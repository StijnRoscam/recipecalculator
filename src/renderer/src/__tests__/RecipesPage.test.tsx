import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { RecipesPage } from '../pages/RecipesPage'
import type { RecipeWithDetails } from '../../../shared/types'

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

// Mock recipes data
const mockRecipes: RecipeWithDetails[] = [
  {
    id: '1',
    name: 'Beef Stew',
    description: 'A hearty beef stew with vegetables and rich gravy',
    categoryId: null,
    yieldQuantity: 4,
    yieldUnit: 'portions',
    prepTimeMinutes: 120,
    instructions: null,
    profitMargin: 30,
    wastePercentage: 5,
    vatPercentage: 9,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isArchived: false,
    isFavorite: true,
    ingredientsCost: 15.5,
    packagingCost: 2.0,
    totalCost: 17.5,
    ingredientCount: 5,
    packagingCount: 2
  },
  {
    id: '2',
    name: 'Chicken Curry',
    description: 'Spicy chicken curry with basmati rice',
    categoryId: null,
    yieldQuantity: 6,
    yieldUnit: 'portions',
    prepTimeMinutes: 60,
    instructions: null,
    profitMargin: 25,
    wastePercentage: 3,
    vatPercentage: 9,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    isArchived: false,
    isFavorite: false,
    ingredientsCost: 12.0,
    packagingCost: 1.5,
    totalCost: 13.5,
    ingredientCount: 8,
    packagingCount: 1
  },
  {
    id: '3',
    name: 'Archived Recipe',
    description: 'This recipe is archived',
    categoryId: null,
    yieldQuantity: 2,
    yieldUnit: 'portions',
    prepTimeMinutes: 30,
    instructions: null,
    profitMargin: null,
    wastePercentage: null,
    vatPercentage: null,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
    isArchived: true,
    isFavorite: false,
    ingredientsCost: 5.0,
    packagingCost: 0.5,
    totalCost: 5.5,
    ingredientCount: 2,
    packagingCount: 1
  }
]

// Setup window.api mock
const mockGetAll = vi.fn()
const mockToggleFavorite = vi.fn()
const mockArchive = vi.fn()
const mockUnarchive = vi.fn()
const mockGetSuggestedDuplicateName = vi.fn()
const mockCheckNameAvailable = vi.fn()
const mockDuplicate = vi.fn()
const mockDelete = vi.fn()

