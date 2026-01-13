import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { CreateMaterialPage } from '../pages/CreateMaterialPage'

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
      materials: {
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

describe('CreateMaterialPage', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
  })

  it('renders the create material form', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    expect(screen.getByText('Create New Material')).toBeInTheDocument()
    expect(screen.getByLabelText(/Material Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Price per Unit/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Unit of Measure/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Supplier/)).toBeInTheDocument()
    expect(screen.getByLabelText(/SKU/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Notes/)).toBeInTheDocument()
  })

  it('shows back button that calls onCancel', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('shows cancel and save buttons', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('has kg selected as default unit', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const unitSelect = screen.getByLabelText(/Unit of Measure/) as HTMLSelectElement
    expect(unitSelect.value).toBe('kg')
  })

  it('shows unit options kg and g', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const unitSelect = screen.getByLabelText(/Unit of Measure/) as HTMLSelectElement
    const options = unitSelect.querySelectorAll('option')

    expect(options).toHaveLength(2)
    expect(options[0].value).toBe('kg')
    expect(options[1].value).toBe('g')
  })
})

describe('CreateMaterialPage form validation', () => {
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
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('shows error when price is negative', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Material Name/)
    const priceInput = screen.getByLabelText(/Price per Unit/)

    await user.type(nameInput, 'Test Material')
    await user.clear(priceInput)
    await user.type(priceInput, '-5')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Please enter a positive number')).toBeInTheDocument()
    })

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('allows price of zero', async () => {
    const user = userEvent.setup()
    mockCreate.mockResolvedValue({
      id: '1',
      name: 'Free Material',
      currentPrice: 0,
      unitOfMeasure: 'kg',
      supplier: null,
      sku: null,
      notes: null,
      categoryId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Material Name/)
    const priceInput = screen.getByLabelText(/Price per Unit/)

    await user.type(nameInput, 'Free Material')
    await user.clear(priceInput)
    await user.type(priceInput, '0')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          currentPrice: 0
        })
      )
    })
  })

  it('validates name is not longer than 200 characters', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Material Name/)
    const longName = 'a'.repeat(201)

    await user.type(nameInput, longName)

    const priceInput = screen.getByLabelText(/Price per Unit/)
    await user.clear(priceInput)
    await user.type(priceInput, '10')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Maximum 200 characters allowed/)).toBeInTheDocument()
    })

    expect(mockCreate).not.toHaveBeenCalled()
  })
})

describe('CreateMaterialPage form submission', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
  })

  it('submits form with valid data and calls onSuccess', async () => {
    const user = userEvent.setup()
    mockCreate.mockResolvedValue({
      id: '1',
      name: 'Test Material',
      currentPrice: 10.5,
      unitOfMeasure: 'kg',
      supplier: 'Test Supplier',
      sku: 'TST001',
      notes: 'Test notes',
      categoryId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Material Name/)
    const priceInput = screen.getByLabelText(/Price per Unit/)
    const supplierInput = screen.getByLabelText(/Supplier/)
    const skuInput = screen.getByLabelText(/SKU/)
    const notesInput = screen.getByLabelText(/Notes/)

    await user.type(nameInput, 'Test Material')
    await user.clear(priceInput)
    await user.type(priceInput, '10.50')
    await user.type(supplierInput, 'Test Supplier')
    await user.type(skuInput, 'TST001')
    await user.type(notesInput, 'Test notes')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        name: 'Test Material',
        currentPrice: 10.5,
        unitOfMeasure: 'kg',
        supplier: 'Test Supplier',
        sku: 'TST001',
        notes: 'Test notes'
      })
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('submits form with only required fields', async () => {
    const user = userEvent.setup()
    mockCreate.mockResolvedValue({
      id: '1',
      name: 'Test Material',
      currentPrice: 5.0,
      unitOfMeasure: 'kg',
      supplier: null,
      sku: null,
      notes: null,
      categoryId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Material Name/)
    const priceInput = screen.getByLabelText(/Price per Unit/)

    await user.type(nameInput, 'Test Material')
    await user.clear(priceInput)
    await user.type(priceInput, '5')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        name: 'Test Material',
        currentPrice: 5,
        unitOfMeasure: 'kg',
        supplier: null,
        sku: null,
        notes: null
      })
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('allows selecting gram as unit', async () => {
    const user = userEvent.setup()
    mockCreate.mockResolvedValue({
      id: '1',
      name: 'Test Material',
      currentPrice: 0.5,
      unitOfMeasure: 'g',
      supplier: null,
      sku: null,
      notes: null,
      categoryId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Material Name/)
    const priceInput = screen.getByLabelText(/Price per Unit/)
    const unitSelect = screen.getByLabelText(/Unit of Measure/)

    await user.type(nameInput, 'Test Material')
    await user.clear(priceInput)
    await user.type(priceInput, '0.50')
    await user.selectOptions(unitSelect, 'g')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          unitOfMeasure: 'g'
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
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Material Name/)
    const priceInput = screen.getByLabelText(/Price per Unit/)

    await user.type(nameInput, 'Test Material')
    await user.clear(priceInput)
    await user.type(priceInput, '10')

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
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Material Name/)
    const priceInput = screen.getByLabelText(/Price per Unit/)

    await user.type(nameInput, 'Test Material')
    await user.clear(priceInput)
    await user.type(priceInput, '10')

    const submitButton = screen.getByText('Save')
    const cancelButton = screen.getByText('Cancel')

    await user.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })
  })
})

