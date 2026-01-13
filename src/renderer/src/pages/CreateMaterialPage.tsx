import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialForm, type MaterialFormData } from '../components/MaterialForm'
import type { CreateMaterialInput } from '../../../shared/types'
import './CreateMaterialPage.css'

interface CreateMaterialPageProps {
  onCancel: () => void
  onSuccess: () => void
}

const defaultFormValues = {
  name: '',
  currentPrice: 0,
  unitOfMeasure: 'kg' as const,
  supplier: '',
  sku: '',
  notes: ''
}

/**
 * Create Material page component with form validation
 * Allows users to add new source materials to the database
 */
export function CreateMaterialPage({
  onCancel,
  onSuccess
}: CreateMaterialPageProps): JSX.Element {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const handleSubmit = async (data: MaterialFormData): Promise<void> => {
    setIsSubmitting(true)
    setServerError(null)

    try {
      const input: CreateMaterialInput = {
        name: data.name,
        currentPrice: data.currentPrice,
        unitOfMeasure: data.unitOfMeasure,
        supplier: data.supplier,
        sku: data.sku,
        notes: data.notes
      }

      await window.api.materials.create(input)
      onSuccess()
    } catch (error) {
      console.error('Failed to create material:', error)
      const errorMessage = error instanceof Error ? error.message : ''

      if (errorMessage === 'DUPLICATE_NAME') {
        setServerError(t('materials.create.errors.duplicateName'))
      } else {
        setServerError(t('materials.create.errors.createFailed'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MaterialForm
      defaultValues={defaultFormValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      serverError={serverError}
      title={t('materials.create.title')}
    />
  )
}
