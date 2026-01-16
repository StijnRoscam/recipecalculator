import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { RecipeWithDetails } from '../../../shared/types'
import { useDebounce } from '../hooks/useDebounce'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { DuplicateRecipeDialog } from '../components/DuplicateRecipeDialog'
import './RecipesPage.css'

interface RecipesPageProps {
  onCreateRecipe?: () => void
  onViewRecipe?: (id: string) => void
  onEditRecipe?: (id: string) => void
}

/**
 * Recipes page component for managing recipes
 * Displays a grid of recipe cards with filtering, favorites, archive toggle, and actions
 */
export function RecipesPage({
  onCreateRecipe,
  onViewRecipe,
  onEditRecipe
}: RecipesPageProps): JSX.Element {
  const { t } = useTranslation()
  const [recipes, setRecipes] = useState<RecipeWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recipeToDelete, setRecipeToDelete] = useState<RecipeWithDetails | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [recipeToDuplicate, setRecipeToDuplicate] = useState<string | null>(null)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const fetchRecipes = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const data = await window.api.recipes.getAll(showArchived)
      setRecipes(data)
    } catch (err) {
      console.error('Failed to fetch recipes:', err)
      setError(t('errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecipes()
  }, [showArchived, t])

  const handleRetry = (): void => {
    fetchRecipes()
  }

  const formatPrice = (price: number): string => {
    return `€${price.toFixed(2)}`
  }

  // Filter recipes based on search term and favorites
  const filteredRecipes = useMemo(() => {
    let result = recipes

    // Filter by favorites
    if (showFavoritesOnly) {
      result = result.filter((recipe) => recipe.isFavorite)
    }

    // Filter by search term
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      result = result.filter((recipe) => {
        return recipe.name.toLowerCase().includes(searchLower)
      })
    }

    return result
  }, [recipes, debouncedSearchTerm, showFavoritesOnly])

  // Handle Escape key to clear search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && searchTerm) {
        setSearchTerm('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchTerm])

  const handleClearSearch = (): void => {
    setSearchTerm('')
  }

  const showTemporarySuccess = (message: string): void => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleToggleFavorite = async (id: string): Promise<void> => {
    setActionInProgress(id)
    setError(null)
    try {
      const result = await window.api.recipes.toggleFavorite(id)
      // Update the recipe in the list
      setRecipes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isFavorite: result.isFavorite } : r))
      )
      showTemporarySuccess(
        result.isFavorite ? t('recipes.favoriteAdded') : t('recipes.favoriteRemoved')
      )
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
      setError(t('recipes.toggleFavoriteError'))
    } finally {
      setActionInProgress(null)
    }
  }

  const handleArchive = async (id: string): Promise<void> => {
    setActionInProgress(id)
    setError(null)
    try {
      await window.api.recipes.archive(id)
      await fetchRecipes()
      showTemporarySuccess(t('recipes.archiveSuccess'))
    } catch (err) {
      console.error('Failed to archive recipe:', err)
      setError(t('recipes.archiveError'))
    } finally {
      setActionInProgress(null)
    }
  }

  const handleUnarchive = async (id: string): Promise<void> => {
    setActionInProgress(id)
    setError(null)
    try {
      await window.api.recipes.unarchive(id)
      await fetchRecipes()
      showTemporarySuccess(t('recipes.unarchiveSuccess'))
    } catch (err) {
      console.error('Failed to unarchive recipe:', err)
      setError(t('recipes.unarchiveError'))
    } finally {
      setActionInProgress(null)
    }
  }

  const handleDuplicateClick = (id: string): void => {
    setRecipeToDuplicate(id)
    setDuplicateDialogOpen(true)
  }

  const handleDuplicateCancel = (): void => {
    setDuplicateDialogOpen(false)
    setRecipeToDuplicate(null)
  }

  const handleDuplicateConfirm = async (newName: string): Promise<void> => {
    if (!recipeToDuplicate) return

    setIsDuplicating(true)
    setError(null)
    try {
      const newRecipe = await window.api.recipes.duplicate(recipeToDuplicate, newName)
      await fetchRecipes()
      showTemporarySuccess(t('recipes.duplicate.success'))
      setDuplicateDialogOpen(false)
      setRecipeToDuplicate(null)
      // Navigate to the new recipe
      onViewRecipe?.(newRecipe.id)
    } catch (err) {
      console.error('Failed to duplicate recipe:', err)
      setError(t('recipes.duplicate.error'))
      setDuplicateDialogOpen(false)
      setRecipeToDuplicate(null)
    } finally {
      setIsDuplicating(false)
    }
  }

  const handleDeleteClick = (recipe: RecipeWithDetails): void => {
    setRecipeToDelete(recipe)
    setDeleteDialogOpen(true)
  }

  const handleDeleteCancel = (): void => {
    setDeleteDialogOpen(false)
    setRecipeToDelete(null)
  }

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!recipeToDelete) return

    setIsDeleting(true)
    setDeleteError(null)
    try {
      await window.api.recipes.delete(recipeToDelete.id)
      setRecipes((prev) => prev.filter((r) => r.id !== recipeToDelete.id))
      showTemporarySuccess(t('recipes.delete.success'))
      setDeleteDialogOpen(false)
      setRecipeToDelete(null)
    } catch (err) {
      console.error('Failed to delete recipe:', err)
      setDeleteError(t('recipes.delete.error'))
      setDeleteDialogOpen(false)
      setRecipeToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  // Truncate description for card display
  const truncateDescription = (description: string | null, maxLength = 80): string => {
    if (!description) return ''
    if (description.length <= maxLength) return description
    return description.slice(0, maxLength).trim() + '...'
  }

  // Check states for rendering
  const hasSearchTerm = debouncedSearchTerm.length > 0
  const hasNoSearchResults = hasSearchTerm && filteredRecipes.length === 0
  const hasNoRecipes = recipes.length === 0
  const hasNoFavoritesMatch = showFavoritesOnly && filteredRecipes.length === 0 && !hasSearchTerm

  return (
    <div className="recipes-page">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">{t('navigation.recipes')}</h2>
        </div>
        <div className="page-header-right">
          <button className="btn-primary" onClick={onCreateRecipe}>
            {t('recipes.createRecipe')}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="success-message" role="status">
          {successMessage}
        </div>
      )}

      {deleteError && (
        <div className="error-message" role="alert">
          {deleteError}
        </div>
      )}

      <div className="page-controls">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder={t('recipes.search.placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label={t('recipes.search.placeholder')}
          />
          {searchTerm && (
            <button
              className="search-clear-btn"
              onClick={handleClearSearch}
              title={t('recipes.search.clear')}
              aria-label={t('recipes.search.clear')}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="filter-controls">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={(e) => setShowFavoritesOnly(e.target.checked)}
              className="checkbox"
            />
            <span>{t('recipes.showFavoritesOnly')}</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="checkbox"
            />
            <span>{t('recipes.showArchived')}</span>
          </label>
        </div>
      </div>

      <div className="recipes-content">
        {loading ? (
          <div className="loading-state">
            <p>{t('common.loading')}</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button className="btn-secondary" onClick={handleRetry}>
              {t('common.retry')}
            </button>
          </div>
        ) : hasNoRecipes ? (
          <div className="empty-state">
            <p>{t('recipes.emptyState')}</p>
          </div>
        ) : hasNoFavoritesMatch ? (
          <div className="empty-state">
            <p>{t('recipes.noFavorites')}</p>
          </div>
        ) : hasNoSearchResults ? (
          <div className="empty-state">
            <p>{t('recipes.search.noResults')}</p>
          </div>
        ) : (
          <div className="recipes-grid">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className={`recipe-card ${recipe.isArchived ? 'archived' : ''}`}
                onClick={() => onViewRecipe?.(recipe.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onViewRecipe?.(recipe.id)
                  }
                }}
              >
                <div className="recipe-card-header">
                  <h3 className="recipe-card-title">{recipe.name}</h3>
                  <button
                    className={`favorite-btn ${recipe.isFavorite ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleFavorite(recipe.id)
                    }}
                    disabled={actionInProgress === recipe.id}
                    title={recipe.isFavorite ? t('recipes.removeFavorite') : t('recipes.addFavorite')}
                    aria-label={recipe.isFavorite ? t('recipes.removeFavorite') : t('recipes.addFavorite')}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill={recipe.isFavorite ? 'currentColor' : 'none'}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 1.66667L12.575 6.88334L18.3333 7.725L14.1667 11.7833L15.15 17.5167L10 14.8083L4.85 17.5167L5.83333 11.7833L1.66667 7.725L7.425 6.88334L10 1.66667Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                {recipe.isArchived && (
                  <span className="archived-badge">{t('recipes.archived')}</span>
                )}

                {recipe.description && (
                  <p className="recipe-card-description">
                    {truncateDescription(recipe.description)}
                  </p>
                )}

                <div className="recipe-card-cost">
                  <span className="cost-label">{t('recipes.totalCost')}:</span>
                  <span className="cost-value">{formatPrice(recipe.totalCost)}</span>
                </div>

                <div className="recipe-card-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn-icon"
                    title={t('common.edit')}
                    aria-label={t('common.edit')}
                    onClick={() => onEditRecipe?.(recipe.id)}
                    disabled={actionInProgress === recipe.id}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L4.99967 13.6667L1.33301 14.6667L2.33301 11L11.333 2.00004Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className="btn-icon"
                    title={t('recipes.duplicate.button')}
                    aria-label={t('recipes.duplicate.button')}
                    onClick={() => handleDuplicateClick(recipe.id)}
                    disabled={actionInProgress === recipe.id}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.3333 6H7.33333C6.59695 6 6 6.59695 6 7.33333V13.3333C6 14.0697 6.59695 14.6667 7.33333 14.6667H13.3333C14.0697 14.6667 14.6667 14.0697 14.6667 13.3333V7.33333C14.6667 6.59695 14.0697 6 13.3333 6Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3.33333 10H2.66667C2.31304 10 1.97391 9.85952 1.72386 9.60947C1.47381 9.35943 1.33333 9.02029 1.33333 8.66667V2.66667C1.33333 2.31304 1.47381 1.97391 1.72386 1.72386C1.97391 1.47381 2.31304 1.33333 2.66667 1.33333H8.66667C9.02029 1.33333 9.35943 1.47381 9.60947 1.72386C9.85952 1.97391 10 2.31304 10 2.66667V3.33333"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className="btn-icon"
                    title={recipe.isArchived ? t('recipes.unarchive') : t('recipes.archive')}
                    aria-label={recipe.isArchived ? t('recipes.unarchive') : t('recipes.archive')}
                    onClick={() =>
                      recipe.isArchived ? handleUnarchive(recipe.id) : handleArchive(recipe.id)
                    }
                    disabled={actionInProgress === recipe.id}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14 5.33337V14C14 14.3536 13.8595 14.6928 13.6095 14.9428C13.3594 15.1929 13.0203 15.3334 12.6667 15.3334H3.33333C2.97971 15.3334 2.64057 15.1929 2.39052 14.9428C2.14048 14.6928 2 14.3536 2 14V5.33337M14 5.33337H2M14 5.33337L12.6667 0.666706H3.33333L2 5.33337M10 8.00004H6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className="btn-icon btn-danger"
                    title={t('common.delete')}
                    aria-label={t('common.delete')}
                    onClick={() => handleDeleteClick(recipe)}
                    disabled={actionInProgress === recipe.id}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2 4H3.33333M3.33333 4H14M3.33333 4V13.3333C3.33333 13.687 3.47381 14.0261 3.72386 14.2762C3.97391 14.5262 4.31304 14.6667 4.66667 14.6667H11.3333C11.687 14.6667 12.0261 14.5262 12.2761 14.2762C12.5262 14.0261 12.6667 13.687 12.6667 13.3333V4H3.33333ZM5.33333 4V2.66667C5.33333 2.31304 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31304 1.33333 6.66667 1.33333H9.33333C9.68696 1.33333 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31304 10.6667 2.66667V4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title={t('recipes.delete.confirmTitle')}
        message={t('recipes.delete.confirmMessage', { name: recipeToDelete?.name })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isDeleting}
        variant="danger"
      />

      <DuplicateRecipeDialog
        isOpen={duplicateDialogOpen}
        recipeId={recipeToDuplicate || ''}
        onConfirm={handleDuplicateConfirm}
        onCancel={handleDuplicateCancel}
        isLoading={isDuplicating}
      />
    </div>
  )
}
