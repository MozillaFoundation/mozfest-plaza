import { Session } from '@openlab/deconf-shared'

export function createSessionPredicate(filter: string) {
  const params = new URLSearchParams(filter)

  const allowedTypes = new Set<string>()
  if (params.has('types')) {
    for (const type of params.get('types')!.split(',')) {
      allowedTypes.add(type)
    }
  }

  return (session: Session) => {
    if (allowedTypes.size > 0 && !allowedTypes.has(session.type)) {
      return false
    }
    return true
  }
}
