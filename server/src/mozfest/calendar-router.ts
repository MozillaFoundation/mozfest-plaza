import KoaRouter from '@koa/router'
import {
  AppContext,
  AppRouter,
  getActiveToken,
  getGoogleClient,
  GOOGLE_CALENDAR_SCOPE,
  setupGoogleAuth,
} from '../lib/module.js'
import { ApiError, VOID_RESPONSE } from '@openlab/deconf-api-toolkit'
import { google } from 'googleapis'

type Context = AppContext

export class MozCalendarRouter implements AppRouter {
  #context: Context

  constructor(context: Context) {
    this.#context = context
  }

  apply(router: KoaRouter) {
    router.get('/my-schedule/google/status', async (ctx) => {
      const authz = this.#context.jwt.getRequestAuth(ctx.request.header)
      if (!authz) throw ApiError.unauthorized()

      const registration =
        await this.#context.registrationRepo.getVerifiedRegistration(authz.sub)
      if (!registration) throw ApiError.unauthorized()

      const token = getActiveToken(
        await this.#context.oauth2Repo.getTokens(authz.sub),
        GOOGLE_CALENDAR_SCOPE
      )
      if (!token) {
        console.log('bad request')
        throw ApiError.unauthorized()
      }

      const promises: Promise<void>[] = []
      const auth = setupGoogleAuth(
        this.#context.env,
        token,
        authz.sub,
        promises,
        this.#context.oauth2Repo
      )
      await Promise.all(promises)

      const gcal = google.calendar({ version: 'v3', auth })
      const list = await gcal.calendarList.list()

      ctx.body = list.data.items
    })

    router.post('/my-schedule/google/unlink', async (ctx) => {
      const token = this.#context.jwt.getRequestAuth(ctx.request.header)
      if (!token) throw ApiError.unauthorized()

      const registration =
        await this.#context.registrationRepo.getVerifiedRegistration(token.sub)
      if (!registration) throw ApiError.unauthorized()

      await this.#context.calendarRepo.clearGoogleAttendee(token.sub)

      ctx.body = VOID_RESPONSE
    })
  }
}
