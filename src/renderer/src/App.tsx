import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { Navigation } from './components/Navigation'
import { MaterialsPage } from './pages/MaterialsPage'
import { CreateMaterialPage } from './pages/CreateMaterialPage'

function App(): JSX.Element {
  const [activePage, setActivePage] = useState('materials')
  const { t } = useTranslation()

  const handleNavigate = (page: string): void => {
    setActivePage(page)
  }

  const handleCreateMaterial = (): void => {
    setActivePage('materials/new')
  }

  const handleCreateMaterialSuccess = (): void => {
    setActivePage('materials')
  }

  const handleCreateMaterialCancel = (): void => {
    setActivePage('materials')
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
      <Navigation activePage={activePage.split('/')[0]} onNavigate={handleNavigate} />
      <main className="app-main">
        {activePage === 'materials' && (
          <MaterialsPage onCreateMaterial={handleCreateMaterial} />
        )}
        {activePage === 'materials/new' && (
          <CreateMaterialPage
            onCancel={handleCreateMaterialCancel}
            onSuccess={handleCreateMaterialSuccess}
          />
        )}
      </main>
    </div>
  )
}

export default App
