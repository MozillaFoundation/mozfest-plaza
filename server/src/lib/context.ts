import { DeconfBaseContext } from '@openlab/deconf-api-toolkit'

import { AppConfig } from './config.js'
import { EnvRecord } from './env.js'
import { SocketService } from './socket-service.js'
import { UrlService } from './url-service.js'

export type AppContext = Pick<
  DeconfBaseContext,
  | 'resources'
  | 'jwt'
  | 'email'
  | 'i18n'
  | 'postgres'
  | 'semaphore'
  | 'store'
  | 'attendanceRepo'
  | 'conferenceRepo'
  | 'metricsRepo'
  | 'registrationRepo'
> & {
  config: AppConfig
  env: EnvRecord
  pkg: {
    name: string
    version: string
  }
  url: Readonly<UrlService>
  sockets: Readonly<SocketService>
}
