import { type ScheduleRecord } from '@openlab/deconf-shared'
import {
  type ApiModuleState,
  createStateMapper,
} from '@openlab/deconf-ui-toolkit'
import { type MozConferenceConfig } from './api'

// TODO: work out how to merge upstream nicely
type MozApiModuleState = Omit<ApiModuleState, 'schedule'> & {
  schedule: Omit<ScheduleRecord, 'settings'> & {
    settings: MozConferenceConfig
  }
}
export const mapApiState = createStateMapper<MozApiModuleState>()
