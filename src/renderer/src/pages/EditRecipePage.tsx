import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { recipeFormSchema, type RecipeFormData } from '../components/RecipeForm'
import type {
  RecipeWithFullDetails,
  RecipeIngredientWithMaterial,
  RecipePackagingWithMaterial,
  UpdateRecipeInput,
  Material,
  PackagingMaterial
} from '../../../shared/types'
import './EditRecipePage.css'

interface EditRecipePageProps {
  recipeId: string
  onCancel: () => void
  onSuccess: () => void
}

// Helper to calculate ingredient cost
function calculateIngredientCost(
  quantity: number,
  unit: string,
  pricePerKg: number
): number {
  if (unit === 'kg') {
    return quantity * pricePerKg
  } else {
    // unit is 'g'
    return (quantity / 1000) * pricePerKg
  }
}

// Helper to calculate packaging cost
function calculatePackagingCost(quantity: number, unitPrice: number): number {
  return quantity * unitPrice
}

/**
 * EditRecipePage component for editing recipes with full ingredient and packaging management.
 * Features inline editing, drag-and-drop reordering, and real-time cost updates.
 */
export function EditRecipePage({
  recipeId,
  onCancel,
  onSuccess
}: EditRecipePageProps): JSX.Element {
  const { t } = useTranslation()

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Recipe data
  const [recipe, setRecipe] = useState<RecipeWithFullDetails | null>(null)
  const [ingredients, setIngredients] = useState<RecipeIngredientWithMaterial[]>([])
  const [packaging, setPackaging] = useState<RecipePackagingWithMaterial[]>([])

  // Available materials for dropdowns
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([])
  const [availablePackaging, setAvailablePackaging] = useState<PackagingMaterial[]>([])

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  // Track if form is dirty for cancel confirmation
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  // Add ingredient modal
  const [showAddIngredient, setShowAddIngredient] = useState(false)
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('')
  const [ingredientQuantity, setIngredientQuantity] = useState<string>('1')
  const [ingredientUnit, setIngredientUnit] = useState<'kg' | 'g'>('kg')
  const [addIngredientError, setAddIngredientError] = useState<string | null>(null)

  // Add packaging modal
  const [showAddPackaging, setShowAddPackaging] = useState(false)
  const [selectedPackagingId, setSelectedPackagingId] = useState<string>('')
  const [packagingQuantity, setPackagingQuantity] = useState<string>('1')
  const [addPackagingError, setAddPackagingError] = useState<string | null>(null)

  // Edit ingredient state
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null)
  const [editIngredientQuantity, setEditIngredientQuantity] = useState<string>('')
  const [editIngredientUnit, setEditIngredientUnit] = useState<'kg' | 'g'>('kg')

  // Edit packaging state
  const [editingPackagingId, setEditingPackagingId] = useState<string | null>(null)
  const [editPackagingQuantity, setEditPackagingQuantity] = useState<string>('')

  // Drag and drop state
  const [draggedIngredientId, setDraggedIngredientId] = useState<string | null>(null)

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      name: '',
      description: '',
      yieldQuantity: 1,
      yieldUnit: 'portion',
      prepTimeMinutes: undefined,
      profitMargin: undefined,
      wastePercentage: undefined,
      vatPercentage: 21,
      instructions: ''
    }
  })

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(isDirty)
  }, [isDirty])

  // Calculate total costs
  const ingredientsCost = useMemo(() => {
    return ingredients.reduce((total, ing) => {
      return total + calculateIngredientCost(ing.quantity, ing.unit, ing.material.currentPrice)
    }, 0)
  }, [ingredients])

  const packagingCost = useMemo(() => {
    return packaging.reduce((total, pkg) => {
      return total + calculatePackagingCost(pkg.quantity, pkg.packagingMaterial.unitPrice)
    }, 0)
  }, [packaging])

  const totalCost = ingredientsCost + packagingCost

  // Load recipe and materials
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const [recipeData, materialsData, packagingData] = await Promise.all([
          window.api.recipes.get(recipeId),
          window.api.materials.getAll(false),
          window.api.packaging.getAll(false)
        ])

        if (!recipeData) {
          setLoadError(t('recipes.edit.errors.notFound'))
          return
        }

        setRecipe(recipeData)
        setIngredients(recipeData.ingredients)
        setPackaging(recipeData.packaging)
        setAvailableMaterials(materialsData)
        setAvailablePackaging(packagingData)

        // Reset form with recipe data
        reset({
          name: recipeData.name,
          description: recipeData.description || '',
          yieldQuantity: recipeData.yieldQuantity,
          yieldUnit: recipeData.yieldUnit as 'portion' | 'piece' | 'kg' | 'g' | 'l' | 'ml',
          prepTimeMinutes: recipeData.prepTimeMinutes ?? undefined,
          profitMargin: recipeData.profitMargin ?? undefined,
          wastePercentage: recipeData.wastePercentage ?? undefined,
          vatPercentage: recipeData.vatPercentage ?? 21,
          instructions: recipeData.instructions || ''
        })
      } catch (error) {
        console.error('Failed to fetch recipe:', error)
        setLoadError(t('recipes.edit.errors.loadFailed'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [recipeId, t, reset])

  // Handle form submission
  const handleFormSubmit = async (data: RecipeFormData): Promise<void> => {
    setIsSubmitting(true)
    setServerError(null)

    try {
      const input: UpdateRecipeInput = {
        name: data.name,
        description: data.description,
        yieldQuantity: data.yieldQuantity,
        yieldUnit: data.yieldUnit,
        prepTimeMinutes: data.prepTimeMinutes,
        profitMargin: data.profitMargin,
        wastePercentage: data.wastePercentage,
        vatPercentage: data.vatPercentage,
        instructions: data.instructions
      }

      await window.api.recipes.update(recipeId, input)
      setHasUnsavedChanges(false)
      onSuccess()
    } catch (error) {
      console.error('Failed to update recipe:', error)
      const errorMessage = error instanceof Error ? error.message : ''

      if (errorMessage === 'DUPLICATE_NAME') {
        setServerError(t('recipes.edit.errors.duplicateName'))
      } else if (errorMessage === 'NOT_FOUND') {
        setServerError(t('recipes.edit.errors.notFound'))
      } else {
        setServerError(t('recipes.edit.errors.updateFailed'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle cancel with confirmation
  const handleCancelClick = useCallback((): void => {
    if (hasUnsavedChanges) {
      setShowCancelDialog(true)
    } else {
      onCancel()
    }
  }, [hasUnsavedChanges, onCancel])

  const handleConfirmCancel = (): void => {
    setShowCancelDialog(false)
    onCancel()
  }

  // ========================================
  // Ingredient Management
  // ========================================

  const handleAddIngredient = async (): Promise<void> => {
    if (!selectedMaterialId) {
      setAddIngredientError(t('recipes.edit.ingredients.errors.selectMaterial'))
      return
    }

    const quantity = parseFloat(ingredientQuantity)
    if (isNaN(quantity) || quantity <= 0) {
      setAddIngredientError(t('recipes.edit.ingredients.errors.invalidQuantity'))
      return
    }

    try {
      await window.api.ingredients.add({
        recipeId,
        materialId: selectedMaterialId,
        quantity,
        unit: ingredientUnit
      })

      // Refresh recipe data
      const updatedRecipe = await window.api.recipes.get(recipeId)
      if (updatedRecipe) {
        setIngredients(updatedRecipe.ingredients)
      }

      // Reset and close modal
      setSelectedMaterialId('')
      setIngredientQuantity('1')
      setIngredientUnit('kg')
      setAddIngredientError(null)
      setShowAddIngredient(false)
      setHasUnsavedChanges(true)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ''
      if (errorMessage === 'INGREDIENT_ALREADY_EXISTS') {
        setAddIngredientError(t('recipes.edit.ingredients.errors.alreadyExists'))
      } else {
        setAddIngredientError(t('recipes.edit.ingredients.errors.addFailed'))
      }
    }
  }

  const handleStartEditIngredient = (ingredient: RecipeIngredientWithMaterial): void => {
    setEditingIngredientId(ingredient.id)
    setEditIngredientQuantity(ingredient.quantity.toString())
    setEditIngredientUnit(ingredient.unit as 'kg' | 'g')
  }

  const handleSaveIngredient = async (ingredientId: string): Promise<void> => {
    const quantity = parseFloat(editIngredientQuantity)
    if (isNaN(quantity) || quantity <= 0) {
      return
    }

    try {
      await window.api.ingredients.update(ingredientId, {
        quantity,
        unit: editIngredientUnit
      })

      // Refresh recipe data
      const updatedRecipe = await window.api.recipes.get(recipeId)
      if (updatedRecipe) {
        setIngredients(updatedRecipe.ingredients)
      }

      setEditingIngredientId(null)
      setHasUnsavedChanges(true)
    } catch (error) {
      console.error('Failed to update ingredient:', error)
    }
  }

  const handleCancelEditIngredient = (): void => {
    setEditingIngredientId(null)
  }

  const handleRemoveIngredient = async (ingredientId: string): Promise<void> => {
    try {
      await window.api.ingredients.remove(ingredientId)

      // Update local state
      setIngredients((prev) => prev.filter((ing) => ing.id !== ingredientId))
      setHasUnsavedChanges(true)
    } catch (error) {
      console.error('Failed to remove ingredient:', error)
    }
  }

  // Drag and drop handlers for ingredients
  const handleDragStart = (ingredientId: string): void => {
    setDraggedIngredientId(ingredientId)
  }

  const handleDragOver = (e: React.DragEvent, targetId: string): void => {
    e.preventDefault()
    if (!draggedIngredientId || draggedIngredientId === targetId) return

    const draggedIndex = ingredients.findIndex((ing) => ing.id === draggedIngredientId)
    const targetIndex = ingredients.findIndex((ing) => ing.id === targetId)

    if (draggedIndex !== targetIndex) {
      const newIngredients = [...ingredients]
      const [removed] = newIngredients.splice(draggedIndex, 1)
      newIngredients.splice(targetIndex, 0, removed)
      setIngredients(newIngredients)
    }
  }

  const handleDragEnd = async (): Promise<void> => {
    if (draggedIngredientId) {
      try {
        await window.api.ingredients.reorder(
          recipeId,
          ingredients.map((ing) => ing.id)
        )
        setHasUnsavedChanges(true)
      } catch (error) {
        console.error('Failed to reorder ingredients:', error)
        // Refresh to get correct order
        const updatedRecipe = await window.api.recipes.get(recipeId)
        if (updatedRecipe) {
          setIngredients(updatedRecipe.ingredients)
        }
      }
    }
    setDraggedIngredientId(null)
  }

  // ========================================
  // Packaging Management
  // ========================================

  const handleAddPackaging = async (): Promise<void> => {
    if (!selectedPackagingId) {
      setAddPackagingError(t('recipes.edit.packaging.errors.selectPackaging'))
      return
    }

    const quantity = parseFloat(packagingQuantity)
    if (isNaN(quantity) || quantity <= 0) {
      setAddPackagingError(t('recipes.edit.packaging.errors.invalidQuantity'))
      return
    }

    try {
      await window.api.recipePackaging.add({
        recipeId,
        packagingMaterialId: selectedPackagingId,
        quantity
      })

      // Refresh recipe data
      const updatedRecipe = await window.api.recipes.get(recipeId)
      if (updatedRecipe) {
        setPackaging(updatedRecipe.packaging)
      }

      // Reset and close modal
      setSelectedPackagingId('')
      setPackagingQuantity('1')
      setAddPackagingError(null)
      setShowAddPackaging(false)
      setHasUnsavedChanges(true)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ''
      if (errorMessage === 'PACKAGING_ALREADY_EXISTS') {
        setAddPackagingError(t('recipes.edit.packaging.errors.alreadyExists'))
      } else {
        setAddPackagingError(t('recipes.edit.packaging.errors.addFailed'))
      }
    }
  }

  const handleStartEditPackaging = (pkg: RecipePackagingWithMaterial): void => {
    setEditingPackagingId(pkg.id)
    setEditPackagingQuantity(pkg.quantity.toString())
  }

  const handleSavePackaging = async (packagingId: string): Promise<void> => {
    const quantity = parseFloat(editPackagingQuantity)
    if (isNaN(quantity) || quantity <= 0) {
      return
    }

    try {
      await window.api.recipePackaging.update(packagingId, { quantity })

      // Refresh recipe data
      const updatedRecipe = await window.api.recipes.get(recipeId)
      if (updatedRecipe) {
        setPackaging(updatedRecipe.packaging)
      }

      setEditingPackagingId(null)
      setHasUnsavedChanges(true)
    } catch (error) {
      console.error('Failed to update packaging:', error)
    }
  }

  const handleCancelEditPackaging = (): void => {
    setEditingPackagingId(null)
  }

  const handleRemovePackaging = async (packagingId: string): Promise<void> => {
    try {
      await window.api.recipePackaging.remove(packagingId)

      // Update local state
      setPackaging((prev) => prev.filter((pkg) => pkg.id !== packagingId))
      setHasUnsavedChanges(true)
    } catch (error) {
      console.error('Failed to remove packaging:', error)
    }
  }

  // Filter out already added materials and packaging
  const availableMaterialsFiltered = availableMaterials.filter(
    (mat) => !ingredients.some((ing) => ing.materialId === mat.id)
  )

  const availablePackagingFiltered = availablePackaging.filter(
    (pkg) => !packaging.some((p) => p.packagingMaterialId === pkg.id)
  )

  const formatPrice = (price: number): string => `€${price.toFixed(2)}`

  const getErrorMessage = (errorKey: string | undefined): string | undefined => {
    if (!errorKey) return undefined
    if (errorKey === 'validation.maxLength') {
      return t(errorKey, { max: 200 })
    }
    return t(errorKey)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="edit-recipe-page">
        <div className="page-header">
          <div className="page-header-left">
            <button className="btn-back" onClick={onCancel} type="button">
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

  // Error state
  if (loadError || !recipe) {
    return (
      <div className="edit-recipe-page">
        <div className="page-header">
          <div className="page-header-left">
            <button className="btn-back" onClick={onCancel} type="button">
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
            <button className="btn-secondary" onClick={onCancel}>
              {t('common.back')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="edit-recipe-page">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-back" onClick={handleCancelClick} type="button">
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
          <h2 className="page-title">
            {t('recipes.edit.title')}
            <span className="edit-recipe-name">: {recipe.name}</span>
          </h2>
        </div>
      </div>

      <div className="edit-recipe-content">
        {serverError && (
          <div className="server-error" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          {/* Recipe Metadata Section */}
          <section className="edit-section">
            <h3 className="section-title">{t('recipes.view.recipeDetails')}</h3>

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                {t('recipes.create.fields.name')} <span className="required">*</span>
              </label>
              <input
                id="name"
                type="text"
                className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                placeholder={t('recipes.create.fields.namePlaceholder')}
                {...register('name')}
                aria-invalid={errors.name ? 'true' : 'false'}
              />
              {errors.name && (
                <span className="field-error" role="alert">
                  {getErrorMessage(errors.name.message)}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                {t('recipes.create.fields.description')}
              </label>
              <textarea
                id="description"
                className={`form-input form-textarea ${errors.description ? 'form-input-error' : ''}`}
                placeholder={t('recipes.create.fields.descriptionPlaceholder')}
                rows={3}
                {...register('description')}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="yieldQuantity" className="form-label">
                  {t('recipes.create.fields.yieldQuantity')} <span className="required">*</span>
                </label>
                <input
                  id="yieldQuantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={`form-input ${errors.yieldQuantity ? 'form-input-error' : ''}`}
                  {...register('yieldQuantity', { valueAsNumber: true })}
                />
                {errors.yieldQuantity && (
                  <span className="field-error" role="alert">
                    {getErrorMessage(errors.yieldQuantity.message)}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="yieldUnit" className="form-label">
                  {t('recipes.create.fields.yieldUnit')} <span className="required">*</span>
                </label>
                <select
                  id="yieldUnit"
                  className="form-input form-select"
                  {...register('yieldUnit')}
                >
                  <option value="portion">{t('recipes.create.yieldUnits.portion')}</option>
                  <option value="piece">{t('recipes.create.yieldUnits.piece')}</option>
                  <option value="kg">{t('recipes.create.yieldUnits.kg')}</option>
                  <option value="g">{t('recipes.create.yieldUnits.g')}</option>
                  <option value="l">{t('recipes.create.yieldUnits.l')}</option>
                  <option value="ml">{t('recipes.create.yieldUnits.ml')}</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prepTimeMinutes" className="form-label">
                  {t('recipes.create.fields.prepTimeMinutes')}
                </label>
                <input
                  id="prepTimeMinutes"
                  type="number"
                  step="1"
                  min="0"
                  className="form-input"
                  {...register('prepTimeMinutes', {
                    setValueAs: (v) => (v === '' || v === null ? null : Number(v))
                  })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="profitMargin" className="form-label">
                  {t('recipes.create.fields.profitMargin')}
                </label>
                <input
                  id="profitMargin"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="form-input"
                  {...register('profitMargin', {
                    setValueAs: (v) => (v === '' || v === null ? null : Number(v))
                  })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="wastePercentage" className="form-label">
                  {t('recipes.create.fields.wastePercentage')}
                </label>
                <input
                  id="wastePercentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="form-input"
                  {...register('wastePercentage', {
                    setValueAs: (v) => (v === '' || v === null ? null : Number(v))
                  })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="vatPercentage" className="form-label">
                  {t('recipes.create.fields.vatPercentage')}
                </label>
                <input
                  id="vatPercentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="form-input"
                  {...register('vatPercentage', {
                    setValueAs: (v) => (v === '' || v === null ? null : Number(v))
                  })}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="instructions" className="form-label">
                {t('recipes.create.fields.instructions')}
              </label>
              <textarea
                id="instructions"
                className="form-input form-textarea"
                placeholder={t('recipes.create.fields.instructionsPlaceholder')}
                rows={6}
                {...register('instructions')}
              />
            </div>
          </section>

          {/* Ingredients Section */}
          <section className="edit-section">
            <div className="section-header">
              <h3 className="section-title">{t('recipes.view.ingredients')}</h3>
              <button
                type="button"
                className="btn-secondary btn-small"
                onClick={() => setShowAddIngredient(true)}
                disabled={availableMaterialsFiltered.length === 0}
              >
                {t('recipes.edit.ingredients.add')}
              </button>
            </div>

            {ingredients.length === 0 ? (
              <div className="empty-state-section">
                <p>{t('recipes.view.noIngredients')}</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="edit-table">
                  <thead>
                    <tr>
                      <th className="drag-handle-col"></th>
                      <th>{t('recipes.view.materialName')}</th>
                      <th className="text-right">{t('recipes.view.quantity')}</th>
                      <th>{t('recipes.view.unit')}</th>
                      <th className="text-right">{t('recipes.view.cost')}</th>
                      <th className="actions-col">{t('materials.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ingredient) => {
                      const lineCost = calculateIngredientCost(
                        ingredient.quantity,
                        ingredient.unit,
                        ingredient.material.currentPrice
                      )
                      const isEditing = editingIngredientId === ingredient.id

                      return (
                        <tr
                          key={ingredient.id}
                          draggable={!isEditing}
                          onDragStart={() => handleDragStart(ingredient.id)}
                          onDragOver={(e) => handleDragOver(e, ingredient.id)}
                          onDragEnd={handleDragEnd}
                          className={draggedIngredientId === ingredient.id ? 'dragging' : ''}
                        >
                          <td className="drag-handle-col">
                            <span className="drag-handle" title={t('recipes.edit.ingredients.dragToReorder')}>
                              &#8942;&#8942;
                            </span>
                          </td>
                          <td>{ingredient.material.name}</td>
                          <td className="text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                className="inline-input"
                                value={editIngredientQuantity}
                                onChange={(e) => setEditIngredientQuantity(e.target.value)}
                                autoFocus
                              />
                            ) : (
                              ingredient.quantity.toFixed(3)
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <select
                                className="inline-select"
                                value={editIngredientUnit}
                                onChange={(e) =>
                                  setEditIngredientUnit(e.target.value as 'kg' | 'g')
                                }
                              >
                                <option value="kg">kg</option>
                                <option value="g">g</option>
                              </select>
                            ) : (
                              ingredient.unit
                            )}
                          </td>
                          <td className="text-right">{formatPrice(lineCost)}</td>
                          <td className="actions-col">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  className="btn-icon btn-save"
                                  onClick={() => handleSaveIngredient(ingredient.id)}
                                  title={t('common.save')}
                                >
                                  &#10003;
                                </button>
                                <button
                                  type="button"
                                  className="btn-icon btn-cancel"
                                  onClick={handleCancelEditIngredient}
                                  title={t('common.cancel')}
                                >
                                  &#10005;
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="btn-icon"
                                  onClick={() => handleStartEditIngredient(ingredient)}
                                  title={t('common.edit')}
                                >
                                  &#9998;
                                </button>
                                <button
                                  type="button"
                                  className="btn-icon btn-danger-icon"
                                  onClick={() => handleRemoveIngredient(ingredient.id)}
                                  title={t('common.delete')}
                                >
                                  &#128465;
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan={4}>{t('recipes.view.totalIngredientsCost')}</td>
                      <td className="text-right">{formatPrice(ingredientsCost)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </section>

          {/* Packaging Section */}
          <section className="edit-section">
            <div className="section-header">
              <h3 className="section-title">{t('recipes.view.packaging')}</h3>
              <button
                type="button"
                className="btn-secondary btn-small"
                onClick={() => setShowAddPackaging(true)}
                disabled={availablePackagingFiltered.length === 0}
              >
                {t('recipes.edit.packaging.add')}
              </button>
            </div>

            {packaging.length === 0 ? (
              <div className="empty-state-section">
                <p>{t('recipes.view.noPackaging')}</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="edit-table">
                  <thead>
                    <tr>
                      <th>{t('recipes.view.materialName')}</th>
                      <th className="text-right">{t('recipes.view.quantity')}</th>
                      <th>{t('recipes.view.unitType')}</th>
                      <th className="text-right">{t('recipes.view.cost')}</th>
                      <th className="actions-col">{t('materials.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packaging.map((pkg) => {
                      const lineCost = calculatePackagingCost(
                        pkg.quantity,
                        pkg.packagingMaterial.unitPrice
                      )
                      const isEditing = editingPackagingId === pkg.id

                      return (
                        <tr key={pkg.id}>
                          <td>{pkg.packagingMaterial.name}</td>
                          <td className="text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="inline-input"
                                value={editPackagingQuantity}
                                onChange={(e) => setEditPackagingQuantity(e.target.value)}
                                autoFocus
                              />
                            ) : (
                              pkg.quantity.toFixed(2)
                            )}
                          </td>
                          <td>{pkg.packagingMaterial.unitType}</td>
                          <td className="text-right">{formatPrice(lineCost)}</td>
                          <td className="actions-col">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  className="btn-icon btn-save"
                                  onClick={() => handleSavePackaging(pkg.id)}
                                  title={t('common.save')}
                                >
                                  &#10003;
                                </button>
                                <button
                                  type="button"
                                  className="btn-icon btn-cancel"
                                  onClick={handleCancelEditPackaging}
                                  title={t('common.cancel')}
                                >
                                  &#10005;
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="btn-icon"
                                  onClick={() => handleStartEditPackaging(pkg)}
                                  title={t('common.edit')}
                                >
                                  &#9998;
                                </button>
                                <button
                                  type="button"
                                  className="btn-icon btn-danger-icon"
                                  onClick={() => handleRemovePackaging(pkg.id)}
                                  title={t('common.delete')}
                                >
                                  &#128465;
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan={3}>{t('recipes.view.totalPackagingCost')}</td>
                      <td className="text-right">{formatPrice(packagingCost)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </section>

          {/* Cost Summary */}
          <section className="edit-section cost-summary-section">
            <h3 className="section-title">{t('recipes.view.costBreakdown')}</h3>
            <div className="cost-summary">
              <div className="cost-item">
                <span>{t('recipes.view.materialCost')}:</span>
                <span>{formatPrice(ingredientsCost)}</span>
              </div>
              <div className="cost-item">
                <span>{t('recipes.view.packagingCost')}:</span>
                <span>{formatPrice(packagingCost)}</span>
              </div>
              <div className="cost-item total">
                <span>{t('recipes.view.totalCost')}:</span>
                <span>{formatPrice(totalCost)}</span>
              </div>
            </div>
          </section>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancelClick}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>

      {/* Add Ingredient Modal */}
      {showAddIngredient && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">{t('recipes.edit.ingredients.addTitle')}</h3>

            {addIngredientError && (
              <div className="modal-error" role="alert">
                {addIngredientError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="material-select" className="form-label">
                {t('recipes.edit.ingredients.selectMaterial')}
              </label>
              <select
                id="material-select"
                className="form-input form-select"
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
              >
                <option value="">{t('recipes.edit.ingredients.selectPlaceholder')}</option>
                {availableMaterialsFiltered.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name} ({formatPrice(mat.currentPrice)}/{mat.unitOfMeasure})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ingredient-quantity" className="form-label">
                  {t('recipes.view.quantity')}
                </label>
                <input
                  id="ingredient-quantity"
                  type="number"
                  step="0.001"
                  min="0.001"
                  className="form-input"
                  value={ingredientQuantity}
                  onChange={(e) => setIngredientQuantity(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ingredient-unit" className="form-label">
                  {t('recipes.view.unit')}
                </label>
                <select
                  id="ingredient-unit"
                  className="form-input form-select"
                  value={ingredientUnit}
                  onChange={(e) => setIngredientUnit(e.target.value as 'kg' | 'g')}
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowAddIngredient(false)
                  setAddIngredientError(null)
                  setSelectedMaterialId('')
                  setIngredientQuantity('1')
                  setIngredientUnit('kg')
                }}
              >
                {t('common.cancel')}
              </button>
              <button type="button" className="btn-primary" onClick={handleAddIngredient}>
                {t('recipes.edit.ingredients.add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Packaging Modal */}
      {showAddPackaging && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">{t('recipes.edit.packaging.addTitle')}</h3>

            {addPackagingError && (
              <div className="modal-error" role="alert">
                {addPackagingError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="packaging-select" className="form-label">
                {t('recipes.edit.packaging.selectPackaging')}
              </label>
              <select
                id="packaging-select"
                className="form-input form-select"
                value={selectedPackagingId}
                onChange={(e) => setSelectedPackagingId(e.target.value)}
              >
                <option value="">{t('recipes.edit.packaging.selectPlaceholder')}</option>
                {availablePackagingFiltered.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} ({formatPrice(pkg.unitPrice)}/{pkg.unitType})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="packaging-quantity" className="form-label">
                {t('recipes.view.quantity')}
              </label>
              <input
                id="packaging-quantity"
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                value={packagingQuantity}
                onChange={(e) => setPackagingQuantity(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowAddPackaging(false)
                  setAddPackagingError(null)
                  setSelectedPackagingId('')
                  setPackagingQuantity('1')
                }}
              >
                {t('common.cancel')}
              </button>
              <button type="button" className="btn-primary" onClick={handleAddPackaging}>
                {t('recipes.edit.packaging.add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        title={t('recipes.edit.cancelConfirm.title')}
        message={t('recipes.edit.cancelConfirm.message')}
        confirmLabel={t('recipes.edit.cancelConfirm.discard')}
        cancelLabel={t('recipes.edit.cancelConfirm.keepEditing')}
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelDialog(false)}
        variant="danger"
      />
    </div>
  )
}
