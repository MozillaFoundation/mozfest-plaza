import { createStateMapper } from '@openlab/deconf-ui-toolkit'
import type { MozApiStoreState } from '@/store/api-module.js'

export const mapApiState = createStateMapper<MozApiStoreState>()
