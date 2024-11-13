import { google } from 'googleapis'
import { createDebug, EnvRecord } from './utils.js'
import { Oauth2Record, Oauth2Repository } from '../deconf/oauth2-repository.js'

const debug = createDebug('lib:google')

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

export interface ActiveToken {
  accessToken?: string
  refreshToken?: string | null
}

/** From a set of attendee tokens, get their latest access & refresh tokens */
export function getActiveToken(
  tokens: Oauth2Record[],
  scope: string
): ActiveToken {
  const newestFirst = tokens
    .filter((t) => t.scope.includes(scope))
    .sort((a, b) => b.created.getTime() - a.created.getTime())

  // Return the newest token that has a refresh token & latest access token
  return {
    refreshToken: newestFirst.map((t) => t.refreshToken).filter((t) => t)[0],
    accessToken: newestFirst[0]?.accessToken,
  }
}

export function setupGoogleAuth(
  env: EnvRecord,
  token: ActiveToken,
  attendee: number,
  queue: Promise<void>[],
  oauth2Repo: Readonly<Oauth2Repository>
) {
  // Create a google client to authenticate the user
  const auth = getGoogleClient(env)
  auth.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
  })
  auth.on('tokens', (tokens) => {
    debug('enqueue new token attendee=%o', attendee)
    queue.push(
      oauth2Repo.store(
        attendee,
        'google',
        tokens.scope ?? '',
        tokens.access_token!,
        tokens.refresh_token ?? null,
        tokens.expiry_date ? new Date(tokens.expiry_date) : null
      )
    )
  })
  return auth
}
