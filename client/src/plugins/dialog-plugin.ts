import _Vue, { Component } from 'vue'
import { CombinedVueInstance } from 'vue/types/vue'

interface Data {
  component: Component | null
  props: Record<string, unknown>
}

export class DialogPlugin {
  static shared: DialogPlugin | null = null

  get component(): unknown {
    return this._vm.component
  }
  get props(): unknown {
    return this._vm.props
  }

  // Use an internal vue component to fake the reactivity of properties
  // so consumers can bind to $dev values
  _vm: CombinedVueInstance<_Vue, Data, unknown, unknown, unknown>

  static install(Vue: typeof _Vue): void {
    const plugin = new DialogPlugin(Vue)
    Vue.prototype.$dialog = plugin
    DialogPlugin.shared = plugin
  }

  constructor(Vue: typeof _Vue) {
    this._vm = new Vue({
      data: { component: null, props: {} },
    })
  }

  show(component: Component, props = {}): void {
    this._vm.component = component
    this._vm.props = props
  }
  close(): void {
    this._vm.component = null
    this._vm.props = {}
  }
}
