import { useTranslation } from 'react-i18next'
import './Navigation.css'

interface NavigationProps {
  activePage: string
  onNavigate: (page: string) => void
}

/**
 * Navigation component providing main app navigation
 * Displays horizontal navigation bar with Recipes, Materials, Packaging, and Settings
 */
export function Navigation({ activePage, onNavigate }: NavigationProps): JSX.Element {
  const { t } = useTranslation()

  const navItems = [
    { id: 'recipes', label: t('navigation.recipes') },
    { id: 'materials', label: t('navigation.materials') },
    { id: 'packaging', label: t('navigation.packaging') },
    { id: 'settings', label: t('navigation.settings') }
  ]

  return (
    <nav className="navigation">
      <div className="navigation-content">
        <ul className="navigation-list">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
                aria-current={activePage === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
