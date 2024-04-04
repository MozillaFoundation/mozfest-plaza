import { EmailService } from '@openlab/deconf-api-toolkit'
import got from 'got'

type Context = {
  env: {
    SENDGRID_API_KEY: string
  }
}

export class CaMoEmailService implements Readonly<EmailService> {
  #context: Context
  constructor(context: Context) {
    this.#context = context
  }

  sendEmail(to: string, subject: string, html: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async sendTransactional(
    to: string,
    subject: string,
    templateId: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const endpoint = new URL(
      `https://api.createsend.com/api/v3.2/transactional/smartemail/${templateId}/send`
    )

    await got.post(endpoint, {
      json: {
        To: [to],
        Data: data,
        ConsentToTrack: 'yes',
      },
      username: this.#context.env.SENDGRID_API_KEY,
      throwHttpErrors: true,
    })
  }
}
