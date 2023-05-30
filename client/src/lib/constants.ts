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
])

export const sessionTypeIds = {
  extendedWorkshop: '2427',
  artAndMedia: '2423',
  socialMoment: '2424',
  discussion: '2425',
  workshop: '2453',
  lightningTalk: '2426',
  communityPlenary: '2620',
  fringeEvent: '2672',
}

export const trackIds = {
  mozHouse: '3623',
}
