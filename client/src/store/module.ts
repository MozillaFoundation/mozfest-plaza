import Vue from 'vue'
import Vuex from 'vuex'

import { apiModule } from './api-module'
import { metricsModule } from './metrics-module'

import { ApiModuleState, MetricsModuleState } from '@openlab/deconf-ui-toolkit'
import { whatsOnModule, WhatsOnModuleState } from './whats-on-module'

export { mapWhatsOnState } from './whats-on-module'

export interface StoreState {
  api: ApiModuleState
  metrics: MetricsModuleState
  whastsOn: WhatsOnModuleState
}

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    api: apiModule(),
    metrics: metricsModule(),
    whatsOn: whatsOnModule(),
  },
})
