//
// This type file describes vue plugins
//

import { Store } from 'vuex'

import { EnvRecord } from '@/plugins/env-plugin'
import { MetricsPlugin } from '@/plugins/metrics-plugin'
import { SocketIoPlugin } from '@/plugins/socketio-plugin'
import { TemporalPlugin, DevPlugin } from '@openlab/deconf-ui-toolkit'
import { StoreState } from '@/store/module'
import { DialogPlugin } from '@/plugins/dialog-plugin'

declare module 'vue/types/vue' {
  // provide typings for `this` in Vue components
  interface Vue {
    $store: Store<StoreState>
    $env: EnvRecord
    $dev: DevPlugin
    $temporal: TemporalPlugin
    $metrics: MetricsPlugin
    $io?: SocketIoPlugin
    $dialog: DialogPlugin
    // $deconf: DeconfPlugin
  }
}