describe('CreateMaterialPage error handling', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
  })

  it('shows duplicate name error when material already exists', async () => {
    const user = userEvent.setup()
    mockCreate.mockRejectedValue(new Error('DUPLICATE_NAME'))

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Material Name/)
    const priceInput = screen.getByLabelText(/Price per Unit/)

    await user.type(nameInput, 'Existing Material')
    await user.clear(priceInput)
    await user.type(priceInput, '10')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('A material with this name already exists')
      ).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('shows generic error for other failures', async () => {
    const user = userEvent.setup()
    mockCreate.mockRejectedValue(new Error('Network error'))

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Material Name/)
    const priceInput = screen.getByLabelText(/Price per Unit/)

    await user.type(nameInput, 'Test Material')
    await user.clear(priceInput)
    await user.type(priceInput, '10')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to create material')).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('server error is displayed with alert role', async () => {
    const user = userEvent.setup()
    mockCreate.mockRejectedValue(new Error('DUPLICATE_NAME'))

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Material Name/)
    const priceInput = screen.getByLabelText(/Price per Unit/)

    await user.type(nameInput, 'Existing Material')
    await user.clear(priceInput)
    await user.type(priceInput, '10')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      const errorElement = screen.getByRole('alert')
      expect(errorElement).toHaveTextContent('A material with this name already exists')
    })
  })
})

describe('CreateMaterialPage translations', () => {
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  it('renders in Dutch when language is set to Dutch', async () => {
    const testI18n = createTestI18n('nl')

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    expect(screen.getByText('Nieuw Materiaal Aanmaken')).toBeInTheDocument()
    expect(screen.getByLabelText(/Materiaalnaam/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Prijs per Eenheid/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Meeteenheid/)).toBeInTheDocument()
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
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Materiaalnaam/)
    const priceInput = screen.getByLabelText(/Prijs per Eenheid/)

    await user.type(nameInput, 'Test')
    await user.clear(priceInput)
    await user.type(priceInput, '10')

    const submitButton = screen.getByText('Opslaan')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('Er bestaat al een materiaal met deze naam')
      ).toBeInTheDocument()
    })
  })

  it('has all required English translation keys for create material', () => {
    const testI18n = createTestI18n('en')

    expect(testI18n.t('materials.create.title')).toBe('Create New Material')
    expect(testI18n.t('materials.create.fields.name')).toBe('Material Name')
    expect(testI18n.t('materials.create.fields.currentPrice')).toBe('Price per Unit')
    expect(testI18n.t('materials.create.fields.unitOfMeasure')).toBe('Unit of Measure')
    expect(testI18n.t('materials.create.fields.supplier')).toBe('Supplier')
    expect(testI18n.t('materials.create.fields.sku')).toBe('SKU')
    expect(testI18n.t('materials.create.fields.notes')).toBe('Notes')
    expect(testI18n.t('materials.create.units.kg')).toBe('Kilogram (kg)')
    expect(testI18n.t('materials.create.units.g')).toBe('Gram (g)')
    expect(testI18n.t('materials.create.success')).toBe('Material created successfully')
    expect(testI18n.t('materials.create.errors.duplicateName')).toBe(
      'A material with this name already exists'
    )
    expect(testI18n.t('materials.create.errors.createFailed')).toBe(
      'Failed to create material'
    )
  })

  it('has all required Dutch translation keys for create material', () => {
    const testI18n = createTestI18n('nl')

    expect(testI18n.t('materials.create.title')).toBe('Nieuw Materiaal Aanmaken')
    expect(testI18n.t('materials.create.fields.name')).toBe('Materiaalnaam')
    expect(testI18n.t('materials.create.fields.currentPrice')).toBe('Prijs per Eenheid')
    expect(testI18n.t('materials.create.fields.unitOfMeasure')).toBe('Meeteenheid')
    expect(testI18n.t('materials.create.fields.supplier')).toBe('Leverancier')
    expect(testI18n.t('materials.create.fields.sku')).toBe('SKU')
    expect(testI18n.t('materials.create.fields.notes')).toBe('Notities')
    expect(testI18n.t('materials.create.units.kg')).toBe('Kilogram (kg)')
    expect(testI18n.t('materials.create.units.g')).toBe('Gram (g)')
    expect(testI18n.t('materials.create.success')).toBe('Materiaal succesvol aangemaakt')
    expect(testI18n.t('materials.create.errors.duplicateName')).toBe(
      'Er bestaat al een materiaal met deze naam'
    )
    expect(testI18n.t('materials.create.errors.createFailed')).toBe(
      'Materiaal aanmaken mislukt'
    )
  })
})

describe('CreateMaterialPage accessibility', () => {
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
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Material Name/)
      expect(nameInput).toHaveAttribute('aria-invalid', 'true')
    })
  })

  it('has proper form labels for all inputs', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    // All form fields should be accessible via their labels
    expect(screen.getByLabelText(/Material Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Price per Unit/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Unit of Measure/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Supplier/)).toBeInTheDocument()
    expect(screen.getByLabelText(/SKU/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Notes/)).toBeInTheDocument()
  })

  it('shows required field indicators', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    // Required fields should have asterisk
    const requiredIndicators = screen.getAllByText('*')
    expect(requiredIndicators.length).toBe(3) // name, price, unit
  })

  it('has field errors with role alert', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <CreateMaterialPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
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
