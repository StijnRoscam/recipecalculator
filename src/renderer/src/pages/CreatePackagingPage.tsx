import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PackagingForm, type PackagingFormData } from '../components/PackagingForm'
import type { CreatePackagingInput } from '../../../shared/types'
import './CreateMaterialPage.css'

interface CreatePackagingPageProps {
  onCancel: () => void
  onSuccess: () => void
}

const defaultFormValues = {
  name: '',
  unitPrice: 0,
  unitType: 'piece' as const,
  supplier: '',
  sku: '',
  notes: ''
}

/**
 * Create Packaging page component with form validation
 * Allows users to add new packaging materials to the database
 */
export function CreatePackagingPage({
  onCancel,
  onSuccess
}: CreatePackagingPageProps): JSX.Element {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const handleSubmit = async (data: PackagingFormData): Promise<void> => {
    setIsSubmitting(true)
    setServerError(null)

    try {
      const input: CreatePackagingInput = {
        name: data.name,
        unitPrice: data.unitPrice,
        unitType: data.unitType,
        supplier: data.supplier,
        sku: data.sku,
        notes: data.notes
      }

      await window.api.packaging.create(input)
      onSuccess()
    } catch (error) {
      console.error('Failed to create packaging:', error)
      const errorMessage = error instanceof Error ? error.message : ''

      if (errorMessage === 'DUPLICATE_NAME') {
        setServerError(t('packaging.create.errors.duplicateName'))
      } else {
        setServerError(t('packaging.create.errors.createFailed'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PackagingForm
      defaultValues={defaultFormValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      serverError={serverError}
      title={t('packaging.create.title')}
    />
  )
}
