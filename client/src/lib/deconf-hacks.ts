import {
  createStateMapper,
  localiseFromObject,
} from '@openlab/deconf-ui-toolkit'
import type { MozApiStoreState } from '@/store/api-module.js'
import { useI18n } from 'vue-i18n'
import store from '../store/module.js'
import { computed } from 'vue'

export const mapApiState = createStateMapper<MozApiStoreState>()

export function localise(input: unknown) {
  // return computed(() => {})
  const i18n = useI18n()
  if (typeof input === 'string') return i18n.t(input)
  if (input && typeof input === 'object') {
    return localiseFromObject(
      i18n.locale.value,
      input as Record<string, string>
    )
  }
}

export function useUser() {
  return computed(() => store.state.api.user)
}

// https://stackoverflow.com/q/22266826/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function shallowCompare(a: any, b: any) {
  return (
    a &&
    b &&
    typeof a === 'object' &&
    typeof b === 'object' &&
    Object.keys(a).length === Object.keys(b).length &&
    Object.keys(a).every((key) => a[key] === b[key])
  )
}
