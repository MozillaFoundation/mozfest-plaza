import path from 'path'
import fs from 'fs/promises'

import { ConferenceRoutes, ContentRoutes } from '@openlab/deconf-api-toolkit'
import { Localised, LocalisedLink } from '@openlab/deconf-shared'
import { ConferenceConfig } from '../lib/module.js'
import { createDebug } from '../lib/utils.js'
import { createServerContext } from './serve-command.js'
import { ConferenceRouter } from '../deconf/conference-router.js'

const debug = createDebug('cmd:export-schedule')

export interface ExportScheduleOptions {
  destination: string
}

export async function exportScheduleCommand(options: ExportScheduleOptions) {
  debug('start')
  const context = await createServerContext()

  const contentRoutes = new ContentRoutes(context)
  const conferenceRoutes = new ConferenceRoutes({
    ...context,
    config: undefined,
  })

  const schedule = await conferenceRoutes.getSchedule()

  const links: Record<string, LocalisedLink[]> = {}
  for (const session of await context.conferenceRepo.getSessions()) {
    if (session.links.length > 0) {
      links[session.id] = session.links.filter(linkFilter)
    }
  }

  const content: Record<string, Localised> = {}
  for (const key of context.config.content.keys) {
    content[key] = await contentRoutes.getContent(key).then((r) => r.content)
  }

  const whatsOn = ConferenceRouter.filterForWhatsOn(schedule.sessions)
  const attendance = Object.fromEntries(
    await context.attendanceRepo.getSessionAttendance()
  )

  //
  // Modify the settings
  //
  const settings: ConferenceConfig = schedule.settings as any
  settings.navigation.showLogin = false
  settings.navigation.showProfile = false
  settings.navigation.showRegister = false
  settings.atriumWidgets.siteVisitors = false
  settings.atriumWidgets.login = false
  settings.atriumWidgets.register = false

  //
  // Once all data is fetch, write it to files
  //
  const files = { schedule, links, content, 'whats-on': whatsOn, attendance }

  const dir = await fs.stat(options.destination).catch(() => null)
  if (!dir) await fs.mkdir(options.destination, { recursive: true })

  for (const [file, data] of Object.entries(files)) {
    await fs.writeFile(
      path.join(options.destination, `${file}.json`),
      JSON.stringify(data)
    )
  }

  // Shut down
  await context.store.close()
  await context.postgres.close()
}

function isDomain(url: URL, domain: string) {
  return url.hostname === domain || url.hostname.endsWith('.' + domain)
}

function linkFilter(l: LocalisedLink) {
  try {
    const url = new URL(l.url)

    // TODO: review with MozFest
    if (isDomain(url, 'zoom.us')) return false
    if (isDomain(url, 'panopto.com')) return false
    if (isDomain(url, 'teams.microsoft.com')) return false

    return true
  } catch {
    return false
  }
}
