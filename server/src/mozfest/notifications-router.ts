import KoaRouter from '@koa/router'
import { AppContext, AppRouter } from '../lib/module.js'
import {
  ApiError,
  assertStruct,
  VOID_RESPONSE,
} from '@openlab/deconf-api-toolkit'

import webPush from 'web-push'
import { array, date, nullable, object, record, string } from 'superstruct'

const WebPushDeviceInit = object({
  name: string(),
  endpoint: string(),
  expiration: nullable(date()),
  keys: record(string(), string()),
  categories: array(string()),
})

const WebPushDeviceUpdate = object({
  name: string(),
  categories: array(string()),
})

type Context = AppContext

export class MozNotificationsRouter implements AppRouter {
  #context: Context

  constructor(context: Context) {
    this.#context = context

    webPush.setVapidDetails(
      'mailto:' + this.#context.config.mail.fromEmail,
      this.#context.env.WEB_PUSH_PUBLIC_KEY,
      this.#context.env.WEB_PUSH_PRIVATE_KEY
    )
  }

  apply(router: KoaRouter) {
    router.get('/notifications/web-push-credentials', async (ctx) => {
      ctx.body = {
        publicKey: this.#context.env.WEB_PUSH_PUBLIC_KEY,
      }
    })

    router.get('/notifications/web-push-devices', async (ctx) => {
      const auth = this.#context.jwt.getRequestAuth(ctx.request.headers)
      if (!auth) throw ApiError.unauthorized()

      ctx.body = await this.#context.notifsRepo.listAttendeeWebPushDevices(
        auth.sub
      )
    })

    router.post('/notifications/web-push-devices', async (ctx) => {
      const auth = this.#context.jwt.getRequestAuth(ctx.request.headers)
      if (!auth) throw ApiError.unauthorized()

      assertStruct(ctx.request.body, WebPushDeviceInit)
      ctx.body = await this.#context.notifsRepo.createWebPushDevices({
        ...ctx.request.body,
        attendee: auth.sub,
      })
    })

    router.patch('/notifications/web-push-devices/:id', async (ctx) => {
      const auth = this.#context.jwt.getRequestAuth(ctx.request.headers)
      if (!auth) throw ApiError.unauthorized()

      const device = await this.#context.notifsRepo.getAttendeeWebPushDevice(
        ctx.params.id
      )
      if (!device || device.attendee !== auth.sub) throw ApiError.unauthorized()

      assertStruct(ctx.request.body, WebPushDeviceUpdate)
      ctx.body = await this.#context.notifsRepo.updateWebPushDevices(
        device.id,
        { ...ctx.request.body }
      )
    })

    router.delete('/notifications/web-push-devices/:id', async (ctx) => {
      const auth = this.#context.jwt.getRequestAuth(ctx.request.headers)
      if (!auth) throw ApiError.unauthorized()

      const device = await this.#context.notifsRepo.getAttendeeWebPushDevice(
        ctx.params.id
      )
      if (!device || device.attendee !== auth.sub) throw ApiError.unauthorized()

      await this.#context.notifsRepo.deleteWebPushDevice(device.id)

      ctx.body = VOID_RESPONSE
    })

    router.post('/notifications/web-push-test', async (ctx) => {
      // ...

      const result = await webPush.sendNotification(
        ctx.request.body as any,
        JSON.stringify({
          title: 'Hello There!',
          body: 'General Kenobi',
          data: {
            url: 'https://example.com',
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )

      ctx.body = result
    })
  }
}
