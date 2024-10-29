import http from 'http'

import Koa from 'koa'
import KoaRouter from '@koa/router'
import koaCors from '@koa/cors'
import koaJson from 'koa-json'
import koaBodyParser from 'koa-bodyparser'
import koaHelmet from 'koa-helmet'
import koaStatic from 'koa-static'
import koaMount from 'koa-mount'

import { Server as SocketIoServer, Socket } from 'socket.io'
import { createAdapter as socketIoRedisAdapter } from '@socket.io/redis-adapter'

import ms from 'ms'

import {
  ApiError,
  createRedisClient,
  SocketService,
  StructApiError,
} from '@openlab/deconf-api-toolkit'
import { AppContext, AppRouter, AppBroker, createDebug } from './lib/module.js'

import { GeneralRouter } from './mozfest/general-router.js'
import { RegistrationRouter } from './deconf/registration-router.js'
import { AttendanceRouter } from './deconf/attendance-router.js'
import { ConferenceRouter } from './deconf/conference-router.js'
import { ContentRouter } from './deconf/content-router.js'
import { MetricsBroker } from './deconf/metrics-broker.js'
import { AuthBroker } from './deconf/auth-broker.js'
import { AdminRouter } from './deconf/admin-router.js'
import { CalendarRouter } from './deconf/calendar-router.js'
import { TitoRouter } from './mozfest/tito-router.js'
import { MozCalendarRouter } from './mozfest/calendar-router.js'

const STATIC_MAX_AGE = 30 * 60 * 1000
const debug = createDebug('server')

/** A middleware to output requests when in debug mode */
function debugMiddleware(): Koa.Middleware {
  return async (ctx, next) => {
    const start = Date.now()
    await next()

    // Check for invalid ctx.body use
    if (ctx.body instanceof Promise) {
      console.error('A promise was set on ctx.body')
      console.error(
        'Request: %s %i %s',
        ctx.request.method,
        ctx.response.status,
        ctx.request.path
      )
      process.exit(1)
    }

    const dt = Date.now() - start
    debug(
      '%s %i %s %s',
      ctx.request.method,
      ctx.response.status,
      ctx.request.path,
      ms(dt)
    )
  }
}

function httpErrorHandler(isProduction: boolean): Koa.Middleware {
  return async (ctx, next) => {
    try {
      await next()
    } catch (error) {
      if (error instanceof ApiError) {
        ctx.status = error.status
        ctx.body = {
          error: error.message,
          codes: error.codes,
          stack: error.stack,
        }
        if (error instanceof StructApiError) {
          ctx.body.failures = error.failures
        }
      } else if (error instanceof Error) {
        ctx.status = 500
        ctx.body = {
          error: isProduction ? 'Something went wrong' : error.message,
          stack: isProduction ? null : error.stack,
        }
      } else {
        console.error('A non-Error was thrown')
        console.error(error)
        process.exit(1)
      }
    }
  }
}

export function ioErrorHandler<T extends unknown[]>(
  socket: Socket,
  service: SocketService
) {
  return (endpoint: (...args: T) => Promise<void>) => {
    return async (...args: T) => {
      try {
        await endpoint(...args)
      } catch (error) {
        if (error instanceof ApiError) {
          service.sendError(socket.id, error)
        } else {
          console.error('An unknown error occured')
          console.error(error)
          process.exit(1)
        }
      }
    }
  }
}

export function createServer(context: AppContext) {
  const router = new KoaRouter()

  const appRouters: AppRouter[] = [
    new GeneralRouter(context),
    new RegistrationRouter(context),
    new AttendanceRouter(context),
    new ConferenceRouter(context),
    new ContentRouter(context),
    new AdminRouter(context),
    new CalendarRouter(context),
    new TitoRouter(context),
    new MozCalendarRouter(context),
  ]

  const appBrokers: AppBroker[] = [
    new MetricsBroker(context),
    new AuthBroker(context),
  ]

  for (const appRouter of appRouters) {
    appRouter.apply(router)
  }

  const app = new Koa()
    .use(koaHelmet())
    .use(koaCors({ origin: context.env.CLIENT_URL }))
    .use(koaMount('/static', koaStatic('static', { maxage: STATIC_MAX_AGE })))
    .use(koaJson())
    .use(koaBodyParser())
    .use(debugMiddleware())
    .use(httpErrorHandler(context.env.NODE_ENV === 'production'))
    .use(router.routes())
    .use(router.allowedMethods())

  const server = http.createServer(app.callback())
  const io = new SocketIoServer(server, {})
  context.sockets.setIo(io)

  io.on('connection', (socket) => {
    const m = ioErrorHandler(socket, context.sockets)
    const exitProcess = (error: Error, broker: AppBroker) => {
      console.error('A fatal error occured managing sockets')
      console.error(error)
      process.exit(1)
    }

    for (const broker of appBrokers) {
      broker.socketConnected(socket, m).catch((e) => exitProcess(e, broker))
    }

    socket.on('disconnect', () => {
      // Only call the broker if the server is alive (ie not terminating)
      if (server.address() === null) return
      for (const broker of appBrokers) {
        broker.socketDisconnected(socket).catch((e) => exitProcess(e, broker))
      }
    })
  })

  if (context.env.REDIS_URL) {
    const pub = createRedisClient(context.env.REDIS_URL)
    const sub = createRedisClient(context.env.REDIS_URL)
    io.adapter(socketIoRedisAdapter(pub, sub))
  }

  return { app, server, router, io }
}
