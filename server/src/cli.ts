#!/usr/bin/env node

//
// The cli entrypoint
//

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { devAuthCommand } from './commands/dev-auth-command.js'
import { migrateCommand } from './commands/migrate-command.js'
import {
  fetchUsersCommand,
  titoDataCommands,
} from './commands/fetch-auth-command.js'
import { serveCommand } from './commands/serve-command.js'
import { hackCommands } from './commands/hack-command.js'
import {
  pretalxDataCommands,
  fetchScheduleCommand,
} from './commands/fetch-schedule-command.js'
import { fetchContentCommand } from './commands/fetch-content-command.js'
import { fakeTitoCommand } from './commands/fake-tito-command.js'
import { fakeScheduleCommand } from './commands/fake-schedule-command.js'
import { logVisitorsCommand } from './commands/log-visitors-command.js'
import { exportScheduleCommand } from './commands/export-schedule-command.js'

const isDevelopment = process.env.NODE_ENV === 'development'

const cli = yargs(hideBin(process.argv))
  .help()
  .alias('h', 'help')
  .demandCommand(1, 'A command is required')
  .recommendCommands()

function errorHandler(error: any) {
  console.error('Fatal error')
  console.error(error)
  process.exit(1)
}

function deprecatedCommand(
  args: yargs.Arguments,
  command: string,
  replacement: string
) {
  if (args._.includes(command)) {
    console.error(`DEPRECATED: %o is deprecated, use %o`, command, replacement)
  }
}

cli.command(
  'serve',
  'Run the http server',
  (yargs) =>
    yargs
      .options('port', { type: 'number', default: 3000 })
      .option('migrate', { type: 'boolean', default: false })
      .option('content', { type: 'boolean', default: false }),
  (args) => serveCommand(args).catch(errorHandler)
)

/** `reuse` is @deprecated, use `repoPath` instead */
cli.command(
  'fetch-content',
  'Pull content from the mozfest-content repository',
  (yargs) =>
    yargs
      .options('branch', {
        type: 'string',
        default: process.env.CONTENT_REPO_BRANCH ?? 'main',
      })
      .options('reuse', { type: 'boolean', default: false })
      .options('local', { type: 'boolean', default: false })
      .options('repoPath', { type: 'string', default: null }),
  (args) => fetchContentCommand(args).catch(errorHandler)
)

/** "scrape-pretalx" is @deprecated */
cli.command(
  ['fetch-schedule', 'scrape-pretalx'],
  'Fetch resources from pretalx and make the schedule',
  (yargs) => yargs,
  (args) => {
    deprecatedCommand(args, 'scrape-pretalx', 'fetch-schedule')
    return fetchScheduleCommand({}).catch(errorHandler)
  }
)

cli.command(
  'pretalx <data>',
  'Fetch and output pretalx data',
  (yargs) =>
    yargs.positional('data', {
      type: 'string',
      choices: Object.keys(pretalxDataCommands),
      demandOption: true,
    }),
  (args) =>
    pretalxDataCommands[args.data as keyof typeof pretalxDataCommands]().catch(
      errorHandler
    )
)

/** "scrape-tito" is @deprecated */
cli.command(
  ['fetch-users', 'scrape-tito'],
  'Fetch data from tito and cache into redis',
  (yargs) =>
    yargs.option('noCache', {
      type: 'boolean',
      default: false,
      describe: 'Skip the cache and return all records',
    }),
  (args) => {
    deprecatedCommand(args, 'scrape-tito', 'fetch-users')
    return fetchUsersCommand(args).catch(errorHandler)
  }
)

if (isDevelopment) {
  cli.command(
    'fake-tito',
    '[dev] Fake ti.to data based on current registrations',
    (yargs) => yargs,
    (args) => fakeTitoCommand(args).catch(errorHandler)
  )
}

cli.command(
  'tito <data>',
  'Fetch and output tito data',
  (yargs) =>
    yargs.positional('data', {
      type: 'string',
      choices: Object.keys(titoDataCommands),
      demandOption: true,
    }),
  (args) =>
    titoDataCommands[args.data as keyof typeof titoDataCommands]().catch(
      errorHandler
    )
)

cli.command(
  'hack <hack>',
  'Run the hack command',
  (yargs) =>
    yargs.positional('hack', {
      type: 'string',
      choices: Object.keys(hackCommands),
      demandOption: true,
    }),
  (args) =>
    hackCommands[args.hack as keyof typeof hackCommands]().catch(errorHandler)
)

cli.command(
  'dev-auth <email>',
  'Generate authentication for development',
  (yargs) =>
    yargs
      .positional('email', { type: 'string', demandOption: true })
      .option('interpreter', { type: 'boolean', default: false })
      .option('admin', { type: 'boolean', default: false }),
  (args) => devAuthCommand(args).catch(errorHandler)
)

cli.command(
  'migrate',
  'Run pending database migrations',
  (yargs) => yargs,
  (args) => migrateCommand(args).catch(errorHandler)
)

cli.command(
  'fake-schedule',
  'Generate a fake schedule for development',
  (yargs) => yargs,
  (args) => fakeScheduleCommand(args).catch(errorHandler)
)

cli.command(
  'log-visitors',
  'See how many people are on the site and log it to the store',
  (yargs) => yargs,
  (args) => logVisitorsCommand(args).catch(errorHandler)
)

cli.command(
  'export-schedule [destination]',
  'Export a public static version of the schedule',
  (yargs) =>
    yargs.positional('destination', {
      type: 'string',
      describe: 'Where to put the static files',
      default: 'static/schedule',
    }),
  (args) => exportScheduleCommand(args).catch(errorHandler)
)

cli.parse()
