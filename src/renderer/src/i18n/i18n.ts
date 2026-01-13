import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import en from './locales/en.json'
import nl from './locales/nl.json'

// Configure language detector to use localStorage
const detectionOptions = {
  order: ['localStorage', 'navigator'],
  lookupLocalStorage: 'language',
  caches: ['localStorage'],
  excludeCacheFor: ['cimode']
}

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources: {
      en: {
        translation: en
      },
      nl: {
        translation: nl
      }
    },
    fallbackLng: 'en',
    debug: false,
    detection: detectionOptions,
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false // Disable Suspense mode
    }
  })

export default i18n
