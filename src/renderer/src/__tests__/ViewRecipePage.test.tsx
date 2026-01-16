import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { ViewRecipePage } from '../pages/ViewRecipePage'
import type { RecipeWithFullDetails } from '../../../shared/types'

// Import translation files
import en from '../i18n/locales/en.json'
import nl from '../i18n/locales/nl.json'

// Create a test i18n instance
const createTestI18n = (language = 'en') => {
  const testI18n = i18n.createInstance()
  testI18n.use(initReactI18next).init({
    lng: language,
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      nl: { translation: nl }
    },
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  })
  return testI18n
}

// Mock recipe data with full details
const mockRecipe: RecipeWithFullDetails = {
  id: '1',
  name: 'Premium Beef Burger',
  description: 'A gourmet beef burger with special seasoning',
  categoryId: null,
  yieldQuantity: 10,
  yieldUnit: 'pieces',
  prepTimeMinutes: 45,
  instructions: 'Mix ingredients thoroughly. Form into patties. Cook to perfection.',
  profitMargin: 40,
  wastePercentage: 5,
  vatPercentage: 21,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  isArchived: false,
  isFavorite: true,
  ingredients: [
    {
      id: 'ing1',
      recipeId: '1',
      materialId: 'mat1',
      quantity: 2.5,
      unit: 'kg',
      sortOrder: 0,
      notes: null,
      material: {
        id: 'mat1',
        name: 'Ground Beef',
        currentPrice: 12.0,
        unitOfMeasure: 'kg'
      }
    },
    {
      id: 'ing2',
      recipeId: '1',
      materialId: 'mat2',
      quantity: 500,
      unit: 'g',
      sortOrder: 1,
      notes: null,
      material: {
        id: 'mat2',
        name: 'Breadcrumbs',
        currentPrice: 4.0,
        unitOfMeasure: 'kg'
      }
    }
  ],
  packaging: [
    {
      id: 'pkg1',
      recipeId: '1',
      packagingMaterialId: 'pkgmat1',
      quantity: 10,
      sortOrder: 0,
      notes: null,
      packagingMaterial: {
        id: 'pkgmat1',
        name: 'Burger Box',
        unitPrice: 0.5,
        unitType: 'piece'
      }
    }
  ],
  ingredientsCost: 32.0,
  packagingCost: 5.0,
  totalCost: 37.0
}

const mockRecipeNoIngredients: RecipeWithFullDetails = {
  ...mockRecipe,
  id: '2',
  name: 'Empty Recipe',
  ingredients: [],
  packaging: [],
  ingredientsCost: 0,
  packagingCost: 0,
  totalCost: 0
}

