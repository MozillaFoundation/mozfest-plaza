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

type FeatureFlag = 'calendarSync' | 'webPush' | 'googleAuth'

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

  features: Record<FeatureFlag, boolean | undefined>

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

export interface WebPushCredentials {
  publicKey: string
}

export interface WebPushDevice {
  id: number
  created: Date
  attendee: number
  name: string
  endpoint: string
  expiration: Date | null
  keys: Record<string, string>
  categories: string[]
}

export interface WebPushDeviceInit {
  name: string
  endpoint: string
  expiration: Date | null
  keys: Record<string, string>
  categories: string[]
}

export interface WebPushDeviceUpdate {
  name: string
  categories: string[]
}

export interface TestWebPushMessage {
  title: string
  body: string
  url: string
}

export interface MozApiClient {
  getWhatsOn(): Promise<Session[]>
  startEmailLogin(email: string, options?: MozLoginOptions): Promise<boolean>
  unlinkGoogleCalendar(): Promise<void>
  getWebPushCredentials(): Promise<WebPushCredentials | null>

  listWebPushDevices(): Promise<WebPushDevice[] | null>
  createWebPushDevice(init: WebPushDeviceInit): Promise<WebPushDevice | null>
  updateWebPushDevice(
    id: string | number,
    update: WebPushDeviceUpdate
  ): Promise<WebPushDevice | null>
  deleteWebPushDevice(id: string | number): Promise<boolean>

  testWebPush(message: TestWebPushMessage): Promise<boolean>
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
    await this.fetch('calendar/google/unlink', { method: 'POST' })
  }

  getWebPushCredentials() {
    return this.fetchJson<WebPushCredentials>(
      'notifications/web-push-credentials'
    )
  }

  listWebPushDevices(): Promise<WebPushDevice[] | null> {
    return this.fetchJson<WebPushDevice[]>('notifications/web-push-devices')
  }
  createWebPushDevice(init: WebPushDeviceInit): Promise<WebPushDevice | null> {
    return this.fetchJson<WebPushDevice>('notifications/web-push-devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(init),
    })
  }
  updateWebPushDevice(
    id: string | number,
    update: WebPushDeviceUpdate
  ): Promise<WebPushDevice | null> {
    return this.fetchJson<WebPushDevice>(
      `notifications/web-push-devices/${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      }
    )
  }
  deleteWebPushDevice(id: string | number): Promise<boolean> {
    return this.fetch(`notifications/web-push-devices/${id}`, {
      method: 'DELETE',
    })
  }

  testWebPush(message: TestWebPushMessage): Promise<boolean> {
    return this.fetch('admin/test-message', {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    })
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
  async getWebPushCredentials(): Promise<null> {
    return null
  }

  async listWebPushDevices(): Promise<null> {
    return null
  }
  async createWebPushDevice(): Promise<null> {
    return null
  }
  async updateWebPushDevice(): Promise<null> {
    return null
  }
  async deleteWebPushDevice(): Promise<boolean> {
    return false
  }

  async testWebPush(): Promise<boolean> {
    return false
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
