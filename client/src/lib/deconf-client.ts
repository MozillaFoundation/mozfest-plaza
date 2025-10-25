import { env } from '@/plugins/env-plugin.js'
import {
  FetchClient,
  jsonBody,
  type FetchClientOptions,
  type WebPushCredentials,
  type WebPushDevice,
  type WebPushDeviceInit,
  type WebPushDeviceUpdate,
} from './api.ts'

export interface DeconfClientOptions extends FetchClientOptions {
  conferenceId?: number
}

// TODO: this is a modified copy of the server version
export class DeconfClient extends FetchClient {
  #conferenceId: number | undefined

  constructor(input: string | URL, options: DeconfClientOptions = {}) {
    super(input, options)
    this.#conferenceId = options.conferenceId
  }

  get conferenceId() {
    if (this.#conferenceId === undefined) {
      throw new TypeError('DeconfClient#conferenceId not set')
    }
    return this.#conferenceId
  }

  auth = new AuthClient(this)
  notifs = new NotificationsClient(this)
}

export interface ApiVerify {
  token: string
}

export interface ApiEmailLogin {
  token: string
}

export interface ApiOAuthLogin {
  token: string
  location: string
}

// export interface ApiOauth

export interface EmailLoginOptions {
  emailAddress: string
  redirect?: string
}

export type OauthProvider = 'google'

export interface OauthLoginOptions {
  provider: OauthProvider
  redirect?: string
  scope?: 'calendar'
}

export class AuthClient {
  deconf: DeconfClient
  constructor(deconf: DeconfClient) {
    this.deconf = deconf
  }

  emailLogin({
    emailAddress,
    redirect,
  }: EmailLoginOptions): Promise<ApiEmailLogin | null> {
    const redirectUri = new URL('login', env.SELF_URL)
    if (redirect) redirectUri.searchParams.set('redirect', redirect)

    return this.deconf.json(`auth/v1/login`, {
      method: 'POST',
      ...jsonBody({
        type: 'email',
        emailAddress,
        redirectUri,
        conferenceId: this.deconf.conferenceId,
      }),
    })
  }

  verify(code: string, token?: string): Promise<ApiVerify | null> {
    return this.deconf.json('auth/v1/verify', {
      method: 'POST',
      ...jsonBody({ method: 'email', token, code }),
    })
  }

  oauthLogin({
    provider,
    redirect,
    scope,
  }: OauthLoginOptions): Promise<ApiOAuthLogin | null> {
    const redirectUri = new URL('login', env.SELF_URL)
    if (redirect) redirectUri.searchParams.set('redirect', redirect)

    return this.deconf.json('auth/v1/login', {
      method: 'POST',
      ...jsonBody({
        type: 'oauth',
        provider,
        redirectUri: redirectUri,
        conferenceId: this.deconf.conferenceId,
        scope,
      }),
    })
  }
}

export class NotificationsClient {
  deconf: DeconfClient
  constructor(deconf: DeconfClient) {
    this.deconf = deconf
  }

  getWebPushCredentials(): Promise<WebPushCredentials | null> {
    return this.deconf.json('notifications/v1/web-push/credentials')
  }

  listWebPushDevices(): Promise<WebPushDevice[] | null> {
    return this.deconf.json(
      `notifications/v1/conference/${this.deconf.conferenceId}/web-push/devices`
    )
  }

  createWebPushDevice(init: WebPushDeviceInit): Promise<WebPushDevice | null> {
    return this.deconf.json(
      `notifications/v1/conference/${this.deconf.conferenceId}/web-push/devices`,
      { method: 'POST', ...jsonBody(init) }
    )
  }

  updateWebPushDevice(
    id: number | string,
    update: WebPushDeviceUpdate
  ): Promise<WebPushDevice | null> {
    return this.deconf.json(
      `notifications/v1/conference/${this.deconf.conferenceId}/web-push/devices/${id}`,
      { method: 'PATCH', ...jsonBody(update) }
    )
  }

  deleteWebPushDevice(id: number | string): Promise<boolean> {
    return this.deconf.ok(
      `notifications/v1/conference/${this.deconf.conferenceId}/web-push/devices/${id}`,
      { method: 'DELETE' }
    )
  }

  testWebPush() {
    return this.deconf.ok(
      `notifications/v1/conference/${this.deconf.conferenceId}/web-push/test`,
      { method: 'POST' }
    )
  }
}

export const deconfClient = new DeconfClient(env.DECONF_API_URL, {
  credentials: 'include',
  conferenceId: env.DECONF_CONFERENCE,
})