describe('ViewRecipePage', () => {
  let testI18n: typeof i18n

  beforeEach(() => {
    testI18n = createTestI18n()

    // Mock window.api
    window.api = {
      recipes: {
        get: vi.fn(),
        toggleFavorite: vi.fn(),
        archive: vi.fn(),
        unarchive: vi.fn(),
        duplicate: vi.fn(),
        delete: vi.fn(),
        getAll: vi.fn(),
        create: vi.fn(),
        update: vi.fn()
      }
    } as any
  })

  it('renders loading state initially', () => {
    ;(window.api.recipes.get as any).mockResolvedValue(mockRecipe)

    render(
      <I18nextProvider i18n={testI18n}>
        <ViewRecipePage recipeId="1" onBack={vi.fn()} onEdit={vi.fn()} />
      </I18nextProvider>
    )

    const loadingElements = screen.getAllByText('Loading...')
    expect(loadingElements.length).toBeGreaterThan(0)
  })

  it('renders recipe details correctly', async () => {
    ;(window.api.recipes.get as any).mockResolvedValue(mockRecipe)

    render(
      <I18nextProvider i18n={testI18n}>
        <ViewRecipePage recipeId="1" onBack={vi.fn()} onEdit={vi.fn()} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Premium Beef Burger')).toBeInTheDocument()
    })

    // Check metadata
    expect(screen.getByText('A gourmet beef burger with special seasoning')).toBeInTheDocument()
    expect(screen.getByText('10 pieces')).toBeInTheDocument()
    expect(screen.getByText('45 minutes')).toBeInTheDocument()
  })

  it('displays ingredients table correctly', async () => {
    ;(window.api.recipes.get as any).mockResolvedValue(mockRecipe)

    render(
      <I18nextProvider i18n={testI18n}>
        <ViewRecipePage recipeId="1" onBack={vi.fn()} onEdit={vi.fn()} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Ground Beef')).toBeInTheDocument()
    })

    expect(screen.getByText('Breadcrumbs')).toBeInTheDocument()
  })

  it('displays packaging table correctly', async () => {
    ;(window.api.recipes.get as any).mockResolvedValue(mockRecipe)

    render(
      <I18nextProvider i18n={testI18n}>
        <ViewRecipePage recipeId="1" onBack={vi.fn()} onEdit={vi.fn()} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Burger Box')).toBeInTheDocument()
    })
  })

  it('shows empty state when no ingredients', async () => {
    ;(window.api.recipes.get as any).mockResolvedValue(mockRecipeNoIngredients)

    render(
      <I18nextProvider i18n={testI18n}>
        <ViewRecipePage recipeId="2" onBack={vi.fn()} onEdit={vi.fn()} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('No ingredients added to this recipe.')).toBeInTheDocument()
    })

    expect(screen.getByText('No packaging materials added to this recipe.')).toBeInTheDocument()
  })

  it('displays cost breakdown correctly', async () => {
    ;(window.api.recipes.get as any).mockResolvedValue(mockRecipe)

    render(
      <I18nextProvider i18n={testI18n}>
        <ViewRecipePage recipeId="1" onBack={vi.fn()} onEdit={vi.fn()} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Material Cost:')).toBeInTheDocument()
    })

    expect(screen.getByText('Labor Cost:')).toBeInTheDocument()
    expect(screen.getByText('Packaging Cost:')).toBeInTheDocument()
  })

  it('displays instructions when available', async () => {
    ;(window.api.recipes.get as any).mockResolvedValue(mockRecipe)

    render(
      <I18nextProvider i18n={testI18n}>
        <ViewRecipePage recipeId="1" onBack={vi.fn()} onEdit={vi.fn()} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(
        screen.getByText('Mix ingredients thoroughly. Form into patties. Cook to perfection.')
      ).toBeInTheDocument()
    })
  })

  it('shows archived badge for archived recipes', async () => {
    ;(window.api.recipes.get as any).mockResolvedValue({ ...mockRecipe, isArchived: true })

    render(
      <I18nextProvider i18n={testI18n}>
        <ViewRecipePage recipeId="1" onBack={vi.fn()} onEdit={vi.fn()} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Archived')).toBeInTheDocument()
    })
  })

  it('calls onBack when back button is clicked', async () => {
    ;(window.api.recipes.get as any).mockResolvedValue(mockRecipe)
    const onBack = vi.fn()

    render(
      <I18nextProvider i18n={testI18n}>
        <ViewRecipePage recipeId="1" onBack={onBack} onEdit={vi.fn()} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Premium Beef Burger')).toBeInTheDocument()
    })

    const backButton = screen.getAllByText('Back')[0]
    fireEvent.click(backButton)

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('calls onEdit when edit button is clicked', async () => {
    ;(window.api.recipes.get as any).mockResolvedValue(mockRecipe)
    const onEdit = vi.fn()

    render(
      <I18nextProvider i18n={testI18n}>
        <ViewRecipePage recipeId="1" onBack={vi.fn()} onEdit={onEdit} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Premium Beef Burger')).toBeInTheDocument()
    })

    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)

    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('toggles favorite status when star button is clicked', async () => {
    ;(window.api.recipes.get as any).mockResolvedValue(mockRecipe)
    ;(window.api.recipes.toggleFavorite as any).mockResolvedValue({
      ...mockRecipe,
      isFavorite: false
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <ViewRecipePage recipeId="1" onBack={vi.fn()} onEdit={vi.fn()} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Premium Beef Burger')).toBeInTheDocument()
    })

    const favoriteButton = screen.getByLabelText('Remove from favorites')
    fireEvent.click(favoriteButton)

    await waitFor(() => {
      expect(window.api.recipes.toggleFavorite).toHaveBeenCalledWith('1')
    })
  })

  it('opens delete dialog when delete button is clicked', async () => {
    ;(window.api.recipes.get as any).mockResolvedValue(mockRecipe)

    render(
      <I18nextProvider i18n={testI18n}>
        <ViewRecipePage recipeId="1" onBack={vi.fn()} onEdit={vi.fn()} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Premium Beef Burger')).toBeInTheDocument()
    })

    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText('Delete Recipe?')).toBeInTheDocument()
    })
  })

  it('deletes recipe when confirmed in dialog', async () => {
    ;(window.api.recipes.get as any).mockResolvedValue(mockRecipe)
    ;(window.api.recipes.delete as any).mockResolvedValue(undefined)
    const onBack = vi.fn()

    render(
      <I18nextProvider i18n={testI18n}>
        <ViewRecipePage recipeId="1" onBack={onBack} onEdit={vi.fn()} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Premium Beef Burger')).toBeInTheDocument()
    })

    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText('Delete Recipe?')).toBeInTheDocument()
    })

    const confirmButton = screen.getAllByText('Delete')[1]
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(window.api.recipes.delete).toHaveBeenCalledWith('1')
    })

    await waitFor(() => {
      expect(onBack).toHaveBeenCalled()
    })
  })

  it('handles recipe not found error', async () => {
    ;(window.api.recipes.get as any).mockResolvedValue(null)

    render(
      <I18nextProvider i18n={testI18n}>
        <ViewRecipePage recipeId="999" onBack={vi.fn()} onEdit={vi.fn()} />
      </I18nextProvider>
    )

    await waitFor(() => {
      const errorElements = screen.getAllByText('Recipe not found')
      expect(errorElements.length).toBeGreaterThan(0)
    })
  })

  it('handles load error', async () => {
    ;(window.api.recipes.get as any).mockRejectedValue(new Error('Failed to load'))

    render(
      <I18nextProvider i18n={testI18n}>
        <ViewRecipePage recipeId="1" onBack={vi.fn()} onEdit={vi.fn()} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Failed to load recipe')).toBeInTheDocument()
    })
  })

  it('duplicates recipe when duplicate button is clicked', async () => {
    ;(window.api.recipes.get as any).mockResolvedValue(mockRecipe)
    ;(window.api.recipes.duplicate as any).mockResolvedValue({ ...mockRecipe, id: '2' })
    const onBack = vi.fn()

    render(
      <I18nextProvider i18n={testI18n}>
        <ViewRecipePage recipeId="1" onBack={onBack} onEdit={vi.fn()} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Premium Beef Burger')).toBeInTheDocument()
    })

    const duplicateButton = screen.getByText('Duplicate')
    fireEvent.click(duplicateButton)

    await waitFor(() => {
      expect(window.api.recipes.duplicate).toHaveBeenCalledWith('1')
    })

    await waitFor(() => {
      expect(onBack).toHaveBeenCalled()
    })
  })

  it('archives recipe when archive button is clicked', async () => {
    ;(window.api.recipes.get as any).mockResolvedValue(mockRecipe)
    ;(window.api.recipes.archive as any).mockResolvedValue({ ...mockRecipe, isArchived: true })

    render(
      <I18nextProvider i18n={testI18n}>
        <ViewRecipePage recipeId="1" onBack={vi.fn()} onEdit={vi.fn()} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Premium Beef Burger')).toBeInTheDocument()
    })

    const archiveButton = screen.getByText('Archive')
    fireEvent.click(archiveButton)

    await waitFor(() => {
      expect(window.api.recipes.archive).toHaveBeenCalledWith('1')
    })
  })

  it('unarchives archived recipe when unarchive button is clicked', async () => {
    ;(window.api.recipes.get as any).mockResolvedValue({ ...mockRecipe, isArchived: true })
    ;(window.api.recipes.unarchive as any).mockResolvedValue({ ...mockRecipe, isArchived: false })

    render(
      <I18nextProvider i18n={testI18n}>
        <ViewRecipePage recipeId="1" onBack={vi.fn()} onEdit={vi.fn()} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Premium Beef Burger')).toBeInTheDocument()
    })

    const unarchiveButton = screen.getByText('Unarchive')
    fireEvent.click(unarchiveButton)

    await waitFor(() => {
      expect(window.api.recipes.unarchive).toHaveBeenCalledWith('1')
    })
  })
})
