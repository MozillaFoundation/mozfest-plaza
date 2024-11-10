import { type Localised } from '@openlab/deconf-shared'
import { type Sponsor } from '@openlab/deconf-ui-toolkit'

export enum StorageKey {
  AuthToken = 'authToken',
  Analytics = 'analyticsConsent',
  Locale = 'chosenLocale',
  ScheduleFilters = 'scheduleFilters',
  MisinfoConFilters = 'misinfoConFilters',
  HouseEventsFilters = 'houseEventsFilters',
  ArtFilters = 'artFilters',
  LightningTalksFilters = 'lightningTalksFilters',
  FringeEventsFilters = 'fringeEventsFilters',
  WhatsOnFilters = 'whatsOnFilters',
  EmergentSessionsFilters = 'emergentSessionsFilters',
  MyScheduleFilters = 'myScheduleFilters',
  SearchViewFilters = 'searchViewFilters',
}

export enum ExtraRoutes {
  Spaces = 'spaces',
  LightningTalks = 'lightningTalks',
  Arts = 'art-gallery',
  Fringe = 'fringe',
  House = 'house',
  HouseInfo = 'houseInfo',
  MisinfoCon = 'misinfoCon',
  EmergentInfo = 'emergentInfo',
  EmergentSessions = 'emergentSessions',
  Calendar = 'calendar',
  MySchedule = 'mySchedule',
  Utils = 'utils',
  Search = 'Search',
  ProfileCalendar = 'ProfileCalendar',
  ProfileNotifications = 'ProfileNotifications',

  Admin = 'Admin',
  AdminSchedule = 'AdminSchedule',
  AdminMessaging = 'AdminMessaging',
}

export const themeAllowlist = new Set([])

export const sessionTypes = {
  extendedWorkshop: '4048',
  discussion: '4047',
  workshop: '4046',
  communityPlenary: '4049',

  instillation: '4045',
  performance: '4359',
}

export const trackIds = {
  mozHouse: '3623',
}

export interface PageConfig<T extends string, U> {
  path: string
  name: string
  title: Record<string, string>
  kind: T
  options: U
}

// TODO: these should be *Config suffix-ed

export type TimelineOptions = {
  filter: string
  tile: {
    header: string[]
    attributes: string[]
    actions?: string[]
  }
  controls: string[]
}

export type GridOptions = {
  filter: string
  tile: {
    header: string[]
    attributes: string[]
    actions?: string[]
  }
  controls: string[]
  readonly: boolean
}

export type ContentOptions = {
  contentSlug: string
}

export type AtriumWidgetInit<Kind, Options> = {
  id: string
  kind: Kind
  options: Options
  condition?: string
}

export type VisitorsWidgetOptions = AtriumWidgetInit<
  'visitors',
  { subtitle: Localised }
>
export type CustomWidgetOptions = AtriumWidgetInit<
  'custom',
  {
    title: Localised
    subtitle: Localised
    url?: string
    icon: string
  }
>
export type GenericWidget = AtriumWidgetInit<string, unknown>
export type AtriumWidgetOptions =
  | VisitorsWidgetOptions
  | CustomWidgetOptions
  | GenericWidget

// TypeScript doesn't like the literal types when its generated from JSON
export type GenericSponsorGroup = {
  title: string
  size: string
  sponsors: Sponsor[]
}

export type AtriumOptions = {
  hero: {
    title: Localised
    subtitle: Localised
  }
  widgets: AtriumWidgetOptions[]
  featured: {
    limit: number
  }
  sponsors: GenericSponsorGroup[]
}

// https://developers.google.com/identity/protocols/oauth2/scopes
export const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar'
