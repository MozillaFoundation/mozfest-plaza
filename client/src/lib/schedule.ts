import { ScheduleRecord, Session } from '@openlab/deconf-shared'
import {
  Routes,
  ScheduleConfig,
  ScheduleFilterRecord,
  SelectOption,
} from '@openlab/deconf-ui-toolkit'
import { Location } from 'vue-router'
import { ExtraRoutes } from './module'

export interface FilteredScheduleOptions {
  predicate: (s: Session) => boolean
  filtersKey: string
  scheduleConfig: ScheduleConfig
  enabledFilters: (keyof ScheduleFilterRecord)[]
  languages: SelectOption[]
}

export interface DateRange {
  start: Date
  end: Date
}

/** Get the very start and end dates based on a set of sessions */
export function getScheduleStartAndEnd(
  sessions: Session[],
  schedule: ScheduleRecord
): DateRange | null {
  const slots = new Map(schedule.slots.map((s) => [s.id, s]))

  let firstDate: Date | null = null
  let lastDate: Date | null = null

  for (const session of sessions) {
    const slot = session.slot ? slots.get(session.slot) : undefined
    if (!slot) continue

    if (!firstDate || slot.start.getTime() < firstDate.getTime()) {
      firstDate = slot.start
    }

    if (!lastDate || slot.end.getTime() > lastDate.getTime()) {
      lastDate = slot.end
    }
  }

  if (!firstDate || !lastDate) return null

  return {
    start: firstDate,
    end: lastDate,
  }
}

/** Wether a fate is inside a `DateRange` */
export function isInRange(range: DateRange, date: Date): boolean {
  return (
    date.getTime() >= range.start.getTime() &&
    date.getTime() <= range.end.getTime()
  )
}

/** Work out which page to return to from a given `Session` */
export function getSessionParentRoute(session: Session): Location {
  if (session.type === 'art-and-media') return { name: ExtraRoutes.Arts }
  if (session.type === 'fringe-events') return { name: ExtraRoutes.Fringe }
  if (session.type === 'mozfest-house') return { name: ExtraRoutes.House }
  if (session.type === 'skill-share--lightning-talk') {
    return { name: ExtraRoutes.SkillShare }
  }
  if (
    session.type === 'misinfocon-discussion' ||
    session.type === 'misinfocon-workshop'
  ) {
    return { name: ExtraRoutes.MisinfoCon }
  }

  return { name: Routes.Schedule }
}

/**
 * Create a new schedule record with only the relevant resource in it. It looks through each session and only keeps slots/speakers/themes/tracks/types that existing on the provided sessions.
 */
export function filterScheduleFromSessions(
  schedule: ScheduleRecord,
  sessions: Session[]
): ScheduleRecord {
  const slotIds = new Set<string>()
  const speakerIds = new Set<string>()
  const themeIds = new Set<string>()
  const trackIds = new Set<string>()
  const typeIds = new Set<string>()

  for (const session of sessions) {
    if (session.slot) slotIds.add(session.slot)
    if (session.track) trackIds.add(session.track)
    if (session.type) typeIds.add(session.type)

    session.speakers.forEach((id) => speakerIds.add(id))
    session.themes.forEach((id) => themeIds.add(id))
  }

  const slots = schedule.slots.filter((s) => slotIds.has(s.id))
  const speakers = schedule.speakers.filter((s) => speakerIds.has(s.id))
  const themes = schedule.themes.filter((s) => themeIds.has(s.id))
  const tracks = schedule.tracks.filter((s) => trackIds.has(s.id))
  const types = schedule.types.filter((s) => typeIds.has(s.id))

  return { ...schedule, slots, speakers, themes, tracks, types }
}
