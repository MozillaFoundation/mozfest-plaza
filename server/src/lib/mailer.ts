import { RegistrationMailer } from '@openlab/deconf-api-toolkit'
import { Registration } from '@openlab/deconf-shared'
import { AppContext } from './types'

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

    this.#context.email.sendTransactional(
      registration.email,
      subject,
      this.#options.templateId,
      {
        subject: subject,
        url: this.#context.url.getServerLoginLink(token).toString(),
      }
    )
  }
  async sendVerifyEmail(
    registration: Registration,
    token: string
  ): Promise<void> {
    // This shouldn't be triggered with a ti.to login
  }
  async sendAlreadyRegisteredEmail(
    registration: Registration,
    authToken: string
  ): Promise<void> {
    // This shouldn't be triggered with a ti.to login
  }
}
