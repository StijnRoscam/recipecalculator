import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import './DuplicateRecipeDialog.css'

interface DuplicateRecipeDialogProps {
  isOpen: boolean
  recipeId: string
  onConfirm: (newName: string) => void
  onCancel: () => void
  isLoading?: boolean
}

/**
 * A dialog component for duplicating a recipe with a custom name.
 * Prompts the user for a new name with validation for uniqueness.
 */
export function DuplicateRecipeDialog({
  isOpen,
  recipeId,
  onConfirm,
  onCancel,
  isLoading = false
}: DuplicateRecipeDialogProps): JSX.Element | null {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [suggestedName, setSuggestedName] = useState('')
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Load suggested name when dialog opens
  useEffect(() => {
    if (isOpen && recipeId) {
      setIsLoadingSuggestion(true)
      setError(null)

      window.api.recipes
        .getSuggestedDuplicateName(recipeId)
        .then((suggested) => {
          setSuggestedName(suggested)
          setName(suggested)
          setIsLoadingSuggestion(false)
        })
        .catch((err) => {
          console.error('Failed to get suggested name:', err)
          setIsLoadingSuggestion(false)
        })
    }
  }, [isOpen, recipeId])

  // Focus the input when dialog opens and suggestion is loaded
  useEffect(() => {
    if (isOpen && !isLoadingSuggestion && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isOpen, isLoadingSuggestion])

  // Handle Escape key to close dialog
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && !isLoading) {
        handleCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLoading])

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
      setName('')
      setSuggestedName('')
      setError(null)
      setIsValidating(false)
    }
  }, [isOpen])

  const handleCancel = (): void => {
    if (!isLoading) {
      onCancel()
    }
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    const trimmedName = name.trim()

    // Validate name is not empty
    if (!trimmedName) {
      setError(t('recipes.duplicate.errors.nameRequired'))
      return
    }

    // Validate name length
    if (trimmedName.length > 200) {
      setError(t('recipes.duplicate.errors.nameTooLong'))
      return
    }

    // Check name availability
    setIsValidating(true)
    setError(null)

    try {
      const isAvailable = await window.api.recipes.checkNameAvailable(trimmedName)

      if (!isAvailable) {
        setError(t('recipes.duplicate.errors.duplicateName'))
        setIsValidating(false)
        return
      }

      setIsValidating(false)
      onConfirm(trimmedName)
    } catch (err) {
      console.error('Failed to validate name:', err)
      setError(t('recipes.duplicate.errors.validationFailed'))
      setIsValidating(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent): void => {
    if (e.target === e.currentTarget && !isLoading) {
      handleCancel()
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value)
    setError(null) // Clear error when user types
  }

  if (!isOpen) {
    return null
  }

  const isSubmitting = isLoading || isValidating

  return (
    <div
      className="duplicate-dialog-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-dialog-title"
    >
      <div className="duplicate-dialog" ref={dialogRef}>
        <h3 id="duplicate-dialog-title" className="duplicate-dialog-title">
          {t('recipes.duplicate.title')}
        </h3>

        {isLoadingSuggestion ? (
          <div className="duplicate-dialog-loading">
            <span className="loading-spinner" />
            {t('common.loading')}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="duplicate-dialog-content">
              <label htmlFor="duplicate-name" className="duplicate-dialog-label">
                {t('recipes.duplicate.nameLabel')}
                <span className="required"> *</span>
              </label>
              <input
                ref={inputRef}
                id="duplicate-name"
                type="text"
                className={`duplicate-dialog-input ${error ? 'input-error' : ''}`}
                value={name}
                onChange={handleNameChange}
                placeholder={suggestedName || t('recipes.duplicate.namePlaceholder')}
                disabled={isSubmitting}
                maxLength={200}
                autoComplete="off"
              />
              {error && <span className="duplicate-dialog-error">{error}</span>}
            </div>

            <div className="duplicate-dialog-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting || !name.trim()}>
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner-small" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('recipes.duplicate.confirm')
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
