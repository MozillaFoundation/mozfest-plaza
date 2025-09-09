import type { MetricsEvent } from '@openlab/deconf-ui-toolkit'
import type { App } from 'vue'
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

  track(metric: MetricsEvent): void {
    console.debug('MetricsPlugin#track %o', metric.eventName, metric.payload)
    SocketIoPlugin.sharedSocket?.emit(
      'trackMetric',
      metric.eventName,
      metric.payload
    )
    if (!gaExcluded.has(metric.eventName)) gaTrack({ event: metric.eventName })
  }

  error(error: unknown): void {
    SocketIoPlugin.sharedSocket?.emit('trackError', error)
  }
}

export function gaTrack(...args: any[]) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(args)
}
