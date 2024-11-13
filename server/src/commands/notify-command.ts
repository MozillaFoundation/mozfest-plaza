import {
  createDebug,
  MetricsRepository,
  PostgresClient,
  PostgresService,
  SemaphoreService,
} from '@openlab/deconf-api-toolkit'
import ms from 'ms'
import webPush from 'web-push'

import {
  AppContext,
  createEnv,
  loadConfig,
  logServerError,
} from '../lib/module.js'
import { pickAStore } from './serve-command.js'
import {
  NotificationsRepository,
  WebPushDeviceRecord,
} from '../mozfest/notifications-repo.js'

const debug = createDebug('cmd:migrate')

type Context = Pick<AppContext, 'store' | 'notifsRepo' | 'metricsRepo'> & {
  dryRun: boolean
}

const LOCK_KEY = 'notifyCommand/lock'
const LOCK_AGE = ms('30s')

export interface NotifyCommandOptions {
  dryRun: boolean
}

export async function notifyCommand(options: NotifyCommandOptions) {
  debug('start')
  const env = createEnv()
  const config = await loadConfig()
  const store = pickAStore(env.REDIS_URL)
  const postgres = new PostgresService({ env })

  const semaphore = new SemaphoreService({ store })

  const metricsRepo = new MetricsRepository({ postgres })
  const notifsRepo = new NotificationsRepository({ postgres })

  webPush.setVapidDetails(
    'mailto:' + config.mail.fromEmail,
    env.WEB_PUSH_PUBLIC_KEY,
    env.WEB_PUSH_PRIVATE_KEY
  )

  try {
    const unlocked = await semaphore.aquire(LOCK_KEY, LOCK_AGE)
    if (!unlocked) throw new Error('Failed to aquire lock')
    debug('unlocked')

    const result = await _run({ store, notifsRepo, metricsRepo, ...options })
    console.log('finished %O', result)
  } catch (error) {
    await logServerError(metricsRepo, 'webPush/error', error)
  } finally {
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

async function _run({ notifsRepo, metricsRepo, dryRun }: Context) {
  const messages = await notifsRepo.listPendingWebPushMessages()

  debug('messages', messages.length)

  if (dryRun) {
    console.log('%d message(s) to send', messages.length)
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
    debug('message=%d device=%d', message.id, message.device)
    const device = await notifsRepo.getAttendeeWebPushDevice(message.device)
    if (!device) {
      console.error('missing device id=%d', message.device)
      continue
    }

    const success = await _send(message, device)
    debug('  success=%o', success)
    if (success) {
      await notifsRepo.updateWebPushMessage(message, 'sent')
      counts.sent++
    } else {
      await notifsRepo.updateWebPushMessage(message, 'failed')
      counts.failed++
    }
    await metricsRepo.trackEvent('webPush/send', { success })
  }

  return counts
}

async function _send(
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
