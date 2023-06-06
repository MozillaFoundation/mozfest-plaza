import { I18nService, RedisService } from '@openlab/deconf-api-toolkit'
import { Session } from '@openlab/deconf-shared'
import ipRegex from 'ip-regex'
import yaml from 'yaml'
import fs from 'fs/promises'

import { generateSessionOpengraphImage } from '../general/general-router.js'
import { createEnv, loadConfig } from '../lib/module.js'

//
// Helpers
//

async function setup() {
  const config = await loadConfig()
  const env = createEnv()

  if (!env.REDIS_URL) throw new Error('REDIS_URL not set')

  const store = new RedisService(env.REDIS_URL)

  return { config, env, store }
}

async function teardown(store: RedisService) {
  await store.close()
}

//
// Export for cli.ts
//

export const hackCommands = {
  'recorded-sessions': recordedSessions,
  ips: parseIps,
  'load-io': loadIo,
  opengraph: opengraphImage,
  i18n: missingI18n,
} satisfies Record<string, (args: any) => void>

//
// Hacks
//

/** A hack to output recorded sessions as a CSV */
async function recordedSessions() {
  const { store } = await setup()

  const sessions = await store.retrieve<Session[]>('schedule.sessions')

  const csv: string[] = ['session,isRecorded,url']

  for (const session of sessions ?? []) {
    csv.push(`${session.id},${session.isRecorded}`)
  }

  console.log(csv.join('\r\n'))

  await teardown(store)
}

/** A hack to parse ips from stdin and display the most frequent*/
async function parseIps() {
  const ipMap = new Map()

  // hack ids in here
  const blocklist = new Set<string>([])

  function matchAll(input: string, regex: RegExp) {
    const matches: RegExpExecArray[] = []

    let result: RegExpExecArray | null
    while ((result = regex.exec(input))) {
      matches.push(result)
    }
    return matches
  }

  process.stdin.on('data', (line) => {
    const ips = matchAll(line.toString('utf8'), ipRegex())

    for (const match of ips) {
      const [ip] = match
      if (blocklist.has(ip)) continue

      ipMap.set(ip, (ipMap.get(ip) ?? 0) + 1)
    }
  })
  process.stdin.on('close', () => {
    render()
    clearInterval(timerId)
  })

  process.on('SIGINT', () => {
    process.exit(1)
  })
  process.on('SIGTERM', () => {
    process.exit(1)
  })

  const timerId = setInterval(() => render(), 1000)

  function render() {
    console.clear()

    const sortedIps = [...ipMap.entries()]
      .filter(([ip, count]) => !ip.startsWith('10.'))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)

    for (const [ip, count] of sortedIps) {
      console.log('%o %o', ip, count)
    }
  }
}

export async function loadIo() {
  const { io } = await import('socket.io-client')

  async function getSocket() {
    const socket = io('wss://mozfest.openlab.dev/', {
      path: '/api/socket.io',
      multiplex: false,
      transports: ['websocket'],
    })

    await new Promise<void>((resolve) => socket.once('connect', resolve))

    return socket
  }

  process.on('SIGINT', () => {
    process.exit()
  })

  let count = 0

  while (true) {
    const sockets = await Promise.all(
      Array.from({ length: 50 }, () => getSocket())
    )
    for (const socket of sockets) socket.close()
    console.clear()
    console.log(count++)
  }
}

export async function opengraphImage(args: any) {
  const [name = 'My test session'] = args._.slice(1)

  const config = await loadConfig()

  if (!config.cloudinary) throw new Error('Not configured')

  console.log()
  console.log(
    generateSessionOpengraphImage(name, new Date(), config.cloudinary)
  )
}

export async function missingI18n() {
  const en = yaml.parse(
    await fs.readFile(
      new URL('../../../client/src/i18n/en.yml', import.meta.url),
      'utf8'
    )
  )
  const es = yaml.parse(
    await fs.readFile(
      new URL('../../../client/src/i18n/es.yml', import.meta.url),
      'utf8'
    )
  )

  const some = I18nService.findMissingKeys({ en, es })

  console.log(some)
}
