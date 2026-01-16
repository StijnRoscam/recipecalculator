import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RecipeForm, type RecipeFormData } from '../components/RecipeForm'
import type { CreateRecipeInput } from '../../../shared/types'

interface CreateRecipePageProps {
  onCancel: () => void
  onSuccess: (recipeId: string) => void
}

const defaultFormValues = {
  name: '',
  description: '',
  yieldQuantity: 1,
  yieldUnit: 'portion' as const,
  prepTimeMinutes: null,
  profitMargin: null,
  wastePercentage: null,
  vatPercentage: 21,
  instructions: ''
}

/**
 * Create Recipe page component with form validation
 * Allows users to create new recipes
 */
export function CreateRecipePage({ onCancel, onSuccess }: CreateRecipePageProps): JSX.Element {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const handleSubmit = async (data: RecipeFormData): Promise<void> => {
    setIsSubmitting(true)
    setServerError(null)

    try {
      const input: CreateRecipeInput = {
        name: data.name,
        description: data.description,
        yieldQuantity: data.yieldQuantity,
        yieldUnit: data.yieldUnit,
        prepTimeMinutes: data.prepTimeMinutes,
        profitMargin: data.profitMargin,
        wastePercentage: data.wastePercentage,
        vatPercentage: data.vatPercentage,
        instructions: data.instructions
      }

      const recipe = await window.api.recipes.create(input)
      onSuccess(recipe.id)
    } catch (error) {
      console.error('Failed to create recipe:', error)
      const errorMessage = error instanceof Error ? error.message : ''

      if (errorMessage === 'DUPLICATE_NAME') {
        setServerError(t('recipes.create.errors.duplicateName'))
      } else {
        setServerError(t('recipes.create.errors.createFailed'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <RecipeForm
      defaultValues={defaultFormValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      serverError={serverError}
      title={t('recipes.create.title')}
    />
  )
}
