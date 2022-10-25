import KoaRouter from '@koa/router'
import {
  CalendarOptions,
  CalendarRoutes,
  getRedirectErrorCode,
  UserICalTokenStruct,
  validateStruct,
} from '@openlab/deconf-api-toolkit'

import {
  SessionIdStruct,
  AppContext,
  AppRouter,
  TokenStruct,
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

    router.get('calendar.createUserCalendar', '/calendar/me', async (ctx) => {
      ctx.body = this.#routes.createUserCalendar(
        this.#jwt.getRequestAuth(ctx.request.headers),
        (token) => new URL(`calendar/me/${token}`, this.#env.SELF_URL)
      )
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
