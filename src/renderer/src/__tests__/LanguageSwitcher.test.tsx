import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

// Import translation files
import en from '../i18n/locales/en.json'
import nl from '../i18n/locales/nl.json'

// Create a test i18n instance
const createTestI18n = (language = 'en') => {
  const testI18n = i18n.createInstance()
  testI18n.use(initReactI18next).init({
    lng: language,
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      nl: { translation: nl }
    },
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  })
  return testI18n
}

describe('LanguageSwitcher', () => {
  let testI18n: typeof i18n

  beforeEach(() => {
    testI18n = createTestI18n('en')
  })

  it('renders EN and NL language buttons', () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    )

    expect(screen.getByText('EN')).toBeInTheDocument()
    expect(screen.getByText('NL')).toBeInTheDocument()
  })

  it('shows English as active when current language is English', () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    )

    const enButton = screen.getByText('EN')
    const nlButton = screen.getByText('NL')

    expect(enButton).toHaveClass('active')
    expect(nlButton).not.toHaveClass('active')
  })

  it('shows Dutch as active when current language is Dutch', () => {
    testI18n = createTestI18n('nl')

    render(
      <I18nextProvider i18n={testI18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    )

    const enButton = screen.getByText('EN')
    const nlButton = screen.getByText('NL')

    expect(enButton).not.toHaveClass('active')
    expect(nlButton).toHaveClass('active')
  })

  it('changes language to Dutch when NL button is clicked', async () => {
    const changeLanguageSpy = vi.spyOn(testI18n, 'changeLanguage')

    render(
      <I18nextProvider i18n={testI18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    )

    const nlButton = screen.getByText('NL')
    fireEvent.click(nlButton)

    expect(changeLanguageSpy).toHaveBeenCalledWith('nl')
  })

  it('changes language to English when EN button is clicked', async () => {
    testI18n = createTestI18n('nl')
    const changeLanguageSpy = vi.spyOn(testI18n, 'changeLanguage')

    render(
      <I18nextProvider i18n={testI18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    )

    const enButton = screen.getByText('EN')
    fireEvent.click(enButton)

    expect(changeLanguageSpy).toHaveBeenCalledWith('en')
  })

  it('has correct aria-labels for accessibility', () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    )

    const enButton = screen.getByText('EN')
    const nlButton = screen.getByText('NL')

    expect(enButton).toHaveAttribute('aria-label', 'English')
    expect(nlButton).toHaveAttribute('aria-label', 'Dutch')
  })

  it('has correct aria-pressed attribute for active language', () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    )

    const enButton = screen.getByText('EN')
    const nlButton = screen.getByText('NL')

    expect(enButton).toHaveAttribute('aria-pressed', 'true')
    expect(nlButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('handles language codes with region (e.g., en-US)', () => {
    testI18n = createTestI18n('en-US')

    render(
      <I18nextProvider i18n={testI18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    )

    const enButton = screen.getByText('EN')
    expect(enButton).toHaveClass('active')
  })
})

describe('i18n translations', () => {
  it('provides English translations correctly', () => {
    const testI18n = createTestI18n('en')

    expect(testI18n.t('app.title')).toBe('Recipe Calculator')
    expect(testI18n.t('app.subtitle')).toBe('Calculate your recipe costs easily')
    expect(testI18n.t('language.en')).toBe('English')
    expect(testI18n.t('language.nl')).toBe('Dutch')
  })

  it('provides Dutch translations correctly', () => {
    const testI18n = createTestI18n('nl')

    expect(testI18n.t('app.title')).toBe('Receptcalculator')
    expect(testI18n.t('app.subtitle')).toBe('Bereken eenvoudig je receptkosten')
    expect(testI18n.t('language.en')).toBe('Engels')
    expect(testI18n.t('language.nl')).toBe('Nederlands')
  })

  it('falls back to English for unknown language', () => {
    const testI18n = createTestI18n('fr')

    expect(testI18n.t('app.title')).toBe('Recipe Calculator')
  })

  it('supports interpolation in validation messages', () => {
    const testI18n = createTestI18n('en')

    expect(testI18n.t('validation.minLength', { min: 5 })).toBe('Minimum 5 characters required')
    expect(testI18n.t('validation.maxLength', { max: 100 })).toBe('Maximum 100 characters allowed')
  })

  it('has all required translation keys for navigation', () => {
    const testI18n = createTestI18n('en')

    expect(testI18n.t('navigation.recipes')).toBe('Recipes')
    expect(testI18n.t('navigation.materials')).toBe('Materials')
    expect(testI18n.t('navigation.packaging')).toBe('Packaging')
    expect(testI18n.t('navigation.settings')).toBe('Settings')
  })

  it('has all required translation keys for common actions', () => {
    const testI18n = createTestI18n('en')

    expect(testI18n.t('common.save')).toBe('Save')
    expect(testI18n.t('common.cancel')).toBe('Cancel')
    expect(testI18n.t('common.delete')).toBe('Delete')
    expect(testI18n.t('common.edit')).toBe('Edit')
    expect(testI18n.t('common.create')).toBe('Create')
    expect(testI18n.t('common.search')).toBe('Search')
  })

  it('has all required translation keys for errors', () => {
    const testI18n = createTestI18n('en')

    expect(testI18n.t('errors.generic')).toBe('Something went wrong')
    expect(testI18n.t('errors.notFound')).toBe('Not found')
    expect(testI18n.t('errors.loadFailed')).toBe('Failed to load data')
  })
})
