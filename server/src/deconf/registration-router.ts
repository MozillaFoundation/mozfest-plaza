import KoaRouter from '@koa/router'
import {
  ApiError,
  EmailLoginTokenStruct,
  getRedirectErrorCode,
  RegistrationRoutes,
  trimEmail,
  validateStruct,
  VOID_RESPONSE,
} from '@openlab/deconf-api-toolkit'
import { AuthToken, EmailLoginToken } from '@openlab/deconf-shared'
import { google } from 'googleapis'
import crypto from 'node:crypto'
import {
  AppContext,
  AppRouter,
  BlockList,
  sha256Hash,
  TitoRecord,
  TokenStruct,
  upsertRegistration,
} from '../lib/module.js'

import { Describe, object, optional, string } from 'superstruct'
import { MozRegistrationMailer } from '../lib/mailer.js'

export interface UserData {}
const UserDataStruct: Describe<UserData> = object({})

export interface Oauth2LoginToken {
  kind: 'oauth2-login'
}

const LoginStartBodyStruct = object({
  email: string(),
  redirect: optional(string()),
})

function parseLoginRedirect(
  input: string | undefined | string[],
  clientUrl: string
) {
  if (Array.isArray(input)) input = input[0]
  if (!input || !input.startsWith('/')) return undefined
  try {
    return new URL(input, clientUrl).toString()
  } catch {
    return undefined
  }
}

type Context = AppContext

export class RegistrationRouter implements AppRouter {
  #context: Context
  #routes: RegistrationRoutes<any>
  #mailer: MozRegistrationMailer
  constructor(context: Context) {
    this.#context = context
    this.#mailer = new MozRegistrationMailer(context, {
      subjectKey: 'email.login.subject',
      templateId: this.#context.config.sendgrid.loginTemplateId,
    })
    this.#routes = new RegistrationRoutes({
      ...context,
      mailer: this.#mailer,
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

  async lookupUser(emailAddress: string) {
    const emailHash = sha256Hash(emailAddress)

    const titoEmails = await this.#context.store.retrieve<TitoRecord[]>(
      'tito.emails'
    )
    // if (!titoEmails) throw ApiError.internalServerError()

    const facilitatorEmails = await this.#context.store.retrieve<string[]>(
      'schedule.facilitators'
    )
    // if (!facilitatorEmails) throw ApiError.internalServerError()

    const titoRecord = titoEmails?.find((r) => r.emailHash === emailHash)
    const isFacilitator = facilitatorEmails?.includes(emailHash)
    const isAdmin = this.#context.env.ADMIN_EMAILS.has(emailAddress)

    const roles: string[] = []
    if (isFacilitator) roles.push('facilitator')
    if (isAdmin) roles.push('admin')

    if (!titoRecord && !isFacilitator && !isAdmin) {
      return null
    }

    return {
      roles,
      name: titoRecord?.name ?? 'Facilitator',
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

      const user = await this.lookupUser(emailAddress)
      if (!user) throw ApiError.unauthorized()

      const registration = await upsertRegistration(
        this.#context.registrationRepo,
        emailAddress,
        user?.name
      )

      const loginToken = this.#context.jwt.signToken<EmailLoginToken>(
        {
          kind: 'email-login',
          sub: registration.id,
          user_roles: user.roles,
          redirect,
        },
        { expiresIn: '30m' }
      )

      this.#mailer.sendLoginEmail(registration, loginToken)

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

    // https://developers.google.com/identity/protocols/oauth2/web-server#node.js_1
    router.get(
      'registration.startOAuth2',
      '/auth/oauth2/google',
      async (ctx) => {
        const redirect = parseLoginRedirect(
          ctx.request.query.redirect,
          this.#context.env.CLIENT_URL
        )
        const scopes = [
          'https://www.googleapis.com/auth/userinfo.email',
          'openid',
          'profile',
        ]

        const oauth2Client = this.getGoogleClient()

        const state = crypto.randomBytes(32).toString('base64url')
        ctx.cookies.set('oauth2-csrf', state)
        ctx.cookies.set('oauth2-redirect', redirect)

        ctx.redirect(
          oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            include_granted_scopes: true,
            state,
            prompt: 'select_account',
          })
        )
      }
    )

    // Errors - admin_policy_enforced | disallowed_useragent | org_internal | invalid_client
    //        | invalid_grant | redirect_uri_mismatch | invalid_request

    // https://developers.google.com/identity/protocols/oauth2/web-server#exchange-authorization-code
    router.get(
      'registration.finishOAuth2',
      '/auth/oauth2/google/callback',
      async (ctx) => {
        const { code, error, state } = ctx.request.query
        if (
          error ||
          typeof code !== 'string' ||
          ctx.cookies.get('oauth2-csrf') !== state
        ) {
          console.error('oauth2 error', ctx.request.query)
          ctx.redirect(
            this.#context.url.getClientErrorLink('oauth2_failed').toString()
          )
          return
        }

        const oauth2 = this.getGoogleClient()
        const { tokens } = await oauth2.getToken(code)
        oauth2.setCredentials(tokens)

        const verified = await oauth2.verifyIdToken({
          idToken: tokens.id_token!,
        })

        const profile = verified.getPayload()
        if (!profile?.email) {
          ctx.redirect(
            this.#context.url.getClientErrorLink('oauth2_failed').toString()
          )
          return
        }

        await this.#assertNotBlocked(profile.email)

        const user = await this.lookupUser(profile.email)
        if (!user) {
          ctx.redirect(
            this.#context.url.getClientErrorLink('not_registered').toString()
          )
          return
        }

        const registration = await upsertRegistration(
          this.#context.registrationRepo,
          profile.email,
          profile.name ?? 'Unknown'
        )

        await this.#context.registrationRepo.verifyRegistration(registration.id)

        await this.#context.oauth2Repo.store(
          registration.id,
          'google',
          tokens.access_token!,
          tokens.refresh_token ?? null,
          tokens.expiry_date ? new Date(tokens.expiry_date) : null
        )

        const authToken = this.#context.jwt.signToken<AuthToken>({
          kind: 'auth',
          sub: registration.id,
          user_lang: registration.language,
          user_roles: user.roles,
        })

        ctx.redirect(
          this.#context.url
            .getClientLoginLink(authToken, ctx.cookies.get('oauth2-redirect'))
            .toString()
        )
      }
    )
  }

  getGoogleClient() {
    return new google.auth.OAuth2(
      this.#context.env.GOOGLE_OAUTH2_CLIENT_ID,
      this.#context.env.GOOGLE_OAUTH2_CLIENT_SECRET,
      new URL(
        './auth/oauth2/google/callback',
        this.#context.env.SELF_URL
      ).toString()
    )
  }

  //
  // RegistrationMailer
  //
}
