import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebounce } from '../hooks/useDebounce'
import type { Material } from '../../../shared/types'
import './AddIngredientDialog.css'

export interface AddIngredientResult {
  materialId: string
  quantity: number
  unit: 'kg' | 'g'
  notes: string | null
}

interface AddIngredientDialogProps {
  isOpen: boolean
  availableMaterials: Material[]
  existingMaterialIds: string[]
  onConfirm: (result: AddIngredientResult) => void
  onCancel: () => void
  isLoading?: boolean
}

/**
 * A dialog component for adding an ingredient to a recipe.
 * Includes searchable material list, quantity/unit selection, and optional notes.
 */
export function AddIngredientDialog({
  isOpen,
  availableMaterials,
  existingMaterialIds,
  onConfirm,
  onCancel,
  isLoading = false
}: AddIngredientDialogProps): JSX.Element | null {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [search, setSearch] = useState('')
  const [selectedMaterialId, setSelectedMaterialId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unit, setUnit] = useState<'kg' | 'g'>('kg')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  // Filter materials by search and exclude already added
  const filteredMaterials = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase().trim()
    return availableMaterials.filter((mat) => {
      // Exclude already added materials
      if (existingMaterialIds.includes(mat.id)) {
        return false
      }
      // Apply search filter if there's a search term
      if (searchLower) {
        return (
          mat.name.toLowerCase().includes(searchLower) ||
          (mat.supplier && mat.supplier.toLowerCase().includes(searchLower))
        )
      }
      return true
    })
  }, [availableMaterials, existingMaterialIds, debouncedSearch])

  // Focus search input when dialog opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && !isLoading) {
        if (search) {
          setSearch('')
        } else {
          handleCancel()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLoading, search])

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearch('')
      setSelectedMaterialId('')
      setQuantity('1')
      setUnit('kg')
      setNotes('')
      setError(null)
    }
  }, [isOpen])

  const handleCancel = (): void => {
    if (!isLoading) {
      onCancel()
    }
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    // Validate material selection
    if (!selectedMaterialId) {
      setError(t('recipes.edit.ingredients.errors.selectMaterial'))
      return
    }

    // Validate quantity
    const parsedQuantity = parseFloat(quantity)
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setError(t('recipes.edit.ingredients.errors.invalidQuantity'))
      return
    }

    setError(null)
    onConfirm({
      materialId: selectedMaterialId,
      quantity: parsedQuantity,
      unit,
      notes: notes.trim() || null
    })
  }

  const handleBackdropClick = (e: React.MouseEvent): void => {
    if (e.target === e.currentTarget && !isLoading) {
      handleCancel()
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(e.target.value)
    // Clear selection if search changes
    setSelectedMaterialId('')
    setError(null)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Escape' && search) {
      e.stopPropagation()
      setSearch('')
    }
  }

  const handleClearSearch = (): void => {
    setSearch('')
    searchInputRef.current?.focus()
  }

  const formatPrice = (price: number): string => `${price.toFixed(2)}`

  if (!isOpen) {
    return null
  }

  const hasNoResults = filteredMaterials.length === 0 && debouncedSearch.length > 0

  return (
    <div
      className="add-ingredient-dialog-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-ingredient-dialog-title"
    >
      <div className="add-ingredient-dialog" ref={dialogRef}>
        <h3 id="add-ingredient-dialog-title" className="add-ingredient-dialog-title">
          {t('recipes.edit.ingredients.addTitle')}
        </h3>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="add-ingredient-dialog-error" role="alert">
              {error}
            </div>
          )}

          {/* Search Input */}
          <div className="add-ingredient-dialog-field">
            <label htmlFor="ingredient-search" className="add-ingredient-dialog-label">
              {t('common.search')}
            </label>
            <div className="add-ingredient-dialog-search-wrapper">
              <input
                ref={searchInputRef}
                id="ingredient-search"
                type="text"
                className="add-ingredient-dialog-input"
                placeholder={t('recipes.edit.ingredients.searchPlaceholder')}
                value={search}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                disabled={isLoading}
                autoComplete="off"
              />
              {search && (
                <button
                  type="button"
                  className="add-ingredient-dialog-search-clear"
                  onClick={handleClearSearch}
                  title={t('recipes.edit.ingredients.clearSearch')}
                  aria-label={t('recipes.edit.ingredients.clearSearch')}
                  disabled={isLoading}
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* Material Selection */}
          <div className="add-ingredient-dialog-field">
            <label htmlFor="material-select" className="add-ingredient-dialog-label">
              {t('recipes.edit.ingredients.selectMaterial')}
              <span className="required"> *</span>
            </label>
            {hasNoResults ? (
              <p className="add-ingredient-dialog-no-results">
                {t('recipes.edit.ingredients.searchNoResults')}
              </p>
            ) : (
              <select
                id="material-select"
                className="add-ingredient-dialog-select"
                value={selectedMaterialId}
                onChange={(e) => {
                  setSelectedMaterialId(e.target.value)
                  setError(null)
                }}
                disabled={isLoading}
              >
                <option value="">{t('recipes.edit.ingredients.selectPlaceholder')}</option>
                {filteredMaterials.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name} ({formatPrice(mat.currentPrice)}/{mat.unitOfMeasure})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Quantity and Unit */}
          <div className="add-ingredient-dialog-row">
            <div className="add-ingredient-dialog-field">
              <label htmlFor="ingredient-quantity" className="add-ingredient-dialog-label">
                {t('recipes.view.quantity')}
                <span className="required"> *</span>
              </label>
              <input
                id="ingredient-quantity"
                type="number"
                step="0.001"
                min="0.001"
                className="add-ingredient-dialog-input"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value)
                  setError(null)
                }}
                disabled={isLoading}
              />
            </div>
            <div className="add-ingredient-dialog-field">
              <label htmlFor="ingredient-unit" className="add-ingredient-dialog-label">
                {t('recipes.view.unit')}
                <span className="required"> *</span>
              </label>
              <select
                id="ingredient-unit"
                className="add-ingredient-dialog-select"
                value={unit}
                onChange={(e) => setUnit(e.target.value as 'kg' | 'g')}
                disabled={isLoading}
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="add-ingredient-dialog-field">
            <label htmlFor="ingredient-notes" className="add-ingredient-dialog-label">
              {t('recipes.edit.ingredients.notes')}
            </label>
            <textarea
              id="ingredient-notes"
              className="add-ingredient-dialog-textarea"
              placeholder={t('recipes.edit.ingredients.notesPlaceholder')}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="add-ingredient-dialog-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !selectedMaterialId}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner-small" />
                  {t('common.loading')}
                </>
              ) : (
                t('recipes.edit.ingredients.add')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
