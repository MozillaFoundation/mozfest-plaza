import {
  DECONF_MIGRATIONS,
  MigrateRepository,
  MigrateService,
  PostgresService,
} from '@openlab/deconf-api-toolkit'
import { createEnv, createDebug } from '../lib/module.js'
import addAttendeeOauth2 from '../migrations/001-attendee-oauth2.js'
import addWebPushDevices from '../migrations/002-web-push-device.js'

const debug = createDebug('cmd:migrate')

const MOZFEST_MIGRATIONS = [
  ...DECONF_MIGRATIONS,
  addAttendeeOauth2,
  addWebPushDevices,
]

export interface MigrateCommandOptions {
  // ...
}

export async function migrateCommand(options: MigrateCommandOptions) {
  debug('start')

  const env = createEnv()

  debug(
    'migrations %o',
    MOZFEST_MIGRATIONS.map((m) => m.id)
  )

  const postgres = new PostgresService({ env })

  debug('connecting to postgres')
  await postgres.run(async (client) => {
    const migrateRepo = new MigrateRepository(client)
    const migrate = new MigrateService({ migrateRepo })

    debug('running migrations')
    await migrate.runMigrations(MOZFEST_MIGRATIONS)
  })

  debug('disconnecting')
  await postgres.close()
}
