import {
  DeconfConfigStruct,
  loadConfig as loadDeconfConfig,
} from '@openlab/deconf-api-toolkit'

import {
  object,
  string,
  array,
  number,
  Infer,
  assign,
  tuple,
  enums,
} from 'superstruct'

const localised = () =>
  object({
    en: string(),
  })

export type PretalxConfig = Infer<typeof PretalxConfigStruct>
export const PretalxConfigStruct = object({
  eventSlug: string(),
  englishKeys: array(string()),
  questions: object({
    pulsePhoto: number(),
    links: array(number()),
    affiliation: number(),
  }),
})

export type TitoConfig = Infer<typeof TitoConfigStruct>
export const TitoConfigStruct = object({
  accountSlug: string(),
  eventSlug: string(),
})

export type AppConfig = Infer<typeof AppConfigStruct>
export const AppConfigStruct = assign(
  DeconfConfigStruct,
  object({
    pretalx: PretalxConfigStruct,
    tito: TitoConfigStruct,
    sendgrid: object({
      loginTemplateId: string(),
    }),
    sessionTypes: array(
      object({
        title: localised(),
        icon: tuple([string(), string()]),
        layout: enums(['plenary', 'workshop']),
      })
    ),
    tracks: array(object({ title: localised() })),
  })
)

export function loadConfig() {
  return loadDeconfConfig('app-config.json', AppConfigStruct)
}
