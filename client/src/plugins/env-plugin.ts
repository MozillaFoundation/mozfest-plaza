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
})

//
// A plugin to provide environment variables to Vue components
//
export class EnvPlugin {
  static install(app: App): void {
    app.config.globalProperties.$env = env
  }
}
