import KoaRouter from '@koa/router'
import {
  ApiError,
  EmailLoginTokenStruct,
  getRedirectErrorCode,
  RegistrationMailer,
  RegistrationRoutes,
  trimEmail,
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
} from '../lib/module.js'

import { Describe, object, optional, string } from 'superstruct'

export interface UserData {}
const UserDataStruct: Describe<UserData> = object({})

const LoginStartBodyStruct = object({
  email: string(),
  redirect: optional(string()),
})

function parseLoginRedirect(input: string | undefined, clientUrl: string) {
  if (!input || !input.startsWith('/')) return undefined
  try {
    return new URL(input, clientUrl).toString()
  } catch {
    return undefined
  }
}

type Context = AppContext

export class RegistrationRouter implements AppRouter, RegistrationMailer {
  #context: Context
  #routes: RegistrationRoutes<any>
  constructor(context: Context) {
    this.#context = context
    this.#routes = new RegistrationRoutes({
      ...context,
      mailer: this,
      userDataStruct: UserDataStruct as any,
      config: undefined,
    })
  }

  async #assertNotBlocked(emailAddress: string) {
    const blocked = await this.#context.store.retrieve<BlockList>(
      'schedule.blocked'
    )
    if (blocked?.emails.includes(trimEmail(emailAddress))) {
      throw ApiError.unauthorized()
    }
  }

  //
  // AppRouter
  //
  apply(router: KoaRouter) {
    router.get('registration.me', '/auth/me', async (ctx) => {
      const token = this.#context.jwt.getRequestAuth(ctx.request.header)
      const result = await this.#routes.getRegistration(token)

      await this.#assertNotBlocked(result.registration.email)

      ctx.body = result
    })

    router.post('registration.startLogin', '/auth/login', async (ctx) => {
      const reqBody = validateStruct(ctx.request.body, LoginStartBodyStruct)
      const emailAddress = trimEmail(reqBody.email)
      const redirect = parseLoginRedirect(
        reqBody.redirect,
        this.#context.env.CLIENT_URL
      )

      await this.#assertNotBlocked(emailAddress)

      const emailHash = sha256Hash(emailAddress)

      const titoEmails = await this.#context.store.retrieve<TitoRecord[]>(
        'tito.emails'
      )
      if (!titoEmails) throw ApiError.internalServerError()

      const facilitatorEmails = await this.#context.store.retrieve<string[]>(
        'schedule.facilitators'
      )
      if (!facilitatorEmails) throw ApiError.internalServerError()

      const titoRecord = titoEmails.find((r) => r.emailHash === emailHash)
      const isFacilitator = facilitatorEmails.includes(emailHash)
      const isAdmin = this.#context.env.ADMIN_EMAILS.has(emailAddress)

      if (!titoRecord && !isFacilitator && !isAdmin) {
        throw ApiError.unauthorized()
      }

      // Get registrations and find the newest one
      const registrations =
        await this.#context.registrationRepo.getRegistrations(emailAddress)
      let [registration] = registrations.sort((a, b) => b.id - a.id)

      if (!registration) {
        await this.#context.registrationRepo.register({
          name: titoRecord?.name ?? 'Facilitator',
          email: emailAddress,
          language: 'en',
          country: '',
          affiliation: '',
          userData: {},
        })

        const registrations =
          await this.#context.registrationRepo.getRegistrations(emailAddress)
        registration = registrations.sort((a, b) => b.id - a.id)[0]
      }

      if (!registration) throw ApiError.internalServerError()

      const roles = []
      if (isFacilitator) roles.push('facilitator')
      if (isAdmin) roles.push('admin')
      const loginToken = this.#context.jwt.signToken<EmailLoginToken>(
        {
          kind: 'email-login',
          sub: registration.id,
          user_roles: roles,
          redirect,
        },
        { expiresIn: '30m' }
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

          const loginToken = this.#context.jwt.verifyToken(
            token,
            EmailLoginTokenStruct
          )

          await this.#context.registrationRepo.verifyRegistration(
            loginToken.sub
          )

          const registration =
            await this.#context.registrationRepo.getVerifiedRegistration(
              loginToken.sub
            )
          if (!registration) throw ApiError.unauthorized()

          await this.#assertNotBlocked(registration.email)

          const authToken = this.#context.jwt.signToken<AuthToken>({
            kind: 'auth',
            sub: registration.id,
            user_lang: registration.language,
            user_roles: loginToken.user_roles,
          })

          ctx.redirect(
            this.#context.url
              .getClientLoginLink(authToken, loginToken.redirect)
              .toString()
          )
        } catch (error) {
          ctx.redirect(
            this.#context.url
              .getClientErrorLink(getRedirectErrorCode(error))
              .toString()
          )
        }
      }
    )

    router.delete('registration.unregister', '/auth/me', async (ctx) => {
      const token = this.#context.jwt.getRequestAuth(ctx.request.headers)
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
    const t = (k: string) =>
      this.#context.i18n.translate(registration.language, k)

    this.#context.email.sendTransactional(
      registration.email,
      t('email.login.subject'),
      this.#context.config.sendgrid.loginTemplateId,
      {
        subject: t('email.login.subject'),
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
