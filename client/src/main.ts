import Vue from 'vue'

import App from './App.vue'
import router from './router/module'
import store from './store/module'
import i18n from './i18n/module'

import { DevPlugin, TemporalPlugin } from '@openlab/deconf-ui-toolkit'

import { EnvPlugin, env } from './plugins/env-plugin'
import { FontawesomePlugin } from './plugins/fontawesome-plugin'
import { MozFestDeconfPlugin } from './plugins/deconf-plugin'
import { MetricsPlugin } from './plugins/metrics-plugin'
import { SocketIoPlugin } from './plugins/socketio-plugin'
import { DialogPlugin } from './plugins/dialog-plugin'

if (!env.DISABLE_SOCKETS) {
  Vue.use(SocketIoPlugin)
}
Vue.use(TemporalPlugin, 1000)
Vue.use(DevPlugin)
Vue.use(EnvPlugin)
Vue.use(FontawesomePlugin)
Vue.use(MetricsPlugin)
Vue.use(MozFestDeconfPlugin)
Vue.use(DialogPlugin)

Vue.config.productionTip = false

new Vue({
  i18n,
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