beforeEach(() => {
  // Reset mock before each test
  mockGetAll.mockReset()
  mockToggleFavorite.mockReset()
  mockArchive.mockReset()
  mockUnarchive.mockReset()
  mockGetSuggestedDuplicateName.mockReset()
  mockCheckNameAvailable.mockReset()
  mockDuplicate.mockReset()
  mockDelete.mockReset()

  // Default implementations for duplicate dialog
  mockGetSuggestedDuplicateName.mockResolvedValue('Test Recipe (Copy)')
  mockCheckNameAvailable.mockResolvedValue(true)

  // Setup window.api mock
  Object.defineProperty(window, 'api', {
    value: {
      recipes: {
        getAll: mockGetAll,
        toggleFavorite: mockToggleFavorite,
        archive: mockArchive,
        unarchive: mockUnarchive,
        getSuggestedDuplicateName: mockGetSuggestedDuplicateName,
        checkNameAvailable: mockCheckNameAvailable,
        duplicate: mockDuplicate,
        delete: mockDelete
      }
    },
    writable: true,
    configurable: true
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('RecipesPage', () => {
  let testI18n: typeof i18n
  const mockOnCreateRecipe = vi.fn()
  const mockOnViewRecipe = vi.fn()
  const mockOnEditRecipe = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCreateRecipe.mockReset()
    mockOnViewRecipe.mockReset()
    mockOnEditRecipe.mockReset()
  })

  it('shows loading state initially', () => {
    mockGetAll.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
      </I18nextProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows empty state when no recipes exist', async () => {
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(
        screen.getByText('No recipes found. Create your first recipe to get started.')
      ).toBeInTheDocument()
    })
  })

  it('displays recipes in a grid', async () => {
    mockGetAll.mockResolvedValue(mockRecipes.filter((r) => !r.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Beef Stew')).toBeInTheDocument()
      expect(screen.getByText('Chicken Curry')).toBeInTheDocument()
    })

    // Check price formatting
    expect(screen.getByText('€17.50')).toBeInTheDocument()
    expect(screen.getByText('€13.50')).toBeInTheDocument()
  })

  it('shows Create Recipe button', async () => {
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Create Recipe')).toBeInTheDocument()
    })
  })

  it('calls onCreateRecipe when Create Recipe button is clicked', async () => {
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Create Recipe')).toBeInTheDocument()
    })

    const createButton = screen.getByText('Create Recipe')
    fireEvent.click(createButton)

    expect(mockOnCreateRecipe).toHaveBeenCalledTimes(1)
  })

  it('calls onViewRecipe when recipe card is clicked', async () => {
    mockGetAll.mockResolvedValue(mockRecipes.filter((r) => !r.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage
          onCreateRecipe={mockOnCreateRecipe}
          onViewRecipe={mockOnViewRecipe}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Beef Stew')).toBeInTheDocument()
    })

    // Click the recipe card (by clicking on the title)
    const recipeCard = screen.getByText('Beef Stew').closest('.recipe-card')
    if (recipeCard) {
      fireEvent.click(recipeCard)
    }

    expect(mockOnViewRecipe).toHaveBeenCalledWith('1')
  })

  it('calls onEditRecipe when Edit button is clicked', async () => {
    mockGetAll.mockResolvedValue(mockRecipes.filter((r) => !r.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage
          onCreateRecipe={mockOnCreateRecipe}
          onEditRecipe={mockOnEditRecipe}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Beef Stew')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByTitle('Edit')
    fireEvent.click(editButtons[0])

    expect(mockOnEditRecipe).toHaveBeenCalledWith('1')
  })

  it('shows favorites filter checkbox unchecked by default', async () => {
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
      </I18nextProvider>
    )

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      // First checkbox is favorites, second is archived
      expect(checkboxes[0]).not.toBeChecked()
    })
  })

  it('shows Show archived checkbox unchecked by default', async () => {
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
      </I18nextProvider>
    )

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      // Second checkbox is archived
      expect(checkboxes[1]).not.toBeChecked()
    })
  })

  it('fetches recipes with includeArchived=false by default', async () => {
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenCalledWith(false)
    })
  })

  it('fetches recipes with includeArchived=true when checkbox is checked', async () => {
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenCalledWith(false)
    })

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[1]) // Second checkbox is archived

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenCalledWith(true)
    })
  })

  it('displays archived badge for archived recipes', async () => {
    mockGetAll.mockResolvedValue(mockRecipes)

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
      </I18nextProvider>
    )

    // Check the show archived checkbox
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[1])

    await waitFor(() => {
      expect(screen.getByText('Archived')).toBeInTheDocument()
    })
  })

  it('shows error state when API call fails', async () => {
    mockGetAll.mockRejectedValue(new Error('Network error'))

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })
  })

  it('retries fetching recipes when retry button is clicked', async () => {
    mockGetAll.mockRejectedValueOnce(new Error('Network error'))
    mockGetAll.mockResolvedValueOnce([])

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    })

    const retryButton = screen.getByText('Retry')
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('No recipes found. Create your first recipe to get started.')).toBeInTheDocument()
    })

    expect(mockGetAll).toHaveBeenCalledTimes(2)
  })

  it('renders in Dutch when language is set to Dutch', async () => {
    testI18n = createTestI18n('nl')
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Recept aanmaken')).toBeInTheDocument()
      expect(screen.getByText('Gearchiveerde recepten tonen')).toBeInTheDocument()
      expect(
        screen.getByText('Geen recepten gevonden. Maak je eerste recept aan om te beginnen.')
      ).toBeInTheDocument()
    })
  })

  it('truncates long descriptions', async () => {
    const longDescriptionRecipe = {
      ...mockRecipes[0],
      description: 'This is a very long description that should be truncated because it exceeds the maximum allowed length for display in the card view of the recipes grid.'
    }
    mockGetAll.mockResolvedValue([longDescriptionRecipe])

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Beef Stew')).toBeInTheDocument()
    })

    // The description should be truncated and end with ...
    const description = screen.getByText(/This is a very long description/)
    expect(description.textContent).toContain('...')
  })
})

