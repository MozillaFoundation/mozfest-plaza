import { createI18n } from 'vue-i18n'

import en from './en.yml'
import es from './es.yml'
// import sw from './sw.yml'

const rtlLocales = new Set(['ar'])

const i18n = createI18n({
  locale: pickLocale(),
  messages: { en, es },
})

export function pickLocale() {
  return (
    localStorage.getItem('locale') ??
    getBrowserLocale(window.navigator.language)
  )
}

export function getBrowserLocale(input = 'en') {
  const specific = /(\w+)-\w+/.exec(input)
  return specific ? specific[1] : input
}

export function setLocale(newLocale: string): void {
  const isBrowser = newLocale == getBrowserLocale()

  i18n.global.locale = newLocale as 'en'
  updateDocumentDirection(newLocale)
  if (isBrowser) localStorage.removeItem('locale')
  else localStorage.setItem('locale', newLocale)
}

function updateDocumentDirection(locale: string) {
  const html = document.documentElement
  html.setAttribute('lang', locale)
  html.setAttribute('dir', rtlLocales.has(locale) ? 'rtl' : 'ltr')
}

updateDocumentDirection(i18n.global.locale)

export default i18n
