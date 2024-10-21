import {
  ConferenceRepository,
  KeyValueService,
  localise,
  PostgresClient,
  PostgresService,
  RegistrationRepository,
  UrlService,
} from '@openlab/deconf-api-toolkit'
import { createDebug, createEnv, EnvRecord } from '../lib/module.js'
import { Oauth2Record, Oauth2Repository } from '../deconf/oauth2-repository.js'
import {
  Attendance,
  Localised,
  Registration,
  Session,
  SessionSlot,
} from '@openlab/deconf-shared'
import { pickAStore } from './serve-command.js'
import { getGoogleClient, GOOGLE_CALENDAR_SCOPE } from '../lib/google.js'
import { Credentials, GoogleAuth, OAuth2Client } from 'google-auth-library'
import { calendar_v3, google } from 'googleapis'
import crypto from 'node:crypto'

const debug = createDebug('cmd:dev-auth')

function getTokens(pg: PostgresClient) {
  return pg.sql<Oauth2Record>`
    SELECT id, created, attendee, kind, scope, "accessToken", "refreshToken", expiry
    FROM attendee_oauth2
    WHERE expiry > NOW() OR "refreshToken" IS NOT NULL
  `
}

function perAttendee(tokens: Oauth2Record[]) {
  const map = new Map<number, Oauth2Record[]>()
  for (const token of tokens) {
    const value = map.get(token.attendee) ?? []
    value.push(token)
    map.set(token.attendee, value)
  }

  return map
}

function getAttendance(pg: PostgresClient, attendee: number) {
  return pg.sql<Attendance>`
    SELECT id, created, attendee, session
    FROM attendance
    WHERE attendee = ${attendee}
  `
}

export function getActiveToken(tokens: Oauth2Record[]) {
  const filtered = tokens
    .filter((t) => t.scope.includes(GOOGLE_CALENDAR_SCOPE))
    .sort((a, b) => b.created.getTime() - a.created.getTime())

  if (filtered.length === 0) return null

  const refreshToken = filtered.map((t) => t.refreshToken).filter((t) => t)[0]
  const accessToken = filtered[0].accessToken
  return { refreshToken, accessToken }
}

interface GlobalEvent {
  id: string
  title: Localised
  location: string
  description: Localised
  start: Date
  end: Date
}

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
      id: session.id,
      title: session.title,
      location: url.getSessionLink(session.id).toString(),
      description: session.content,
      start: new Date(slot.start),
      end: new Date(slot.end),
    })
  }
  return events
}

interface CalendarEvent {
  id: string
  title: string
  location: string
  description: string
  start: Date
  end: Date
}

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

async function getGoogleEvents(
  gcal: calendar_v3.Calendar,
  calendarId: string
): Promise<Map<string, CalendarEvent>> {
  let items: calendar_v3.Schema$Events[] = []
  const events = new Map<string, CalendarEvent>()
  try {
    // let pageToken: string | undefined = undefined

    // while (true) {
    const res = await gcal.events.list({ calendarId /*, pageToken */ })

    for (const event of res.data.items ?? []) {
      if (
        !event.id ||
        !event.summary ||
        !event.start?.dateTime ||
        !event.end?.dateTime
      ) {
        continue
      }
      events.set(event.id, {
        id: event.id,
        title: event.summary,
        location: event.location ?? '',
        description: event.description ?? '',
        start: new Date(event.start.dateTime),
        end: new Date(event.end.dateTime),
      })
    }

    // TODO: paginate...
    // NOTE: we can set the event id to the session ID !

    //   pageToken = res.data.nextPageToken
    // }

    return events
  } catch {
    return new Map()
  }
}

interface CalendarToken {
  accessToken: string
  refreshToken?: string | null
}

function setupAuth(
  env: EnvRecord,
  token: CalendarToken,
  attendee: number,
  queue: Promise<unknown>[],
  oauth2Repo: Oauth2Repository
) {
  // Create a google client to authenticate the user
  const auth = getGoogleClient(env)
  auth.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
  })
  auth.on('tokens', (tokens) => {
    debug('enqueue new token attendee=%o', attendee)
    queue.push(
      oauth2Repo.store(
        attendee,
        'google',
        tokens.scope ?? '',
        tokens.access_token!,
        tokens.refresh_token ?? null,
        tokens.expiry_date ? new Date(tokens.expiry_date) : null
      )
    )
  })
  return auth
}

export interface CalendarSyncCommandOptions {
  dryRun: boolean
}

export async function calendarSyncCommand(options: CalendarSyncCommandOptions) {
  debug('start')

  const env = createEnv()
  const store = pickAStore(env.REDIS_URL)
  const postgres = new PostgresService({ env })

  const oauthRepo = new Oauth2Repository({ postgres })
  const regRepo = new RegistrationRepository({ postgres })
  const confRepo = new ConferenceRepository({ store })
  const urls = new UrlService({ env })

  const allEvents = await getEvents(confRepo, urls)

  let enqueued: Promise<unknown>[] = []

  await postgres.run(async (pg) => {
    const allTokens = await getTokens(pg)

    for (const [attendee, tokens] of perAttendee(allTokens)) {
      debug('attendee=%o', attendee)

      // Skip if they are not a valid registation
      const registration = await regRepo.getVerifiedRegistration(attendee)
      if (!registration) {
        debug('[skip] not verified')
        continue
      }
      const userData = registration.userData as Record<'googleCalendarId', any>

      // Skip the calendar sync if explicitly set to null
      if (userData.googleCalendarId === null) {
        debug('[skip] sync disabled')
      }

      // Don't run if there is no calendar token
      const activeToken = getActiveToken(tokens)
      if (!activeToken) {
        debug('[skip] no calendar tokens')
        continue
      }

      // Fetch the user's attendance and map those to sessions
      const localEvents = await getUserEvents(pg, registration, allEvents)
      debug(
        'attending %o',
        localEvents.map((s) => s.id)
      )

      // Create a google client to authenticate the user
      const auth = setupAuth(env, activeToken, attendee, enqueued, oauthRepo)
      const gcal = google.calendar({ version: 'v3', auth })

      // const calendar = await upsertCalendar(gcal, userData.googleCalendarId)

      // if (!calendar) {
      //   debug('[skip] failed to upsert calendar')
      //   continue
      // }

      // await storeCalendarId(pg, attendee, calendar.id!)

      // const events = await gcal.events.list({
      //   calendarId: calendar?.id!,
      // })

      const googleEvents = await getGoogleEvents(
        gcal,
        userData.googleCalendarId
      )

      console.log(googleEvents)

      //
    }
  })

  await Promise.all(enqueued)

  await postgres.close()
  await store.close()
}

function diffEvents(local: CalendarEvent[], remote: CalendarEvent[]) {
  // work out new, updated, missing
}

async function storeCalendarId(
  pg: PostgresClient,
  attendee: number,
  calendarId: string
) {
  const patch = JSON.stringify({ googleCalendar: calendarId })
  return pg.sql`
    UPDATE attendees
    SET "userData" = "userData" || ${patch}
    WHERE id = ${attendee};
  `
}

async function upsertCalendar(gcal: calendar_v3.Calendar, calendarId?: string) {
  if (calendarId) {
    const res = await gcal.calendars.get({ calendarId }) //.catch(() => null)
    if (res?.data) return res.data
  }

  const calendar = await gcal.calendars.insert({
    quotaUser: 'mozfest-development',
    requestBody: {
      summary: 'MozFest calendar',
    },
  })
  // .catch(() => null)

  return calendar?.data
}
