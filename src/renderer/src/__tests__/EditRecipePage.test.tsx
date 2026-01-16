import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, within, cleanup } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { EditRecipePage } from '../pages/EditRecipePage'
import type { RecipeWithFullDetails, Material, PackagingMaterial } from '../../../shared/types'

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

// Mock recipe data
const mockRecipe: RecipeWithFullDetails = {
  id: '1',
  name: 'Premium Beef Burger',
  description: 'A gourmet beef burger with special seasoning',
  categoryId: null,
  yieldQuantity: 10,
  yieldUnit: 'piece',
  prepTimeMinutes: 45,
  instructions: 'Mix ingredients thoroughly. Form into patties.',
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

// Mock materials
const mockMaterials: Material[] = [
  {
    id: 'mat1',
    name: 'Ground Beef',
    currentPrice: 12.0,
    unitOfMeasure: 'kg',
    supplier: 'Butcher Co',
    sku: 'BEEF-001',
    notes: null,
    isArchived: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'mat2',
    name: 'Breadcrumbs',
    currentPrice: 4.0,
    unitOfMeasure: 'kg',
    supplier: 'Baker',
    sku: 'BREAD-001',
    notes: null,
    isArchived: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'mat3',
    name: 'Salt',
    currentPrice: 2.0,
    unitOfMeasure: 'kg',
    supplier: 'Spice Co',
    sku: 'SALT-001',
    notes: null,
    isArchived: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Mock packaging materials
const mockPackaging: PackagingMaterial[] = [
  {
    id: 'pkgmat1',
    name: 'Burger Box',
    unitPrice: 0.5,
    unitType: 'piece',
    supplier: 'PackCo',
    sku: 'BOX-001',
    notes: null,
    isArchived: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pkgmat2',
    name: 'Paper Wrap',
    unitPrice: 0.1,
    unitType: 'piece',
    supplier: 'PackCo',
    sku: 'WRAP-001',
    notes: null,
    isArchived: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Mock window.api
const mockApi = {
  recipes: {
    get: vi.fn(),
    update: vi.fn()
  },
  materials: {
    getAll: vi.fn()
  },
  packaging: {
    getAll: vi.fn()
  },
  ingredients: {
    add: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    reorder: vi.fn()
  },
  recipePackaging: {
    add: vi.fn(),
    update: vi.fn(),
    remove: vi.fn()
  }
}

// Setup global mock
beforeEach(() => {
  vi.clearAllMocks()
  ;(window as unknown as { api: typeof mockApi }).api = mockApi
  mockApi.recipes.get.mockResolvedValue(mockRecipe)
  mockApi.materials.getAll.mockResolvedValue(mockMaterials)
  mockApi.packaging.getAll.mockResolvedValue(mockPackaging)
})

// Ensure fake timers are always restored and cleanup happens after each test
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  // Reset body style that may be set by AddIngredientDialog
  document.body.style.overflow = ''
})

const renderComponent = (language = 'en') => {
  const testI18n = createTestI18n(language)
  return render(
    <I18nextProvider i18n={testI18n}>
      <EditRecipePage
        recipeId="1"
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />
    </I18nextProvider>
  )
}

describe('EditRecipePage', () => {
  describe('loading and initial state', () => {
    it('renders loading state initially', async () => {
      // Keep the recipe loading by never resolving
      mockApi.recipes.get.mockImplementation(() => new Promise(() => {}))

      renderComponent()

      // There may be multiple loading texts (title and content)
      const loadingTexts = screen.getAllByText('Loading...')
      expect(loadingTexts.length).toBeGreaterThan(0)
    })

    it('loads and displays recipe data', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText(/Edit Recipe/)).toBeInTheDocument()
        expect(screen.getByText(': Premium Beef Burger')).toBeInTheDocument()
      })

      // Check form fields are pre-populated
      const nameInput = screen.getByLabelText(/Recipe Name/i) as HTMLInputElement
      expect(nameInput.value).toBe('Premium Beef Burger')

      const descInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement
      expect(descInput.value).toBe('A gourmet beef burger with special seasoning')

      const yieldQtyInput = screen.getByLabelText(/Yield Quantity/i) as HTMLInputElement
      expect(yieldQtyInput.value).toBe('10')
    })

    it('shows error state when recipe not found', async () => {
      mockApi.recipes.get.mockResolvedValue(null)

      renderComponent()

      await waitFor(() => {
        // There may be multiple elements with "Recipe not found" text
        const errorTexts = screen.getAllByText('Recipe not found')
        expect(errorTexts.length).toBeGreaterThan(0)
      })
    })

    it('shows error state when API fails', async () => {
      mockApi.recipes.get.mockRejectedValue(new Error('Network error'))

      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Failed to load recipe')).toBeInTheDocument()
      })
    })
  })

  describe('ingredients section', () => {
    it('displays existing ingredients', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Ground Beef')).toBeInTheDocument()
        expect(screen.getByText('Breadcrumbs')).toBeInTheDocument()
      })
    })

    it('shows Add Ingredient button', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Add Ingredient')).toBeInTheDocument()
      })
    })

    it('opens add ingredient modal when button clicked', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Add Ingredient')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Add Ingredient'))

      await waitFor(() => {
        // Should show the modal title (there will be two "Add Ingredient" texts now)
        const modalTitles = screen.getAllByText('Add Ingredient')
        expect(modalTitles.length).toBeGreaterThanOrEqual(1)
        expect(screen.getByLabelText(/Material/i)).toBeInTheDocument()
      })
    })

    it('can add a new ingredient', async () => {
      const newIngredient = {
        id: 'ing3',
        recipeId: '1',
        materialId: 'mat3',
        quantity: 0.1,
        unit: 'kg',
        sortOrder: 2,
        notes: null
      }
      mockApi.ingredients.add.mockResolvedValue(newIngredient)

      // After adding, recipe will have updated ingredients
      const updatedRecipe = {
        ...mockRecipe,
        ingredients: [
          ...mockRecipe.ingredients,
          {
            ...newIngredient,
            material: mockMaterials[2]
          }
        ]
      }
      mockApi.recipes.get.mockResolvedValueOnce(mockRecipe).mockResolvedValueOnce(updatedRecipe)

      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Add Ingredient')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Add Ingredient'))

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search materials...')).toBeInTheDocument()
      })

      // Type to search for Salt and select from dropdown
      const searchInput = screen.getByPlaceholderText('Search materials...')
      fireEvent.focus(searchInput)

      // Wait for dropdown to appear and click on Salt
      await waitFor(() => {
        expect(screen.getByText('Salt')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Salt'))

      // Set quantity
      const quantityInput = screen.getByLabelText(/^Quantity/i) as HTMLInputElement
      fireEvent.change(quantityInput, { target: { value: '0.1' } })

      // Click add in modal
      const addButtons = screen.getAllByText('Add Ingredient')
      const modalAddButton = addButtons[addButtons.length - 1]
      fireEvent.click(modalAddButton)

      await waitFor(() => {
        expect(mockApi.ingredients.add).toHaveBeenCalledWith({
          recipeId: '1',
          materialId: 'mat3',
          quantity: 0.1,
          unit: 'kg',
          notes: null
        })
      })
    })

    it('can edit an ingredient inline', async () => {
      const updatedIngredient = {
        id: 'ing1',
        recipeId: '1',
        materialId: 'mat1',
        quantity: 3.0,
        unit: 'kg',
        sortOrder: 0,
        notes: null
      }
      mockApi.ingredients.update.mockResolvedValue(updatedIngredient)
      mockApi.recipes.get.mockResolvedValue(mockRecipe)

      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Ground Beef')).toBeInTheDocument()
      })

      // Find and click edit button for first ingredient (pencil icon)
      const editButtons = screen.getAllByTitle('Edit')
      fireEvent.click(editButtons[0])

      // Should show inline input
      await waitFor(() => {
        const inlineInputs = screen.getAllByRole('spinbutton')
        expect(inlineInputs.length).toBeGreaterThan(0)
      })
    })

    it('can remove an ingredient', async () => {
      mockApi.ingredients.remove.mockResolvedValue(undefined)

      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Ground Beef')).toBeInTheDocument()
      })

      // Find and click delete button for first ingredient (trash icon)
      const deleteButtons = screen.getAllByTitle('Delete')
      fireEvent.click(deleteButtons[0])

      await waitFor(() => {
        expect(mockApi.ingredients.remove).toHaveBeenCalledWith('ing1')
      })
    })

    it('can add an ingredient with notes', async () => {
      const newIngredient = {
        id: 'ing3',
        recipeId: '1',
        materialId: 'mat3',
        quantity: 0.5,
        unit: 'g',
        sortOrder: 2,
        notes: 'Use fine salt'
      }
      mockApi.ingredients.add.mockResolvedValue(newIngredient)

      const updatedRecipe = {
        ...mockRecipe,
        ingredients: [
          ...mockRecipe.ingredients,
          {
            ...newIngredient,
            material: mockMaterials[2]
          }
        ]
      }
      mockApi.recipes.get.mockResolvedValueOnce(mockRecipe).mockResolvedValueOnce(updatedRecipe)

      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Add Ingredient')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Add Ingredient'))

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search materials...')).toBeInTheDocument()
      })

      // Type to search for Salt and select from dropdown
      const searchInput = screen.getByPlaceholderText('Search materials...')
      fireEvent.focus(searchInput)

      // Wait for dropdown to appear and click on Salt
      await waitFor(() => {
        expect(screen.getByText('Salt')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Salt'))

      // Set quantity
      const quantityInput = screen.getByLabelText(/^Quantity/i) as HTMLInputElement
      fireEvent.change(quantityInput, { target: { value: '0.5' } })

      // Set unit to grams
      const unitSelect = screen.getByLabelText(/^Unit/i) as HTMLSelectElement
      fireEvent.change(unitSelect, { target: { value: 'g' } })

      // Add notes
      const notesInput = screen.getByLabelText(/Notes/i) as HTMLTextAreaElement
      fireEvent.change(notesInput, { target: { value: 'Use fine salt' } })

      // Click add in modal
      const addButtons = screen.getAllByText('Add Ingredient')
      const modalAddButton = addButtons[addButtons.length - 1]
      fireEvent.click(modalAddButton)

      await waitFor(() => {
        expect(mockApi.ingredients.add).toHaveBeenCalledWith({
          recipeId: '1',
          materialId: 'mat3',
          quantity: 0.5,
          unit: 'g',
          notes: 'Use fine salt'
        })
      })
    })

    it('filters materials by search term (case-insensitive)', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Add Ingredient')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Add Ingredient'))

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search materials...')).toBeInTheDocument()
      })

      // Focus on search input to open dropdown
      const searchInput = screen.getByPlaceholderText('Search materials...')
      fireEvent.focus(searchInput)

      // Initially Salt should be visible in dropdown (it's the only non-added material)
      await waitFor(() => {
        expect(screen.getByText('Salt')).toBeInTheDocument()
      })

      // Type search term with different case - debounce will apply after 300ms
      fireEvent.change(searchInput, { target: { value: 'SALT' } })

      // Wait for debounce to apply - Salt should still be visible (case-insensitive match)
      await waitFor(() => {
        expect(screen.getByText('Salt')).toBeInTheDocument()
      }, { timeout: 1000 })
    })

    it('shows no results message when search has no matches', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Add Ingredient')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Add Ingredient'))

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search materials...')).toBeInTheDocument()
      })

      // Type a search term that won't match anything
      const searchInput = screen.getByPlaceholderText('Search materials...')
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

      // Wait for debounce and no results message
      await waitFor(() => {
        expect(screen.getByText('No materials match your search')).toBeInTheDocument()
      }, { timeout: 1000 })
    })

    it('clears search when clear button is clicked', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Add Ingredient')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Add Ingredient'))

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search materials...')).toBeInTheDocument()
      })

      // Type a search term
      const searchInput = screen.getByPlaceholderText('Search materials...')
      fireEvent.change(searchInput, { target: { value: 'test' } })

      // Clear button should appear immediately (no debounce for button visibility)
      await waitFor(() => {
        expect(screen.getByTitle('Clear search')).toBeInTheDocument()
      })

      // Click clear button
      fireEvent.click(screen.getByTitle('Clear search'))

      // Search should be cleared
      expect((searchInput as HTMLInputElement).value).toBe('')
    })

    it('clears search when Escape key is pressed on search input', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Add Ingredient')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Add Ingredient'))

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search materials...')).toBeInTheDocument()
      })

      // Type a search term (which opens the dropdown)
      const searchInput = screen.getByPlaceholderText('Search materials...')
      fireEvent.change(searchInput, { target: { value: 'test' } })

      // First Escape closes the dropdown, second Escape clears the search
      fireEvent.keyDown(searchInput, { key: 'Escape' })
      fireEvent.keyDown(searchInput, { key: 'Escape' })

      // Search should be cleared
      expect((searchInput as HTMLInputElement).value).toBe('')
    })

    it('resets search and notes when modal is closed', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Add Ingredient')).toBeInTheDocument()
      })

      // Open modal
      fireEvent.click(screen.getByText('Add Ingredient'))

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search materials...')).toBeInTheDocument()
      })

      // Type in search and notes
      const searchInput = screen.getByPlaceholderText('Search materials...')
      fireEvent.change(searchInput, { target: { value: 'test' } })

      const notesInput = screen.getByLabelText(/Notes/i) as HTMLTextAreaElement
      fireEvent.change(notesInput, { target: { value: 'Some notes' } })

      // Cancel modal - there may be multiple Cancel buttons, use the one in the dialog
      const cancelButtons = screen.getAllByText('Cancel')
      const modalCancelButton = cancelButtons.find(btn =>
        btn.closest('.add-ingredient-dialog') || btn.closest('.modal')
      )
      fireEvent.click(modalCancelButton!)

      // Re-open modal
      fireEvent.click(screen.getByText('Add Ingredient'))

      await waitFor(() => {
        const newSearchInput = screen.getByPlaceholderText('Search materials...')
        expect((newSearchInput as HTMLInputElement).value).toBe('')
      })

      const newNotesInput = screen.getByLabelText(/Notes/i) as HTMLTextAreaElement
      expect(newNotesInput.value).toBe('')
    })
  })

  describe('packaging section', () => {
    it('displays existing packaging', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Burger Box')).toBeInTheDocument()
      })
    })

    it('shows Add Packaging button', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Add Packaging')).toBeInTheDocument()
      })
    })

    it('can add packaging', async () => {
      const newPackaging = {
        id: 'pkg2',
        recipeId: '1',
        packagingMaterialId: 'pkgmat2',
        quantity: 5,
        sortOrder: 1,
        notes: null
      }
      mockApi.recipePackaging.add.mockResolvedValue(newPackaging)

      const updatedRecipe = {
        ...mockRecipe,
        packaging: [
          ...mockRecipe.packaging,
          {
            ...newPackaging,
            packagingMaterial: mockPackaging[1]
          }
        ]
      }
      mockApi.recipes.get.mockResolvedValueOnce(mockRecipe).mockResolvedValueOnce(updatedRecipe)

      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Add Packaging')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Add Packaging'))

      await waitFor(() => {
        expect(screen.getByLabelText(/Packaging Material/i)).toBeInTheDocument()
      })

      // Select packaging material
      const select = screen.getByLabelText(/Packaging Material/i) as HTMLSelectElement
      fireEvent.change(select, { target: { value: 'pkgmat2' } })

      // Set quantity
      const quantityInput = screen.getByLabelText(/^Quantity/i) as HTMLInputElement
      fireEvent.change(quantityInput, { target: { value: '5' } })

      // Click add in modal
      const addButtons = screen.getAllByText('Add Packaging')
      const modalAddButton = addButtons[addButtons.length - 1]
      fireEvent.click(modalAddButton)

      await waitFor(() => {
        expect(mockApi.recipePackaging.add).toHaveBeenCalledWith({
          recipeId: '1',
          packagingMaterialId: 'pkgmat2',
          quantity: 5
        })
      })
    })

    it('can remove packaging', async () => {
      mockApi.recipePackaging.remove.mockResolvedValue(undefined)

      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Burger Box')).toBeInTheDocument()
      })

      // Find delete buttons - ingredients section has 2, packaging section has 1
      const deleteButtons = screen.getAllByTitle('Delete')
      // The last delete button should be for packaging
      fireEvent.click(deleteButtons[deleteButtons.length - 1])

      await waitFor(() => {
        expect(mockApi.recipePackaging.remove).toHaveBeenCalledWith('pkg1')
      })
    })
  })

  describe('cost calculations', () => {
    it('displays cost breakdown', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Cost Breakdown')).toBeInTheDocument()
        expect(screen.getByText('Material Cost:')).toBeInTheDocument()
        expect(screen.getByText('Packaging Cost:')).toBeInTheDocument()
        expect(screen.getByText('Total Cost:')).toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    it('submits form with updated data', async () => {
      mockApi.recipes.update.mockResolvedValue({ ...mockRecipe, name: 'Updated Burger' })
      const onSuccess = vi.fn()

      const testI18n = createTestI18n('en')
      render(
        <I18nextProvider i18n={testI18n}>
          <EditRecipePage
            recipeId="1"
            onCancel={vi.fn()}
            onSuccess={onSuccess}
          />
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/Recipe Name/i)).toBeInTheDocument()
      })

      // Change the name
      const nameInput = screen.getByLabelText(/Recipe Name/i) as HTMLInputElement
      fireEvent.change(nameInput, { target: { value: 'Updated Burger' } })

      // Submit form
      const saveButton = screen.getByRole('button', { name: /Save/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockApi.recipes.update).toHaveBeenCalledWith('1', expect.objectContaining({
          name: 'Updated Burger'
        }))
        expect(onSuccess).toHaveBeenCalled()
      })
    })

    it('shows error for duplicate name', async () => {
      mockApi.recipes.update.mockRejectedValue(new Error('DUPLICATE_NAME'))

      renderComponent()

      await waitFor(() => {
        expect(screen.getByLabelText(/Recipe Name/i)).toBeInTheDocument()
      })

      // Change name to trigger dirty state
      const nameInput = screen.getByLabelText(/Recipe Name/i) as HTMLInputElement
      fireEvent.change(nameInput, { target: { value: 'Existing Recipe' } })

      // Submit form
      const saveButton = screen.getByRole('button', { name: /Save/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('A recipe with this name already exists')).toBeInTheDocument()
      })
    })
  })

  describe('cancel confirmation', () => {
    it('shows confirmation dialog when cancelling with unsaved changes', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByLabelText(/Recipe Name/i)).toBeInTheDocument()
      })

      // Make a change to trigger dirty state
      const nameInput = screen.getByLabelText(/Recipe Name/i) as HTMLInputElement
      fireEvent.change(nameInput, { target: { value: 'Changed Name' } })

      // Click back button
      const backButton = screen.getByText('Back')
      fireEvent.click(backButton)

      await waitFor(() => {
        expect(screen.getByText('Discard Changes?')).toBeInTheDocument()
        expect(screen.getByText('You have unsaved changes. Are you sure you want to discard them?')).toBeInTheDocument()
      })
    })

    it('does not show confirmation when no changes made', async () => {
      const onCancel = vi.fn()
      const testI18n = createTestI18n('en')

      render(
        <I18nextProvider i18n={testI18n}>
          <EditRecipePage
            recipeId="1"
            onCancel={onCancel}
            onSuccess={vi.fn()}
          />
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/Recipe Name/i)).toBeInTheDocument()
      })

      // Click back button without making changes
      const backButton = screen.getByText('Back')
      fireEvent.click(backButton)

      // Should call onCancel directly without showing dialog
      await waitFor(() => {
        expect(onCancel).toHaveBeenCalled()
      })
    })
  })

  describe('ingredient reordering', () => {
    it('displays drag handles on ingredient rows', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Ground Beef')).toBeInTheDocument()
      })

      // Check that drag handles are present (≡≡ character)
      const dragHandles = screen.getAllByTitle('Drag to reorder')
      expect(dragHandles.length).toBe(2) // Two ingredients in mock data
    })

    it('sets draggable attribute on ingredient rows', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Ground Beef')).toBeInTheDocument()
      })

      // Find the table rows containing ingredients
      const beefRow = screen.getByText('Ground Beef').closest('tr')
      expect(beefRow).toHaveAttribute('draggable', 'true')
    })

    it('applies dragging class when drag starts', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Ground Beef')).toBeInTheDocument()
      })

      // Find the row containing Ground Beef
      const beefRow = screen.getByText('Ground Beef').closest('tr')
      expect(beefRow).not.toHaveClass('dragging')

      // Trigger drag start
      fireEvent.dragStart(beefRow!)

      // The row should now have the dragging class
      expect(beefRow).toHaveClass('dragging')
    })

    it('calls reorder API when drag ends', async () => {
      mockApi.ingredients.reorder.mockResolvedValue(undefined)

      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Ground Beef')).toBeInTheDocument()
      })

      // Find the rows
      const beefRow = screen.getByText('Ground Beef').closest('tr')
      const breadcrumbsRow = screen.getByText('Breadcrumbs').closest('tr')

      // Simulate drag start on beef row
      fireEvent.dragStart(beefRow!)

      // Simulate drag over breadcrumbs row (reordering)
      fireEvent.dragOver(breadcrumbsRow!)

      // Simulate drag end
      fireEvent.dragEnd(beefRow!)

      // Should call the reorder API
      await waitFor(() => {
        expect(mockApi.ingredients.reorder).toHaveBeenCalledWith(
          '1', // recipeId
          expect.any(Array) // ingredientIds
        )
      })
    })

    it('handles reorder API error gracefully', async () => {
      // Mock API failure and recipe refetch
      mockApi.ingredients.reorder.mockRejectedValue(new Error('Reorder failed'))
      mockApi.recipes.get.mockResolvedValue(mockRecipe)

      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Ground Beef')).toBeInTheDocument()
      })

      // Find the rows
      const beefRow = screen.getByText('Ground Beef').closest('tr')
      const breadcrumbsRow = screen.getByText('Breadcrumbs').closest('tr')

      // Simulate drag operations
      fireEvent.dragStart(beefRow!)
      fireEvent.dragOver(breadcrumbsRow!)
      fireEvent.dragEnd(beefRow!)

      // Should attempt reorder and refetch on error
      await waitFor(() => {
        expect(mockApi.ingredients.reorder).toHaveBeenCalled()
      })

      // Recipe should be refetched to restore original order
      await waitFor(() => {
        // Initial load + error recovery refetch
        expect(mockApi.recipes.get.mock.calls.length).toBeGreaterThan(1)
      })
    })

    it('disables dragging when editing an ingredient', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Ground Beef')).toBeInTheDocument()
      })

      // Find and click edit button for first ingredient
      const editButtons = screen.getAllByTitle('Edit')
      fireEvent.click(editButtons[0])

      // Wait for edit mode
      await waitFor(() => {
        const inlineInputs = screen.getAllByRole('spinbutton')
        expect(inlineInputs.length).toBeGreaterThan(0)
      })

      // The row being edited should not be draggable
      const beefRow = screen.getByText('Ground Beef').closest('tr')
      expect(beefRow).toHaveAttribute('draggable', 'false')
    })
  })

  describe('translations', () => {
    it('shows Dutch translations', async () => {
      const testI18n = createTestI18n('nl')

      render(
        <I18nextProvider i18n={testI18n}>
          <EditRecipePage
            recipeId="1"
            onCancel={vi.fn()}
            onSuccess={vi.fn()}
          />
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(screen.getByText(/Recept Bewerken/)).toBeInTheDocument()
        expect(screen.getByText('Terug')).toBeInTheDocument()
        expect(screen.getByLabelText(/Receptnaam/i)).toBeInTheDocument()
      })
    })
  })
})
