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
 * Features a searchable dropdown for material selection, quantity/unit fields, and optional notes.
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
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Form state
  const [search, setSearch] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [quantity, setQuantity] = useState('1')
  const [unit, setUnit] = useState<'kg' | 'g'>('kg')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

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
        if (isDropdownOpen) {
          setIsDropdownOpen(false)
        } else if (search && !selectedMaterial) {
          setSearch('')
        } else {
          handleCancel()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLoading, search, isDropdownOpen, selectedMaterial])

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
      setSelectedMaterial(null)
      setQuantity('1')
      setUnit('kg')
      setNotes('')
      setError(null)
      setIsDropdownOpen(false)
      setHighlightedIndex(-1)
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isDropdownOpen) return

    const handleClickOutside = (e: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDropdownOpen])

  // Reset highlighted index when filtered materials change
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [filteredMaterials])

  const handleCancel = (): void => {
    if (!isLoading) {
      onCancel()
    }
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    // Validate material selection
    if (!selectedMaterial) {
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
      materialId: selectedMaterial.id,
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
    const value = e.target.value
    setSearch(value)
    setSelectedMaterial(null)
    setError(null)
    setIsDropdownOpen(true)
  }

  const handleSearchFocus = (): void => {
    setIsDropdownOpen(true)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Escape') {
      if (isDropdownOpen) {
        e.stopPropagation()
        setIsDropdownOpen(false)
      } else if (search && !selectedMaterial) {
        e.stopPropagation()
        setSearch('')
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isDropdownOpen) {
        setIsDropdownOpen(true)
      } else {
        setHighlightedIndex((prev) =>
          prev < filteredMaterials.length - 1 ? prev + 1 : prev
        )
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === 'Enter' && isDropdownOpen && highlightedIndex >= 0) {
      e.preventDefault()
      const material = filteredMaterials[highlightedIndex]
      if (material) {
        handleSelectMaterial(material)
      }
    }
  }

  const handleSelectMaterial = (material: Material): void => {
    setSelectedMaterial(material)
    setSearch(material.name)
    setIsDropdownOpen(false)
    setError(null)
  }

  const handleClearSelection = (): void => {
    setSelectedMaterial(null)
    setSearch('')
    setError(null)
    searchInputRef.current?.focus()
  }

  const formatPrice = (price: number): string => `${price.toFixed(2)}`

  if (!isOpen) {
    return null
  }

  const hasNoResults = filteredMaterials.length === 0 && debouncedSearch.length > 0 && !selectedMaterial

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

          {/* Searchable Material Dropdown */}
          <div className="add-ingredient-dialog-field">
            <label htmlFor="material-search" className="add-ingredient-dialog-label">
              {t('recipes.edit.ingredients.selectMaterial')}
              <span className="required"> *</span>
            </label>
            <div className="add-ingredient-dialog-searchable-select">
              <div className="add-ingredient-dialog-search-wrapper">
                <input
                  ref={searchInputRef}
                  id="material-search"
                  type="text"
                  className={`add-ingredient-dialog-input ${selectedMaterial ? 'has-selection' : ''}`}
                  placeholder={t('recipes.edit.ingredients.searchPlaceholder')}
                  value={search}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  onKeyDown={handleSearchKeyDown}
                  disabled={isLoading}
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="listbox"
                  aria-controls="material-listbox"
                />
                {(search || selectedMaterial) && (
                  <button
                    type="button"
                    className="add-ingredient-dialog-search-clear"
                    onClick={handleClearSelection}
                    title={t('recipes.edit.ingredients.clearSearch')}
                    aria-label={t('recipes.edit.ingredients.clearSearch')}
                    disabled={isLoading}
                  >
                    &times;
                  </button>
                )}
              </div>

              {/* Dropdown List */}
              {isDropdownOpen && !selectedMaterial && (
                <div
                  ref={dropdownRef}
                  id="material-listbox"
                  className="add-ingredient-dialog-dropdown"
                  role="listbox"
                >
                  {hasNoResults ? (
                    <div className="add-ingredient-dialog-dropdown-empty">
                      {t('recipes.edit.ingredients.searchNoResults')}
                    </div>
                  ) : filteredMaterials.length === 0 ? (
                    <div className="add-ingredient-dialog-dropdown-empty">
                      {t('recipes.edit.ingredients.noMaterialsAvailable')}
                    </div>
                  ) : (
                    filteredMaterials.map((material, index) => (
                      <div
                        key={material.id}
                        className={`add-ingredient-dialog-dropdown-item ${
                          index === highlightedIndex ? 'highlighted' : ''
                        }`}
                        onClick={() => handleSelectMaterial(material)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        role="option"
                        aria-selected={index === highlightedIndex}
                      >
                        <span className="add-ingredient-dialog-dropdown-item-name">
                          {material.name}
                        </span>
                        <span className="add-ingredient-dialog-dropdown-item-price">
                          {formatPrice(material.currentPrice)}/{material.unitOfMeasure}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
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
              disabled={isLoading || !selectedMaterial}
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
