/// <reference types="vite/client" />

//
// This type file describes vue plugins
//

import { Store } from 'vuex'
import { VueI18n } from 'vue-i18n'

import { EnvRecord } from '@/plugins/env-plugin'
import { MetricsPlugin } from '@/plugins/metrics-plugin'
import { SocketIoPlugin } from '@/plugins/socketio-plugin'
import {
  TemporalPlugin,
  DevPlugin,
  DialogPlugin,
} from '@openlab/deconf-ui-toolkit'
import { StoreState } from '@/store/module'

declare global {
  interface Window {
    CONFIG?: Record<string, string | undefined>
    APP_NAME: string
    APP_VERSION: string
  }
}

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
    $i18n: VueI18n
    $t(...args: unknown[]): string
    // $deconf: DeconfPlugin
  }
}
