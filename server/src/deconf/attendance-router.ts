import KoaRouter from '@koa/router'

import { AttendanceRoutes, validateStruct } from '@openlab/deconf-api-toolkit'
import { AppContext, AppRouter, SessionIdStruct } from '../lib/module.js'

type Context = AppContext

export class AttendanceRouter implements AppRouter {
  get #jwt() {
    return this.#context.jwt
  }

  #context: Context
  #routes: AttendanceRoutes
  constructor(context: Context) {
    this.#context = context
    this.#routes = new AttendanceRoutes(context)
  }

  apply(router: KoaRouter): void {
    router.get('attendance.user', '/attendance/me', async (ctx) => {
      const token = this.#jwt.getRequestAuth(ctx.request.headers)
      ctx.body = await this.#routes.getUserAttendance(token)
    })

    router.get('attendance.session', '/attendance/:sessionId', async (ctx) => {
      const { sessionId } = validateStruct(ctx.params, SessionIdStruct)
      const token = this.#jwt.getRequestAuth(ctx.request.headers)
      ctx.body = await this.#routes.getSessionAttendance(token, sessionId)
    })

    router.post(
      'attendance.attend',
      '/attendance/:sessionId/attend',
      async (ctx) => {
        const { sessionId } = validateStruct(ctx.params, SessionIdStruct)
        const token = this.#jwt.getRequestAuth(ctx.request.headers)
        ctx.body = await this.#routes.attend(token, sessionId)
      }
    )

    router.post(
      'attendance.unattend',
      '/attendance/:sessionId/unattend',
      async (ctx) => {
        const { sessionId } = validateStruct(ctx.params, SessionIdStruct)
        const token = this.#jwt.getRequestAuth(ctx.request.headers)
        ctx.body = await this.#routes.unattend(token, sessionId)
      }
    )
  }
}
