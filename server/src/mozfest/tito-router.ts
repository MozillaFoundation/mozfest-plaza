import KoaRouter from '@koa/router'
import {
  ApiError,
  trimEmail,
  validateStruct,
} from '@openlab/deconf-api-toolkit'
import { EmailLoginToken } from '@openlab/deconf-shared'
import { createHmac } from 'crypto'
import { literal, string, type } from 'superstruct'
import { MozRegistrationMailer } from '../lib/mailer.js'

import {
  AppRouter,
  AppContext,
  createDebug,
  upsertRegistration,
} from '../lib/module.js'

const debug = createDebug('router:tito')

const TicketWebhookStruct = type({
  _type: literal('ticket'),
  name: string(),
  email: string(),
})

type Context = AppContext

export class TitoRouter implements AppRouter {
  #context
  #mailer
  constructor(context: Context) {
    this.#context = context
    this.#mailer = new MozRegistrationMailer(context, {
      subjectKey: 'email.login.subject',
      templateId: this.#context.config.sendgrid.loginTemplateId,
    })
  }

  apply(router: KoaRouter): void {
    router.post('/tito/webhook', async (ctx) => {
      const { TITO_SECURITY_TOKEN } = this.#context.env
      if (!TITO_SECURITY_TOKEN) throw ApiError.internalServerError()

      const signature = ctx.request.header['tito-signature']
      const webhook = ctx.request.header['x-webhook-name']
      debug('webhook hook=%o signature=%o', webhook, signature)

      if (webhook !== 'ticket.completed') throw ApiError.notFound()

      const digest = createHmac('sha256', TITO_SECURITY_TOKEN)
        .update(ctx.request.rawBody)
        .digest('base64')

      debug('webhook compare', signature, digest)
      if (signature !== digest) throw ApiError.unauthorized()

      const ticket = validateStruct(ctx.request.body, TicketWebhookStruct)

      // Create registration record
      const registration = await upsertRegistration(
        this.#context.registrationRepo,
        trimEmail(ticket.email),
        ticket.name
      )

      // Generate a login token
      // TODO: check roles agains admin/facilitator records
      const loginToken = this.#context.jwt.signToken<EmailLoginToken>(
        {
          kind: 'email-login',
          sub: registration.id,
          user_roles: [],
        },
        { expiresIn: '60m' }
      )

      // Send login email...
      await this.#mailer.sendLoginEmail(registration, loginToken)

      ctx.body = 'ok'
    })
  }
}
