import KoaRouter from '@koa/router'

import { AppRouter, AppContext, SessionIdStruct } from '../lib/module.js'

type Context = AppContext

export class TitoRouter implements AppRouter {
  #context: Context
  constructor(context: Context) {
    this.#context = context
  }

  apply(router: KoaRouter): void {
    router.post('/tito/webhook/ticket.created', async (ctx) => {
      ctx.body = 'plop'
    })
  }
}
