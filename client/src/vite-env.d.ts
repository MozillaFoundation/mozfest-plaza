/// <reference types="vite/client" />

//
// This type file describes vue plugins
//

import { Store } from 'vuex'
import { VueI18n } from 'vue-i18n'
import { VueRouter, RouteLocationNormalizedLoaded } from 'vue-router'

import { EnvRecord } from '@/plugins/env-plugin'
import { MetricsPlugin } from '@/plugins/metrics-plugin'
import { SocketIoPlugin } from '@/plugins/socketio-plugin'
import type { ServiceWorkerPlugin } from './src/plugins/service-worker-plugin'
import {
  TemporalPlugin,
  DevPlugin,
  DialogPlugin,
} from '@openlab/deconf-ui-toolkit'
import { StoreState } from '@/store/module'
import type { ConsentPlugin } from './plugins/consent-plugin.js'

declare global {
  interface Window {
    CONFIG?: Record<string, string | undefined>
    dataLayer?: unknown[]
    OptanonWrapper?: any
  }
}

declare const __APP_NAME__: string
declare const __APP_VERSION__: string

declare module 'vue' {
  // provide typings for `this` in Vue components
  export interface ComponentCustomProperties {
    $store: Store<StoreState>
    $env: EnvRecord
    $dev: DevPlugin
    $temporal: TemporalPlugin
    $metrics: MetricsPlugin
    $io?: SocketIoPlugin
    $dialog: DialogPlugin
    $serviceWorker: ServiceWorkerPlugin
    $i18n: VueI18n
    $t(...args: unknown[]): string
    // $deconf: DeconfPlugin
    $router: VueRouter
    $route: RouteLocationNormalizedLoaded
    $consent: ConsentPlugin
  }
}
