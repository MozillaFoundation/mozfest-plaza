import Vue from 'vue'
import VueI18n from 'vue-i18n'

import en from './en.yml'

Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: 'en',
  messages: { en },
})

const rtlLocales = new Set(['ar'])

export function setLocale(newLocale: string): void {
  i18n.locale = newLocale

  const html = document.documentElement
  html.setAttribute('lang', newLocale)
  html.setAttribute('dir', rtlLocales.has(newLocale) ? 'rtl' : 'ltr')
}

export default i18n
