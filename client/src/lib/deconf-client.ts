import { env } from '@/plugins/env-plugin.js'
import { FetchClient } from './api.ts'

export interface ApiVerify {
  token: string
}

export interface ApiLogin {
  token: string
}

// TODO: this is a modified copy of the server version
export class DeconfClient extends FetchClient {
  async login(
    emailAddress: string,
    redirect?: string
  ): Promise<ApiLogin | null> {
    const redirectUri = new URL('login', env.SELF_URL)
    if (redirect) redirectUri.searchParams.set('redirect', redirect)

    const res = await this.fetch(`auth/v1/login`, {
      method: 'POST',
      body: JSON.stringify({
        emailAddress,
        redirectUri,
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
