import KoaRouter from '@koa/router'
import {
  ApiError,
  EmailLoginTokenStruct,
  RegistrationMailer,
  RegistrationRoutes,
  validateStruct,
  VOID_RESPONSE,
} from '@openlab/deconf-api-toolkit'
import {
  AuthToken,
  EmailLoginToken,
  Registration,
} from '@openlab/deconf-shared'
import {
  AppContext,
  AppRouter,
  TokenStruct,
  sha256Hash,
  TitoRecord,
  BlockList,
  getRedirectErrorCode,
} from '../lib/module.js'

import { Describe, object, string } from 'superstruct'

export interface UserData {}
const UserDataStruct: Describe<UserData> = object({})

const LoginStartBodyStruct = object({
  email: string(),
})

type Context = AppContext

export class RegistrationRouter implements AppRouter, RegistrationMailer {
  get #jwt() {
    return this.#context.jwt
  }
  get #email() {
    return this.#context.email
  }
  get #i18n() {
    return this.#context.i18n
  }
  get #url() {
    return this.#context.url
  }
  get #store() {
    return this.#context.store
  }
  get #registrationRepo() {
    return this.#context.registrationRepo
  }
  get #config() {
    return this.#context.config
  }

  #context: Context
  #routes: RegistrationRoutes<any>
  constructor(context: Context) {
    this.#context = context
    this.#routes = new RegistrationRoutes({
      ...context,
      mailer: this,
      userDataStruct: UserDataStruct as any,
    })
  }

  #trimEmail(input: string) {
    return input.trim().toLowerCase()
  }

  async #assertNotBlocked(emailAddress: string) {
    const blocked = await this.#store.retrieve<BlockList>('schedule.blocked')
    if (blocked?.emails.includes(this.#trimEmail(emailAddress))) {
      throw ApiError.unauthorized()
    }
  }

  //
  // AppRouter
  //
  apply(router: KoaRouter) {
    router.get('registration.me', '/auth/me', async (ctx) => {
      const token = this.#jwt.getRequestAuth(ctx.request.header)
      const result = await this.#routes.getRegistration(token)

      await this.#assertNotBlocked(result.registration.email)

      ctx.body = result
    })

    router.post('registration.startLogin', '/auth/login', async (ctx) => {
      const reqBody = validateStruct(ctx.request.body, LoginStartBodyStruct)
      const emailAddress = this.#trimEmail(reqBody.email)

      await this.#assertNotBlocked(emailAddress)

      const emailHash = sha256Hash(emailAddress)

      const titoEmails = await this.#store.retrieve<TitoRecord[]>('tito.emails')
      if (!titoEmails) throw ApiError.internalServerError()

      const matchedRecord = titoEmails.find((r) => r.emailHash === emailHash)
      if (!matchedRecord) throw ApiError.unauthorized()

      // Get registrations and find the newest one
      const registrations = await this.#registrationRepo.getRegistrations(
        emailAddress
      )
      let [registration] = registrations.sort((a, b) => b.id - a.id)

      if (!registration) {
        await this.#registrationRepo.register({
          name: matchedRecord.name,
          email: emailAddress,
          language: 'en',
          country: '',
          affiliation: '',
          userData: {},
        })

        const registrations = await this.#registrationRepo.getRegistrations(
          emailAddress
        )
        registration = registrations.sort((a, b) => b.id - a.id)[0]
      }

      if (!registration) throw ApiError.internalServerError()

      const loginToken = this.#jwt.signToken<EmailLoginToken>(
        {
          kind: 'email-login',
          sub: registration.id,
          user_roles: [],
        },
        {
          expiresIn: '30m',
        }
      )

      this.sendLoginEmail(registration, loginToken)

      ctx.body = VOID_RESPONSE
    })

    router.get(
      'registration.finishLogin',
      '/auth/login/:token',
      async (ctx) => {
        try {
          const { token } = validateStruct(ctx.params, TokenStruct)

          const loginToken = this.#jwt.verifyToken(token, EmailLoginTokenStruct)

          await this.#registrationRepo.verifyRegistration(loginToken.sub)

          const registration =
            await this.#registrationRepo.getVerifiedRegistration(loginToken.sub)
          if (!registration) throw ApiError.unauthorized()

          await this.#assertNotBlocked(registration.email)

          const roles: string[] = ['attendee']
          if (this.#config.admins.some((a) => a.email === registration.email)) {
            roles.push('admin')
          }

          const authToken = this.#jwt.signToken<AuthToken>({
            kind: 'auth',
            sub: registration.id,
            user_lang: registration.language,
            user_roles: roles,
          })

          ctx.redirect(this.#url.getClientLoginLink(authToken).toString())
        } catch (error) {
          ctx.redirect(
            this.#url.getClientErrorLink(getRedirectErrorCode(error)).toString()
          )
        }
      }
    )

    router.delete('registration.unregister', '/auth/me', async (ctx) => {
      const token = this.#jwt.getRequestAuth(ctx.request.headers)
      ctx.body = await this.#routes.unregister(token)
    })
  }

  //
  // RegistrationMailer
  //
  async sendLoginEmail(
    registration: Registration,
    token: string
  ): Promise<void> {
    const t = (k: string) => this.#i18n.translate(registration.language, k)

    this.#email.sendTransactional(
      registration.email,
      t('email.login.subject'),
      this.#config.sendgrid.loginTemplateId,
      {
        subject: t('email.login.subject'),
        url: this.#url.getServerLoginLink(token).toString(),
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
