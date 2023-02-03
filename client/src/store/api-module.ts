import {
  ApiStoreModule,
  AuthenticateOptions,
  createApiStoreActions,
  createApiStoreModule,
  decodeJwt,
  FullAuthToken,
} from '@openlab/deconf-ui-toolkit'
import { env } from '@/plugins/env-plugin'

import { SocketIoPlugin } from '@/plugins/socketio-plugin'
import { pickApi } from '@/lib/api'

import { themeAllowlist } from '@/lib/module'

export interface LoginPayload {
  email: string
  redirect: string
}

export function apiModule(): ApiStoreModule {
  const apiClient = pickApi(env)

  const baseActions = createApiStoreActions(apiClient)

  return {
    ...createApiStoreModule(),
    getters: {
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
        if (data) {
          data.themes = data.themes.filter((t) => themeAllowlist.has(t.id))
        }
        commit('schedule', data)
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

console.log(getRedirect())
