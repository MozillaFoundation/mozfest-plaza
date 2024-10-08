import { Localised } from '@openlab/deconf-shared'
import { SponsorGroup } from '@openlab/deconf-ui-toolkit'

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
}

export const themeAllowlist = new Set([
  '610', // Activism
  '592', // Arts & Culture
  '593', // Bias
  '611', // Developer Focused
  '594', // Data Stewardship
  '595', // Decentralization
  '596', // Equity, Diversity & Inclusion
  '597', // Education
  '598', // Intersectionality
  '599', // Governance & Policy
  '600', // Health
  '601', // Movement Building
  '602', // Openness & Transparency
  '604', // Privacy & Security
  '605', // Science
  '606', // Speech & Language
  '607', // Web Literacy
  '585', // MozFest Funder Track

  '701', // Room A - THT Kamer
  '702', // Room B - Arthur Staal
  '703', // Room C - Boardroom
  '704', // Room D - Zonzij
  '705', // Room E - Flexruimte
  '706', // Room F - Water Studio
  '707', // Garden - House
  '708', // Garden - Tent
  '709', // Lounge
  '710', // Small Lounge
  '724', // Online Only
  '671', // Ethical Dilemma Cafe
  '760', // Restaurant
])

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
export type AtriumWidgetOptions = VisitorsWidgetOptions | CustomWidgetOptions

export type AtriumOptions = {
  hero: {
    title: Localised
    subtitle: Localised
  }
  widgets: AtriumWidgetOptions[]
  featured: {
    limit: 7
  }
  sponsors: SponsorGroup
}
