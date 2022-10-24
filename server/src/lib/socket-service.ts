import { Server as SocketIoServer } from 'socket.io'
import { createDebug } from './debug.js'

import {
  ApiError,
  SocketService as DeconfSocketService,
} from '@openlab/deconf-api-toolkit'

const debug = createDebug('moz:lib:sockets-service')

export class SocketService implements Readonly<DeconfSocketService> {
  get #io() {
    if (!this.#_io) throw new Error('SocketService used before it is ready')
    return this.#_io
  }

  #_io: SocketIoServer | undefined
  constructor() {}

  setIo(io: SocketIoServer) {
    this.#_io = io
  }

  emitToEveryone(eventName: string, ...args: unknown[]): void {
    debug('emitToEveryone event=%o', eventName)
    this.#io.emit(eventName, ...args)
  }

  emitTo(roomNameOrId: string, eventName: string, ...args: unknown[]): void {
    debug('emitTo to=%o event=%o', roomNameOrId, eventName)
    this.#io.in(roomNameOrId).emit(eventName, ...args)
  }

  async joinRoom(socketId: string, roomName: string): Promise<void> {
    debug('joinRoom socket=%o room=%o', socketId, roomName)

    const socket = this.#io.of('/').sockets.get(socketId)
    if (socket) {
      socket.join(roomName)
    } else {
      this.#io.in(socketId).socketsJoin(roomName)
    }
  }

  async leaveRoom(socketId: string, roomName: string): Promise<void> {
    debug('leaveRoom socket=%o room=%o', socketId, roomName)

    const socket = this.#io.of('/').sockets.get(socketId)
    if (socket) {
      socket.leave(roomName)
    } else {
      this.#io.in(socketId).socketsLeave(roomName)
    }
  }

  async getRoomsOfSocket(socketId: string): Promise<Set<string>> {
    debug('getRoomsOfSocket socket=%o ', socketId)
    const sockets = await this.#io.in(socketId).fetchSockets()
    return sockets[0].rooms
  }

  async getSocketsInRoom(roomName: string): Promise<string[]> {
    debug('getSocketsInRoom room=%o ', roomName)
    const sockets = await this.#io.in(roomName).fetchSockets()
    return sockets.map((r) => r.id)
  }

  sendError(socketId: string, error: ApiError): void {
    debug('#sendError to=%o error=%O', socketId, error)
    this.#io.in(socketId).emit('apiError', {
      ...error,
      status: error.status,
      codes: error.codes,
      stack: error.stack,
    })
  }
}
