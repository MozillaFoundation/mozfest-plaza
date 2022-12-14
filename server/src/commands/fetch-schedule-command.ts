//
// Links
// - https://docs.pretalx.org/api/fundamentals.html
//

import {
  PretalxService,
  PretalxTalk,
  PretalxTax,
  RedisService,
  SemaphoreService,
  trimEmail,
} from '@openlab/deconf-api-toolkit'
import {
  Session,
  SessionVisibility,
  SessionState,
  ScheduleRecord,
  Track,
  SessionType,
  Localised,
  Theme,
} from '@openlab/deconf-shared'

import { checkEnvObject, pluck } from 'valid-env'
import ms from 'ms'

// import sessionTypes = require('../data/session-types.json')
// import languages = require('../data/languages.json')
// import tracks = require('../data/tracks.json')

import {
  AppConfig,
  createDebug,
  loadConfig,
  sha256Hash,
} from '../lib/module.js'

export interface FetchScheduleCommandOptions {}

//
// Constants
//

const debug = createDebug('cmd:scrape-pretalx')
const LOCK_MAX_DURATION_MS = ms('10m')
export const PRETALX_LOCK_KEY = 'pretalx/lock'

/** Setup to run the scrape command */
async function setup() {
  const env = checkEnvObject(
    pluck(process.env, 'PRETALX_API_TOKEN', 'REDIS_URL')
  )
  const config = await loadConfig()
  const store = new RedisService(env.REDIS_URL)
  const pretalx = new PretalxService({ env, store, config: config.pretalx })
  const semaphore = new SemaphoreService({ store })

  return { config, env, store, pretalx, semaphore }
}

async function teardown(store: RedisService) {
  await store.close()
}

//
// Data accessors
//
function dataCommand<T>(block: (pretalx: PretalxService) => Promise<T>) {
  return async () => {
    const { store, pretalx } = await setup()
    const result = await block(pretalx)
    console.log(JSON.stringify(result, null, 2))
    await teardown(store)
  }
}

export const pretalxDataCommands = {
  questions: dataCommand((p) => p.getQuestions()),
  event: dataCommand((p) => p.getEvent()),
  submissions: dataCommand(async (p) =>
    p.getSubmissions(submissionOptions(await loadConfig()))
  ),
  speakers: dataCommand(async (p) =>
    p.getSpeakers(speakerOptions(await loadConfig()))
  ),
  tags: dataCommand((p) => p.getTags()),
}

function submissionOptions(config: AppConfig) {
  return {
    questions: [...config.pretalx.questions.links],
  }
}

function speakerOptions(config: AppConfig) {
  return {
    questions: [
      config.pretalx.questions.pulsePhoto,
      config.pretalx.questions.affiliation,
    ],
  }
}

/** A CLI command to scrape pretalx, format content for deconf and put into redis */
export async function fetchScheduleCommand(
  options: FetchScheduleCommandOptions
) {
  debug('start')

  const { config, pretalx, store, semaphore } = await setup()
  const helpers = new PretalxHelpers(pretalx, config.pretalx)

  const hasLock = await semaphore.aquire(PRETALX_LOCK_KEY, LOCK_MAX_DURATION_MS)
  if (!hasLock) {
    throw new Error(`Failed to aquire lock`)
  }

  try {
    const submissions = await pretalx.getSubmissions(submissionOptions(config))
    const speakers = await pretalx.getSpeakers(speakerOptions(config))
    const tags = await pretalx.getTags()
    const activeSpeakers = new Set<string>()
    const speakerMap = new Map(speakers.map((s) => [s.code, s]))
    // const questions = await pretalx.getQuestions()
    // const speakerMap = new Map(speakers.map((s) => [s.code, s]))

    const schedule: Omit<ScheduleRecord, 'settings'> = {
      sessions: helpers.getSessions(submissions),
      slots: pretalx.getDeconfSlots(submissions),
      speakers: pretalx.getDeconfSpeakers(
        speakers,
        config.pretalx.questions.affiliation
      ),
      themes: helpers.getThemes(tags),
      tracks: config.tracks as Track[],
      types: config.sessionTypes.map((t) => helpers.createSessionType(t)),
    }

    for (const session of schedule.sessions) {
      // Remove -mozilla from language names
      session.hostLanguages = session.hostLanguages.map((locale) =>
        locale.replace('-mozilla', '')
      )
      if (session.state !== 'confirmed') continue

      for (const s of session.speakers) {
        const speaker = speakerMap.get(s)
        if (!speaker?.email) continue
        activeSpeakers.add(sha256Hash(trimEmail(speaker.email)))
      }
    }

    // Save to redis
    for (const [key, value] of Object.entries(schedule)) {
      await store.put(`schedule.${key}`, value)
    }
    await store.put('schedule.facilitators', Array.from(activeSpeakers))

    // Wait a little bit to hold the lock for longer
    // For example, if multiple containers are triggered at the same time
    // only 1 has to run
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000))
  } finally {
    await semaphore.release(PRETALX_LOCK_KEY)
    await teardown(store)
  }
}

//
// Utilities
//

class PretalxHelpers {
  constructor(
    public pretalx: PretalxService,
    public config: AppConfig['pretalx']
  ) {}

  getSessions(submissions: PretalxTalk[]): Session[] {
    const sessions = submissions.map((submission) => {
      // TODO: slots don't currently have ids
      const slot = submission.slot
        ? this.pretalx.getSlotId(submission.slot)
        : undefined

      const type = submission.submission_type_id?.toString()
      const track = submission.track_id?.toString()

      if (type === undefined || track === undefined) return null

      const themes: string[] = (submission.tags ?? []).map((tag) =>
        this.pretalx.getSlug(tag)
      )

      return {
        id: this.pretalx.makeUnique(submission.code),
        type,
        title: { en: submission.title },
        slot,
        track,
        themes,
        coverImage: '',
        content: {
          en: submission.description,
        },

        // TODO: pull from resources
        links: [],
        hostLanguages: [submission.content_locale],
        enableInterpretation: false,
        speakers: submission.speakers.map((s) => s.code),
        hostOrganisation: { en: '' },
        isRecorded: submission.do_not_record !== true,
        isOfficial: false,
        isFeatured: submission.is_featured,
        visibility: SessionVisibility.private,
        state: submission.state as SessionState,
        participantCap: null,

        proxyUrl: undefined,
        hideFromSchedule: false,
      }
    })

    return sessions.filter((s) => Boolean(s)) as Session[]
  }

  getThemes(tags: PretalxTax[]): Theme[] {
    // TODO: Use ids if they're available?
    return tags.map((tag) => ({
      id: this.pretalx.getSlug(tag.tag),
      title: {
        en: tag.tag,
      },
    }))
  }

  // createTrack({ id, title }: { id: number; title: Localised }): Track {
  //   return { id, title }
  //   return {
  //     id: input.id,
  //     title: input.title,
  //   }
  // }

  createSessionType(input: {
    id: string
    title: Localised
    icon: [string, string]
    layout: string
  }): SessionType {
    return {
      id: input.id,
      title: input.title,
      layout: input.layout,
      iconGroup: input.icon[0],
      iconName: input.icon[1],
    }
  }
}
