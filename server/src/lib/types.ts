import KoaRouter from '@koa/router'
import { Socket } from 'socket.io'
import { DeconfBaseContext } from '@openlab/deconf-api-toolkit'

import { AppConfig } from './structs.js'
import { EnvRecord } from './utils.js'
import { SocketService } from './socket-service.js'
import { UrlService } from './url-service.js'
import { Oauth2Repository } from '../deconf/oauth2-repository.js'
import { CalendarRepository } from '../mozfest/calendar-repo.js'
import { NotificationsRepository } from '../mozfest/notifications-repo.js'

//
// A common object passed between instances to share functionality and abstract implementations
//
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
  oauth2Repo: Readonly<Oauth2Repository>
  calendarRepo: Readonly<CalendarRepository>
  notifsRepo: Readonly<NotificationsRepository>
}

//
// A broker is something responsible for a set of socket.io messages
//

export interface AppBroker {
  socketConnected(
    socket: Socket,
    handleErrors: SocketErrorHandler
  ): Promise<void>
  socketDisconnected(socket: Socket): Promise<void>
}
export interface SocketErrorHandler {
  (listener: (...args: any[]) => Promise<void>): (...args: any) => void
}

export interface AppRouter {
  apply(router: KoaRouter): void
}
