import KoaRouter from '@koa/router'
import {
  ApiError,
  CalendarOptions,
  CalendarRoutes,
  UserICalToken,
  UserICalTokenStruct,
  validateStruct,
} from '@openlab/deconf-api-toolkit'

import {
  SessionIdStruct,
  AppContext,
  AppRouter,
  TokenStruct,
  getRedirectErrorCode,
} from '../lib/module.js'

type Context = AppContext

const calendarOptions: CalendarOptions = {
  calName: 'My MozFest 2022 Schedule',
}

export class CalendarRouter implements AppRouter {
  get #jwt() {
    return this.#context.jwt
  }
  get #url() {
    return this.#context.url
  }
  get #env() {
    return this.#context.env
  }

  #context: Context
  #routes: CalendarRoutes
  constructor(context: Context) {
    this.#context = context
    this.#routes = new CalendarRoutes(context)
  }

  apply(router: KoaRouter) {
    router.get('calendar.ical', '/calendar/ical/:sessionId', async (ctx) => {
      const { sessionId } = validateStruct(ctx.params, SessionIdStruct)
      const token = this.#jwt.getRequestAuth(ctx.request.headers)
      const locale = token?.user_lang ?? 'en'

      ctx.set('content-type', 'text/calendar')
      ctx.set('content-disposition', `attachment; filename="${sessionId}.ics`)
      ctx.body = await this.#routes.getSessionIcsFile(
        locale,
        sessionId,
        calendarOptions
      )
    })

    router.get(
      'calendar.google',
      '/calendar/google/:sessionId',
      async (ctx) => {
        try {
          const { sessionId } = validateStruct(ctx.params, SessionIdStruct)
          const token = this.#jwt.getRequestAuth(ctx.request.headers)
          const locale = token?.user_lang ?? 'en'

          const url = await this.#routes.getGoogleCalendarUrl(locale, sessionId)

          ctx.redirect(url.toString())
        } catch (error) {
          ctx.redirect(
            this.#url.getClientErrorLink(getRedirectErrorCode(error)).toString()
          )
        }
      }
    )

    // TODO: migrate to deconf implementation
    router.get('calendar.createUserCalendar', '/calendar/me', async (ctx) => {
      const token = this.#jwt.getRequestAuth(ctx.request.headers)
      if (!token) throw ApiError.unauthorized()

      const icalToken = this.#jwt.signToken<UserICalToken>({
        kind: 'user-ical',
        sub: token.sub,
        user_lang: token.user_lang,
      })

      ctx.body = {
        url: new URL(`calendar/me/${icalToken}`, this.#env.SELF_URL),
      }
    })

    router.get('calendar.user', '/calendar/me/:token', async (ctx) => {
      const { token } = validateStruct(ctx.params, TokenStruct)
      const icalToken = this.#jwt.verifyToken(token, UserICalTokenStruct)

      ctx.set('content-type', 'text/calendar')
      ctx.set('content-disposition', `attachment; filename="my-sessions.ics`)
      ctx.body = await this.#routes.getUserIcs(icalToken, calendarOptions)
    })
  }
}
