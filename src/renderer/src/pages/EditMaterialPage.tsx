import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Material, UpdateMaterialInput } from '../../../shared/types'
import './CreateMaterialPage.css'

/**
 * Zod schema for material form validation
 */
const editMaterialSchema = z.object({
  name: z
    .string()
    .min(1, 'validation.required')
    .max(200, 'validation.maxLength')
    .transform((val) => val.trim()),
  currentPrice: z
    .number({ invalid_type_error: 'validation.invalidNumber' })
    .min(0, 'validation.positiveNumber'),
  unitOfMeasure: z.enum(['kg', 'g']),
  supplier: z
    .string()
    .max(200, 'validation.maxLength')
    .optional()
    .transform((val) => val?.trim() || null),
  sku: z
    .string()
    .max(100, 'validation.maxLength')
    .optional()
    .transform((val) => val?.trim() || null),
  notes: z
    .string()
    .max(1000, 'validation.maxLength')
    .optional()
    .transform((val) => val?.trim() || null)
})

type EditMaterialFormData = z.infer<typeof editMaterialSchema>

interface EditMaterialPageProps {
  materialId: string
  onCancel: () => void
  onSuccess: () => void
}

/**
 * Edit Material page component with form validation
 * Allows users to update existing source materials in the database
 */
export function EditMaterialPage({
  materialId,
  onCancel,
  onSuccess
}: EditMaterialPageProps): JSX.Element {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [material, setMaterial] = useState<Material | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<EditMaterialFormData>({
    resolver: zodResolver(editMaterialSchema),
    defaultValues: {
      name: '',
      currentPrice: 0,
      unitOfMeasure: 'kg',
      supplier: '',
      sku: '',
      notes: ''
    }
  })

  // Load material data on mount
  useEffect(() => {
    const fetchMaterial = async (): Promise<void> => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const data = await window.api.materials.get(materialId)

        if (!data) {
          setLoadError(t('materials.edit.errors.notFound'))
          return
        }

        setMaterial(data)

        // Reset form with loaded values
        reset({
          name: data.name,
          currentPrice: data.currentPrice,
          unitOfMeasure: data.unitOfMeasure as 'kg' | 'g',
          supplier: data.supplier || '',
          sku: data.sku || '',
          notes: data.notes || ''
        })
      } catch (error) {
        console.error('Failed to fetch material:', error)
        setLoadError(t('materials.edit.errors.loadFailed'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchMaterial()
  }, [materialId, reset, t])

  const onSubmit = async (data: EditMaterialFormData): Promise<void> => {
    setIsSubmitting(true)
    setServerError(null)

    try {
      const input: UpdateMaterialInput = {
        name: data.name,
        currentPrice: data.currentPrice,
        unitOfMeasure: data.unitOfMeasure,
        supplier: data.supplier,
        sku: data.sku,
        notes: data.notes
      }

      await window.api.materials.update(materialId, input)
      onSuccess()
    } catch (error) {
      console.error('Failed to update material:', error)
      const errorMessage = error instanceof Error ? error.message : ''

      if (errorMessage === 'DUPLICATE_NAME') {
        setServerError(t('materials.edit.errors.duplicateName'))
      } else if (errorMessage === 'NOT_FOUND') {
        setServerError(t('materials.edit.errors.notFound'))
      } else {
        setServerError(t('materials.edit.errors.updateFailed'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const getErrorMessage = (errorKey: string | undefined): string | undefined => {
    if (!errorKey) return undefined

    // Handle validation keys with parameters
    if (errorKey === 'validation.maxLength') {
      return t(errorKey, { max: 200 })
    }

    return t(errorKey)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="create-material-page">
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
            <h2 className="page-title">{t('materials.edit.title')}</h2>
          </div>
        </div>
        <div className="form-container">
          <div className="loading-state">
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state if material not found
  if (loadError) {
    return (
      <div className="create-material-page">
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
            <h2 className="page-title">{t('materials.edit.title')}</h2>
          </div>
        </div>
        <div className="form-container">
          <div className="error-state" role="alert">
            <p>{loadError}</p>
            <button className="btn-secondary" onClick={onCancel}>
              {t('common.back')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="create-material-page">
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
          <h2 className="page-title">
            {t('materials.edit.title')}
            {material && <span className="edit-material-name">: {material.name}</span>}
          </h2>
        </div>
      </div>

      <div className="form-container">
        {serverError && (
          <div className="server-error" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              {t('materials.create.fields.name')} <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              className={`form-input ${errors.name ? 'form-input-error' : ''}`}
              placeholder={t('materials.create.fields.namePlaceholder')}
              {...register('name')}
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <span id="name-error" className="field-error" role="alert">
                {getErrorMessage(errors.name.message)}
              </span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="currentPrice" className="form-label">
                {t('materials.create.fields.currentPrice')} <span className="required">*</span>
              </label>
              <div className="price-input-wrapper">
                <span className="price-currency">EUR</span>
                <input
                  id="currentPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  className={`form-input price-input ${errors.currentPrice ? 'form-input-error' : ''}`}
                  placeholder={t('materials.create.fields.currentPricePlaceholder')}
                  {...register('currentPrice', { valueAsNumber: true })}
                  aria-invalid={errors.currentPrice ? 'true' : 'false'}
                  aria-describedby={errors.currentPrice ? 'price-error' : undefined}
                />
              </div>
              {errors.currentPrice && (
                <span id="price-error" className="field-error" role="alert">
                  {getErrorMessage(errors.currentPrice.message)}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="unitOfMeasure" className="form-label">
                {t('materials.create.fields.unitOfMeasure')} <span className="required">*</span>
              </label>
              <select
                id="unitOfMeasure"
                className={`form-input form-select ${errors.unitOfMeasure ? 'form-input-error' : ''}`}
                {...register('unitOfMeasure')}
                aria-invalid={errors.unitOfMeasure ? 'true' : 'false'}
              >
                <option value="kg">{t('materials.create.units.kg')}</option>
                <option value="g">{t('materials.create.units.g')}</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="supplier" className="form-label">
                {t('materials.create.fields.supplier')}
              </label>
              <input
                id="supplier"
                type="text"
                className={`form-input ${errors.supplier ? 'form-input-error' : ''}`}
                placeholder={t('materials.create.fields.supplierPlaceholder')}
                {...register('supplier')}
                aria-invalid={errors.supplier ? 'true' : 'false'}
                aria-describedby={errors.supplier ? 'supplier-error' : undefined}
              />
              {errors.supplier && (
                <span id="supplier-error" className="field-error" role="alert">
                  {getErrorMessage(errors.supplier.message)}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="sku" className="form-label">
                {t('materials.create.fields.sku')}
              </label>
              <input
                id="sku"
                type="text"
                className={`form-input ${errors.sku ? 'form-input-error' : ''}`}
                placeholder={t('materials.create.fields.skuPlaceholder')}
                {...register('sku')}
                aria-invalid={errors.sku ? 'true' : 'false'}
                aria-describedby={errors.sku ? 'sku-error' : undefined}
              />
              {errors.sku && (
                <span id="sku-error" className="field-error" role="alert">
                  {getErrorMessage(errors.sku.message)}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              {t('materials.create.fields.notes')}
            </label>
            <textarea
              id="notes"
              className={`form-input form-textarea ${errors.notes ? 'form-input-error' : ''}`}
              placeholder={t('materials.create.fields.notesPlaceholder')}
              rows={4}
              {...register('notes')}
              aria-invalid={errors.notes ? 'true' : 'false'}
              aria-describedby={errors.notes ? 'notes-error' : undefined}
            />
            {errors.notes && (
              <span id="notes-error" className="field-error" role="alert">
                {getErrorMessage(errors.notes.message)}
              </span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
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
    </div>
  )
}
