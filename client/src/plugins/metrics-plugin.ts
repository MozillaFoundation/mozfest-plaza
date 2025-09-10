import { deconfClient } from '@/lib/module.ts'
import type { MetricsEvent } from '@openlab/deconf-ui-toolkit'
import type { App } from 'vue'
import { env } from './env-plugin.ts'
import { SocketIoPlugin } from './socketio-plugin'

const gaExcluded = new Set(['general/pageView'])

export class MetricsPlugin {
  static shared: MetricsPlugin | null = null

  static install(app: App): void {
    const plugin = new MetricsPlugin()
    app.config.globalProperties.$metrics = plugin
    MetricsPlugin.shared = plugin

    app.config.errorHandler = function (error, _vm, info) {
      console.error(error, info)
      MetricsPlugin.shared?.error(error)
    }
  }

  get visitor() {
    return sessionStorage.getItem('visitor_id')
  }

  track(metric: MetricsEvent): void {
    console.debug('MetricsPlugin#track %o', metric.eventName, metric.payload)
    SocketIoPlugin.sharedSocket?.emit(
      'trackMetric',
      metric.eventName,
      metric.payload
    )
    this.custom(metric).catch((error) =>
      console.error('custom metric failed', error)
    )
    if (!gaExcluded.has(metric.eventName)) gaTrack({ event: metric.eventName })
  }

  error(error: unknown): void {
    SocketIoPlugin.sharedSocket?.emit('trackError', error)
  }

  async custom(metric: MetricsEvent) {
    if (!env.CUSTOM_METRICS) return

    const url = deconfClient.endpoint(
      `/legacy/${env.DECONF_CONFERENCE}/metrics`
    )
    if (this.visitor) url.searchParams.set('visitor_id', this.visitor)

    const res = await deconfClient.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metric.eventName,
        payload: metric.payload,
      }),
    })

    if (res.ok) {
      const body = await res.json()
      sessionStorage.setItem('visitor_id', body.visitor)
    }
  }
}

export function gaTrack(...args: any[]) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(args)
}