describe('RecipesPage search functionality', () => {
  let testI18n: typeof i18n
  const mockOnCreateRecipe = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCreateRecipe.mockReset()
  })

  it('shows search input with placeholder', async () => {
    mockGetAll.mockResolvedValue(mockRecipes.filter((r) => !r.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
      </I18nextProvider>
    )

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search recipes...')
      expect(searchInput).toBeInTheDocument()
    })
  })

  it('filters recipes by name as user types (case-insensitive)', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockRecipes.filter((r) => !r.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef Stew')).toBeInTheDocument()
    expect(screen.getByText('Chicken Curry')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search recipes...')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'beef' } })
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(screen.getByText('Beef Stew')).toBeInTheDocument()
    expect(screen.queryByText('Chicken Curry')).not.toBeInTheDocument()

    vi.useRealTimers()
  })

  it('shows no results message when search has no matches', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockRecipes.filter((r) => !r.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef Stew')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search recipes...')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'xyz' } })
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(screen.getByText('No recipes match your search')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('shows clear button when search has text', async () => {
    mockGetAll.mockResolvedValue(mockRecipes.filter((r) => !r.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Beef Stew')).toBeInTheDocument()
    })

    // Clear button should not be visible initially
    expect(screen.queryByTitle('Clear search')).not.toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search recipes...')
    fireEvent.change(searchInput, { target: { value: 'test' } })

    // Clear button should now be visible
    expect(screen.getByTitle('Clear search')).toBeInTheDocument()
  })

  it('clears search when clear button is clicked', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockRecipes.filter((r) => !r.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef Stew')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search recipes...')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'beef' } })
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(screen.queryByText('Chicken Curry')).not.toBeInTheDocument()

    // Click clear button
    const clearButton = screen.getByTitle('Clear search')

    await act(async () => {
      fireEvent.click(clearButton)
    })

    // Verify input value is cleared immediately
    expect((searchInput as HTMLInputElement).value).toBe('')

    // Wait for debounce to update filtered results
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(screen.getByText('Beef Stew')).toBeInTheDocument()
    expect(screen.getByText('Chicken Curry')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('clears search when Escape key is pressed', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockRecipes.filter((r) => !r.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef Stew')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search recipes...')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'beef' } })
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(screen.queryByText('Chicken Curry')).not.toBeInTheDocument()

    // Press Escape
    await act(async () => {
      fireEvent.keyDown(window, { key: 'Escape' })
    })

    // Verify input value is cleared immediately
    expect((searchInput as HTMLInputElement).value).toBe('')

    // Wait for debounce to update filtered results
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(screen.getByText('Beef Stew')).toBeInTheDocument()
    expect(screen.getByText('Chicken Curry')).toBeInTheDocument()

    vi.useRealTimers()
  })
})

describe('RecipesPage favorites filter', () => {
  let testI18n: typeof i18n
  const mockOnCreateRecipe = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCreateRecipe.mockReset()
  })

  it('shows only favorites when favorites filter is enabled', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockRecipes.filter((r) => !r.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef Stew')).toBeInTheDocument()
    expect(screen.getByText('Chicken Curry')).toBeInTheDocument()

    // Enable favorites filter
    const favoritesCheckbox = screen.getAllByRole('checkbox')[0]
    await act(async () => {
      fireEvent.click(favoritesCheckbox)
    })

    // Only Beef Stew is a favorite
    expect(screen.getByText('Beef Stew')).toBeInTheDocument()
    expect(screen.queryByText('Chicken Curry')).not.toBeInTheDocument()

    vi.useRealTimers()
  })

  it('shows no favorites message when no favorites exist', async () => {
    vi.useFakeTimers()
    // Return recipes with no favorites
    mockGetAll.mockResolvedValue([{ ...mockRecipes[1], isFavorite: false }])

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Chicken Curry')).toBeInTheDocument()

    // Enable favorites filter
    const favoritesCheckbox = screen.getAllByRole('checkbox')[0]
    await act(async () => {
      fireEvent.click(favoritesCheckbox)
    })

    expect(
      screen.getByText('No favorite recipes. Star a recipe to add it to your favorites.')
    ).toBeInTheDocument()

    vi.useRealTimers()
  })
})

