import { useTranslation } from 'react-i18next'
import './LanguageSwitcher.css'

/**
 * Language switcher component that allows users to change the application language
 * Displays in the navigation header with clear indication of current language
 */
export function LanguageSwitcher(): JSX.Element {
  const { i18n, t } = useTranslation()

  const changeLanguage = (lng: string): void => {
    i18n.changeLanguage(lng)
  }

  // Get the base language code (e.g., 'en' from 'en-US')
  const currentLanguage = i18n.language?.split('-')[0] || 'en'

  return (
    <div className="language-switcher">
      <button
        className={`language-btn ${currentLanguage === 'en' ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
        aria-label={t('language.en')}
        aria-pressed={currentLanguage === 'en'}
      >
        EN
      </button>
      <span className="language-separator">|</span>
      <button
        className={`language-btn ${currentLanguage === 'nl' ? 'active' : ''}`}
        onClick={() => changeLanguage('nl')}
        aria-label={t('language.nl')}
        aria-pressed={currentLanguage === 'nl'}
      >
        NL
      </button>
    </div>
  )
}
