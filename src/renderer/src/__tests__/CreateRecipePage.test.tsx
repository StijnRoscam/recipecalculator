import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { CreateRecipePage } from '../pages/CreateRecipePage'

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

// Setup window.api mock
const mockCreate = vi.fn()

beforeEach(() => {
  // Reset mock before each test
  mockCreate.mockReset()

  // Setup window.api mock
  Object.defineProperty(window, 'api', {
    value: {
      recipes: {
        create: mockCreate
      }
    },
    writable: true,
    configurable: true
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('CreateRecipePage', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
  })

  it('renders the create recipe form', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    expect(screen.getByText('Create New Recipe')).toBeInTheDocument()
    expect(screen.getByLabelText(/Recipe Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Yield Quantity/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Yield Unit/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Prep Time/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Profit Margin/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Waste Percentage/)).toBeInTheDocument()
    expect(screen.getByLabelText(/VAT Percentage/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Instructions/)).toBeInTheDocument()
  })

  it('shows back button that calls onCancel', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('shows cancel and save buttons', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('has portion selected as default yield unit', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const unitSelect = screen.getByLabelText(/Yield Unit/) as HTMLSelectElement
    expect(unitSelect.value).toBe('portion')
  })

  it('shows all yield unit options', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const unitSelect = screen.getByLabelText(/Yield Unit/) as HTMLSelectElement
    const options = unitSelect.querySelectorAll('option')

    expect(options).toHaveLength(6)
    expect(options[0].value).toBe('portion')
    expect(options[1].value).toBe('piece')
    expect(options[2].value).toBe('kg')
    expect(options[3].value).toBe('g')
    expect(options[4].value).toBe('l')
    expect(options[5].value).toBe('ml')
  })

  it('has default values for yieldQuantity and vatPercentage', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const yieldQuantityInput = screen.getByLabelText(/Yield Quantity/) as HTMLInputElement
    const vatPercentageInput = screen.getByLabelText(/VAT Percentage/) as HTMLInputElement

    expect(yieldQuantityInput.value).toBe('1')
    expect(vatPercentageInput.value).toBe('21')
  })
})

describe('CreateRecipePage form validation', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
  })

  it('shows error when name is empty on submit', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    // Clear the name field (it's empty by default, but we need to submit)
    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('shows error when yield quantity is zero', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Recipe Name/)
    const yieldQuantityInput = screen.getByLabelText(/Yield Quantity/)

    await user.type(nameInput, 'Test Recipe')
    await user.clear(yieldQuantityInput)
    await user.type(yieldQuantityInput, '0')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Please enter a positive number')).toBeInTheDocument()
    })

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('shows error when yield quantity is negative', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Recipe Name/)
    const yieldQuantityInput = screen.getByLabelText(/Yield Quantity/)

    await user.type(nameInput, 'Test Recipe')
    await user.clear(yieldQuantityInput)
    await user.type(yieldQuantityInput, '-5')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Please enter a positive number')).toBeInTheDocument()
    })

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('validates name is not longer than 200 characters', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Recipe Name/)
    const longName = 'a'.repeat(201)

    await user.type(nameInput, longName)

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Maximum 200 characters allowed/)).toBeInTheDocument()
    })

    expect(mockCreate).not.toHaveBeenCalled()
  })
})

