import crypto from 'node:crypto'

import {
  ConferenceRepository,
  localise,
  MetricsRepository,
  PostgresClient,
  PostgresService,
  RegistrationRepository,
  SemaphoreService,
} from '@openlab/deconf-api-toolkit'
import { Attendance, Localised, Registration } from '@openlab/deconf-shared'
import { calendar_v3, google } from 'googleapis'

import { Oauth2Record, Oauth2Repository } from '../deconf/oauth2-repository.js'
import {
  getActiveToken,
  getGoogleClient,
  GOOGLE_CALENDAR_SCOPE,
  setupGoogleAuth,
} from '../lib/google.js'
import {
  AppContext,
  createDebug,
  createEnv,
  EnvRecord,
  logServerError,
  UrlService,
} from '../lib/module.js'
import { pickAStore } from './serve-command.js'
import ms from 'ms'

const debug = createDebug('cmd:dev-auth')

function getTokens(pg: PostgresClient) {
  return pg.sql<Oauth2Record>`
    SELECT id, created, attendee, kind, scope, "accessToken", "refreshToken", expiry
    FROM attendee_oauth2
    WHERE (expiry > NOW() OR "refreshToken" IS NOT NULL)
      AND kind = 'google'
  `
}

/** Group OAuth2 records by attendee */
function perAttendee(tokens: Oauth2Record[]) {
  const map = new Map<number, Oauth2Record[]>()
  for (const token of tokens) {
    const value = map.get(token.attendee) ?? []
    value.push(token)
    map.set(token.attendee, value)
  }

  return map
}

/** Get the attendance records for an attendee */
function getAttendance(pg: PostgresClient, attendee: number) {
  return pg.sql<Attendance>`
    SELECT id, created, attendee, session
    FROM attendance
    WHERE attendee = ${attendee}
  `
}

/** An unlocalised event */
interface GlobalEvent {
  id: string
  title: Localised
  location: string
  description: Localised
  start: Date
  end: Date
}

/** Get all events for the conference, mapped by id */
async function getEvents(
  repo: ConferenceRepository,
  url: UrlService
): Promise<Map<string, GlobalEvent>> {
  const allSessions = await repo.getSessions()
  const allSlots = await repo.getSlots()

  const slots = new Map(allSlots!.map((s) => [s.id, s]))

  const events = new Map<string, GlobalEvent>()
  for (const session of allSessions) {
    const slot = session.slot ? slots.get(session.slot) : null
    if (!slot) continue

    events.set(session.id, {
      id: getGoogleId(session.id),
      title: session.title,
      location: url.getSessionLink(session.id).toString(),
      description: session.content,
      start: new Date(slot.start),
      end: new Date(slot.end),
    })
  }
  return events
}

/** An event to be synchronised with the users calendar */
interface CalendarEvent {
  id: string
  title: string
  location: string
  description: string
  start: Date
  end: Date
}

/** Get an attendee's events to synchronise with Google */
async function getUserEvents(
  pg: PostgresClient,
  registration: Registration,
  events: Map<string, GlobalEvent>
): Promise<CalendarEvent[]> {
  const attendance = await getAttendance(pg, registration.id)
  return attendance
    .map((r) => events.get(r.session)!)
    .filter((r) => r)
    .map((event) => ({
      ...event,
      title: localise(registration.language, event.title, 'Event'),
      description: localise(registration.language, event.description, ''),
    }))
}

/** Get the events already in a user's google calendar */
async function getGoogleEvents(
  gcal: calendar_v3.Calendar,
  calendarId?: string
): Promise<CalendarEvent[]> {
  if (!calendarId) return []

  const events: CalendarEvent[] = []
  try {
    let res = await gcal.events.list({ calendarId /*, pageToken */ })

    while (true) {
      for (const event of res.data.items ?? []) {
        if (
          !event.id ||
          !event.summary ||
          !event.start?.dateTime ||
          !event.end?.dateTime
        ) {
          continue
        }
        events.push({
          id: event.id,
          title: event.summary,
          location: event.location ?? '',
          description: event.description ?? '',
          start: new Date(event.start.dateTime),
          end: new Date(event.end.dateTime),
        })
      }

      if (!res.data.nextPageToken) break

      res = await gcal.events.list({
        calendarId,
        pageToken: res.data.nextPageToken,
      })
    }

    return events
  } catch {
    return []
  }
}

