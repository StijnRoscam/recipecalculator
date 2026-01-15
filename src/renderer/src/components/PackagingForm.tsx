import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import '../pages/CreateMaterialPage.css'

/**
 * Unit type options for packaging materials
 */
export const PACKAGING_UNIT_TYPES = ['piece', 'meter', 'roll', 'sheet', 'box', 'bag'] as const
export type PackagingUnitType = (typeof PACKAGING_UNIT_TYPES)[number]

/**
 * Zod schema for packaging form validation
 */
export const packagingFormSchema = z.object({
  name: z
    .string()
    .min(1, 'validation.required')
    .max(200, 'validation.maxLength')
    .transform((val) => val.trim()),
  unitPrice: z
    .number({ invalid_type_error: 'validation.invalidNumber' })
    .min(0, 'validation.positiveNumber'),
  unitType: z.enum(PACKAGING_UNIT_TYPES),
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

export type PackagingFormData = z.infer<typeof packagingFormSchema>

export interface PackagingFormValues {
  name: string
  unitPrice: number
  unitType: PackagingUnitType
  supplier: string
  sku: string
  notes: string
}

interface PackagingFormProps {
  defaultValues: PackagingFormValues
  onSubmit: (data: PackagingFormData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  serverError: string | null
  title: string
  subtitle?: string
}

/**
 * Shared packaging form component used by Create and Edit packaging pages
 */
export function PackagingForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  serverError,
  title,
  subtitle
}: PackagingFormProps): JSX.Element {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PackagingFormData>({
    resolver: zodResolver(packagingFormSchema),
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
              {t('packaging.create.fields.name')} <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              className={`form-input ${errors.name ? 'form-input-error' : ''}`}
              placeholder={t('packaging.create.fields.namePlaceholder')}
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
              <label htmlFor="unitPrice" className="form-label">
                {t('packaging.create.fields.unitPrice')} <span className="required">*</span>
              </label>
              <div className="price-input-wrapper">
                <span className="price-currency">EUR</span>
                <input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  className={`form-input price-input ${errors.unitPrice ? 'form-input-error' : ''}`}
                  placeholder={t('packaging.create.fields.unitPricePlaceholder')}
                  {...register('unitPrice', { valueAsNumber: true })}
                  aria-invalid={errors.unitPrice ? 'true' : 'false'}
                  aria-describedby={errors.unitPrice ? 'price-error' : undefined}
                />
              </div>
              {errors.unitPrice && (
                <span id="price-error" className="field-error" role="alert">
                  {getErrorMessage(errors.unitPrice.message)}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="unitType" className="form-label">
                {t('packaging.create.fields.unitType')} <span className="required">*</span>
              </label>
              <select
                id="unitType"
                className={`form-input form-select ${errors.unitType ? 'form-input-error' : ''}`}
                {...register('unitType')}
                aria-invalid={errors.unitType ? 'true' : 'false'}
              >
                {PACKAGING_UNIT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`packaging.unitTypes.${type}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="supplier" className="form-label">
                {t('packaging.create.fields.supplier')}
              </label>
              <input
                id="supplier"
                type="text"
                className={`form-input ${errors.supplier ? 'form-input-error' : ''}`}
                placeholder={t('packaging.create.fields.supplierPlaceholder')}
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
                {t('packaging.create.fields.sku')}
              </label>
              <input
                id="sku"
                type="text"
                className={`form-input ${errors.sku ? 'form-input-error' : ''}`}
                placeholder={t('packaging.create.fields.skuPlaceholder')}
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
              {t('packaging.create.fields.notes')}
            </label>
            <textarea
              id="notes"
              className={`form-input form-textarea ${errors.notes ? 'form-input-error' : ''}`}
              placeholder={t('packaging.create.fields.notesPlaceholder')}
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
