import { PageFlagStruct } from '@openlab/deconf-api-toolkit'
import {
  object,
  string,
  array,
  Infer,
  boolean,
  optional,
  date,
  number,
  tuple,
  enums,
  coerce,
} from 'superstruct'

export const localised = () => object({ en: string(), es: string() })

/** Koa Session URL parameters e.g. /session/:sessionId */
export const SessionIdStruct = object({
  sessionId: string(),
})

/** Koa token URL parameters e.g. /auth/:token */
export const TokenStruct = object({
  token: string(),
})

export { PageFlagStruct }

/** MozFest custom conference config */
export type ConferenceConfig = Infer<typeof ConferenceConfigStruct>
export const ConferenceConfigStruct = object({
  atrium: optional(PageFlagStruct),
  whatsOn: optional(PageFlagStruct),
  schedule: optional(PageFlagStruct),
  helpDesk: optional(PageFlagStruct),

  social: optional(PageFlagStruct),
  arts: optional(PageFlagStruct),
  lightningTalks: optional(PageFlagStruct),
  fringe: optional(PageFlagStruct),
  house: optional(PageFlagStruct),
  misinfoCon: optional(PageFlagStruct),
  emergentInfo: optional(PageFlagStruct),
  emergentSessions: optional(PageFlagStruct),
  mySchedule: optional(PageFlagStruct),

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
    linkedin: boolean(),
    submissions: boolean(),
    calendarHelp: boolean(),
  }),

  content: object({
    atriumVideo: string(),
  }),
})

export type BlockList = Infer<typeof BlockedStruct>
export const BlockedStruct = object({
  emails: array(string()),
})

const numberToString = () => coerce(string(), number(), (v) => v.toString())

export type AppConfig = Infer<typeof AppConfigStruct>
export const AppConfigStruct = object({
  mail: object({
    fromEmail: string(),
    replyToEmail: string(),
  }),
  sendgrid: object({
    loginTemplateId: string(),
  }),
  jwt: object({
    issuer: string(),
  }),
  content: object({
    keys: array(string()),
  }),
  pretalx: object({
    eventSlug: string(),
    englishKeys: array(string()),
    questions: object({
      pulsePhoto: number(),
      links: array(number()),
      affiliation: number(),
      recommendations: number(),
    }),
  }),
  tito: object({
    accountSlug: string(),
    eventSlug: string(),
  }),
  sessionTypes: array(
    object({
      id: numberToString(),
      title: localised(),
      icon: tuple([string(), string()]),
      layout: enums(['plenary', 'workshop']),
    })
  ),
  tracks: array(
    object({
      id: numberToString(),
      title: localised(),
    })
  ),
})
