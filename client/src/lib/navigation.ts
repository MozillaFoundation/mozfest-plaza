import { AuthToken, ConferenceConfig, PageFlag } from '@openlab/deconf-shared'
import { Routes } from '@openlab/deconf-ui-toolkit'
import VueRouter from 'vue-router'
import { MozConferenceConfig } from './api'

type AllPageFlags = {
  [K in keyof MozConferenceConfig]: MozConferenceConfig[K] extends PageFlag
    ? PageFlag
    : never
}

// TODO: migrate to deconf version

/** EXPERIMENTAL - guard a route against a PageFlag unless an admin is visiting */
export function guardRoute(
  schedule: ConferenceConfig | undefined,
  key: keyof AllPageFlags,
  user: AuthToken | null,
  router: VueRouter
): void {
  if (user?.user_roles.includes('admin')) return

  const flag = (schedule as AllPageFlags)?.[key]

  if (!flag || flag.enabled !== true || flag.visible !== true) {
    router.replace({ name: Routes.NotFound })
  }
}
