import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import '../pages/CreateMaterialPage.css'

/**
 * Zod schema for material form validation
 */
export const materialFormSchema = z.object({
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

export type MaterialFormData = z.infer<typeof materialFormSchema>

export interface MaterialFormValues {
  name: string
  currentPrice: number
  unitOfMeasure: 'kg' | 'g'
  supplier: string
  sku: string
  notes: string
}

interface MaterialFormProps {
  defaultValues: MaterialFormValues
  onSubmit: (data: MaterialFormData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  serverError: string | null
  title: string
  subtitle?: string
}

/**
 * Shared material form component used by Create and Edit material pages
 */
export function MaterialForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  serverError,
  title,
  subtitle
}: MaterialFormProps): JSX.Element {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialFormSchema),
    defaultValues
  })

  const getErrorMessage = (errorKey: string | undefined): string | undefined => {
    if (!errorKey) return undefined

    if (errorKey === 'validation.maxLength') {
      return t(errorKey, { max: 200 })
    }

    return t(errorKey)
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
            {title}
            {subtitle && <span className="edit-material-name">: {subtitle}</span>}
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
