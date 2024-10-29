import { env, type EnvRecord } from '@/plugins/env-plugin'
import type {
  LocalisedLink,
  PageFlag,
  ScheduleRecord as DeconfScheduleRecord,
  Session,
} from '@openlab/deconf-shared'
import {
  DeconfApiClient,
  type DeconfStaticFiles,
  StaticDeconfApiClient,
} from '@openlab/deconf-ui-toolkit'

export interface MozConferenceConfig {
  atrium: PageFlag
  whatsOn: PageFlag
  schedule: PageFlag
  helpDesk: PageFlag
  coffeeChat: PageFlag
  maps?: PageFlag

  social?: PageFlag
  arts?: PageFlag
  lightningTalks?: PageFlag
  fringe?: PageFlag
  house?: PageFlag
  houseInfo?: PageFlag
  misinfoCon?: PageFlag
  emergentInfo?: PageFlag
  emergentSessions?: PageFlag
  mySchedule?: PageFlag
  search?: PageFlag

  navigation: {
    showInterpret: boolean
    showProfile: boolean
    showLogin: boolean
    showRegister: boolean
  }

  atriumWidgets: {
    register: boolean
    twitter: boolean
    login: boolean
    siteVisitors: boolean
    spatialChat: boolean
    slack: boolean
    familyResources: boolean
    mozfestBook: boolean
  }

  content: {
    atriumVideo: string
    featuredSessions: string[]
  }

  isStatic: boolean
  startDate: Date
  endDate: Date
}

export type ScheduleRecord = Omit<DeconfScheduleRecord, 'settings'> & {
  settings: MozConferenceConfig
}

export interface MozLoginOptions {
  redirect?: string
}

export interface MozApiClient {
  getWhatsOn(): Promise<Session[]>
  startEmailLogin(email: string, options?: MozLoginOptions): Promise<boolean>
  unlinkGoogleCalendar(): Promise<void>
}

export function pickApi(env: EnvRecord): DeconfApiClient & MozApiClient {
  return env.STATIC_BUILD
    ? new StaticApiClient(env.SERVER_URL.href)
    : new LiveApiClient(env.SERVER_URL.href)
}

type MozStaticFiles = DeconfStaticFiles & {
  'whats-on.json': Session[]
}

export class LiveApiClient extends DeconfApiClient implements MozApiClient {
  async getWhatsOn(): Promise<Session[]> {
    const response = await this.fetchJson<{ sessions: Session[] }>(
      'schedule/whats-on'
    )
    return response?.sessions ?? []
  }

  async unlinkGoogleCalendar(): Promise<void> {
    await this.fetch('/calendar/google/unlink', { method: 'POST' })
  }

  // override async getLinks(): Promise<SessionLinks | null> {
  //   return {
  //     links: [
  //       {
  //         type: '',
  //         url: 'https://www.youtube.com/watch?v=DRFHklnN-SM',
  //         language: 'en',
  //       },
  //       {
  //         type: '',
  //         url: 'https://example.com',
  //         language: 'en',
  //       },
  //     ],
  //   }
  // }

  override async startEmailLogin(
    email: string,
    { redirect }: MozLoginOptions = {}
  ): Promise<boolean> {
    return this.fetch(this.getEndpoint('RegistrationRoutes.startEmailLogin'), {
      method: 'POST',
      body: JSON.stringify({ email, redirect }),
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export class StaticApiClient
  extends StaticDeconfApiClient<MozStaticFiles>
  implements MozApiClient
{
  getWhatsOn(): Promise<Session[]> {
    return this.getStaticFile('whats-on.json')
  }
  unlinkGoogleCalendar(): Promise<void> {
    return Promise.resolve()
  }
}

export interface MozSession extends Session {
  recommendations?: LocalisedLink[]
}

export interface ProfileToken {
  kind: string
  scope: string
  hasRefresh: boolean
}

export const apiClient = pickApi(env)
