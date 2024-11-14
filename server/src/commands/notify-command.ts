import {
  ConferenceRepository,
  MetricsRepository,
  PostgresClient,
  PostgresService,
  SemaphoreService,
} from '@openlab/deconf-api-toolkit'
import ms from 'ms'
import webPush from 'web-push'

import {
  AppContext,
  createDebug,
  createEnv,
  loadConfig,
  logServerError,
  UrlService,
} from '../lib/module.js'
import { pickAStore } from './serve-command.js'
import {
  NotificationsRepository,
  WebPushDeviceRecord,
} from '../mozfest/notifications-repo.js'

const debug = createDebug('cmd:notify')

type Context = Pick<
  AppContext,
  'store' | 'notifsRepo' | 'metricsRepo' | 'conferenceRepo' | 'url'
> & {
  dryRun: boolean
  pg: PostgresClient
  date: Date
}

const LOCK_KEY = 'notifyCommand/lock'
const LOCK_AGE = ms('30s')

export interface NotifyCommandOptions {
  dryRun: boolean
  time: string | null
}

export async function notifyCommand(options: NotifyCommandOptions) {
  debug('start')
  const env = createEnv()
  const config = await loadConfig()
  const store = pickAStore(env.REDIS_URL)
  const postgres = new PostgresService({ env })
  const url = new UrlService({ env })

  const semaphore = new SemaphoreService({ store })

  const metricsRepo = new MetricsRepository({ postgres })
  const notifsRepo = new NotificationsRepository({ postgres })
  const conferenceRepo = new ConferenceRepository({ store })

  const date = options.time ? new Date(options.time) : new Date()

  webPush.setVapidDetails(
    'mailto:' + config.mail.fromEmail,
    env.WEB_PUSH_PUBLIC_KEY,
    env.WEB_PUSH_PRIVATE_KEY
  )

  const pg = await postgres.getClient()

  try {
    const unlocked = await semaphore.aquire(LOCK_KEY, LOCK_AGE)
    if (!unlocked) throw new Error('Failed to aquire lock')
    debug('unlocked')

    const result = await run({
      ...options,
      store,
      notifsRepo,
      metricsRepo,
      conferenceRepo,
      pg,
      url,
      date,
    })

    console.log('finished %O', result)
  } catch (error) {
    await logServerError(metricsRepo, 'webPush/error', error)
  } finally {
    pg.release()
    await semaphore.release(LOCK_KEY)
    await store.close()
    await postgres.close()
  }
}

interface WebPushMessageRecord {
  id: number
  created: Date
  device: number
  message: unknown
  retries: number
  state: string
}

const ALERT_THRESHOLD_MS = 15 * 60 * 1_000

interface Attendance {
  id: number
  attendee: number
  session: string
  notified: Date | null
}

interface PendingNotification {
  attendance: number
  device: number
  title: string
  body: string
  url: string
}

// Get messages to create from upcoming sessions in the schedule
async function getPending(
  conferenceRepo: Readonly<ConferenceRepository>,
  notifsRepo: Readonly<NotificationsRepository>,
  pg: PostgresClient,
  url: Readonly<UrlService>,
  currentDate: Date
) {
  const sessions = await conferenceRepo.getSessions()
  const slots = await conferenceRepo
    .getSlots()
    .then((slots) => new Map(slots.map((s) => [s.id, s])))

  // Get scheduled sessions that are in the future and start within the threshold
  const current = sessions.filter((session) => {
    const slot = session.slot && slots.get(session.slot)
    if (!slot) return false
    return (
      slot.start.getTime() > currentDate.getTime() &&
      slot.start.getTime() - currentDate.getTime() < ALERT_THRESHOLD_MS
    )
  })

  debug('current', current.length)

  const pending: PendingNotification[] = []

  // Loop through the sessions starting soon and get the people attending
  for (const session of current) {
    const attendance = await pg.sql<Attendance>`
      SELECT id, created, attendee, session, notified
      FROM attendance
      WHERE session = ${session.id}
        AND notified IS NULL
    `

    debug('session=%s attendance=%d', session.id, attendance.length)

    // TODO: localise based on attendee record
    const message = {
      title: 'Session starting soon',
      body: session.title.en!,
      url: url.getSessionLink(session.id).toString(),
    }

    // Loop through each person with the session on their schedule
    for (const record of attendance) {
      const devices = await notifsRepo.listAttendeeWebPushDevices(
        record.attendee
      )

      // Add a message for each of the attendee's devices with MySchedule enabled
      for (const device of devices) {
        if (!device.categories.includes('MySchedule')) continue
        pending.push({ device: device.id, attendance: record.id, ...message })
      }
    }
  }

  return pending
}

// Store a push message and mark the attendance as notified
async function insertMessage(
  message: PendingNotification,
  notifsRepo: Readonly<NotificationsRepository>,
  pg: PostgresClient
) {
  await notifsRepo.createWebPushMessage(message.device, {
    title: message.title,
    body: message.body,
    data: { url: message.url },
  })
  await pg.sql`
    UPDATE attendance
    SET notified = ${new Date()}
    WHERE id = ${message.attendance}
  `
}

async function run({
  notifsRepo,
  metricsRepo,
  conferenceRepo,
  pg,
  dryRun,
  url,
  date,
}: Context) {
  const pending = await getPending(conferenceRepo, notifsRepo, pg, url, date)

  debug('pending', pending)

  if (dryRun) {
    console.log('%d message(s) to create:', pending.length)
    for (const m of pending) console.log('device=%d url=%s', m.device, m.url)
    console.log()
  } else {
    for (const message of pending) {
      await insertMessage(message, notifsRepo, pg)
    }
  }

  // NOTE: it runs the "insertMessage" before so they can be sent straight away

  const messages = await notifsRepo.listPendingWebPushMessages()

  debug('messages', messages.length)

  if (dryRun) {
    console.log('%d message(s) to send:', messages.length)
    for (const m of messages) {
      console.log(
        'message=%d device=%d retries=%d',
        m.id,
        m.device,
        m.retries,
        m.message
      )
    }
    return
  }

  const counts = {
    sent: 0,
    failed: 0,
  }

  for (const message of messages) {
    const result = await trySend(message, notifsRepo, metricsRepo)
    counts[result]++
  }

  return counts
}

async function trySend(
  message: WebPushMessageRecord,
  notifsRepo: Readonly<NotificationsRepository>,
  metricsRepo: Readonly<MetricsRepository>
) {
  debug('message=%d device=%d', message.id, message.device)
  const device = await notifsRepo.getAttendeeWebPushDevice(message.device)
  if (!device) {
    // With delete-cascade, this should never happen...
    console.error('missing device id=%d', message.device)
    return 'failed'
  }

  const success = await sendNotification(message, device)
  debug('  success=%o', success)

  await metricsRepo.trackEvent('webPush/send', { success })

  if (success) {
    await notifsRepo.updateWebPushMessage(message, 'sent')
    return 'sent'
  } else {
    await notifsRepo.updateWebPushMessage(message, 'failed')
    return 'failed'
  }
}

async function sendNotification(
  message: WebPushMessageRecord,
  device: WebPushDeviceRecord
): Promise<boolean> {
  try {
    const result = await webPush.sendNotification(
      { endpoint: device.endpoint, keys: device.keys as any },
      JSON.stringify(message.message),
      { headers: { 'Content-Type': 'application/json' } }
    )
    return result.statusCode >= 200 && result.statusCode < 400
  } catch (error) {
    console.error('web-push error', error)
    return false
  }
}
