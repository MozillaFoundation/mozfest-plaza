import { Request } from 'koa'
import KoaRouter from '@koa/router'
import { ApiError, VOID_RESPONSE } from '@openlab/deconf-api-toolkit'

import { AppContext, AppRouter } from '../lib/module.js'
import {
  PRETALX_LOCK_KEY,
  fetchScheduleCommand,
} from '../commands/fetch-schedule-command.js'

type Context = AppContext

export class AdminRouter implements AppRouter {
  get #jwt() {
    return this.#context.jwt
  }
  get #store() {
    return this.#context.store
  }

  #context: Context
  constructor(context: Context) {
    this.#context = context
  }

  async #isRunningPretalx(): Promise<boolean> {
    return Boolean(await this.#store.retrieve(PRETALX_LOCK_KEY))
  }

  apply(router: KoaRouter): void {
    const guardAdminOnly = (request: Request) => {
      const auth = this.#jwt.getRequestAuth(request.headers)
      if (!auth || !auth.user_roles.includes('admin')) {
        throw ApiError.unauthorized()
      }
    }

    // admin-only - run the pretalx scrape
    router.post('admin.scrapePretalx', '/admin/pretalx', async (ctx) => {
      guardAdminOnly(ctx.request)

      if (await this.#isRunningPretalx()) {
        throw new ApiError(400, ['admin.alreadyRunning'])
      }

      // Run the scrape but don't wait for completion
      fetchScheduleCommand({}).catch((error) => {
        console.error('Admin Pretalx scrape failed')
        console.error(error)
      })

      ctx.body = VOID_RESPONSE
    })

    // admin-only - check if pretalx is running or not
    router.get('admin.pretalxInfo', '/admin/pretalx', async (ctx) => {
      guardAdminOnly(ctx.request)

      ctx.body = {
        isEnabled: process.env.PRETALX_API_TOKEN !== undefined,
        isRunning: await this.#isRunningPretalx(),
      }
    })
  }
}
