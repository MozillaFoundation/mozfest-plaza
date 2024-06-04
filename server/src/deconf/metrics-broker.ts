import { ApiError, MetricsSockets } from '@openlab/deconf-api-toolkit'
import { Socket } from 'socket.io'
import { any, boolean, number, object, string, Struct } from 'superstruct'
import {
  AppBroker,
  AppContext,
  createDebug,
  SocketErrorHandler,
} from '../lib/module.js'

const debug = createDebug('deconf:metrics-broker')
const METRICS_ROOM = 'metrics_analisis'

const eventStructs = new Map<string, Struct<any>>()
eventStructs.set(
  'session/ical',
  object({
    sessionId: string(),
  })
)
eventStructs.set(
  'attendance/attend',
  object({
    sessionId: string(),
  })
)
eventStructs.set(
  'attendance/unattend',
  object({
    sessionId: string(),
  })
)
eventStructs.set(
  'login/start',
  object({
    emailHash: string(),
  })
)
eventStructs.set('login/finish', object({}))
eventStructs.set('login/logout', object({}))
eventStructs.set(
  'register/start',
  object({
    country: string(),
  })
)
eventStructs.set(
  'login/unregister',
  object({
    confirmed: boolean(),
  })
)
eventStructs.set(
  'general/pageView',
  object({
    routeName: string(),
    params: any(),
  })
)
eventStructs.set(
  'session/link',
  object({
    sessionId: string(),
    action: string(),
    link: string(),
  })
)
eventStructs.set(
  'atrium/widget',
  object({
    widget: string(),
  })
)
eventStructs.set(
  'session/recommendation',
  object({
    fromSession: string(),
    toSession: string(),
    index: number(),
  })
)
eventStructs.set(
  'session/share',
  object({
    sessionId: string(),
    kind: string(),
  })
)
eventStructs.set('profile/userCalendar', object({}))

type Context = AppContext

export class MetricsBroker implements AppBroker {
  #sockets: MetricsSockets
  #context: Context
  constructor(context: Context) {
    this.#context = context
    this.#sockets = new MetricsSockets({
      ...context,
      eventStructs,
      pause: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    })
  }

  async socketConnected(socket: Socket, handleErrors: SocketErrorHandler) {
    this.#sockets.cameOnline(socket.id).catch((error) => {
      console.error('MetricsBroker#cameOnline', error)
      // process.exit(1)
    })

    socket.on(
      'trackMetric',
      handleErrors(async (eventName, payload) => {
        debug('trackMetric socket=%o event=%o', socket.id, eventName)
        await this.#sockets.event(socket.id, eventName, payload)

        this.#context.sockets.emitTo(METRICS_ROOM, 'liveEvent', {
          created: new Date(),
          eventName,
          payload,
        })
      })
    )

    socket.on(
      'trackError',
      handleErrors(async (error) => {
        debug('trackError socket=%o', socket.id)
        await this.#sockets.error(socket.id, error)

        this.#context.sockets.emitTo(METRICS_ROOM, 'liveError', error)
      })
    )

    socket.on(
      'startAnalyse',
      handleErrors(async () => {
        debug('startAnalyse socket=%o', socket.id)
        const { authToken } = await this.#context.jwt.getSocketAuth(socket.id)
        if (!authToken.user_roles.includes('admin')) {
          throw ApiError.unauthorized()
        }

        await this.#context.sockets.joinRoom(socket.id, METRICS_ROOM)
      })
    )

    socket.on(
      'stopAnalyse',
      handleErrors(async () => {
        debug('stopAnalyse socket=%o', socket.id)
        const { authToken } = await this.#context.jwt.getSocketAuth(socket.id)
        if (!authToken.user_roles.includes('admin')) {
          throw ApiError.unauthorized()
        }

        await this.#context.sockets.leaveRoom(socket.id, METRICS_ROOM)
      })
    )
  }

  async socketDisconnected(socket: Socket) {
    await this.#sockets.wentOffline(socket.id)
  }
}
