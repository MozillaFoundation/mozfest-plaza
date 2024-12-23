import fs from 'fs/promises'

import { createTerminus } from '@godaddy/terminus'
import {
  AppContext,
  createDebug,
  createEnv,
  loadConfig,
  SocketService,
  UrlService,
} from '../lib/module.js'
import {
  AttendanceRepository,
  closeRedisClients,
  ConferenceRepository,
  createMemoryStore,
  I18nService,
  JwtService,
  loadI18nLocales,
  loadResources,
  MetricsRepository,
  PostgresService,
  RedisService,
  RegistrationRepository,
  SemaphoreService,
} from '@openlab/deconf-api-toolkit'
import { createServer } from '../server.js'
import { RedisAdapter } from '@socket.io/redis-adapter'
import { migrateCommand } from './migrate-command.js'
import { fetchContentCommand } from './fetch-content-command.js'
import { CaMoEmailService } from '../lib/email-service.js'
import { Oauth2Repository } from '../deconf/oauth2-repository.js'
import { CalendarRepository } from '../mozfest/calendar-repo.js'
import { NotificationsRepository } from '../mozfest/notifications-repo.js'

const debug = createDebug('cmd:serve')

export function pickAStore(redisUrl: string | null) {
  if (redisUrl) {
    debug('Using redis store %o', redisUrl)
    return new RedisService(redisUrl)
  } else {
    debug('Using in-memory store')
    return createMemoryStore()
  }
}

export interface ServeCommandOptions {
  port: number
  migrate: boolean
  content: boolean
}

export async function createServerContext(): Promise<AppContext> {
  const env = createEnv()
  const config = await loadConfig()
  const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'))
  const resources = await loadResources('res')

  debug('Package name=%o version=%o', pkg.name, pkg.version)
  debug('Loaded resources %o', [...resources.keys()])

  const store = pickAStore(env.REDIS_URL)
  const postgres = new PostgresService({ env })
  const url = new UrlService({ env })
  const jwt = new JwtService({ env, store, config })
  const i18n = new I18nService(loadI18nLocales(resources, ['en']))
  const semaphore = new SemaphoreService({ store })
  const email = new CaMoEmailService({ env })
  const sockets = new SocketService()

  const attendanceRepo = new AttendanceRepository({ postgres })
  // const carbonRepo = new CarbonRepository({ postgres })
  const conferenceRepo = new ConferenceRepository({ store })
  const registrationRepo = new RegistrationRepository({ postgres })
  const metricsRepo = new MetricsRepository({ postgres })
  // const interpreterRepo = new InterpreterRepository({ jwt, conferenceRepo })
  const oauth2Repo = new Oauth2Repository({ postgres })
  const calendarRepo = new CalendarRepository({ postgres })
  const notifsRepo = new NotificationsRepository({ postgres })

  // prettier-ignore
  return {
    config, env, pkg, resources, email, i18n, jwt, postgres, semaphore, sockets,
    store, url, attendanceRepo, conferenceRepo, metricsRepo, registrationRepo,
    oauth2Repo, calendarRepo, notifsRepo
  }
}

export async function serveCommand(options: ServeCommandOptions) {
  if (options.migrate) {
    await migrateCommand({})
  }
  if (options.content) {
    await fetchContentCommand({
      branch: 'main',
      reuse: false,
      local: true,
      repoPath: null,
    })
  }

  const context: AppContext = await createServerContext()
  const { env, store, postgres } = context

  debug('creating server')
  const { server, io } = createServer(context)

  server.listen(options.port, () => {
    debug('Listening on http://0.0.0.0:%d', options.port)
  })

  createTerminus(server, {
    signals: ['SIGINT', 'SIGTERM'],
    healthChecks: {
      '/healthz': async () => {
        try {
          debug('/healthz check redis')
          await store.checkHealth()
          debug('/healthz check postgres')
          await postgres.checkHealth()
          debug('/healthz check done')
        } catch (error) {
          debug('check failed', error)
          throw error
        }
      },
    },
    beforeShutdown: () => {
      // Wait 5s more to shutdown when in production
      // to give loadbalancers time to update
      const wait = env.NODE_ENV !== 'development' ? 5000 : 0
      debug('beforeShutdown wait=%dms', wait)
      return new Promise((resolve) => setTimeout(resolve, wait))
    },
    onSignal: async () => {
      debug('onSignal')
      await store.close()
      await postgres.close()

      const adapter = io.of('/').adapter
      if (adapter instanceof RedisAdapter) {
        await closeRedisClients(adapter.pubClient, adapter.subClient)
      }
    },
  })
}
