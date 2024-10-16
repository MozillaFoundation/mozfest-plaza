// import { type Module } from 'vuex/types/index'
import {
  type ApiModuleState,
  type AuthenticateOptions,
  createApiStoreActions,
  createApiStoreModule,
  decodeJwt,
  type FullAuthToken,
} from '@openlab/deconf-ui-toolkit'
import { env } from '@/plugins/env-plugin'

import { SocketIoPlugin } from '@/plugins/socketio-plugin.js'
import { pickApi, type MozConferenceConfig } from '@/lib/api.js'

export interface LoginPayload {
  email: string
  redirect: string
}

export interface MozApiStoreState extends ApiModuleState {
  settings: MozConferenceConfig | undefined
}

// export type MozApiStoreModule = Module<MozApiStoreState, unknown>

export function apiModule() {
  const apiClient = pickApi(env)

  const base = createApiStoreModule()
  const baseActions = createApiStoreActions(apiClient)

  return {
    namespaced: true,
    state: () => ({
      ...(base.state as ApiModuleState),
      settings: undefined,
    }),
    mutations: {
      ...base.mutations,
      settings(state, settings) {
        state.settings = settings
      },
    },
    getters: {
      ...base.getters,
      apiClient: () => apiClient,
      userSessions: (store) => store.userSessions ?? [],
    },
    actions: {
      ...baseActions,

      async authenticate({ commit, dispatch }, { token }: AuthenticateOptions) {
        const user = decodeJwt(token) as FullAuthToken

        if (user.iss !== env.JWT_ISSUER) {
          console.error('JWT signed by unknown issuer %o', user.iss)
          commit('user', null)
          return
        }

        commit('user', user)

        apiClient.setAuthToken(token)
        SocketIoPlugin.authenticate(token)

        await dispatch('fetchData')
        await dispatch('fetchUserAttendance')
      },
      async fetchData({ commit }): Promise<boolean> {
        const data = await apiClient.getSchedule()
        // if (data) {
        //   data.themes = data.themes.filter((t) => themeAllowlist.has(t.id))
        // }
        commit('schedule', data)
        commit('settings', data?.settings)
        return data !== null
      },
      async fetchWhatsOn() {
        return apiClient.getWhatsOn()
      },

      // TODO: remove this hack + getRedirect if login redirection gets merged upstream
      login(ctx, email: string) {
        return apiClient.startEmailLogin(email, { redirect: getRedirect() })
      },
    },
  }
}

function getRedirect() {
  const url = new URL(location.href)
  const target = url.searchParams.get('redirect')
  if (typeof target !== 'string' || !target.startsWith('/')) {
    return undefined
  }
  return target
}
