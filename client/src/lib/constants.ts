import { type Localised } from '@openlab/deconf-shared'
import { type Sponsor } from '@openlab/deconf-ui-toolkit'

export enum StorageKey {
  AuthToken = 'authToken',
  Locale = 'chosenLocale',
  ScheduleFilters = 'scheduleFilters',
  WhatsOnFilters = 'whatsOnFilters',
  MyScheduleFilters = 'myScheduleFilters',
}

export enum ExtraRoutes {
  Calendar = 'calendar',
  MySchedule = 'mySchedule',
  Search = 'Search',
  ProfileCalendar = 'ProfileCalendar',
  ProfileNotifications = 'ProfileNotifications',
  ProfileAuth = 'ProfileAuth',

  Admin = 'Admin',
  AdminSchedule = 'AdminSchedule',
  AdminMessaging = 'AdminMessaging',
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

export type CollageOptions = {
  filter: string
  // tile: {
  //   header: string[]
  //   attributes: string[]
  //   actions: string[]
  // }
  controls: string[]
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
    image: Localised
  }
  widgets: AtriumWidgetOptions[]
  featured: {
    limit: number
  }
  sponsors: GenericSponsorGroup[]
}

// https://developers.google.com/identity/protocols/oauth2/scopes
export const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar'
