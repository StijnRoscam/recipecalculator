import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { Navigation } from './components/Navigation'
import { MaterialsPage } from './pages/MaterialsPage'

function App(): JSX.Element {
  const [activePage, setActivePage] = useState('materials')
  const { t } = useTranslation()

  const handleNavigate = (page: string): void => {
    setActivePage(page)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-header-title">
            <h1>{t('app.title')}</h1>
            <p>{t('app.subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>
      </header>
      <Navigation activePage={activePage} onNavigate={handleNavigate} />
      <main className="app-main">
        {activePage === 'materials' && <MaterialsPage />}
      </main>
    </div>
  )
}

export default App
