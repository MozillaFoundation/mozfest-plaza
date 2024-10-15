/// <reference types="vuex/types/index.d.ts" />
import { createStore } from 'vuex'

import { apiModule } from './api-module.js'
import { metricsModule } from './metrics-module.js'

import type {
  ApiModuleState,
  MetricsModuleState,
} from '@openlab/deconf-ui-toolkit'
import { whatsOnModule, type WhatsOnModuleState } from './whats-on-module.js'

export { mapWhatsOnState } from './whats-on-module'

export interface StoreState {
  api: ApiModuleState
  metrics: MetricsModuleState
  whastsOn: WhatsOnModuleState
}

export default createStore({
  modules: {
    api: apiModule(),
    metrics: metricsModule(),
    whatsOn: whatsOnModule(),
  },
})
