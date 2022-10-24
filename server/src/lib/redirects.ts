import { ApiError } from '@openlab/deconf-api-toolkit'

export function getRedirectErrorCode(error: unknown) {
  let errorCode: string | undefined = undefined

  if (error instanceof ApiError) {
    for (const code of error.codes) {
      if (code === 'general.notFound') return 'not_found'
      if (code === 'auth.tokenExpired') return 'login_expired'
    }
  }

  return errorCode
}