function hashEvent(
  event: CalendarEvent,
  cache: WeakMap<CalendarEvent, string>
) {
  if (cache.has(event)) return cache.get(event)!

  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(event))
    .digest('base64')

  cache.set(event, hash)

  return hash
}

/**
 * Google takes a base32 string as the identifier.
 * This returns a base16 to satisfy that without adding any extra NPM deps
 */
function getGoogleId(input: string) {
  return Buffer.from(input).toString('hex')
}

interface CalendarDiff {
  missing: CalendarEvent[]
  removed: CalendarEvent[]
  modified: CalendarEvent[]
}

function diffEvents(
  local: Map<string, CalendarEvent>,
  remote: Map<string, CalendarEvent>
): CalendarDiff {
  const hashes = new WeakMap<CalendarEvent, string>()

  // Find events that are not in the remote, so need creating
  const missing: CalendarEvent[] = []
  for (const l of local.values()) {
    if (!remote.has(l.id)) missing.push(l)
  }

  // Find events that are no longer in local, so need removing
  const removed: CalendarEvent[] = []
  for (const r of remote.values()) {
    if (!local.has(r.id)) removed.push(r)
  }

  // Find events that have been modified since uploading, so need updating
  const modified: CalendarEvent[] = []
  for (const l of local.values()) {
    const r = remote.get(l.id)
    if (!r) continue

    if (hashEvent(l, hashes) !== hashEvent(r, hashes)) {
      modified.push(l)
    }
  }

  return { missing, removed, modified }
}

function keyedBy<T, K extends keyof T>(key: K, items: T[]) {
  return new Map(items.map((i) => [i[key], i]))
}

interface CalendarUserData {
  googleCalendarId: string | undefined | null
  googleCalendarDate: string | undefined
}

type Context = Pick<
  AppContext,
  'env' | 'store' | 'oauth2Repo' | 'registrationRepo' | 'conferenceRepo' | 'url'
> & {
  pg: PostgresClient
  allEvents: Map<string, GlobalEvent>
  enqueued: Promise<void>[]
  dryRun: boolean
}

const LOCK_KEY = 'calendarSyncCommand/lock'
const LOCK_AGE = ms('2m')

export interface CalendarSyncCommandOptions {
  dryRun: boolean
}

export async function calendarSyncCommand(options: CalendarSyncCommandOptions) {
  debug('start')

  const env = createEnv()
  const store = pickAStore(env.REDIS_URL)
  const postgres = new PostgresService({ env })

  const oauth2Repo = new Oauth2Repository({ postgres })
  const registrationRepo = new RegistrationRepository({ postgres })
  const conferenceRepo = new ConferenceRepository({ store })
  const metricsRepo = new MetricsRepository({ postgres })
  const url = new UrlService({ env })

  const allEvents = await getEvents(conferenceRepo, url)

  const ctx = {
    ...options,
    env,
    store,
    oauth2Repo,
    registrationRepo,
    conferenceRepo,
    url,
    allEvents,
    enqueued: [],
  } satisfies Partial<Context>

  const semaphore = new SemaphoreService({ store })

  try {
    const unlocked = await semaphore.aquire(LOCK_KEY, LOCK_AGE)
    if (!unlocked) throw new Error('Process already running')

    await postgres.run(async (pg) => {
      const allTokens = await getTokens(pg)

      for (const [attendee, tokens] of perAttendee(allTokens)) {
        try {
          await runUser(attendee, tokens, { ...ctx, pg })
        } catch (error) {
          await logServerError(metricsRepo, 'calendarSync/error', error)
        }
      }
    })
  } finally {
    await semaphore.release(LOCK_KEY)
  }

  debug('waiting for queue')
  await Promise.all(ctx.enqueued)

  await postgres.close()
  await store.close()

  debug('finished')
}

