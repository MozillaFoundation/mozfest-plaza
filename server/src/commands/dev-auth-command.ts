import {
  createMemoryStore,
  DevAuthCommand,
  DevAuthCommandOptions,
  JwtService,
  PostgresService,
  RegistrationRepository,
} from '@openlab/deconf-api-toolkit'
import {
  createDebug,
  createEnv,
  loadConfig,
  UrlService,
} from '../lib/module.js'

const debug = createDebug('moz:cmd:dev-auth')

export async function devAuthCommand(options: DevAuthCommandOptions) {
  debug('start')

  const env = createEnv()
  const store = createMemoryStore()
  const config = await loadConfig()
  const jwt = new JwtService({ env, store, config })
  const postgres = new PostgresService({ env })
  const registrationRepo = new RegistrationRepository({ postgres })
  const url = new UrlService({ env })

  const cmd = new DevAuthCommand({ jwt, registrationRepo, url })

  debug('generating AuthToken')
  const result = await cmd.process(options)

  console.log('Generated AuthToken for %o', options.email)
  console.log(result.token)
  console.log()
  console.log('Login to the client:')
  console.log(result.url.toString())

  debug('disconnecting')
  await postgres.close()
}
