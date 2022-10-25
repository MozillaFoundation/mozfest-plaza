import { ScheduleRecord } from '@openlab/deconf-shared'
import { ApiModuleState, createStateMapper } from '@openlab/deconf-ui-toolkit'
import { MozConferenceConfig } from './api'

// TODO: work out how to merge upstream nicely
type MozApiModuleState = Omit<ApiModuleState, 'schedule'> & {
  schedule: Omit<ScheduleRecord, 'settings'> & {
    settings: MozConferenceConfig
  }
}
export const mapApiState = createStateMapper<MozApiModuleState>()
