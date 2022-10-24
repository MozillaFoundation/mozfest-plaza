import {
  assertStruct,
  ContentRepository,
  ContentService,
  ProcessRepoOptions,
  RedisService,
} from '@openlab/deconf-api-toolkit'
import { readFile } from 'fs/promises'
import path from 'path'
import { checkEnvObject, pluck } from 'valid-env'
import { ConferenceConfigStruct, BlockedStruct } from '../lib/module.js'

export const CONTENT_KEYS = [
  'art-filters',
  'atrium-active',
  'atrium-public',
  'conference-over',
  'fringe-filters',
  'help',
  'lightning-talks-filters',
  'login',
  'schedule-filters',
  'spaces',
  'whats-on-filters',
  'misinfo-con-filters',
  'emergent-info',
  'emergent-filters',
]

export interface FetchContentCommandOptions {
  branch: string
  reuse: boolean
  repoPath: string | null
}

export async function fetchContentCommand(options: FetchContentCommandOptions) {
  const env = checkEnvObject(
    pluck(process.env, 'REDIS_URL', 'CONTENT_REPO_REMOTE')
  )

  const store = new RedisService(env.REDIS_URL)
  const contentRepo = new ContentRepository({})
  const cmd = new ContentService({ store, contentRepo })

  const opts: ProcessRepoOptions = {
    remote: env.CONTENT_REPO_REMOTE,
    branch: options.branch,
    reuseDirectory: options.reuse ? 'content' : undefined,
    contentKeys: CONTENT_KEYS,
    languages: ['en'],
  }

  // `repoPath` is the new way, pass an existing repo to fetch from
  if (options.repoPath) {
    opts.reuseDirectory = options.repoPath
  }

  await cmd.processRepository(opts, async function* (directory) {
    // Fetch data
    const config = JSON.parse(
      await readFile(path.join(directory, 'content', 'settings.json'), 'utf8')
    )
    if (config.startDate) config.startDate = new Date(config.startDate)
    if (config.endDate) config.endDate = new Date(config.endDate)

    const blocked = JSON.parse(
      await readFile(path.join(directory, 'content', 'blocked.json'), 'utf8')
    )

    assertStruct(config, ConferenceConfigStruct)
    assertStruct(blocked, BlockedStruct)

    yield

    // Save data
    await store.put('schedule.settings', config)
    await store.put('schedule.blocked', blocked)
  })

  await store.close()
}
