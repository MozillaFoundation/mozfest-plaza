import { loadScript } from '@/lib/external-scripts.js'
import type { App } from 'vue'
import { env } from './env-plugin.js'

export class ConsentPlugin {
  static install(app: App): void {
    if (!env.CONSENT_ID) {
      console.debug('skip consent')
      return
    }

    app.config.globalProperties.$consent = new ConsentPlugin(
      env.CONSENT_ID,
      env.GA_TOKEN
    )
    app.config.globalProperties.$consent.start().catch((error) => {
      console.error('Failed to start ConsentPlugin', error)
    })
  }

  id: string
  ga: string | null
  constructor(id: string, ga: string | null) {
    this.id = id
    this.ga = ga
  }

  async start() {
    window.OptanonWrapper = (...args: any[]) => this.onOption(...args)
    window.dataLayer = window.dataLayer || []

    await loadScript('cookielaw-sdk', env.CONSENT_URL, {
      type: 'text/javascript',
      charset: 'UTF-8',
      'data-domain-script': this.id,
    })

    if (this.ga) {
      await loadScript(
        'google-tag-manager',
        `https://www.googletagmanager.com/gtag/js?id=${this.ga}`,
        { async: '' }
      )

      this.gtag('js', new Date())
      this.gtag('config', this.ga)
    }
  }

  onOption(...args: any[]) {
    console.log('ConsentPlugin@option', ...args)
  }

  gtag(...args: any[]) {
    window.dataLayer?.push(args)
  }
}
