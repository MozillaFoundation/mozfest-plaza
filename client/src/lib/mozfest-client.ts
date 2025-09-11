import { env } from '@/plugins/env-plugin.ts'
import { FetchClient } from './api.ts'

export class MozFestClient extends FetchClient {}

export const mozClient = new MozFestClient(env.MOZ_API_URL, {
  credentials: 'include',
})
