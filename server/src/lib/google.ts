import { google } from 'googleapis'
import { EnvRecord } from './utils.js'

export const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar'

type Env = Pick<
  EnvRecord,
  'GOOGLE_OAUTH2_CLIENT_ID' | 'GOOGLE_OAUTH2_CLIENT_SECRET' | 'SELF_URL'
>

export function getGoogleClient(env: Env) {
  return new google.auth.OAuth2(
    env.GOOGLE_OAUTH2_CLIENT_ID,
    env.GOOGLE_OAUTH2_CLIENT_SECRET,
    new URL('./auth/oauth2/google/callback', env.SELF_URL).toString()
  )
}
