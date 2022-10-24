/* eslint-disable @typescript-eslint/no-explicit-any */

import _Vue from 'vue'

export interface EnvRecord {
  readonly SELF_URL: string
  readonly SERVER_URL: string
  readonly BUILD_NAME: string | null
  readonly GA_TOKEN: string | null
  readonly JWT_ISSUER: string | null
  readonly DISABLE_SOCKETS: boolean
}

// window.CONFIG is from public/config.js

function normaliseUrl(input: string) {
  return input.replace(/\/*$/, '/')
}

interface WindowWithConfig {
  CONFIG?: Record<string, string | undefined>
}

const {
  SELF_URL = 'http://localhost:8080/',
  SERVER_URL = 'http://localhost:3000/',
  BUILD_NAME = null,
  GA_TOKEN = null,
  JWT_ISSUER = 'deconf-app',
  DISABLE_SOCKETS = false,
} = (window as WindowWithConfig).CONFIG || {}

export const env: EnvRecord = Object.seal({
  SELF_URL: normaliseUrl(SELF_URL),
  SERVER_URL: normaliseUrl(SERVER_URL),
  BUILD_NAME,
  GA_TOKEN,
  JWT_ISSUER,
  DISABLE_SOCKETS: Boolean(DISABLE_SOCKETS),
})

//
// A plugin to provide environment variables to Vue components
//
export class EnvPlugin {
  static install(Vue: typeof _Vue): void {
    Vue.prototype.$env = env
  }
}
