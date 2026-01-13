import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialForm, type MaterialFormData, type MaterialFormValues } from '../components/MaterialForm'
import type { Material, UpdateMaterialInput } from '../../../shared/types'
import './CreateMaterialPage.css'

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
  const [formValues, setFormValues] = useState<MaterialFormValues | null>(null)

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
        setFormValues({
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
  }, [materialId, t])

  const handleSubmit = async (data: MaterialFormData): Promise<void> => {
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
            <h2 className="page-title">{t('materials.edit.title')}</h2>
          </div>
        </div>
        <div className="form-container">
          <div className="error-state" role="alert">
            <p>{loadError || t('materials.edit.errors.loadFailed')}</p>
            <button className="btn-secondary" onClick={onCancel}>
              {t('common.back')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <MaterialForm
      key={materialId}
      defaultValues={formValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      serverError={serverError}
      title={t('materials.edit.title')}
      subtitle={material?.name}
    />
  )
}
