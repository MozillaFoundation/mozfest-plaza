import type { Session } from '@openlab/deconf-shared'

function makeSingularFilter(input?: string | null) {
  if (!input) return () => true
  const allowed = new Set(input.split(',').map((str) => str.trim()))
  return (value: string) => allowed.has(value)
}

export function createSessionPredicate(filter: string) {
  const params = new URLSearchParams(filter)

  const type = makeSingularFilter(params.get('types'))
  const track = makeSingularFilter(params.get('tracks'))
  const room = makeSingularFilter(params.get('rooms'))

  return (session: Session) => {
    if (!type(session.type)) return false
    if (!track(session.track)) return false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!room((session as any).room)) return false
    return true
  }
}
