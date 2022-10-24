import { deepSeal, SelectOption } from '@openlab/deconf-ui-toolkit'

import languageData from '@/data/languages.json'

export function getLanguageOptions(): SelectOption[] {
  return deepSeal(
    Object.entries(languageData).map(([value, text]) => ({ value, text }))
  )
}
