import { MetricsEvent } from '@openlab/deconf-ui-toolkit'
import _Vue from 'vue'
import { SocketIoPlugin } from './socketio-plugin'

import VueGtagPlugin, { VueGtag, PluginOptions as GtagOptions } from 'vue-gtag'
import { env } from './env-plugin'
import router from '@/router/module'

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

    const options: GtagOptions = {
      enabled: Boolean(env.GA_TOKEN),
      config: {
        id: env.GA_TOKEN as string,
        params: {
          anonymize_ip: true,
          allow_ad_personalization_signals: false,
          allow_google_signals: false,
        },
      },
    }

    Vue.use(VueGtagPlugin, options, router)
  }

  track(metric: MetricsEvent): void {
    console.debug('MetricsPlugin#track %o', metric.eventName, metric.payload)
    SocketIoPlugin.sharedSocket?.emit(
      'trackMetric',
      metric.eventName,
      metric.payload
    )

    const gtag: VueGtag = _Vue.prototype.$gtag
    if (gtag && metric.eventName !== 'general/pageView') {
      gtag.event('deconf', {
        event_category: metric.eventName,
      })
    }
  }

  error(error: unknown): void {
    SocketIoPlugin.sharedSocket?.emit('trackError', error)
  }
}
