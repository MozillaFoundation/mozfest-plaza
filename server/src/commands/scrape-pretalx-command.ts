//
// Links
// - https://docs.pretalx.org/api/fundamentals.html
//

import {
  PretalxService,
  PretalxSpeaker,
  PretalxTalk,
  PretalxTax,
  RedisService,
  SemaphoreService,
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
import createDebug from 'debug'

// import sessionTypes = require('../data/session-types.json')
// import languages = require('../data/languages.json')
// import tracks = require('../data/tracks.json')

import { AppConfig, loadConfig } from '../lib/module.js'

export interface ScrapePretalxCommandOptions {}

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
  const appConfig = await loadConfig()
  const config = appConfig
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
  submissions: dataCommand((p) => p.getSubmissions()),
  talks: dataCommand((p) => p.getTalks()),
  speakers: dataCommand((p) => p.getSpeakers()),
  tags: dataCommand((p) => p.getTags()),
}

/** A CLI command to scrape pretalx, format content for deconf and put into redis */
export async function scrapePretalxCommand(
  options: ScrapePretalxCommandOptions
) {
  debug('start')

  const { config, pretalx, store, semaphore } = await setup()
  const helpers = new PretalxHelpers(pretalx, config.pretalx)

  const hasLock = await semaphore.aquire(PRETALX_LOCK_KEY, LOCK_MAX_DURATION_MS)
  if (!hasLock) {
    throw new Error(`Failed to aquire lock`)
  }

  try {
    const submissions = await pretalx.getSubmissions()
    const talks = await pretalx.getTalks()
    const speakers = await pretalx.getSpeakers()
    const tags = await pretalx.getTags()
    // const questions = await pretalx.getQuestions()
    // const speakerMap = new Map(speakers.map((s) => [s.code, s]))

    const schedule: Omit<ScheduleRecord, 'settings'> = {
      sessions: helpers.getSessions(submissions),
      slots: pretalx.getDeconfSlots(talks),
      speakers: pretalx.getDeconfSpeakers(
        speakers,
        config.pretalx.questions.affiliation
      ),
      themes: helpers.getThemes(tags),
      tracks: config.tracks.map((t) => helpers.createTrack(t)),
      types: config.sessionTypes.map((t) => helpers.createSessionType(t)),
    }

    // Remove 'null__null' slot
    schedule.slots = schedule.slots.filter((s) => s.id !== 'null__null')

    for (const session of schedule.sessions) {
      // Remove -mozilla from language names
      session.hostLanguages = session.hostLanguages.map((locale) =>
        locale.replace('-mozilla', '')
      )

      // Unset null__null slot
      if (session.slot === 'null__null') session.slot = undefined
    }

    // Save to redis
    for (const [key, value] of Object.entries(schedule)) {
      await store.put(`schedule.${key}`, value)
    }

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
    return submissions.map((submission) => {
      const type = this.pretalx.getIdFromTitle(
        submission.submission_type,
        'unknown'
      )

      const slot = submission.slot
        ? this.pretalx.getSlotId(submission.slot)
        : undefined

      const track = this.pretalx.getIdFromTitle(submission.track, 'unknown')

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
        links: this.pretalx.getSessionLinks(
          submission,
          this.config.questions.links
        ),
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
  }

  getThemes(tags: PretalxTax[]): Theme[] {
    return tags.map((tag) => ({
      id: this.pretalx.getSlug(tag.tag),
      title: {
        en: tag.tag,
      },
    }))
  }

  createTrack(input: { title: Localised }): Track {
    return {
      id: this.pretalx.getSlug(input.title.en as string),
      title: input.title,
    }
  }

  createSessionType(input: {
    title: Localised
    icon: [string, string]
    layout: string
  }): SessionType {
    return {
      id: this.pretalx.getSlug(input.title.en as string),
      title: input.title,
      layout: input.layout,
      iconGroup: input.icon[0],
      iconName: input.icon[1],
    }
  }
}
