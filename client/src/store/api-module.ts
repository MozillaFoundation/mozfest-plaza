import {
  ApiStoreModule,
  AuthenticateOptions,
  createApiStoreActions,
  createApiStoreModule,
  decodeJwt,
  FullAuthToken,
} from '@openlab/deconf-ui-toolkit'
import { Session } from '@openlab/deconf-shared'
import { env } from '@/plugins/env-plugin'

import { SocketIoPlugin } from '@/plugins/socketio-plugin'
import { pickApi } from '@/lib/api'

// TODO: work out how to filter themes again
// import { StorageKey, themeAllowlist } from '@/lib/module'

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
      // async fetchData({ commit }): Promise<boolean> {
      //   const data = await agent
      //     .get('schedule', { timeout: 30000 })
      //     .json<ScheduleRecord>()
      //     .catch(errorHandler)

      //   if (data) {
      //     data.themes = data.themes.filter((t) => themeAllowlist.has(t.id))
      //   }

      //   commit('schedule', data)
      //   return data !== null
      // },
      async fetchWhatsOn() {
        return apiClient.getWhatsOn()
      },
    },
  }
}
