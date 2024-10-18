import {
  createStateMapper,
  localiseFromObject,
} from '@openlab/deconf-ui-toolkit'
import type { MozApiStoreState } from '@/store/api-module.js'
import { useI18n } from 'vue-i18n'

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
