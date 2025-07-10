import type { App } from 'vue'

// TODO: replace `DISABLE_SOCKETS` with `SOCKETS_URL`

export interface EnvRecord {
  readonly SELF_URL: URL
  readonly SERVER_URL: URL
  readonly BUILD_NAME: string | null
  readonly GA_TOKEN: string | null
  readonly JWT_ISSUER: string | null
  readonly DISABLE_SOCKETS: boolean
  readonly STATIC_BUILD: boolean
  readonly SESSION_SHARE_URL: string

  readonly DECONF_API_URL: string
  readonly DECONF_CONFERENCE: number

  readonly APP_NAME: string
  readonly APP_VERSION: string
}

// window.CONFIG is from public/config.js

const {
  SELF_URL = 'http://localhost:8080/',
  SERVER_URL = 'http://localhost:3000/',
  BUILD_NAME = null,
  GA_TOKEN = null,
  JWT_ISSUER = 'deconf-app',
  DISABLE_SOCKETS = false,
  STATIC_BUILD = false,
  SESSION_SHARE_URL = 'http://localhost:8080/session/$1',

  DECONF_API_URL = 'http://localhost:3000/',
  DECONF_CONFERENCE = '-1',
} = window.CONFIG || {}

export const env = Object.seal<EnvRecord>({
  SELF_URL: new URL(SELF_URL),
  SERVER_URL: new URL(SERVER_URL),
  BUILD_NAME,
  GA_TOKEN,
  JWT_ISSUER,
  DISABLE_SOCKETS: Boolean(DISABLE_SOCKETS),
  STATIC_BUILD: Boolean(STATIC_BUILD),
  SESSION_SHARE_URL,

  DECONF_API_URL,
  DECONF_CONFERENCE: parseInt(DECONF_CONFERENCE),

  /** @ts-expect-error This is injected by vite */
  APP_NAME: __APP_NAME__,

  /** @ts-expect-error This is injected by vite */
  APP_VERSION: BUILD_NAME ?? __APP_VERSION__,
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
