import ky from 'ky'
import {
  ApiStoreModule,
  AuthenticateOptions,
  createApiStoreModule,
  decodeJwt,
  deepSeal,
  FullAuthToken,
  pause,
} from '@openlab/deconf-ui-toolkit'
import {
  ScheduleRecord,
  UserRegistration,
  CarbonCalculation,
  LocalisedLink,
  UserSessionAttendance,
  UserAttendance,
  LocalisedContent,
  Session,
} from '@openlab/deconf-shared'
import { env } from '@/plugins/env-plugin'
import { StorageKey, themeAllowlist } from '@/lib/module'
import { SocketIoPlugin } from '@/plugins/socketio-plugin'

const API_DELAY = 300

function requestMiddleware(request: Request) {
  const token = localStorage.getItem(StorageKey.AuthToken)
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`)
  }
}

function errorHandler(error: unknown) {
  console.error(error)
  return null
}

export function apiModule(): ApiStoreModule {
  const agent = ky.extend({
    prefixUrl: env.SERVER_URL,
    hooks: {
      beforeRequest: [requestMiddleware],
    },
  })

  return {
    ...createApiStoreModule(),
    getters: {
      agent: () => agent,
    },
    actions: {
      async authenticate({ commit, dispatch }, { token }: AuthenticateOptions) {
        const user = decodeJwt(token) as FullAuthToken

        if (user.iss !== env.JWT_ISSUER) {
          console.error('JWT signed by unknown issuer %o', user.iss)
          commit('user', null)
          return
        }

        commit('user', user)

        SocketIoPlugin.authenticate(token)

        await dispatch('fetchData')
        await dispatch('fetchUserAttendance')
      },
      async fetchData({ commit }): Promise<boolean> {
        const data = await agent
          .get('schedule', { timeout: 30000 })
          .json<ScheduleRecord>()
          .catch(errorHandler)

        if (data) {
          data.themes = data.themes.filter((t) => themeAllowlist.has(t.id))
        }

        commit('schedule', data)
        return data !== null
      },
      async fetchWhatsOn() {
        const data = await agent
          .get('schedule/whats-on')
          .json<{ sessions: Session[] }>()
          .catch(errorHandler)

        return data?.sessions ?? []
      },

      //
      // Login logic
      //
      async login(ctx, email) {
        const response = await agent
          .post('auth/login', {
            json: { email },
          })
          .catch(errorHandler)

        return Boolean(response?.ok)
      },

      async register() {
        // Not needed
      },

      async unregister() {
        const response = await agent.delete('auth/me').catch(errorHandler)
        await pause(API_DELAY)
        return Boolean(response?.ok)
      },

      async fetchProfile({ commit }) {
        try {
          const response = await agent.get('auth/me').json<UserRegistration>()
          commit('profile', response.registration)
        } catch (error) {
          console.error(error)
          commit('profile', null)
        }
      },

      async updateProfile() {
        // Not applicable for Tito profiles
      },

      //
      // Carbon
      //
      async fetchCarbon({ commit }) {
        const response = await agent
          .get('carbon')
          .json<CarbonCalculation>()
          .catch(errorHandler)

        commit('carbon', response)
      },

      //
      // Attendance
      //
      async fetchLinks(ctx, sessionId: string) {
        const result = await agent
          .get(`schedule/${sessionId}/links`)
          .json<{ links: LocalisedLink[] }>()
          .catch(errorHandler)

        return deepSeal(result)
      },
      async fetchSessionAttendance(ctx, sessionId: string) {
        const result = await agent
          .get(`attendance/${sessionId}`)
          .json<UserSessionAttendance>()
          .catch(errorHandler)

        // Sort out the sessionCount being a string and also seal for performance
        return deepSeal(result)
      },
      async attend({ dispatch }, sessionId) {
        await agent.post(`attendance/${sessionId}/attend`).catch(errorHandler)
        dispatch('fetchUserAttendance')
        await pause(API_DELAY)
      },
      async unattend({ dispatch }, sessionId) {
        await agent.post(`attendance/${sessionId}/unattend`).catch(errorHandler)
        dispatch('fetchUserAttendance')
        await pause(API_DELAY)
      },
      async fetchUserAttendance({ commit }) {
        const result = await agent
          .get('attendance/me')
          .json<UserAttendance>()
          .catch(errorHandler)

        commit('userAttendance', result?.attendance ?? [])
      },

      //
      // Content
      //
      async fetchContent(ctx, { slug }: { slug: string }) {
        const data = await agent
          .get(`content/${slug}`)
          .json<LocalisedContent>()
          .catch(errorHandler)

        return data ? deepSeal(data.content) : null
      },

      //
      // Calendar
      //
      async fetchUserCalendar(): Promise<string | null> {
        const data = await agent
          .get('calendar/me')
          .json<{ url: string }>()
          .catch(errorHandler)

        return data?.url ?? null
      },
    },
  }
}
