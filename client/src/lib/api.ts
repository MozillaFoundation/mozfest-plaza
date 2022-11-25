import {
  PageFlag,
  ScheduleRecord as DeconfScheduleRecord,
} from '@openlab/deconf-shared'

export interface MozConferenceConfig {
  atrium?: PageFlag
  whatsOn?: PageFlag
  schedule: PageFlag
  helpDesk: PageFlag

  social?: PageFlag
  arts?: PageFlag
  skillShare?: PageFlag
  fringe?: PageFlag
  house?: PageFlag
  misinfoCon?: PageFlag
  emergentInfo?: PageFlag
  emergentSessions?: PageFlag

  navigation: {
    showInterpret: boolean
    showProfile: boolean
    showLogin: boolean
    showRegister: boolean
  }

  atriumWidgets: {
    register: boolean
    twitter: boolean
    login: boolean
    siteVisitors: boolean
    spatialChat: boolean
    slack: boolean
    familyResources: boolean
    mozfestBook: boolean
  }
}

export type ScheduleRecord = Omit<DeconfScheduleRecord, 'settings'> & {
  settings: MozConferenceConfig
}
