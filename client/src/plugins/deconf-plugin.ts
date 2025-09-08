import {
  type DeconfPlugin,
  DialogPlugin,
  type MetricsEvent,
} from '@openlab/deconf-ui-toolkit'
import type { Session } from '@openlab/deconf-shared'
import type { App, Component } from 'vue'
import { env } from './env-plugin'
import { MetricsPlugin } from './metrics-plugin'

export class MozFestDeconfPlugin implements DeconfPlugin {
  static install(app: App): void {
    app.config.globalProperties.$deconf = new MozFestDeconfPlugin()
  }

  getCalendarLink(session: Session, kind?: 'ical' | 'google'): string | null {
    if (!session.slot) return null

    let url: URL | null = null

    if (kind === 'ical') {
      url = new URL(`calendar/ical/${session.id}`, env.SERVER_URL)
    }
    if (kind === 'google') {
      url = new URL(`calendar/google/${session.id}`, env.SERVER_URL)
    }

    return url ? url.toString() : null
  }
  trackMetric(metric: MetricsEvent): void {
    MetricsPlugin.shared?.track(metric)
  }
  showDialog(component: Component, props: Record<string, unknown>): void {
    DialogPlugin.shared?.show(component, props)
  }
  closeDialog(): void {
    DialogPlugin.shared?.close()
  }
  renameIcon([groupName, iconName]: string[]): [string, string] {
    return customIcons[groupName]?.[iconName] ?? [groupName, iconName]
  }
}

const customIcons = {
  fas: {
    'code-branch': ['fas', 'location-dot'],
    tags: ['fas', 'shapes'],
  },
} as Record<string, undefined | Record<string, [string, string] | undefined>>