describe('CreateRecipePage form submission', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
  })

  it('submits form with valid data and calls onSuccess with recipe id', async () => {
    const user = userEvent.setup()
    mockCreate.mockResolvedValue({
      id: 'recipe-123',
      name: 'Test Recipe',
      description: 'A test recipe',
      yieldQuantity: 4,
      yieldUnit: 'portion',
      prepTimeMinutes: 30,
      profitMargin: 25,
      wastePercentage: 5,
      vatPercentage: 21,
      instructions: 'Cook it well',
      categoryId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
      isFavorite: false
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Recipe Name/)
    const descriptionInput = screen.getByLabelText(/Description/)
    const prepTimeInput = screen.getByLabelText(/Prep Time/)
    const profitMarginInput = screen.getByLabelText(/Profit Margin/)
    const wastePercentageInput = screen.getByLabelText(/Waste Percentage/)
    const instructionsInput = screen.getByLabelText(/Instructions/)

    await user.type(nameInput, 'Test Recipe')
    await user.type(descriptionInput, 'A test recipe')
    await user.type(prepTimeInput, '30')
    await user.clear(profitMarginInput)
    await user.type(profitMarginInput, '25')
    await user.type(wastePercentageInput, '5')
    await user.type(instructionsInput, 'Cook it well')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        name: 'Test Recipe',
        description: 'A test recipe',
        yieldQuantity: 1,
        yieldUnit: 'portion',
        prepTimeMinutes: 30,
        profitMargin: 25,
        wastePercentage: 5,
        vatPercentage: 21,
        instructions: 'Cook it well'
      })
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('recipe-123')
    })
  })

  it('submits form with only required fields', async () => {
    const user = userEvent.setup()
    mockCreate.mockResolvedValue({
      id: 'recipe-456',
      name: 'Simple Recipe',
      description: null,
      yieldQuantity: 1,
      yieldUnit: 'portion',
      prepTimeMinutes: null,
      profitMargin: null,
      wastePercentage: null,
      vatPercentage: 21,
      instructions: null,
      categoryId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
      isFavorite: false
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Recipe Name/)
    await user.type(nameInput, 'Simple Recipe')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        name: 'Simple Recipe',
        description: null,
        yieldQuantity: 1,
        yieldUnit: 'portion',
        prepTimeMinutes: null,
        profitMargin: null,
        wastePercentage: null,
        vatPercentage: 21,
        instructions: null
      })
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('recipe-456')
    })
  })

  it('allows selecting different yield units', async () => {
    const user = userEvent.setup()
    mockCreate.mockResolvedValue({
      id: 'recipe-789',
      name: 'Bulk Recipe',
      description: null,
      yieldQuantity: 5,
      yieldUnit: 'kg',
      prepTimeMinutes: null,
      profitMargin: null,
      wastePercentage: null,
      vatPercentage: 21,
      instructions: null,
      categoryId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
      isFavorite: false
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Recipe Name/)
    const yieldQuantityInput = screen.getByLabelText(/Yield Quantity/)
    const unitSelect = screen.getByLabelText(/Yield Unit/)

    await user.type(nameInput, 'Bulk Recipe')
    await user.clear(yieldQuantityInput)
    await user.type(yieldQuantityInput, '5')
    await user.selectOptions(unitSelect, 'kg')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          yieldQuantity: 5,
          yieldUnit: 'kg'
        })
      )
    })
  })

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup()
    // Create a promise that never resolves to keep loading state
    mockCreate.mockImplementation(() => new Promise(() => {}))

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Recipe Name/)
    await user.type(nameInput, 'Test Recipe')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    // Verify button is disabled
    expect(submitButton).toBeDisabled()
  })

  it('disables buttons while submitting', async () => {
    const user = userEvent.setup()
    mockCreate.mockImplementation(() => new Promise(() => {}))

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Recipe Name/)
    await user.type(nameInput, 'Test Recipe')

    const submitButton = screen.getByText('Save')
    const cancelButton = screen.getByText('Cancel')

    await user.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })
  })

  it('allows decimal values for yield quantity', async () => {
    const user = userEvent.setup()
    mockCreate.mockResolvedValue({
      id: 'recipe-decimal',
      name: 'Decimal Recipe',
      description: null,
      yieldQuantity: 2.5,
      yieldUnit: 'kg',
      prepTimeMinutes: null,
      profitMargin: null,
      wastePercentage: null,
      vatPercentage: null,
      instructions: null,
      categoryId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
      isFavorite: false
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Recipe Name/)
    const yieldQuantityInput = screen.getByLabelText(/Yield Quantity/)
    const unitSelect = screen.getByLabelText(/Yield Unit/)
    const vatInput = screen.getByLabelText(/VAT Percentage/)

    await user.type(nameInput, 'Decimal Recipe')
    await user.clear(yieldQuantityInput)
    await user.type(yieldQuantityInput, '2.5')
    await user.selectOptions(unitSelect, 'kg')
    await user.clear(vatInput)

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          yieldQuantity: 2.5
        })
      )
    })
  })
})

describe('CreateRecipePage error handling', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
  })

  it('shows duplicate name error when recipe already exists', async () => {
    const user = userEvent.setup()
    mockCreate.mockRejectedValue(new Error('DUPLICATE_NAME'))

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Recipe Name/)
    await user.type(nameInput, 'Existing Recipe')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('A recipe with this name already exists')).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('shows generic error for other failures', async () => {
    const user = userEvent.setup()
    mockCreate.mockRejectedValue(new Error('Network error'))

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Recipe Name/)
    await user.type(nameInput, 'Test Recipe')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to create recipe')).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('server error is displayed with alert role', async () => {
    const user = userEvent.setup()
    mockCreate.mockRejectedValue(new Error('DUPLICATE_NAME'))

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Recipe Name/)
    await user.type(nameInput, 'Existing Recipe')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      const errorElement = screen.getByRole('alert')
      expect(errorElement).toHaveTextContent('A recipe with this name already exists')
    })
  })
})

