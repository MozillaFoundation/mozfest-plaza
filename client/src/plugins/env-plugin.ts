import type { App } from 'vue'

// TODO: replace `DISABLE_SOCKETS` with `SOCKETS_URL`

export interface EnvRecord {
  readonly SELF_URL: URL
  readonly SERVER_URL: URL
  readonly BUILD_NAME: string | null
  readonly GA_TOKEN: string | null
  readonly CONSENT_ID: string | null
  readonly CONSENT_URL: string
  readonly JWT_ISSUER: string | null
  readonly DISABLE_SOCKETS: boolean
  readonly STATIC_BUILD: boolean
  readonly SESSION_SHARE_URL: string

  readonly DECONF_API_URL: URL
  readonly DECONF_CONFERENCE: number

  readonly APP_NAME: string
  readonly APP_VERSION: string

  readonly SCHEDULE_TIMEZONE: string | null

  readonly CUSTOM_METRICS: boolean

  readonly MOZ_API_URL: URL
}

// window.CONFIG is from public/config.js

const {
  SELF_URL = 'http://localhost:8080/',
  SERVER_URL = 'http://localhost:3000/',
  BUILD_NAME = null,
  GA_TOKEN = null,
  CONSENT_ID = null,
  CONSENT_URL = 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js',
  JWT_ISSUER = 'deconf-app',
  DISABLE_SOCKETS = false,
  STATIC_BUILD = false,
  SESSION_SHARE_URL = `${location.origin}/session/$1`,

  DECONF_API_URL = 'http://localhost:3000/',
  DECONF_CONFERENCE = '-1',

  SCHEDULE_TIMEZONE = null,

  CUSTOM_METRICS = false,

  MOZ_API_URL = 'http://localhost:3001',
} = window.CONFIG || {}

export const env = Object.seal<EnvRecord>({
  SELF_URL: new URL(SELF_URL),
  SERVER_URL: new URL(SERVER_URL),
  BUILD_NAME,
  GA_TOKEN,
  CONSENT_ID,
  CONSENT_URL,
  JWT_ISSUER,
  DISABLE_SOCKETS: Boolean(DISABLE_SOCKETS),
  STATIC_BUILD: Boolean(STATIC_BUILD),
  SESSION_SHARE_URL,

  DECONF_API_URL: new URL(DECONF_API_URL),
  DECONF_CONFERENCE: parseInt(DECONF_CONFERENCE),

  /** @ts-expect-error This is injected by vite */
  APP_NAME: __APP_NAME__,

  /** @ts-expect-error This is injected by vite */
  APP_VERSION: BUILD_NAME ?? __APP_VERSION__,

  SCHEDULE_TIMEZONE,
  CUSTOM_METRICS: Boolean(CUSTOM_METRICS),

  MOZ_API_URL: new URL(MOZ_API_URL),
})

if (env.DECONF_CONFERENCE === -1) {
  console.error('DECONF_CONFERENCE not set')
}

//
// A plugin to provide environment variables to Vue components
//
export class EnvPlugin {
  static install(app: App): void {
    app.config.globalProperties.$env = env
  }
}
