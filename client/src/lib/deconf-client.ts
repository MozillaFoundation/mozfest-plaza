import { env } from '@/plugins/env-plugin.js'

export interface ApiVerify {
  token: string
}

export interface ApiLogin {
  token: string
}

export interface DeconfClientOptions {
  authzToken?: string
  credentials?: RequestCredentials
}

// TODO: this is a modified copy of the server version
export class DeconfClient {
  url: URL
  options: DeconfClientOptions
  constructor(url: string | URL, options: DeconfClientOptions = {}) {
    this.url = new URL(url)
    this.options = options
  }

  setAuthToken(token: string | null) {
    this.options.authzToken = token ?? undefined
  }

  /** construct an endpoint for the server */
  endpoint(input: string) {
    return new URL(input, this.url)
  }

  /** perform a fetch against the server, adding auth logic & resolving endpoints */
  async fetch(input: URL | string | Request, init: RequestInit = {}) {
    if (this.options.credentials) init.credentials = this.options.credentials

    if (typeof input === 'string') input = this.endpoint(input)
    const request = new Request(input, init)

    if (this.options.authzToken) {
      request.headers.set('Authorization', `Bearer ${this.options.authzToken}`)
    }

    request.headers.set('User-Agent', `MozFestClient/${env.APP_VERSION}`)

    const res = await fetch(request)

    return res
  }

  async login(emailAddress: string): Promise<ApiLogin | null> {
    const res = await this.fetch(`auth/v1/login`, {
      method: 'POST',
      body: JSON.stringify({
        emailAddress,
        redirectUri: new URL('login', env.SELF_URL),
        conferenceId: env.DECONF_CONFERENCE,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return res.ok ? res.json() : null
  }

  async verify(code: string, token?: string): Promise<ApiVerify | null> {
    const res = await this.fetch('auth/v1/verify', {
      method: 'POST',
      body: JSON.stringify({ method: 'email', token, code }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return res.ok ? res.json() : null
  }
}

export const deconfClient = new DeconfClient(env.DECONF_API_URL, {
  credentials: 'include',
})
