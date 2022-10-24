import KoaRouter from '@koa/router'

import { ContentRoutes, validateStruct } from '@openlab/deconf-api-toolkit'
import { enums, object } from 'superstruct'
import { CONTENT_KEYS } from '../commands/fetch-content-command.js'
import { AppContext, AppRouter } from '../lib/module.js'

const SlugStruct = object({
  slug: enums(CONTENT_KEYS),
})

type Context = AppContext

export class ContentRouter implements AppRouter {
  #context: Context
  #routes: ContentRoutes
  constructor(context: Context) {
    this.#context = context
    this.#routes = new ContentRoutes(context)
  }

  apply(router: KoaRouter): void {
    router.get('content.get', '/content/:slug', async (ctx) => {
      const { slug } = validateStruct(ctx.params, SlugStruct)

      ctx.body = await this.#routes.getContent(slug)
    })
  }
}
