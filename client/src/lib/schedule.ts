import { Session } from '@openlab/deconf-shared'
import { Routes } from '@openlab/deconf-ui-toolkit'
import { Location } from 'vue-router'
import { ExtraRoutes } from './module'

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
