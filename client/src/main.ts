import { createApp } from 'vue'

import App from './App.vue'
import router from './router/module'
import store from './store/module'
import i18n from './i18n/module'

import {
  DevPlugin,
  DialogPlugin,
  TemporalPlugin,
} from '@openlab/deconf-ui-toolkit'

import { EnvPlugin, env } from './plugins/env-plugin'
import { FontawesomePlugin } from './plugins/fontawesome-plugin'
import { MozFestDeconfPlugin } from './plugins/deconf-plugin'
import { MetricsPlugin } from './plugins/metrics-plugin'
import { SocketIoPlugin } from './plugins/socketio-plugin'
import { ServiceWorkerPlugin } from './plugins/service-worker-plugin'

const app = createApp(App)

if (!env.DISABLE_SOCKETS) {
  app.use(SocketIoPlugin)
}
app
  .use(TemporalPlugin, 1000)
  .use(DevPlugin)
  .use(EnvPlugin)
  .use(FontawesomePlugin)
  .use(MetricsPlugin)
  .use(MozFestDeconfPlugin)
  .use(DialogPlugin)
  .use(ServiceWorkerPlugin)
  .use(router)
  .use(store)
  .use(i18n)

app.mount('#app')
