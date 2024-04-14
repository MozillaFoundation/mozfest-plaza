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

export const sessionTypeIds = {
  extendedWorkshop: '3229',
  artAndMedia: '3230',
  discussion: '3227',
  workshop: '3228',
  inPersonWorkshop: '3201',
  communityPlenary: '3333',
  virtualEvent: '3411',

  // Not setup for Kenya
  socialMoment: '_',
  lightningTalk: '_',
  fringeEvent: '_',
}

export const trackIds = {
  mozHouse: '3623',
}
