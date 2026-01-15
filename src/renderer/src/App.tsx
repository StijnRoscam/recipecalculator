import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { Navigation } from './components/Navigation'
import { MaterialsPage } from './pages/MaterialsPage'
import { CreateMaterialPage } from './pages/CreateMaterialPage'
import { EditMaterialPage } from './pages/EditMaterialPage'
import { PackagingPage } from './pages/PackagingPage'
import { CreatePackagingPage } from './pages/CreatePackagingPage'
import { EditPackagingPage } from './pages/EditPackagingPage'
import { RecipesPage } from './pages/RecipesPage'

function App(): JSX.Element {
  const [activePage, setActivePage] = useState('recipes')
  const [editMaterialId, setEditMaterialId] = useState<string | null>(null)
  const [editPackagingId, setEditPackagingId] = useState<string | null>(null)
  const [viewRecipeId, setViewRecipeId] = useState<string | null>(null)
  const [editRecipeId, setEditRecipeId] = useState<string | null>(null)
  const { t } = useTranslation()

  const handleNavigate = (page: string): void => {
    setActivePage(page)
    setEditMaterialId(null)
    setEditPackagingId(null)
    setViewRecipeId(null)
    setEditRecipeId(null)
  }

  const handleCreateMaterial = (): void => {
    setActivePage('materials/new')
  }

  const handleEditMaterial = (id: string): void => {
    setEditMaterialId(id)
    setActivePage('materials/edit')
  }

  const handleMaterialSuccess = (): void => {
    setActivePage('materials')
    setEditMaterialId(null)
  }

  const handleMaterialCancel = (): void => {
    setActivePage('materials')
    setEditMaterialId(null)
  }

  const handleCreatePackaging = (): void => {
    setActivePage('packaging/new')
  }

  const handleEditPackaging = (id: string): void => {
    setEditPackagingId(id)
    setActivePage('packaging/edit')
  }

  const handlePackagingSuccess = (): void => {
    setActivePage('packaging')
    setEditPackagingId(null)
  }

  const handlePackagingCancel = (): void => {
    setActivePage('packaging')
    setEditPackagingId(null)
  }

  const handleCreateRecipe = (): void => {
    setActivePage('recipes/new')
  }

  const handleViewRecipe = (id: string): void => {
    setViewRecipeId(id)
    setActivePage('recipes/view')
  }

  const handleEditRecipe = (id: string): void => {
    setEditRecipeId(id)
    setActivePage('recipes/edit')
  }

  const handleRecipeSuccess = (): void => {
    setActivePage('recipes')
    setViewRecipeId(null)
    setEditRecipeId(null)
  }

  const handleRecipeCancel = (): void => {
    setActivePage('recipes')
    setViewRecipeId(null)
    setEditRecipeId(null)
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
          <MaterialsPage
            onCreateMaterial={handleCreateMaterial}
            onEditMaterial={handleEditMaterial}
          />
        )}
        {activePage === 'materials/new' && (
          <CreateMaterialPage
            onCancel={handleMaterialCancel}
            onSuccess={handleMaterialSuccess}
          />
        )}
        {activePage === 'materials/edit' && editMaterialId && (
          <EditMaterialPage
            materialId={editMaterialId}
            onCancel={handleMaterialCancel}
            onSuccess={handleMaterialSuccess}
          />
        )}
        {activePage === 'packaging' && (
          <PackagingPage
            onCreatePackaging={handleCreatePackaging}
            onEditPackaging={handleEditPackaging}
          />
        )}
        {activePage === 'packaging/new' && (
          <CreatePackagingPage
            onCancel={handlePackagingCancel}
            onSuccess={handlePackagingSuccess}
          />
        )}
        {activePage === 'packaging/edit' && editPackagingId && (
          <EditPackagingPage
            packagingId={editPackagingId}
            onCancel={handlePackagingCancel}
            onSuccess={handlePackagingSuccess}
          />
        )}
        {activePage === 'recipes' && (
          <RecipesPage
            onCreateRecipe={handleCreateRecipe}
            onViewRecipe={handleViewRecipe}
            onEditRecipe={handleEditRecipe}
          />
        )}
      </main>
    </div>
  )
}

export default App
