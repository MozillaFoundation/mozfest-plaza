import { Request } from 'koa'
import KoaRouter from '@koa/router'
import {
  ApiError,
  assertStruct,
  VOID_RESPONSE,
} from '@openlab/deconf-api-toolkit'

import { AppContext, AppRouter } from '../lib/module.js'
import {
  PRETALX_LOCK_KEY,
  fetchScheduleCommand,
} from '../commands/fetch-schedule-command.js'
import { object, string } from 'superstruct'

const PushMessage = object({
  title: string(),
  body: string(),
  url: string(),
})

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
      return auth
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

    router.get('/admin/messaging', async (ctx) => {
      guardAdminOnly(ctx.request)

      ctx.body = await this.#context.notifsRepo.getAdminStats()
    })

    router.post('/admin/test-message', async (ctx) => {
      const auth = guardAdminOnly(ctx.request)

      assertStruct(ctx.request.body, PushMessage)
      const { title, body, url } = ctx.request.body

      try {
        new URL(url)
      } catch {
        throw new ApiError(400, ['admin.invalidUrl'])
      }

      const devices = await this.#context.notifsRepo.listAttendeeWebPushDevices(
        auth.sub
      )

      for (const device of devices) {
        await this.#context.notifsRepo.createWebPushMessage(device.id, {
          title,
          body,
          data: { url },
        })
      }

      ctx.body = VOID_RESPONSE
    })

    router.post('/admin/send-message', async (ctx) => {
      guardAdminOnly(ctx.request)
      assertStruct(ctx.request.body, PushMessage)

      const { title, body, url } = ctx.request.body

      try {
        new URL(url)
      } catch {
        throw new ApiError(400, ['admin.invalidUrl'])
      }

      const devices = await this.#context.notifsRepo.listAllWebPushDevices(
        'Special'
      )

      for (const device of devices) {
        await this.#context.notifsRepo.createWebPushMessage(device.id, {
          title,
          body,
          data: { url },
        })
      }

      ctx.body = VOID_RESPONSE
    })
  }
}
