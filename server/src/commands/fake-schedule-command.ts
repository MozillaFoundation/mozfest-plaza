import { MockScheduleCommand, RedisService } from '@openlab/deconf-api-toolkit'
import { checkEnvObject, pluck } from 'valid-env'
import { createDebug } from '../lib/module.js'

const debug = createDebug('cmd:fake-schedule')

export interface FakeScheduleCommandOptions {}

export async function fakeScheduleCommand(options: FakeScheduleCommandOptions) {
  debug('start')

  const env = checkEnvObject(pluck(process.env, 'REDIS_URL'))
  const store = new RedisService(env.REDIS_URL)
  const cmd = new MockScheduleCommand({ store })

  await cmd.process({
    exclude: ['settings'],
  })

  await store.close()
}
