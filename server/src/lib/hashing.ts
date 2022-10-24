import crypto from 'crypto'

export function sha256Hash(input: string) {
  return crypto.createHash('sha256').update(input).digest('base64')
}
