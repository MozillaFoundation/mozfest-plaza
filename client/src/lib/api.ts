import { ConferenceConfig, PageFlag } from '@openlab/deconf-shared'

export interface MozConferenceConfig extends ConferenceConfig {
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
    siteVisitors: boolean
    twitter: boolean
    login: boolean
    register: boolean
    spatialChat: boolean
    slack: boolean
    familyResources: boolean
    mozfestBook: boolean
  }
}

// TODO: migrate to deconf version
export function getSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/[^\w-]+/g, '')
}
