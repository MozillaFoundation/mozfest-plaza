//
// Links
// - https://ti.to/docs/api/admin/#registrations-get-all-registrations
// - https://ti.to/docs/api/admin#pagination
//

import got, { PaginationOptions, Got } from 'got'
import { checkEnvObject, pluck } from 'valid-env'
import ms from 'ms'
import qs from 'qs'

import {
  TitoMeta,
  TitoRecord,
  TitoRegistration,
  TitoTicket,
  loadConfig,
  sha256Hash,
  TitoAccountInfo,
  TitoEvent,
  TitoRelease,
  createDebug,
} from '../lib/module.js'
import {
  RedisService,
  SemaphoreService,
  trimEmail,
} from '@openlab/deconf-api-toolkit'

const debug = createDebug('cmd:scrape-tito')
const LOCK_KEY = 'tito/lock'
const SINCE_KEY = 'tito/lastScrape'
const LOCK_MAX_DURATION_MS = ms('2m')
const SINCE_OVERLAY_MINUTES = 15

function createEnv(processEnv = process.env) {
  return checkEnvObject(pluck(processEnv, 'TITO_API_TOKEN', 'REDIS_URL'))
}

function createPaginator<T, K extends string>(
  key: K
): PaginationOptions<T, TitoMeta & Record<K, T[]>> {
  return {
    pagination: {
      transform(response) {
        debug(
          'page=%o next=%o',
          response.body.meta.current_page,
          response.body.meta.next_page
        )
        return response.body[key]
      },
      paginate(response) {
        if (typeof response.body?.meta?.next_page !== 'number') return false

        return {
          searchParams: {
            ...response.request.options.searchParams,
            page: response.body.meta?.next_page,
          },
        }
      },
    },
  }
}

async function setup() {
  const config = await loadConfig()
  const env = createEnv()

  const tito = got.extend({
    prefixUrl: `https://api.tito.io/v3/${config.tito.accountSlug}/${config.tito.eventSlug}`,
    headers: {
      authorization: `Token token=${env.TITO_API_TOKEN}`,
    },
    responseType: 'json',
  })

  const store = new RedisService(env.REDIS_URL)
  const semaphore = new SemaphoreService({ store })

  return { config, env, tito, store, semaphore }
}

async function teardown(store: RedisService) {
  await store.close()
}

//
// Data accessors
//
function generateParams(states: string[], sinceDate?: Date | null) {
  // Only show complete / confirmed records
  // Sort by created date
  // show newest first (used when calculating the next "sinceDate")
  const searchParams: any = {
    search: {
      state: states,
      sort: 'created_at',
      direction: 'desc',
    },
  }

  // If passed, only return ones created after that date
  // add an overlap just to be careful
  if (sinceDate) {
    const targetDate = new Date(sinceDate)
    targetDate.setMinutes(targetDate.getMinutes() - SINCE_OVERLAY_MINUTES)

    searchParams.search['updated_at'] = {
      gt: targetDate.toISOString(),
    }
  }

  const query = qs.stringify(searchParams, { encode: false })
  debug('query %o', query)
  return query
}

function getAccount(tito: Got) {
  return tito
    .get('hello', { prefixUrl: 'https://api.tito.io/v3' })
    .json<TitoAccountInfo>()
}

function getEvents(tito: Got) {
  return tito.paginate.all(
    '../events',
    createPaginator<TitoEvent, 'events'>('events')
  )
}

function getTickets(tito: Got, sinceDate?: Date | null) {
  const searchParams = generateParams(['complete'], sinceDate)

  return tito.paginate.all('tickets', {
    ...createPaginator<TitoTicket, 'tickets'>('tickets'),
    searchParams,
  })
}

function getRegistrations(tito: Got, sinceDate?: Date | null) {
  const searchParams = generateParams(['complete', 'confirmed'], sinceDate)

  return tito.paginate.all('registrations', {
    ...createPaginator<TitoRegistration, 'registrations'>('registrations'),
    searchParams,
  })
}

function getReleases(tito: Got) {
  return tito.paginate.all(
    'releases',
    createPaginator<TitoRelease, 'releases'>('releases')
  )
}

function createOutputCommand<T>(block: (tito: Got) => Promise<T>) {
  return async () => {
    const { store, tito } = await setup()
    const result = await block(tito)
    console.log(JSON.stringify(result, null, 2))
    await teardown(store)
  }
}

export const titoDataCommands = {
  registrations: createOutputCommand((t) => getRegistrations(t)),
  tickets: createOutputCommand((t) => getTickets(t)),
  account: createOutputCommand((t) => getAccount(t)),
  events: createOutputCommand((t) => getEvents(t)),
  releases: createOutputCommand((t) => getReleases(t)),
}

export interface ScrapeTitoCommandOptions {
  noCache: boolean
}

export async function scrapeTitoCommand(options: ScrapeTitoCommandOptions) {
  debug('scrape')
  const { store, tito, semaphore } = await setup()

  try {
    const hasLock = await semaphore.aquire(LOCK_KEY, LOCK_MAX_DURATION_MS)
    if (!hasLock) throw new Error('Process is already running')

    // Find when we last scraped and get previous records
    const sinceDate = options.noCache ? null : await getSinceDate(store)
    const previousRecords = await store.retrieve<TitoRecord[]>('tito.emails')

    // Find new records
    const newTickets = await getTickets(tito, sinceDate)
    debug('found %o tickets since %o', newTickets.length, sinceDate)

    // Merge the old and new records together
    const mergedRecords: TitoRecord[] = []
    if (!options.noCache) mergedRecords.push(...(previousRecords ?? []))

    // Create a map of email hash to existing record
    const recordMap = new Map(mergedRecords.map((r) => [r.emailHash, r]))

    // For each new registration merge or append a record
    for (const ticket of newTickets) {
      const email = ticket.email ?? ticket.registration_email
      const hash = sha256Hash(trimEmail(email))
      const matchedRecord = recordMap.get(hash)

      // If the record exists, update its name
      if (matchedRecord) {
        matchedRecord.name = ticket.name
      } else {
        // If the record doesn't exist, push it on the end
        const record: TitoRecord = {
          emailHash: hash,
          name: ticket.name,
        }
        recordMap.set(hash, record)
        mergedRecords.push(record)
      }
    }

    // Store the merged records in redis
    await store.put('tito.emails', mergedRecords)

    // If there were records returned get the last updated_at date
    // And store in redis for when to lookup from next time
    const newSinceDate =
      newTickets.length > 0 ? new Date(newTickets[0].updated_at) : null

    if (newSinceDate) {
      debug('set sinceDate to %o', newSinceDate)
      await setSinceDate(store, newSinceDate)
    }

    // Wait a little bit to hold the lock for longer
    // For if multiple containers are triggered at the same time
    // only 1 has to run
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000))
  } catch (error) {
    throw error
  } finally {
    await semaphore.release(LOCK_KEY)

    await teardown(store)
  }
}

async function getSinceDate(store: RedisService): Promise<Date | null> {
  try {
    const found = await store.retrieve<string>(SINCE_KEY)
    return found ? new Date(found) : null
  } catch (error) {
    return null
  }
}

async function setSinceDate(redis: RedisService, date: Date) {
  await redis.put(SINCE_KEY, date.toISOString())
}
