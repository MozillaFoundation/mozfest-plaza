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
import {
  apiClient,
  deconfClient,
  type MozConferenceConfig,
  type ProfileToken,
} from '@/lib/module.js'
import type { Module } from 'vuex'
import { mozClient } from '@/lib/mozfest-client.ts'

export interface LoginPayload {
  email: string
  redirect: string
}

export interface MozApiStoreState extends ApiModuleState {
  settings: MozConferenceConfig | undefined
  tokens: ProfileToken[] | undefined
}

export function apiModule(): Module<MozApiStoreState, unknown> {
  const base = createApiStoreModule()
  const baseActions = createApiStoreActions(apiClient)

  return {
    namespaced: true,
    state: () => ({
      ...(base.state as ApiModuleState),
      settings: undefined,
      tokens: undefined,
    }),
    mutations: {
      ...base.mutations,
      settings(state, settings) {
        state.settings = settings
      },
      tokens(state, tokens) {
        state.tokens = tokens
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

        // TODO: this is a pre-deconf hack
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user.user_roles = (user as any)?.scope?.split(/\s+/) ?? []

        commit('user', user)

        apiClient.setAuthToken(token)
        deconfClient.options.bearerToken = token
        mozClient.options.bearerToken = token
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

      async login(/* ctx, email: string */) {
        throw new Error('not implemented')
      },

      async fetchProfile({ commit }) {
        const result = await apiClient.getRegistration()
        commit('profile', result?.registration ?? null)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        commit('tokens', (result as any).tokens ?? null)
      },
    },
  }
}
