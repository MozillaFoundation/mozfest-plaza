import KoaRouter from '@koa/router'
import escapeHtml from 'escape-html'
import dedent from 'dedent'

import { validateStruct, VOID_RESPONSE } from '@openlab/deconf-api-toolkit'
import { SessionState } from '@openlab/deconf-shared'

import { AppRouter, AppContext, SessionIdStruct } from '../lib/module.js'

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

    // NOTE: Create "share-router" if more shares are needed
    router.get(
      'general.shareSession',
      '/share/session/:sessionId',
      async (ctx) => {
        const { sessionId } = validateStruct(ctx.params, SessionIdStruct)
        const session = await this.#confRepo.findSession(sessionId)

        const appTitle = 'Mozilla Festival 2023'
        const pageTitle = session?.title.en
        const pageDescription = session?.content.en || ''
        const sessionImage = this.#url
          .getClientAsset('opengraph-session.png')
          .toString()

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

        const shortDesc = pageDescription.substring(0, 200)

        const head = dedent`
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <title>${pageTitle} | ${appTitle}</title>
          <meta property="og:title" content="${pageTitle}">
          <meta property="og:description" content="${shortDesc}">
          <meta property="og:type" content="website">
          <meta property="og:site_name" content="${appTitle}">
          <meta property="og:url" content="${sessionUrl}">
          <meta property="og:image" content="${sessionImage}">
          <meta http-equiv="refresh" content="0; url='${sessionUrl}'" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@mozillafestival" />
        `

        // Show the headers if ?dev is specified
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

        // There's no point specifying attendee/socketId as it won't be sent
        this.#metricsRepo
          .trackEvent('session/shareVisit', {
            sessionId: session.id,
            referer: ctx.request.headers.referer,
          })
          .catch((e) => console.error('Failed to track session/shareVisit', e))
      }
    )
  }
}
