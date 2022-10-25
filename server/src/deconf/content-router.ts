import KoaRouter from '@koa/router'

import { ContentRoutes, validateStruct } from '@openlab/deconf-api-toolkit'
import { enums, object } from 'superstruct'
import { AppContext, AppRouter } from '../lib/module.js'

type Context = AppContext

export class ContentRouter implements AppRouter {
  #context: Context
  #routes: ContentRoutes
  constructor(context: Context) {
    this.#context = context
    this.#routes = new ContentRoutes(context)
  }

  apply(router: KoaRouter): void {
    const SlugStruct = object({
      slug: enums(this.#context.config.content.keys),
    })

    router.get('content.get', '/content/:slug', async (ctx) => {
      const { slug } = validateStruct(ctx.params, SlugStruct)

      ctx.body = await this.#routes.getContent(slug)
    })
  }
}
