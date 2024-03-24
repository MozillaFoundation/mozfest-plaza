import { MetricsEvent } from '@openlab/deconf-ui-toolkit'
import _Vue from 'vue'
import { SocketIoPlugin } from './socketio-plugin'

const gaExcluded = new Set(['general/pageView'])

export class MetricsPlugin {
  static shared: MetricsPlugin | null = null

  static install(Vue: typeof _Vue): void {
    const plugin = new MetricsPlugin()
    Vue.prototype.$metrics = plugin
    MetricsPlugin.shared = plugin

    Vue.config.errorHandler = function (error, _vm, info) {
      console.error(error)
      MetricsPlugin.shared?.error({
        name: error.name,
        message: error.message,
        stack: error.stack,
        info: info,
      })
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

export function gaTrack(event: Record<string, string>) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(event)
}
