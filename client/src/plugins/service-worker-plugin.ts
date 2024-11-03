import { shallowReactive, type App } from 'vue'

interface Data {
  registration: ServiceWorkerRegistration | null
}

export class ServiceWorkerPlugin {
  static shared: ServiceWorkerPlugin | null = null

  _vm: Data

  static install(app: App): void {
    const plugin = new ServiceWorkerPlugin()
    app.config.globalProperties.$serviceWorker = plugin
    ServiceWorkerPlugin.shared = plugin
  }

  static use(): Data {
    return this.shared?._vm as Data
  }

  constructor() {
    this._vm = shallowReactive({
      registration: null,
    })
    this.setup()
  }

  async setup() {
    if (!('serviceWorker' in navigator)) return

    try {
      this._vm.registration = await navigator.serviceWorker.register(
        new URL('../../service-worker.js', import.meta.url)
      )
      console.debug('service worker registered', this._vm.registration)
    } catch (error) {
      console.error('service worker not registered', error)
    }
  }
}
