import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { DuplicateRecipeDialog } from '../components/DuplicateRecipeDialog'
import type { RecipeWithFullDetails } from '../../../shared/types'
import './ViewRecipePage.css'

interface ViewRecipePageProps {
  recipeId: string
  onBack: () => void
  onEdit: () => void
}

const LABOR_RATE_PER_HOUR = 15 // Euro per hour - will come from settings later

/**
 * ViewRecipePage displays detailed recipe information including costs,
 * ingredients, packaging, and pricing calculations.
 */
export function ViewRecipePage({ recipeId, onBack, onEdit }: ViewRecipePageProps): JSX.Element {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [recipe, setRecipe] = useState<RecipeWithFullDetails | null>(null)
  const [actionInProgress, setActionInProgress] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)

  // Load recipe data on mount
  useEffect(() => {
    const fetchRecipe = async (): Promise<void> => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const data = await window.api.recipes.get(recipeId)

        if (!data) {
          setLoadError(t('recipes.edit.errors.notFound'))
          return
        }

        setRecipe(data)
      } catch (error) {
        console.error('Failed to fetch recipe:', error)
        setLoadError(t('recipes.edit.errors.loadFailed'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecipe()
  }, [recipeId, t])

  const formatPrice = (price: number): string => {
    return `€${price.toFixed(2)}`
  }

  const formatPercentage = (value: number | null): string => {
    if (value === null) return '0%'
    return `${value.toFixed(1)}%`
  }

  const formatWeight = (grams: number): string => {
    const kg = grams / 1000
    return `${kg.toFixed(3)} kg`
  }

  // Calculate ingredient line cost
  const calculateIngredientCost = (quantity: number, unit: string, pricePerKg: number): number => {
    if (unit === 'kg') {
      return quantity * pricePerKg
    } else {
      // unit is 'g'
      return (quantity / 1000) * pricePerKg
    }
  }

  // Calculate packaging line cost
  const calculatePackagingCost = (quantity: number, unitPrice: number): number => {
    return quantity * unitPrice
  }

  // Calculate labor cost
  const calculateLaborCost = (prepTimeMinutes: number | null): number => {
    if (!prepTimeMinutes) return 0
    return (prepTimeMinutes / 60) * LABOR_RATE_PER_HOUR
  }

  // Calculate total cost
  const calculateTotalCost = (
    ingredientsCost: number,
    packagingCost: number,
    laborCost: number
  ): number => {
    return ingredientsCost + packagingCost + laborCost
  }

  // Calculate cost per unit
  const calculateCostPerUnit = (totalCost: number, yieldQuantity: number): number => {
    return totalCost / yieldQuantity
  }

  // Calculate suggested price
  const calculateSuggestedPrice = (costPerUnit: number, profitMargin: number | null): number => {
    if (!profitMargin) return costPerUnit
    return costPerUnit * (1 + profitMargin / 100)
  }

  // Calculate profit amount
  const calculateProfitAmount = (suggestedPrice: number, costPerUnit: number): number => {
    return suggestedPrice - costPerUnit
  }

  // Calculate VAT amount
  const calculateVATAmount = (suggestedPrice: number, vatPercentage: number | null): number => {
    if (!vatPercentage) return 0
    return suggestedPrice * (vatPercentage / 100)
  }

  // Calculate price including VAT
  const calculatePriceIncludingVAT = (suggestedPrice: number, vatAmount: number): number => {
    return suggestedPrice + vatAmount
  }

  // Calculate gross weight (sum of all ingredient quantities in grams)
  const calculateGrossWeight = (
    ingredients: RecipeWithFullDetails['ingredients']
  ): number => {
    return ingredients.reduce((total, ingredient) => {
      const quantityInGrams = ingredient.unit === 'kg' ? ingredient.quantity * 1000 : ingredient.quantity
      return total + quantityInGrams
    }, 0)
  }

  // Calculate waste weight
  const calculateWasteWeight = (grossWeight: number, wastePercentage: number | null): number => {
    if (!wastePercentage) return 0
    return grossWeight * (wastePercentage / 100)
  }

  // Calculate net weight
  const calculateNetWeight = (grossWeight: number, wasteWeight: number): number => {
    return grossWeight - wasteWeight
  }

  // Calculate cost per kg
  const calculateCostPerKg = (totalCost: number, netWeightGrams: number): number => {
    if (netWeightGrams === 0) return 0
    const netWeightKg = netWeightGrams / 1000
    return totalCost / netWeightKg
  }

  const handleToggleFavorite = async (): Promise<void> => {
    if (!recipe) return
    setActionInProgress(true)
    try {
      const result = await window.api.recipes.toggleFavorite(recipeId)
      setRecipe({ ...recipe, isFavorite: result.isFavorite })
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    } finally {
      setActionInProgress(false)
    }
  }

  const handleArchive = async (): Promise<void> => {
    if (!recipe) return
    setActionInProgress(true)
    try {
      if (recipe.isArchived) {
        await window.api.recipes.unarchive(recipeId)
        setRecipe({ ...recipe, isArchived: false })
      } else {
        await window.api.recipes.archive(recipeId)
        setRecipe({ ...recipe, isArchived: true })
      }
    } catch (error) {
      console.error('Failed to archive/unarchive recipe:', error)
    } finally {
      setActionInProgress(false)
    }
  }

  const handleDuplicateClick = (): void => {
    setDuplicateDialogOpen(true)
  }

  const handleDuplicateCancel = (): void => {
    setDuplicateDialogOpen(false)
  }

  const handleDuplicateConfirm = async (newName: string): Promise<void> => {
    setIsDuplicating(true)
    try {
      await window.api.recipes.duplicate(recipeId, newName)
      setDuplicateDialogOpen(false)
      onBack() // Navigate back to see the new recipe in the list
    } catch (error) {
      console.error('Failed to duplicate recipe:', error)
      setDuplicateDialogOpen(false)
    } finally {
      setIsDuplicating(false)
    }
  }

  const handleDeleteClick = (): void => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteCancel = (): void => {
    setDeleteDialogOpen(false)
  }

  const handleDeleteConfirm = async (): Promise<void> => {
    setIsDeleting(true)
    try {
      await window.api.recipes.delete(recipeId)
      setDeleteDialogOpen(false)
      onBack()
    } catch (error) {
      console.error('Failed to delete recipe:', error)
      setDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="view-recipe-page">
        <div className="page-header">
          <div className="page-header-left">
            <button className="btn-back" onClick={onBack} type="button">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.833 10H4.167M4.167 10L10 15.833M4.167 10L10 4.167"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t('common.back')}
            </button>
            <h2 className="page-title">{t('common.loading')}</h2>
          </div>
        </div>
        <div className="content-container">
          <div className="loading-state">
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state if recipe not found
  if (loadError || !recipe) {
    return (
      <div className="view-recipe-page">
        <div className="page-header">
          <div className="page-header-left">
            <button className="btn-back" onClick={onBack} type="button">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.833 10H4.167M4.167 10L10 15.833M4.167 10L10 4.167"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t('common.back')}
            </button>
            <h2 className="page-title">{t('recipes.edit.errors.notFound')}</h2>
          </div>
        </div>
        <div className="content-container">
          <div className="error-state" role="alert">
            <p>{loadError || t('recipes.edit.errors.loadFailed')}</p>
            <button className="btn-secondary" onClick={onBack}>
              {t('common.back')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Calculate all values
  const laborCost = calculateLaborCost(recipe.prepTimeMinutes)
  const totalCost = calculateTotalCost(recipe.ingredientsCost, recipe.packagingCost, laborCost)
  const costPerUnit = calculateCostPerUnit(totalCost, recipe.yieldQuantity)
  const suggestedPrice = calculateSuggestedPrice(costPerUnit, recipe.profitMargin)
  const profitAmount = calculateProfitAmount(suggestedPrice, costPerUnit)
  const vatAmount = calculateVATAmount(suggestedPrice, recipe.vatPercentage)
  const priceIncludingVAT = calculatePriceIncludingVAT(suggestedPrice, vatAmount)
  const grossWeight = calculateGrossWeight(recipe.ingredients)
  const wasteWeight = calculateWasteWeight(grossWeight, recipe.wastePercentage)
  const netWeight = calculateNetWeight(grossWeight, wasteWeight)
  const costPerKg = calculateCostPerKg(totalCost, netWeight)

  return (
    <div className="view-recipe-page">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-back" onClick={onBack} type="button">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.833 10H4.167M4.167 10L10 15.833M4.167 10L10 4.167"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t('common.back')}
          </button>
          <div className="title-row">
            <h2 className="page-title">{recipe.name}</h2>
            <button
              className={`favorite-btn-large ${recipe.isFavorite ? 'active' : ''}`}
              onClick={handleToggleFavorite}
              disabled={actionInProgress}
              title={recipe.isFavorite ? t('recipes.removeFavorite') : t('recipes.addFavorite')}
              aria-label={recipe.isFavorite ? t('recipes.removeFavorite') : t('recipes.addFavorite')}
            >
              <svg
                width="24"
                height="24"
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
        </div>
        <div className="page-header-actions">
          <button
            className="btn-secondary"
            onClick={onEdit}
            disabled={actionInProgress}
          >
            {t('common.edit')}
          </button>
          <button
            className="btn-secondary"
            onClick={handleDuplicateClick}
            disabled={actionInProgress}
          >
            {t('recipes.duplicate.button')}
          </button>
          <button
            className="btn-secondary"
            onClick={handleArchive}
            disabled={actionInProgress}
          >
            {recipe.isArchived ? t('recipes.unarchive') : t('recipes.archive')}
          </button>
          <button
            className="btn-danger"
            onClick={handleDeleteClick}
            disabled={actionInProgress}
          >
            {t('common.delete')}
          </button>
        </div>
      </div>

      <div className="recipe-content">
        {/* Metadata Section */}
        <section className="recipe-section">
          <h3 className="section-title">{t('recipes.view.recipeDetails')}</h3>
          <div className="metadata-grid">
            {recipe.description && (
              <div className="metadata-item full-width">
                <span className="metadata-label">{t('recipes.view.description')}:</span>
                <span className="metadata-value">{recipe.description}</span>
              </div>
            )}
            <div className="metadata-item">
              <span className="metadata-label">{t('recipes.view.yield')}:</span>
              <span className="metadata-value">{recipe.yieldQuantity} {recipe.yieldUnit}</span>
            </div>
            {recipe.prepTimeMinutes !== null && (
              <div className="metadata-item">
                <span className="metadata-label">{t('recipes.view.prepTime')}:</span>
                <span className="metadata-value">{recipe.prepTimeMinutes} {t('recipes.view.minutes')}</span>
              </div>
            )}
            <div className="metadata-item">
              <span className="metadata-label">{t('recipes.view.profitMargin')}:</span>
              <span className="metadata-value">{formatPercentage(recipe.profitMargin)}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">{t('recipes.view.wastePercentage')}:</span>
              <span className="metadata-value">{formatPercentage(recipe.wastePercentage)}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">{t('recipes.view.vatPercentage')}:</span>
              <span className="metadata-value">{formatPercentage(recipe.vatPercentage)}</span>
            </div>
          </div>
        </section>

        {/* Ingredients Section */}
        <section className="recipe-section">
          <h3 className="section-title">{t('recipes.view.ingredients')}</h3>
          {recipe.ingredients.length === 0 ? (
            <div className="empty-state-section">
              <p>{t('recipes.view.noIngredients')}</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="recipe-table">
                  <thead>
                    <tr>
                      <th>{t('recipes.view.materialName')}</th>
                      <th className="text-right">{t('recipes.view.quantity')}</th>
                      <th>{t('recipes.view.unit')}</th>
                      <th className="text-right">{t('recipes.view.cost')}</th>
                      <th className="text-right">{t('recipes.view.percentOfTotal')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipe.ingredients.map((ingredient) => {
                      const lineCost = calculateIngredientCost(
                        ingredient.quantity,
                        ingredient.unit,
                        ingredient.material.currentPrice
                      )
                      const percentage = (lineCost / recipe.ingredientsCost) * 100
                      return (
                        <tr key={ingredient.id}>
                          <td>{ingredient.material.name}</td>
                          <td className="text-right">{ingredient.quantity.toFixed(3)}</td>
                          <td>{ingredient.unit}</td>
                          <td className="text-right">{formatPrice(lineCost)}</td>
                          <td className="text-right">{percentage.toFixed(1)}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan={3}>{t('recipes.view.totalIngredientsCost')}</td>
                      <td className="text-right">{formatPrice(recipe.ingredientsCost)}</td>
                      <td className="text-right">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </section>

        {/* Packaging Section */}
        <section className="recipe-section">
          <h3 className="section-title">{t('recipes.view.packaging')}</h3>
          {recipe.packaging.length === 0 ? (
            <div className="empty-state-section">
              <p>{t('recipes.view.noPackaging')}</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="recipe-table">
                  <thead>
                    <tr>
                      <th>{t('recipes.view.materialName')}</th>
                      <th className="text-right">{t('recipes.view.quantity')}</th>
                      <th>{t('recipes.view.unitType')}</th>
                      <th className="text-right">{t('recipes.view.cost')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipe.packaging.map((packaging) => {
                      const lineCost = calculatePackagingCost(
                        packaging.quantity,
                        packaging.packagingMaterial.unitPrice
                      )
                      return (
                        <tr key={packaging.id}>
                          <td>{packaging.packagingMaterial.name}</td>
                          <td className="text-right">{packaging.quantity.toFixed(2)}</td>
                          <td>{packaging.packagingMaterial.unitType}</td>
                          <td className="text-right">{formatPrice(lineCost)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan={3}>{t('recipes.view.totalPackagingCost')}</td>
                      <td className="text-right">{formatPrice(recipe.packagingCost)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </section>

        {/* Cost Breakdown Section */}
        <section className="recipe-section">
          <h3 className="section-title">{t('recipes.view.costBreakdown')}</h3>
          <div className="cost-breakdown">
            <div className="cost-item">
              <span className="cost-label">{t('recipes.view.materialCost')}:</span>
              <span className="cost-value">{formatPrice(recipe.ingredientsCost)}</span>
            </div>
            <div className="cost-item">
              <span className="cost-label">{t('recipes.view.laborCost')}:</span>
              <span className="cost-value">{formatPrice(laborCost)}</span>
            </div>
            <div className="cost-item">
              <span className="cost-label">{t('recipes.view.packagingCost')}:</span>
              <span className="cost-value">{formatPrice(recipe.packagingCost)}</span>
            </div>
            <div className="cost-item total">
              <span className="cost-label">{t('recipes.view.totalCost')}:</span>
              <span className="cost-value">{formatPrice(totalCost)}</span>
            </div>
            <div className="cost-item highlight">
              <span className="cost-label">{t('recipes.view.costPerUnit')}:</span>
              <span className="cost-value">{formatPrice(costPerUnit)}</span>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="recipe-section">
          <h3 className="section-title">{t('recipes.view.pricing')}</h3>
          <div className="cost-breakdown">
            <div className="cost-item highlight">
              <span className="cost-label">{t('recipes.view.suggestedPrice')}:</span>
              <span className="cost-value">{formatPrice(suggestedPrice)}</span>
            </div>
            <div className="cost-item">
              <span className="cost-label">{t('recipes.view.profitAmount')}:</span>
              <span className="cost-value">{formatPrice(profitAmount)}</span>
            </div>
            <div className="cost-item">
              <span className="cost-label">{t('recipes.view.vatAmount')}:</span>
              <span className="cost-value">{formatPrice(vatAmount)}</span>
            </div>
            <div className="cost-item total">
              <span className="cost-label">{t('recipes.view.priceIncludingVat')}:</span>
              <span className="cost-value">{formatPrice(priceIncludingVAT)}</span>
            </div>
          </div>
        </section>

        {/* Weight Calculations Section */}
        <section className="recipe-section">
          <h3 className="section-title">{t('recipes.view.weightCalculations')}</h3>
          <div className="cost-breakdown">
            <div className="cost-item">
              <span className="cost-label">{t('recipes.view.grossWeight')}:</span>
              <span className="cost-value">{formatWeight(grossWeight)}</span>
            </div>
            <div className="cost-item">
              <span className="cost-label">{t('recipes.view.waste')} ({formatPercentage(recipe.wastePercentage)}):</span>
              <span className="cost-value">{formatWeight(wasteWeight)}</span>
            </div>
            <div className="cost-item">
              <span className="cost-label">{t('recipes.view.netWeight')}:</span>
              <span className="cost-value">{formatWeight(netWeight)}</span>
            </div>
            <div className="cost-item highlight">
              <span className="cost-label">{t('recipes.view.costPerKg')}:</span>
              <span className="cost-value">{formatPrice(costPerKg)}</span>
            </div>
          </div>
        </section>

        {/* Instructions Section */}
        {recipe.instructions && (
          <section className="recipe-section">
            <h3 className="section-title">{t('recipes.view.instructions')}</h3>
            <div className="instructions-content">
              <p>{recipe.instructions}</p>
            </div>
          </section>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title={t('recipes.delete.confirmTitle')}
        message={t('recipes.delete.confirmMessage', { name: recipe.name })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isDeleting}
        variant="danger"
      />

      <DuplicateRecipeDialog
        isOpen={duplicateDialogOpen}
        recipeId={recipeId}
        onConfirm={handleDuplicateConfirm}
        onCancel={handleDuplicateCancel}
        isLoading={isDuplicating}
      />
    </div>
  )
}
