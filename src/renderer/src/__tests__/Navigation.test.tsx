import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { Navigation } from '../components/Navigation'

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

describe('Navigation', () => {
  let testI18n: typeof i18n
  let onNavigate: ReturnType<typeof vi.fn>

  beforeEach(() => {
    testI18n = createTestI18n('en')
    onNavigate = vi.fn()
  })

  it('renders all navigation items', () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <Navigation activePage="materials" onNavigate={onNavigate} />
      </I18nextProvider>
    )

    expect(screen.getByText('Recipes')).toBeInTheDocument()
    expect(screen.getByText('Materials')).toBeInTheDocument()
    expect(screen.getByText('Packaging')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders navigation items in Dutch when language is Dutch', () => {
    testI18n = createTestI18n('nl')

    render(
      <I18nextProvider i18n={testI18n}>
        <Navigation activePage="materials" onNavigate={onNavigate} />
      </I18nextProvider>
    )

    expect(screen.getByText('Recepten')).toBeInTheDocument()
    expect(screen.getByText('Materialen')).toBeInTheDocument()
    expect(screen.getByText('Verpakking')).toBeInTheDocument()
    expect(screen.getByText('Instellingen')).toBeInTheDocument()
  })

  it('shows materials as active when activePage is materials', () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <Navigation activePage="materials" onNavigate={onNavigate} />
      </I18nextProvider>
    )

    const materialsButton = screen.getByText('Materials')
    const recipesButton = screen.getByText('Recipes')

    expect(materialsButton).toHaveClass('active')
    expect(recipesButton).not.toHaveClass('active')
  })

  it('shows recipes as active when activePage is recipes', () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <Navigation activePage="recipes" onNavigate={onNavigate} />
      </I18nextProvider>
    )

    const materialsButton = screen.getByText('Materials')
    const recipesButton = screen.getByText('Recipes')

    expect(recipesButton).toHaveClass('active')
    expect(materialsButton).not.toHaveClass('active')
  })

  it('calls onNavigate with correct page when clicking a nav item', () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <Navigation activePage="materials" onNavigate={onNavigate} />
      </I18nextProvider>
    )

    fireEvent.click(screen.getByText('Recipes'))
    expect(onNavigate).toHaveBeenCalledWith('recipes')

    fireEvent.click(screen.getByText('Settings'))
    expect(onNavigate).toHaveBeenCalledWith('settings')

    fireEvent.click(screen.getByText('Packaging'))
    expect(onNavigate).toHaveBeenCalledWith('packaging')
  })

  it('has correct aria-current attribute for active page', () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <Navigation activePage="materials" onNavigate={onNavigate} />
      </I18nextProvider>
    )

    const materialsButton = screen.getByText('Materials')
    const recipesButton = screen.getByText('Recipes')

    expect(materialsButton).toHaveAttribute('aria-current', 'page')
    expect(recipesButton).not.toHaveAttribute('aria-current')
  })

  it('renders as a nav element for accessibility', () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <Navigation activePage="materials" onNavigate={onNavigate} />
      </I18nextProvider>
    )

    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })
})