async function runUser(
  attendee: number,
  tokens: Oauth2Record[],
  ctx: Context
): Promise<void> {
  debug('attendee=%o', attendee)

  // Skip if they are not a valid registation
  const registration = await ctx.registrationRepo.getVerifiedRegistration(
    attendee
  )
  if (!registration) {
    return debug('[skip] not verified')
  }
  const userData = registration.userData as CalendarUserData

  // Skip the calendar sync if explicitly set to null
  if (userData.googleCalendarId === null) {
    return debug('[skip] sync disabled')
  }

  // Don't run if there is no calendar token
  const activeToken = getActiveToken(tokens, GOOGLE_CALENDAR_SCOPE)
  if (!activeToken) {
    return debug('[skip] no calendar tokens')
  }

  // Fetch the user's attendance and map those to sessions
  const localEvents = keyedBy(
    'id',
    await getUserEvents(ctx.pg, registration, ctx.allEvents)
  )
  debug('attending %o', [...localEvents.keys()])

  // Create a google client authenticated with the user
  const auth = setupGoogleAuth(
    ctx.env,
    activeToken,
    attendee,
    ctx.enqueued,
    ctx.oauth2Repo
  )
  const gcal = google.calendar({ version: 'v3', auth })

  // Fetch the user's google events
  const googleEvents = keyedBy(
    'id',
    await getGoogleEvents(gcal, userData.googleCalendarId!)
  )

  const diff = diffEvents(localEvents, googleEvents)

  if (ctx.dryRun) {
    console.log('user data', userData)
    console.log('diff', diff)
    return
  }

  const calendarId = await upsertCalendar(gcal, userData.googleCalendarId!)
  if (!calendarId) return debug('[skip] calendar not found') // will have thrown

  debug('storing calendar id')
  userData.googleCalendarId = calendarId
  await updateUserData(ctx.pg, attendee, userData)

  debug('starting diff')
  await performDiff(gcal, calendarId, diff)

  debug('storing calendar date')
  userData.googleCalendarDate = new Date().toISOString()
  await updateUserData(ctx.pg, attendee, userData)

  debug('done')
}

function googleEvent(event: CalendarEvent) {
  return {
    summary: event.title,
    description: event.description,
    start: { dateTime: event.start.toISOString() },
    end: { dateTime: event.end.toISOString() },
    location: event.location,
  }
}

async function performDiff(
  gcal: calendar_v3.Calendar,
  calendarId: string,
  diff: CalendarDiff
) {
  // https://developers.google.com/calendar/api/v3/reference/events/insert
  for (const event of diff.missing) {
    debug('insert', event.id)
    await gcal.events.insert({
      calendarId,
      requestBody: {
        id: event.id,
        ...googleEvent(event),
      },
    })
  }

  // https://developers.google.com/calendar/api/v3/reference/events/update
  for (const event of diff.modified) {
    debug('update', event.id)
    await gcal.events.update({
      eventId: event.id,
      calendarId,
      requestBody: { ...googleEvent(event) },
    })
  }

  for (const event of diff.removed) {
    debug('delete', event.id)
    await gcal.events.delete({
      eventId: event.id,
      calendarId,
    })
  }

  if (
    diff.missing.length === 0 &&
    diff.modified.length == 0 &&
    diff.removed.length === 0
  ) {
    debug('no changes')
  }
}

async function updateUserData(
  pg: PostgresClient,
  attendee: number,
  { googleCalendarDate, googleCalendarId }: CalendarUserData
) {
  const patch = JSON.stringify({ googleCalendarDate, googleCalendarId })
  return pg.sql`
    UPDATE attendees
    SET "userData" = "userData" || ${patch}
    WHERE id = ${attendee};
  `
}

async function upsertCalendar(
  gcal: calendar_v3.Calendar,
  calendarId?: string
): Promise<string | null> {
  if (calendarId) {
    const res = await gcal.calendars.get({ calendarId })
    if (res.data?.id) {
      debug('found calendar')
      return res.data.id
    } else {
      debug('calendar deleted')
      return null
    }
  }

  debug('creating google calendar')
  const calendar = await gcal.calendars.insert({
    quotaUser: 'mozfest-development',
    requestBody: {
      summary: 'MozFest calendar',
    },
  })

  return calendar?.data.id ?? null
}
