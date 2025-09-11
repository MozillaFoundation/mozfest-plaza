import type { Localized, Track } from '@openlab/deconf-shared'
import { getSlug } from '@openlab/deconf-ui-toolkit'

export interface Room {
  id: number
  name: Localized
  slug: string
}

export function getRooms(input: Track[]) {
  return input
    .map((t) => ({
      id: parseInt(t.id),
      name: t.title,
      slug: getSlug(t.title.en!),
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug))
}
