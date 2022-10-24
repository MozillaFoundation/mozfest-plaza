import {
  ConferenceConfigStruct as DeconfConferenceConfigStruct,
  PageFlagStruct,
} from '@openlab/deconf-api-toolkit'
import {
  assign,
  object,
  string,
  array,
  Infer,
  boolean,
  optional,
} from 'superstruct'

/** Koa Session URL parameters e.g. /session/:sessionId */
export const SessionIdStruct = object({
  sessionId: string(),
})

/** Koa token URL parameters e.g. /auth/:token */
export const TokenStruct = object({
  token: string(),
})

/** MozFest custom conference config */
export const ConferenceConfigStruct = assign(
  DeconfConferenceConfigStruct,
  object({
    social: optional(PageFlagStruct),
    arts: optional(PageFlagStruct),
    skillShare: optional(PageFlagStruct),
    fringe: optional(PageFlagStruct),
    house: optional(PageFlagStruct),
    misinfoCon: optional(PageFlagStruct),
    emergentInfo: optional(PageFlagStruct),
    emergentSessions: optional(PageFlagStruct),

    navigation: object({
      showInterpret: boolean(),
      showProfile: boolean(),
      showLogin: boolean(),
      showRegister: boolean(),
    }),

    atriumWidgets: object({
      siteVisitors: boolean(),
      twitter: boolean(),
      login: boolean(),
      register: boolean(),
      spatialChat: boolean(),
      slack: boolean(),
      familyResources: boolean(),
      mozfestBook: boolean(),
    }),
  })
)

export type BlockList = Infer<typeof BlockedStruct>
export const BlockedStruct = object({
  emails: array(string()),
})
