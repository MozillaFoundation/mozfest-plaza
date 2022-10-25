import fs from 'fs/promises'
import crypto from 'crypto'

import debug from 'debug'
import { createEnv as createDeconfEnv } from '@openlab/deconf-api-toolkit'
import { create } from 'superstruct'

import { AppConfigStruct } from './structs.js'

export type EnvRecord = ReturnType<typeof createEnv>

/** Validate environment variables and return them with typed */
export function createEnv(processEnv = process.env) {
  const { REDIS_URL = null, ADMIN_EMAILS = null } = processEnv

  return Object.assign(createDeconfEnv(processEnv), {
    REDIS_URL,
    ADMIN_EMAILS: new Set(ADMIN_EMAILS?.split(/\s*,\s*/)),
  })
}

/** Load the local app-config.json and validate it */
export async function loadConfig() {
  const rawConfig = JSON.parse(await fs.readFile('app-config.json', 'utf8'))
  return create(rawConfig, AppConfigStruct)
}

/** Create a localised debug method */
export function createDebug(namespace: string) {
  return debug(`moz:${namespace}`)
}

export function sha256Hash(input: string) {
  return crypto.createHash('sha256').update(input).digest('base64')
}