describe('RecipesPage favorite toggle', () => {
  let testI18n: typeof i18n
  const mockOnCreateRecipe = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCreateRecipe.mockReset()
  })

  it('calls toggleFavorite API when favorite button is clicked', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockRecipes.filter((r) => !r.isArchived))
    mockToggleFavorite.mockResolvedValue({ ...mockRecipes[0], isFavorite: false })

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef Stew')).toBeInTheDocument()

    // Find the favorite button for Beef Stew (it's the first one, already favorited)
    const favoriteButtons = screen.getAllByTitle('Remove from favorites')

    await act(async () => {
      fireEvent.click(favoriteButtons[0])
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(mockToggleFavorite).toHaveBeenCalledWith('1')

    vi.useRealTimers()
  })

  it('shows success message after toggling favorite', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockRecipes.filter((r) => !r.isArchived))
    mockToggleFavorite.mockResolvedValue({ ...mockRecipes[0], isFavorite: false })

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    const favoriteButtons = screen.getAllByTitle('Remove from favorites')

    await act(async () => {
      fireEvent.click(favoriteButtons[0])
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(screen.getByText('Removed from favorites')).toBeInTheDocument()

    vi.useRealTimers()
  })
})

describe('RecipesPage archive functionality', () => {
  let testI18n: typeof i18n
  const mockOnCreateRecipe = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCreateRecipe.mockReset()
  })

  it('calls archive API when archive button is clicked', async () => {
    vi.useFakeTimers()
    const activeRecipes = mockRecipes.filter((r) => !r.isArchived)
    mockGetAll.mockResolvedValue(activeRecipes)
    mockArchive.mockResolvedValue({ ...activeRecipes[0], isArchived: true })

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef Stew')).toBeInTheDocument()

    const archiveButtons = screen.getAllByTitle('Archive')

    await act(async () => {
      fireEvent.click(archiveButtons[0])
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(mockArchive).toHaveBeenCalledWith('1')

    vi.useRealTimers()
  })

  it('shows success message after archiving', async () => {
    vi.useFakeTimers()
    const activeRecipes = mockRecipes.filter((r) => !r.isArchived)
    mockGetAll
      .mockResolvedValueOnce(activeRecipes)
      .mockResolvedValueOnce([activeRecipes[1]])
    mockArchive.mockResolvedValue({ ...activeRecipes[0], isArchived: true })

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    const archiveButtons = screen.getAllByTitle('Archive')

    await act(async () => {
      fireEvent.click(archiveButtons[0])
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(screen.getByText('Recipe archived successfully')).toBeInTheDocument()

    vi.useRealTimers()
  })
})

describe('RecipesPage duplicate functionality', () => {
  let testI18n: typeof i18n
  const mockOnCreateRecipe = vi.fn()
  const mockOnViewRecipe = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCreateRecipe.mockReset()
    mockOnViewRecipe.mockReset()
  })

  it('opens duplicate dialog when duplicate button is clicked', async () => {
    const activeRecipes = mockRecipes.filter((r) => !r.isArchived)
    mockGetAll.mockResolvedValue(activeRecipes)
    mockGetSuggestedDuplicateName.mockResolvedValue('Beef Stew (Copy)')

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage onCreateRecipe={mockOnCreateRecipe} onViewRecipe={mockOnViewRecipe} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Beef Stew')).toBeInTheDocument()
    })

    const duplicateButtons = screen.getAllByTitle('Duplicate')
    fireEvent.click(duplicateButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Duplicate Recipe')).toBeInTheDocument()
      expect(screen.getByLabelText(/New Recipe Name/i)).toBeInTheDocument()
    })
  })

  it('calls duplicate API with custom name when dialog is confirmed', async () => {
    const activeRecipes = mockRecipes.filter((r) => !r.isArchived)
    const duplicatedRecipe = { ...activeRecipes[0], id: '4', name: 'My Custom Name' }
    mockGetAll
      .mockResolvedValueOnce(activeRecipes)
      .mockResolvedValueOnce([...activeRecipes, duplicatedRecipe])
    mockGetSuggestedDuplicateName.mockResolvedValue('Beef Stew (Copy)')
    mockCheckNameAvailable.mockResolvedValue(true)
    mockDuplicate.mockResolvedValue(duplicatedRecipe)

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage onCreateRecipe={mockOnCreateRecipe} onViewRecipe={mockOnViewRecipe} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Beef Stew')).toBeInTheDocument()
    })

    // Click duplicate button to open dialog
    const duplicateButtons = screen.getAllByTitle('Duplicate')
    fireEvent.click(duplicateButtons[0])

    // Wait for dialog to appear with suggested name
    await waitFor(() => {
      expect(screen.getByLabelText(/New Recipe Name/i)).toHaveValue('Beef Stew (Copy)')
    })

    // Change the name
    const input = screen.getByLabelText(/New Recipe Name/i)
    fireEvent.change(input, { target: { value: 'My Custom Name' } })

    // Click confirm button - use the submit button inside the dialog (type="submit")
    const dialog = screen.getByRole('dialog')
    const submitButton = dialog.querySelector('button[type="submit"]') as HTMLButtonElement
    await act(async () => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(mockDuplicate).toHaveBeenCalledWith('1', 'My Custom Name')
    })
  })

  it('closes dialog when cancel is clicked', async () => {
    const activeRecipes = mockRecipes.filter((r) => !r.isArchived)
    mockGetAll.mockResolvedValue(activeRecipes)
    mockGetSuggestedDuplicateName.mockResolvedValue('Beef Stew (Copy)')

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Beef Stew')).toBeInTheDocument()
    })

    // Open dialog
    const duplicateButtons = screen.getAllByTitle('Duplicate')
    fireEvent.click(duplicateButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Duplicate Recipe')).toBeInTheDocument()
    })

    // Click cancel
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))

    await waitFor(() => {
      expect(screen.queryByText('Duplicate Recipe')).not.toBeInTheDocument()
    })
  })
})

