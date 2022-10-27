import {
  DeconfEnv,
  UrlService as DeconfUrlService,
} from '@openlab/deconf-api-toolkit'

type Context = {
  env: Pick<DeconfEnv, 'CLIENT_URL' | 'SELF_URL'>
}

export class UrlService implements Readonly<DeconfUrlService> {
  get #env() {
    return this.#context.env
  }

  #context: Context
  constructor(context: Context) {
    this.#context = context
  }

  getSessionLink(sessionId: string): URL {
    return new URL(`session/${sessionId}`, this.#env.CLIENT_URL)
  }

  getClientLoginLink(token: string, redirect?: string): URL {
    const url = new URL('_auth', this.#env.CLIENT_URL)

    const params = new URLSearchParams()
    params.set('token', token)
    if (redirect) params.set('redirect', redirect)
    url.hash = params.toString()

    return url
  }

  getClientErrorLink(errorCode?: string): URL {
    return errorCode
      ? new URL(`error/${errorCode}`, this.#env.CLIENT_URL)
      : new URL(`error`, this.#env.CLIENT_URL)
  }

  getServerLoginLink(token: string): URL {
    return new URL(`auth/login/${token}`, this.#env.SELF_URL)
  }

  getClientAsset(asset: string): URL {
    return new URL(asset, this.#env.CLIENT_URL)
  }
}
