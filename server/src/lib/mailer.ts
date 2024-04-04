import { RegistrationMailer } from '@openlab/deconf-api-toolkit'
import { Registration } from '@openlab/deconf-shared'
import { AppContext } from './types'
import got from 'got'

interface MozMailerOptions {
  subjectKey: string
  templateId: string
}

type Context = Pick<AppContext, 'i18n' | 'url' | 'email'>

export class MozRegistrationMailer implements RegistrationMailer {
  #context
  #options
  constructor(context: Context, options: MozMailerOptions) {
    this.#context = context
    this.#options = options
  }

  async sendLoginEmail(
    registration: Registration,
    token: string
  ): Promise<void> {
    const subject = this.#context.i18n.translate(
      registration.language,
      this.#options.subjectKey
    )
    const url = this.#context.url.getServerLoginLink(token).toString()

    this.#context.email.sendTransactional(
      registration.email,
      subject,
      this.#options.templateId,
      { subject, url }
    )
  }
  async sendVerifyEmail(
    registration: Registration,
    token: string
  ): Promise<void> {
    // This isn't triggered from a ti.to login
  }
  async sendAlreadyRegisteredEmail(
    registration: Registration,
    authToken: string
  ): Promise<void> {
    // This isn't triggered from a ti.to login
  }
}