describe('CreateRecipePage translations', () => {
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  it('renders in Dutch when language is set to Dutch', async () => {
    const testI18n = createTestI18n('nl')

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    expect(screen.getByText('Nieuw Recept Aanmaken')).toBeInTheDocument()
    expect(screen.getByLabelText(/Receptnaam/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Omschrijving/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Opbrengst Hoeveelheid/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Opbrengst Eenheid/)).toBeInTheDocument()
    expect(screen.getByText('Opslaan')).toBeInTheDocument()
    expect(screen.getByText('Annuleren')).toBeInTheDocument()
    expect(screen.getByText('Terug')).toBeInTheDocument()
  })

  it('shows Dutch error messages', async () => {
    const testI18n = createTestI18n('nl')
    const user = userEvent.setup()
    mockCreate.mockRejectedValue(new Error('DUPLICATE_NAME'))

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Receptnaam/)
    await user.type(nameInput, 'Test')

    const submitButton = screen.getByText('Opslaan')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Er bestaat al een recept met deze naam')).toBeInTheDocument()
    })
  })

  it('has all required English translation keys for create recipe', () => {
    const testI18n = createTestI18n('en')

    expect(testI18n.t('recipes.create.title')).toBe('Create New Recipe')
    expect(testI18n.t('recipes.create.fields.name')).toBe('Recipe Name')
    expect(testI18n.t('recipes.create.fields.description')).toBe('Description')
    expect(testI18n.t('recipes.create.fields.yieldQuantity')).toBe('Yield Quantity')
    expect(testI18n.t('recipes.create.fields.yieldUnit')).toBe('Yield Unit')
    expect(testI18n.t('recipes.create.fields.prepTimeMinutes')).toBe('Prep Time (minutes)')
    expect(testI18n.t('recipes.create.fields.profitMargin')).toBe('Profit Margin (%)')
    expect(testI18n.t('recipes.create.fields.wastePercentage')).toBe('Waste Percentage (%)')
    expect(testI18n.t('recipes.create.fields.vatPercentage')).toBe('VAT Percentage (%)')
    expect(testI18n.t('recipes.create.fields.instructions')).toBe('Instructions')
    expect(testI18n.t('recipes.create.yieldUnits.portion')).toBe('Portion')
    expect(testI18n.t('recipes.create.yieldUnits.piece')).toBe('Piece')
    expect(testI18n.t('recipes.create.yieldUnits.kg')).toBe('Kilogram (kg)')
    expect(testI18n.t('recipes.create.yieldUnits.g')).toBe('Gram (g)')
    expect(testI18n.t('recipes.create.yieldUnits.l')).toBe('Liter (l)')
    expect(testI18n.t('recipes.create.yieldUnits.ml')).toBe('Milliliter (ml)')
    expect(testI18n.t('recipes.create.success')).toBe('Recipe created successfully')
    expect(testI18n.t('recipes.create.errors.duplicateName')).toBe(
      'A recipe with this name already exists'
    )
    expect(testI18n.t('recipes.create.errors.createFailed')).toBe('Failed to create recipe')
  })

  it('has all required Dutch translation keys for create recipe', () => {
    const testI18n = createTestI18n('nl')

    expect(testI18n.t('recipes.create.title')).toBe('Nieuw Recept Aanmaken')
    expect(testI18n.t('recipes.create.fields.name')).toBe('Receptnaam')
    expect(testI18n.t('recipes.create.fields.description')).toBe('Omschrijving')
    expect(testI18n.t('recipes.create.fields.yieldQuantity')).toBe('Opbrengst Hoeveelheid')
    expect(testI18n.t('recipes.create.fields.yieldUnit')).toBe('Opbrengst Eenheid')
    expect(testI18n.t('recipes.create.fields.prepTimeMinutes')).toBe('Bereidingstijd (minuten)')
    expect(testI18n.t('recipes.create.fields.profitMargin')).toBe('Winstmarge (%)')
    expect(testI18n.t('recipes.create.fields.wastePercentage')).toBe('Afval Percentage (%)')
    expect(testI18n.t('recipes.create.fields.vatPercentage')).toBe('BTW Percentage (%)')
    expect(testI18n.t('recipes.create.fields.instructions')).toBe('Instructies')
    expect(testI18n.t('recipes.create.yieldUnits.portion')).toBe('Portie')
    expect(testI18n.t('recipes.create.yieldUnits.piece')).toBe('Stuk')
    expect(testI18n.t('recipes.create.success')).toBe('Recept succesvol aangemaakt')
    expect(testI18n.t('recipes.create.errors.duplicateName')).toBe(
      'Er bestaat al een recept met deze naam'
    )
    expect(testI18n.t('recipes.create.errors.createFailed')).toBe('Recept aanmaken mislukt')
  })
})

describe('CreateRecipePage accessibility', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
  })

  it('has proper aria-invalid attributes for invalid fields', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Recipe Name/)
      expect(nameInput).toHaveAttribute('aria-invalid', 'true')
    })
  })

  it('has proper form labels for all inputs', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    // All form fields should be accessible via their labels
    expect(screen.getByLabelText(/Recipe Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Yield Quantity/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Yield Unit/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Prep Time/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Profit Margin/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Waste Percentage/)).toBeInTheDocument()
    expect(screen.getByLabelText(/VAT Percentage/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Instructions/)).toBeInTheDocument()
  })

  it('shows required field indicators', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    // Required fields should have asterisk (name, yield quantity, yield unit)
    const requiredIndicators = screen.getAllByText('*')
    expect(requiredIndicators.length).toBe(3)
  })

  it('has field errors with role alert', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateRecipePage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert')
      expect(alerts.length).toBeGreaterThan(0)
    })
  })
})
