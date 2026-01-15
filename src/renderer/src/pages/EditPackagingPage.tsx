import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  PackagingForm,
  type PackagingFormData,
  type PackagingFormValues,
  type PackagingUnitType
} from '../components/PackagingForm'
import type { PackagingMaterial, UpdatePackagingInput } from '../../../shared/types'
import './CreateMaterialPage.css'

interface EditPackagingPageProps {
  packagingId: string
  onCancel: () => void
  onSuccess: () => void
}

/**
 * Edit Packaging page component with form validation
 * Allows users to update existing packaging materials in the database
 */
export function EditPackagingPage({
  packagingId,
  onCancel,
  onSuccess
}: EditPackagingPageProps): JSX.Element {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [packaging, setPackaging] = useState<PackagingMaterial | null>(null)
  const [formValues, setFormValues] = useState<PackagingFormValues | null>(null)

  // Load packaging data on mount
  useEffect(() => {
    const fetchPackaging = async (): Promise<void> => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const data = await window.api.packaging.get(packagingId)

        if (!data) {
          setLoadError(t('packaging.edit.errors.notFound'))
          return
        }

        setPackaging(data)
        setFormValues({
          name: data.name,
          unitPrice: data.unitPrice,
          unitType: data.unitType as PackagingUnitType,
          supplier: data.supplier || '',
          sku: data.sku || '',
          notes: data.notes || ''
        })
      } catch (error) {
        console.error('Failed to fetch packaging:', error)
        setLoadError(t('packaging.edit.errors.loadFailed'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchPackaging()
  }, [packagingId, t])

  const handleSubmit = async (data: PackagingFormData): Promise<void> => {
    setIsSubmitting(true)
    setServerError(null)

    try {
      const input: UpdatePackagingInput = {
        name: data.name,
        unitPrice: data.unitPrice,
        unitType: data.unitType,
        supplier: data.supplier,
        sku: data.sku,
        notes: data.notes
      }

      await window.api.packaging.update(packagingId, input)
      onSuccess()
    } catch (error) {
      console.error('Failed to update packaging:', error)
      const errorMessage = error instanceof Error ? error.message : ''

      if (errorMessage === 'DUPLICATE_NAME') {
        setServerError(t('packaging.edit.errors.duplicateName'))
      } else if (errorMessage === 'NOT_FOUND') {
        setServerError(t('packaging.edit.errors.notFound'))
      } else {
        setServerError(t('packaging.edit.errors.updateFailed'))
      }
    } finally {
      setIsSubmitting(false)
    }
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
            <h2 className="page-title">{t('packaging.edit.title')}</h2>
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

  // Show error state if packaging not found
  if (loadError || !formValues) {
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
            <h2 className="page-title">{t('packaging.edit.title')}</h2>
          </div>
        </div>
        <div className="form-container">
          <div className="error-state" role="alert">
            <p>{loadError || t('packaging.edit.errors.loadFailed')}</p>
            <button className="btn-secondary" onClick={onCancel}>
              {t('common.back')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PackagingForm
      key={packagingId}
      defaultValues={formValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      serverError={serverError}
      title={t('packaging.edit.title')}
      subtitle={packaging?.name}
    />
  )
}
