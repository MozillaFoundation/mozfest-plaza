import KoaRouter from '@koa/router'
import { AppContext, AppRouter } from '../lib/module.js'
import { ApiError, VOID_RESPONSE } from '@openlab/deconf-api-toolkit'

type Context = AppContext

export class MozCalendarRouter implements AppRouter {
  #context: Context

  constructor(context: Context) {
    this.#context = context
  }

  apply(router: KoaRouter) {
    router.post(
      'calendar.googleUnsub',
      '/calendar/google/unlink',
      async (ctx) => {
        const token = this.#context.jwt.getRequestAuth(ctx.request.header)
        if (!token) throw ApiError.unauthorized()

        const registration =
          await this.#context.registrationRepo.getVerifiedRegistration(
            token.sub
          )
        if (!registration) throw ApiError.unauthorized()

        await this.#context.calendarRepo.clearGoogleAttendee(token.sub)

        ctx.body = VOID_RESPONSE
      }
    )
  }
}
