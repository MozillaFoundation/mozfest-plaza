import fs from 'fs/promises'
import crypto from 'crypto'

import debug from 'debug'
import {
  ApiError,
  createEnv as createDeconfEnv,
  EmailService,
  JwtService,
  RegistrationRepository,
} from '@openlab/deconf-api-toolkit'
import { create } from 'superstruct'
import { checkEnvObject } from 'valid-env'

import { AppConfigStruct } from './structs.js'
import { EmailLoginToken, Registration } from '@openlab/deconf-shared'
import { AppContext } from './types.js'

export type EnvRecord = ReturnType<typeof createEnv>

/** Validate environment variables and return them with typed */
export function createEnv(processEnv = process.env) {
  const {
    REDIS_URL = null,
    ADMIN_EMAILS = null,
    TITO_SECURITY_TOKEN = null,
    GOOGLE_OAUTH2_CLIENT_ID,
    GOOGLE_OAUTH2_CLIENT_SECRET,
  } = processEnv

  return Object.assign(createDeconfEnv(processEnv), {
    REDIS_URL,
    ADMIN_EMAILS: new Set(ADMIN_EMAILS?.split(/\s*,\s*/)),
    TITO_SECURITY_TOKEN,
    ...checkEnvObject({
      GOOGLE_OAUTH2_CLIENT_ID,
      GOOGLE_OAUTH2_CLIENT_SECRET,
    }),
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

export async function upsertRegistration(
  repo: Readonly<RegistrationRepository>,
  emailAddress: string,
  name: string
): Promise<Registration> {
  // Get registrations and find the newest one
  const registrations = await repo.getRegistrations(emailAddress)
  let [registration] = registrations.sort((a, b) => b.id - a.id)

  if (!registration) {
    await repo.register({
      name: name,
      email: emailAddress,
      language: 'en',
      country: '',
      affiliation: '',
      userData: {},
    })

    const registrations = await repo.getRegistrations(emailAddress)
    registration = registrations.sort((a, b) => b.id - a.id)[0]
  }

  if (!registration) throw ApiError.internalServerError()

  return registration
}

export interface SendLoginEmailOptions {
  subject: string
  duration: string
  templateId: string
  roles: string[]
  redirect?: string
}
