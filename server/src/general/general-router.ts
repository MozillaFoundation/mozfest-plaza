import KoaRouter from '@koa/router'
import escapeHtml from 'escape-html'
import dedent from 'dedent'
import cloudinary, { ImageTransformationOptions } from 'cloudinary'

import { validateStruct, VOID_RESPONSE } from '@openlab/deconf-api-toolkit'
import { SessionState } from '@openlab/deconf-shared'

import { AppRouter, AppContext, SessionIdStruct } from '../lib/module.js'

const SESSION_OG_DURATION = 1 * 60 * 60

const shareDateFmt = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Europe/Amsterdam',
})
const shareTimeFmt = new Intl.DateTimeFormat('en', {
  timeStyle: 'short',
  timeZone: 'Europe/Amsterdam',
  hourCycle: 'h24',
})

interface CloudinaryOptions {
  publicId: string
  sessionImage: string
  font: string
}

export function generateSessionOpengraphImage(
  title: string,
  date: Date | undefined,
  options: CloudinaryOptions
) {
  const transformation: ImageTransformationOptions[] = [
    { width: 800, crop: 'scale' },
    {
      color: '#FFFFFF',
      width: 750,
      height: 125,
      crop: 'fit',
      overlay: {
        font_family: options.font,
        font_weight: 'bold',
        font_size: 45,
        text: title,
      },
    },
    {
      flags: 'layer_apply',
      gravity: 'north_west',
      x: 25,
      y: 300,
    },
  ]

  if (date) {
    transformation.push(
      {
        color: '#FFFFFF',
        width: 750,
        height: 50,
        crop: 'fit',
        overlay: {
          font_family: options.font,
          font_weight: 'normal',
          font_size: 28,
          text:
            shareTimeFmt.format(date) + ' CET     ' + shareDateFmt.format(date),
        },
      },
      {
        flags: 'layer_apply',
        gravity: 'north_west',
        x: 25,
        y: 260,
      }
    )
  }

  return cloudinary.v2.url(options.sessionImage, {
    cloud_name: options.publicId,
    transformation,
  })
}

type Context = AppContext

export class GeneralRouter implements AppRouter {
  get #confRepo() {
    return this.#context.conferenceRepo
  }
  get #url() {
    return this.#context.url
  }
  get #metricsRepo() {
    return this.#context.metricsRepo
  }

  #context: Context
  constructor(context: Context) {
    this.#context = context
  }

  apply(router: KoaRouter): void {
    router.get('general.hello', '/', async (ctx) => {
      ctx.body = {
        ...VOID_RESPONSE,
        pkg: {
          name: this.#context.pkg.name,
          version: this.#context.pkg.version,
        },
      }
    })

    router.get('/share/session', (ctx) => {
      ctx.redirect(new URL(this.#context.env.CLIENT_URL).toString())
    })

    // NOTE: Create "share-router" if more shares are needed
    router.get(
      'general.shareSession',
      '/share/session/:sessionId',
      async (ctx) => {
        const { sessionId } = validateStruct(ctx.params, SessionIdStruct)

        const cacheKey = `opengraph.session.${sessionId}`
        const cachedHtml = await this.#context.store.retrieve<string>(cacheKey)
        if (cachedHtml) {
          ctx.body = cachedHtml
          this.#trackShareVisit(sessionId, ctx.request.header.referer)
          return
        }

        const session = await this.#confRepo.findSession(sessionId)
        const slots = await this.#confRepo.getSlots()

        const appTitle = 'Mozilla Festival 2023'
        const pageTitle = session?.title.en
        const pageDescription = session?.content.en || ''
        const slot = session?.slot
          ? slots.find((s) => s.id === session.slot)
          : null

        // Return a http 404 if the session doesn't exist, isn't confirmed
        // or doesn't have an English title
        if (
          !session ||
          session.state !== SessionState.confirmed ||
          !pageTitle
        ) {
          ctx.body = 'Not Found'
          ctx.status = 404
          return
        }

        // Get the URL of the session to be visited
        const sessionUrl = this.#url.getSessionLink(session.id)
        sessionUrl.searchParams.set('ref', 'share')

        const shortTitle = pageTitle.substring(0, 100)
        const shortDesc = pageDescription.substring(0, 200)

        const { cloudinary } = this.#context.config

        const imageUrl = cloudinary
          ? generateSessionOpengraphImage(shortTitle, slot?.start, cloudinary)
          : this.#url.getClientAsset('opengraph-session.png').toString()

        const head = dedent`
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <title>${pageTitle} | ${appTitle}</title>
          <meta property="og:title" content="${pageTitle}">
          <meta property="og:description" content="${shortDesc}">
          <meta property="og:type" content="website">
          <meta property="og:site_name" content="${appTitle}">
          <meta property="og:url" content="${sessionUrl}">
          <meta property="og:image" content="${imageUrl.toString()}">
          <meta http-equiv="refresh" content="0; url='${sessionUrl}'" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@mozillafestival" />
        `

        // Show the meta tags if ?dev is specified
        if (ctx.request.query.dev !== undefined) {
          ctx.body = dedent`
            <html>
            <body><pre>${escapeHtml(head)}</pre></body>
            </html>
          `
        } else {
          ctx.body = dedent`
            <html>
            <head>${head}</head>
            <body>Redirecting...</body>
            </html>
          `
        }

        // Cache the response
        // + Don't hold up the request doing this
        this.#context.store
          .put(cacheKey, ctx.body)
          .then(() =>
            this.#context.store.setExpiry(cacheKey, SESSION_OG_DURATION)
          )
          .catch((e) => console.error('Failed to cache session opengraph', e))

        // There's no point specifying attendee/socketId as it won't be set
        // + Don't hold up the request doing this
        this.#trackShareVisit(sessionId, ctx.request.header.referer)
      }
    )
  }

  async #trackShareVisit(sessionId: string, referer?: string) {
    await this.#metricsRepo
      .trackEvent('session/shareVisit', {
        sessionId: sessionId,
        referer: referer,
      })
      .catch((e) => console.error('Failed to track session/shareVisit', e))
  }
}
