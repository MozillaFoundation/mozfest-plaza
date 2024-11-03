import KoaRouter from '@koa/router'
import { AppContext, AppRouter } from '../lib/module.js'
import { ApiError, VOID_RESPONSE } from '@openlab/deconf-api-toolkit'

import webPush from 'web-push'

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
