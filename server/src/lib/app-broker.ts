import { Socket } from 'socket.io'

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