describe('RecipesPage delete functionality', () => {
  let testI18n: typeof i18n
  const mockOnCreateRecipe = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCreateRecipe.mockReset()
  })

  it('shows delete confirmation dialog when delete button is clicked', async () => {
    mockGetAll.mockResolvedValue(mockRecipes.filter((r) => !r.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Beef Stew')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('Delete')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Delete Recipe?')).toBeInTheDocument()
      expect(
        screen.getByText('Are you sure you want to permanently delete "Beef Stew"? This action cannot be undone.')
      ).toBeInTheDocument()
    })
  })

  it('calls delete API when deletion is confirmed', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockRecipes.filter((r) => !r.isArchived))
    mockDelete.mockResolvedValue(undefined)

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef Stew')).toBeInTheDocument()

    const deleteButtons = screen.getAllByTitle('Delete')
    await act(async () => {
      fireEvent.click(deleteButtons[0])
    })

    // Wait for dialog to appear
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100)
    })

    // Confirm deletion - get all Delete buttons and click the one in the dialog (last one)
    const allDeleteButtons = screen.getAllByRole('button', { name: 'Delete' })
    const confirmButton = allDeleteButtons[allDeleteButtons.length - 1]

    await act(async () => {
      fireEvent.click(confirmButton)
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(mockDelete).toHaveBeenCalledWith('1')

    vi.useRealTimers()
  })

  it('shows success message after deletion', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockRecipes.filter((r) => !r.isArchived))
    mockDelete.mockResolvedValue(undefined)

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    const deleteButtons = screen.getAllByTitle('Delete')
    await act(async () => {
      fireEvent.click(deleteButtons[0])
    })

    // Wait for dialog to appear
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100)
    })

    // Confirm deletion - get all Delete buttons and click the one in the dialog (last one)
    const allDeleteButtons = screen.getAllByRole('button', { name: 'Delete' })
    const confirmButton = allDeleteButtons[allDeleteButtons.length - 1]

    await act(async () => {
      fireEvent.click(confirmButton)
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(screen.getByText('Recipe deleted successfully')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('closes dialog when cancel is clicked', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockRecipes.filter((r) => !r.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef Stew')).toBeInTheDocument()

    const deleteButtons = screen.getAllByTitle('Delete')
    await act(async () => {
      fireEvent.click(deleteButtons[0])
    })

    // Wait for dialog to appear
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(screen.getByText('Delete Recipe?')).toBeInTheDocument()

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await act(async () => {
      fireEvent.click(cancelButton)
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(screen.queryByText('Delete Recipe?')).not.toBeInTheDocument()

    // Recipe should still be there
    expect(screen.getByText('Beef Stew')).toBeInTheDocument()
    expect(mockDelete).not.toHaveBeenCalled()

    vi.useRealTimers()
  })

  it('closes delete dialog when Escape key is pressed', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockRecipes.filter((r) => !r.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <RecipesPage onCreateRecipe={mockOnCreateRecipe} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef Stew')).toBeInTheDocument()

    const deleteButtons = screen.getAllByTitle('Delete')
    await act(async () => {
      fireEvent.click(deleteButtons[0])
    })

    // Wait for dialog to appear
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(screen.getByText('Delete Recipe?')).toBeInTheDocument()

    // Press Escape to close the dialog
    await act(async () => {
      fireEvent.keyDown(window, { key: 'Escape' })
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(screen.queryByText('Delete Recipe?')).not.toBeInTheDocument()

    // Recipe should still be there
    expect(screen.getByText('Beef Stew')).toBeInTheDocument()
    expect(mockDelete).not.toHaveBeenCalled()

    vi.useRealTimers()
  })
})

describe('RecipesPage translations', () => {
  it('has all required English translation keys for recipes', () => {
    const testI18n = createTestI18n('en')

    expect(testI18n.t('recipes.createRecipe')).toBe('Create Recipe')
    expect(testI18n.t('recipes.showArchived')).toBe('Show archived recipes')
    expect(testI18n.t('recipes.showFavoritesOnly')).toBe('Favorites only')
    expect(testI18n.t('recipes.emptyState')).toBe(
      'No recipes found. Create your first recipe to get started.'
    )
    expect(testI18n.t('recipes.noFavorites')).toBe(
      'No favorite recipes. Star a recipe to add it to your favorites.'
    )
    expect(testI18n.t('recipes.archived')).toBe('Archived')
    expect(testI18n.t('recipes.archive')).toBe('Archive')
    expect(testI18n.t('recipes.unarchive')).toBe('Unarchive')
    expect(testI18n.t('recipes.duplicate.button')).toBe('Duplicate')
    expect(testI18n.t('recipes.addFavorite')).toBe('Add to favorites')
    expect(testI18n.t('recipes.removeFavorite')).toBe('Remove from favorites')
    expect(testI18n.t('recipes.totalCost')).toBe('Total Cost')
    expect(testI18n.t('recipes.search.placeholder')).toBe('Search recipes...')
    expect(testI18n.t('recipes.search.noResults')).toBe('No recipes match your search')
    expect(testI18n.t('recipes.search.clear')).toBe('Clear search')
    expect(testI18n.t('recipes.delete.confirmTitle')).toBe('Delete Recipe?')
    expect(testI18n.t('recipes.archiveSuccess')).toBe('Recipe archived successfully')
    expect(testI18n.t('recipes.duplicate.success')).toBe('Recipe duplicated successfully')
    expect(testI18n.t('recipes.delete.success')).toBe('Recipe deleted successfully')
  })

  it('has all required Dutch translation keys for recipes', () => {
    const testI18n = createTestI18n('nl')

    expect(testI18n.t('recipes.createRecipe')).toBe('Recept aanmaken')
    expect(testI18n.t('recipes.showArchived')).toBe('Gearchiveerde recepten tonen')
    expect(testI18n.t('recipes.showFavoritesOnly')).toBe('Alleen favorieten')
    expect(testI18n.t('recipes.emptyState')).toBe(
      'Geen recepten gevonden. Maak je eerste recept aan om te beginnen.'
    )
    expect(testI18n.t('recipes.noFavorites')).toBe(
      'Geen favoriete recepten. Markeer een recept met een ster om het aan je favorieten toe te voegen.'
    )
    expect(testI18n.t('recipes.archived')).toBe('Gearchiveerd')
    expect(testI18n.t('recipes.archive')).toBe('Archiveren')
    expect(testI18n.t('recipes.unarchive')).toBe('Herstellen')
    expect(testI18n.t('recipes.duplicate.button')).toBe('Dupliceren')
    expect(testI18n.t('recipes.addFavorite')).toBe('Toevoegen aan favorieten')
    expect(testI18n.t('recipes.removeFavorite')).toBe('Verwijderen uit favorieten')
    expect(testI18n.t('recipes.totalCost')).toBe('Totale kosten')
    expect(testI18n.t('recipes.search.placeholder')).toBe('Recepten zoeken...')
    expect(testI18n.t('recipes.search.noResults')).toBe(
      'Geen recepten gevonden voor uw zoekopdracht'
    )
    expect(testI18n.t('recipes.search.clear')).toBe('Zoekopdracht wissen')
    expect(testI18n.t('recipes.delete.confirmTitle')).toBe('Recept verwijderen?')
    expect(testI18n.t('recipes.archiveSuccess')).toBe('Recept succesvol gearchiveerd')
    expect(testI18n.t('recipes.duplicate.success')).toBe('Recept succesvol gedupliceerd')
    expect(testI18n.t('recipes.delete.success')).toBe('Recept succesvol verwijderd')
  })
})
