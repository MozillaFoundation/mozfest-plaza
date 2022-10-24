import { createEnv as createDeconfEnv } from '@openlab/deconf-api-toolkit'

export type EnvRecord = ReturnType<typeof createEnv>

export function createEnv(processEnv = process.env) {
  const { REDIS_URL = null } = processEnv

  return Object.assign(createDeconfEnv(processEnv), { REDIS_URL })
}
