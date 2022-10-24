import _Vue from 'vue'
import io, { Socket } from 'socket.io-client'
import { env } from './env-plugin'
import { StorageKey } from '@/lib/module'

export class SocketIoPlugin {
  socket: Socket

  static sharedSocket: Socket | null = null

  static install(Vue: typeof _Vue): void {
    Vue.prototype.$io = new SocketIoPlugin(env.SERVER_URL)
  }

  static authenticate(token: string): void {
    this.sharedSocket?.emit('auth', token)
  }

  constructor(serverUrl: string) {
    // Concat the path onto the server url, e.g.
    // "/api/socket.io"
    // "/socket.io"
    const pathname = new URL(serverUrl).pathname.replace(/\/?$/, '/socket.io')

    // Generate the socket.io url
    // reset the pathname because socket.io uses it differently (for amespaces)
    const socketUrl = new URL(serverUrl)
    socketUrl.protocol = socketUrl.protocol.replace(/^http/, 'ws')
    socketUrl.pathname = '/'

    // Create a socket client which only uses websockets
    // this drops support for http-based connections and requires WebSocket
    // which is needed for scaleable architecture
    this.socket = io(socketUrl.toString(), {
      path: pathname,
      transports: ['websocket'],
    })

    // Listen for errors and log them
    this.socket.on('apiError', (error: unknown) => {
      console.error('Socket API Error', error)
    })

    // Share the sockets for other top-level code to user
    SocketIoPlugin.sharedSocket = this.socket

    // Emit auth on connection
    this.socket.on('connect', () => {
      const token = localStorage.getItem(StorageKey.AuthToken)
      if (token) {
        SocketIoPlugin.authenticate(token)
      }
    })
  }

  teardown(): void {
    this.socket.close()
  }
}
