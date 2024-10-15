import type { Session } from '@openlab/deconf-shared'
import { ApiState, createStateMapper } from '@openlab/deconf-ui-toolkit'
import type { Module } from 'vuex'

export interface WhatsOnModuleState {
  apiState: ApiState
  sessions: Session[] | null
}

export const mapWhatsOnState = createStateMapper<WhatsOnModuleState>()

export function whatsOnModule(): Module<WhatsOnModuleState, unknown> {
  return {
    namespaced: true,
    state: {
      apiState: ApiState.init,
      sessions: null,
    },
    mutations: {
      sessions: (state, sessions: Session[] | null) => {
        state.sessions = sessions
        state.apiState = sessions !== null ? ApiState.ready : ApiState.error
      },
    },
  }
}
