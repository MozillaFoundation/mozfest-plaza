import KoaRouter from '@koa/router'

export interface AppRouter {
  apply(router: KoaRouter): void
}
