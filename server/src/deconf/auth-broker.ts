import { AuthSockets } from '@openlab/deconf-api-toolkit'
import { Socket } from 'socket.io'

import { AppBroker, SocketErrorHandler } from '../lib/app-broker'
import { createDebug, AppContext } from '../lib/module.js'

const debug = createDebug('moz:deconf:auth-broker')

type Context = AppContext

export class AuthBroker implements AppBroker {
  #sockets: AuthSockets
  constructor(context: Context) {
    this.#sockets = new AuthSockets(context)
  }

  async socketConnected(
    socket: Socket,
    handleErrors: SocketErrorHandler
  ): Promise<void> {
    socket.on(
      'auth',
      handleErrors(async (authToken) => {
        debug('@auth socket=%o', socket.id)
        await this.#sockets.auth(socket.id, authToken)
      })
    )

    socket.on(
      'deauth',
      handleErrors(async (authToken) => {
        debug('@deauth socket=%o', socket.id)
        await this.#sockets.deauth(socket.id)
      })
    )
  }

  async socketDisconnected(socket: Socket): Promise<void> {
    await this.#sockets.deauth(socket.id).catch(() => {})
  }
}
