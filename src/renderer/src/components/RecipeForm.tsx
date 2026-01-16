import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import '../pages/CreateMaterialPage.css'

/**
 * Zod schema for recipe form validation
 */
export const recipeFormSchema = z.object({
  name: z
    .string()
    .min(1, 'validation.required')
    .max(200, 'validation.maxLength')
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(1000, 'validation.maxLength')
    .optional()
    .transform((val) => val?.trim() || null),
  yieldQuantity: z
    .number({ invalid_type_error: 'validation.invalidNumber' })
    .positive('validation.positiveNumber')
    .finite('validation.invalidNumber'),
  yieldUnit: z.enum(['portion', 'piece', 'kg', 'g', 'l', 'ml']),
  prepTimeMinutes: z
    .number({ invalid_type_error: 'validation.invalidNumber' })
    .int('validation.invalidNumber')
    .min(0, 'validation.positiveNumber')
    .nullable()
    .optional()
    .transform((val) => (val === 0 || val === undefined ? null : val)),
  profitMargin: z
    .number({ invalid_type_error: 'validation.invalidNumber' })
    .min(0, 'validation.positiveNumber')
    .max(100, 'recipes.create.errors.percentageMax')
    .nullable()
    .optional()
    .transform((val) => (val === undefined ? null : val)),
  wastePercentage: z
    .number({ invalid_type_error: 'validation.invalidNumber' })
    .min(0, 'validation.positiveNumber')
    .max(100, 'recipes.create.errors.percentageMax')
    .nullable()
    .optional()
    .transform((val) => (val === undefined ? null : val)),
  vatPercentage: z
    .number({ invalid_type_error: 'validation.invalidNumber' })
    .min(0, 'validation.positiveNumber')
    .max(100, 'recipes.create.errors.percentageMax')
    .nullable()
    .optional()
    .transform((val) => (val === undefined ? null : val)),
  instructions: z
    .string()
    .max(5000, 'validation.maxLength')
    .optional()
    .transform((val) => val?.trim() || null)
})

export type RecipeFormData = z.infer<typeof recipeFormSchema>

export interface RecipeFormValues {
  name: string
  description: string
  yieldQuantity: number
  yieldUnit: 'portion' | 'piece' | 'kg' | 'g' | 'l' | 'ml'
  prepTimeMinutes: number | null
  profitMargin: number | null
  wastePercentage: number | null
  vatPercentage: number | null
  instructions: string
}

interface RecipeFormProps {
  defaultValues: RecipeFormValues
  onSubmit: (data: RecipeFormData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  serverError: string | null
  title: string
  subtitle?: string
}

/**
 * Shared recipe form component used by Create and Edit recipe pages
 */
export function RecipeForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  serverError,
  title,
  subtitle
}: RecipeFormProps): JSX.Element {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      ...defaultValues,
      prepTimeMinutes: defaultValues.prepTimeMinutes ?? undefined,
      profitMargin: defaultValues.profitMargin ?? undefined,
      wastePercentage: defaultValues.wastePercentage ?? undefined,
      vatPercentage: defaultValues.vatPercentage ?? undefined
    }
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
              {t('recipes.create.fields.name')} <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              className={`form-input ${errors.name ? 'form-input-error' : ''}`}
              placeholder={t('recipes.create.fields.namePlaceholder')}
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
              aria-invalid={errors.description ? 'true' : 'false'}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && (
              <span id="description-error" className="field-error" role="alert">
                {getErrorMessage(errors.description.message)}
              </span>
            )}
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
                placeholder={t('recipes.create.fields.yieldQuantityPlaceholder')}
                {...register('yieldQuantity', { valueAsNumber: true })}
                aria-invalid={errors.yieldQuantity ? 'true' : 'false'}
                aria-describedby={errors.yieldQuantity ? 'yieldQuantity-error' : undefined}
              />
              {errors.yieldQuantity && (
                <span id="yieldQuantity-error" className="field-error" role="alert">
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
                className={`form-input form-select ${errors.yieldUnit ? 'form-input-error' : ''}`}
                {...register('yieldUnit')}
                aria-invalid={errors.yieldUnit ? 'true' : 'false'}
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
                className={`form-input ${errors.prepTimeMinutes ? 'form-input-error' : ''}`}
                placeholder={t('recipes.create.fields.prepTimeMinutesPlaceholder')}
                {...register('prepTimeMinutes', {
                  setValueAs: (v) => (v === '' || v === null ? null : Number(v))
                })}
                aria-invalid={errors.prepTimeMinutes ? 'true' : 'false'}
                aria-describedby={errors.prepTimeMinutes ? 'prepTimeMinutes-error' : undefined}
              />
              {errors.prepTimeMinutes && (
                <span id="prepTimeMinutes-error" className="field-error" role="alert">
                  {getErrorMessage(errors.prepTimeMinutes.message)}
                </span>
              )}
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
                className={`form-input ${errors.profitMargin ? 'form-input-error' : ''}`}
                placeholder={t('recipes.create.fields.profitMarginPlaceholder')}
                {...register('profitMargin', {
                  setValueAs: (v) => (v === '' || v === null ? null : Number(v))
                })}
                aria-invalid={errors.profitMargin ? 'true' : 'false'}
                aria-describedby={errors.profitMargin ? 'profitMargin-error' : undefined}
              />
              {errors.profitMargin && (
                <span id="profitMargin-error" className="field-error" role="alert">
                  {getErrorMessage(errors.profitMargin.message)}
                </span>
              )}
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
                className={`form-input ${errors.wastePercentage ? 'form-input-error' : ''}`}
                placeholder={t('recipes.create.fields.wastePercentagePlaceholder')}
                {...register('wastePercentage', {
                  setValueAs: (v) => (v === '' || v === null ? null : Number(v))
                })}
                aria-invalid={errors.wastePercentage ? 'true' : 'false'}
                aria-describedby={errors.wastePercentage ? 'wastePercentage-error' : undefined}
              />
              {errors.wastePercentage && (
                <span id="wastePercentage-error" className="field-error" role="alert">
                  {getErrorMessage(errors.wastePercentage.message)}
                </span>
              )}
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
                className={`form-input ${errors.vatPercentage ? 'form-input-error' : ''}`}
                placeholder={t('recipes.create.fields.vatPercentagePlaceholder')}
                {...register('vatPercentage', {
                  setValueAs: (v) => (v === '' || v === null ? null : Number(v))
                })}
                aria-invalid={errors.vatPercentage ? 'true' : 'false'}
                aria-describedby={errors.vatPercentage ? 'vatPercentage-error' : undefined}
              />
              {errors.vatPercentage && (
                <span id="vatPercentage-error" className="field-error" role="alert">
                  {getErrorMessage(errors.vatPercentage.message)}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="instructions" className="form-label">
              {t('recipes.create.fields.instructions')}
            </label>
            <textarea
              id="instructions"
              className={`form-input form-textarea ${errors.instructions ? 'form-input-error' : ''}`}
              placeholder={t('recipes.create.fields.instructionsPlaceholder')}
              rows={6}
              {...register('instructions')}
              aria-invalid={errors.instructions ? 'true' : 'false'}
              aria-describedby={errors.instructions ? 'instructions-error' : undefined}
            />
            {errors.instructions && (
              <span id="instructions-error" className="field-error" role="alert">
                {getErrorMessage(errors.instructions.message)}
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
