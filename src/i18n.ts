/**
 * Configures Vue I18n with the supported locale bundles and browser fallback behavior.
 */
import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import no from '@/locales/no.json'
import ne from '@/locales/ne.json'
import ur from '@/locales/ur.json'

export const SUPPORTED_LOCALES = ['en', 'es', 'no', 'ne', 'ur'] as const

export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

const STORAGE_KEY = 'app-locale'

function resolveInitialLocale(): AppLocale {
  const savedLocale = localStorage.getItem(STORAGE_KEY)

  if (savedLocale === 'en' || savedLocale === 'es' || savedLocale === 'no' || savedLocale === 'ne' || savedLocale === 'ur') {
    return savedLocale
  }

  const browserLocale = navigator.language.split('-')[0]
  if (browserLocale === 'es' || browserLocale === 'no' || browserLocale === 'ne' || browserLocale === 'ur') {
    return browserLocale
  }

  return 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: resolveInitialLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    es,
    no,
    ne,
    ur,
  },
})

export function setI18nLocale(locale: AppLocale) {
  i18n.global.locale.value = locale
  localStorage.setItem(STORAGE_KEY, locale)
  document.documentElement.lang = locale
}

setI18nLocale(i18n.global.locale.value as AppLocale)
