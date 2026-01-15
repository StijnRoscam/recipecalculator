import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { CreatePackagingPage } from '../pages/CreatePackagingPage'

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
      packaging: {
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

describe('CreatePackagingPage', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
  })

  it('renders the create packaging form', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    expect(screen.getByText('Create New Packaging')).toBeInTheDocument()
    expect(screen.getByLabelText(/Packaging Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Unit Price/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Unit Type/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Supplier/)).toBeInTheDocument()
    expect(screen.getByLabelText(/SKU/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Notes/)).toBeInTheDocument()
  })

  it('shows back button that calls onCancel', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const backButton = screen.getByText('Back')
    await user.click(backButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('shows cancel and save buttons', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('has piece selected as default unit type', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const unitSelect = screen.getByLabelText(/Unit Type/) as HTMLSelectElement
    expect(unitSelect.value).toBe('piece')
  })

  it('shows all 6 unit type options', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const unitSelect = screen.getByLabelText(/Unit Type/) as HTMLSelectElement
    const options = unitSelect.querySelectorAll('option')

    expect(options).toHaveLength(6)
    expect(options[0].value).toBe('piece')
    expect(options[1].value).toBe('meter')
    expect(options[2].value).toBe('roll')
    expect(options[3].value).toBe('sheet')
    expect(options[4].value).toBe('box')
    expect(options[5].value).toBe('bag')
  })
})

describe('CreatePackagingPage form validation', () => {
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
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
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
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Packaging Name/)
    const priceInput = screen.getByLabelText(/Unit Price/)

    await user.type(nameInput, 'Test Packaging')
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
      name: 'Free Packaging',
      unitPrice: 0,
      unitType: 'piece',
      supplier: null,
      sku: null,
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Packaging Name/)
    const priceInput = screen.getByLabelText(/Unit Price/)

    await user.type(nameInput, 'Free Packaging')
    await user.clear(priceInput)
    await user.type(priceInput, '0')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          unitPrice: 0
        })
      )
    })
  })

  it('validates name is not longer than 200 characters', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Packaging Name/)
    const longName = 'a'.repeat(201)

    await user.type(nameInput, longName)

    const priceInput = screen.getByLabelText(/Unit Price/)
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

describe('CreatePackagingPage form submission', () => {
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
      name: 'Vacuum Bag',
      unitPrice: 0.25,
      unitType: 'piece',
      supplier: 'Packaging Co',
      sku: 'VB001',
      notes: 'Small size',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Packaging Name/)
    const priceInput = screen.getByLabelText(/Unit Price/)
    const supplierInput = screen.getByLabelText(/Supplier/)
    const skuInput = screen.getByLabelText(/SKU/)
    const notesInput = screen.getByLabelText(/Notes/)

    await user.type(nameInput, 'Vacuum Bag')
    await user.clear(priceInput)
    await user.type(priceInput, '0.25')
    await user.type(supplierInput, 'Packaging Co')
    await user.type(skuInput, 'VB001')
    await user.type(notesInput, 'Small size')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        name: 'Vacuum Bag',
        unitPrice: 0.25,
        unitType: 'piece',
        supplier: 'Packaging Co',
        sku: 'VB001',
        notes: 'Small size'
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
      name: 'Test Packaging',
      unitPrice: 5.0,
      unitType: 'piece',
      supplier: null,
      sku: null,
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Packaging Name/)
    const priceInput = screen.getByLabelText(/Unit Price/)

    await user.type(nameInput, 'Test Packaging')
    await user.clear(priceInput)
    await user.type(priceInput, '5')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        name: 'Test Packaging',
        unitPrice: 5,
        unitType: 'piece',
        supplier: null,
        sku: null,
        notes: null
      })
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('allows selecting meter as unit type', async () => {
    const user = userEvent.setup()
    mockCreate.mockResolvedValue({
      id: '1',
      name: 'Ribbon',
      unitPrice: 2.5,
      unitType: 'meter',
      supplier: null,
      sku: null,
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Packaging Name/)
    const priceInput = screen.getByLabelText(/Unit Price/)
    const unitSelect = screen.getByLabelText(/Unit Type/)

    await user.type(nameInput, 'Ribbon')
    await user.clear(priceInput)
    await user.type(priceInput, '2.50')
    await user.selectOptions(unitSelect, 'meter')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          unitType: 'meter'
        })
      )
    })
  })

  it('allows selecting roll as unit type', async () => {
    const user = userEvent.setup()
    mockCreate.mockResolvedValue({
      id: '1',
      name: 'Label Roll',
      unitPrice: 15,
      unitType: 'roll',
      supplier: null,
      sku: null,
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Packaging Name/)
    const priceInput = screen.getByLabelText(/Unit Price/)
    const unitSelect = screen.getByLabelText(/Unit Type/)

    await user.type(nameInput, 'Label Roll')
    await user.clear(priceInput)
    await user.type(priceInput, '15')
    await user.selectOptions(unitSelect, 'roll')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          unitType: 'roll'
        })
      )
    })
  })

  it('allows selecting all unit types', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const unitSelect = screen.getByLabelText(/Unit Type/)

    // Test each unit type can be selected
    const unitTypes = ['piece', 'meter', 'roll', 'sheet', 'box', 'bag']
    for (const unitType of unitTypes) {
      await user.selectOptions(unitSelect, unitType)
      expect((unitSelect as HTMLSelectElement).value).toBe(unitType)
    }
  })

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup()
    // Create a promise that never resolves to keep loading state
    mockCreate.mockImplementation(() => new Promise(() => {}))

    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Packaging Name/)
    const priceInput = screen.getByLabelText(/Unit Price/)

    await user.type(nameInput, 'Test Packaging')
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
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Packaging Name/)
    const priceInput = screen.getByLabelText(/Unit Price/)

    await user.type(nameInput, 'Test Packaging')
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

describe('CreatePackagingPage error handling', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
  })

  it('shows duplicate name error when packaging already exists', async () => {
    const user = userEvent.setup()
    mockCreate.mockRejectedValue(new Error('DUPLICATE_NAME'))

    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Packaging Name/)
    const priceInput = screen.getByLabelText(/Unit Price/)

    await user.type(nameInput, 'Existing Packaging')
    await user.clear(priceInput)
    await user.type(priceInput, '10')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('A packaging material with this name already exists')
      ).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('shows generic error for other failures', async () => {
    const user = userEvent.setup()
    mockCreate.mockRejectedValue(new Error('Network error'))

    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Packaging Name/)
    const priceInput = screen.getByLabelText(/Unit Price/)

    await user.type(nameInput, 'Test Packaging')
    await user.clear(priceInput)
    await user.type(priceInput, '10')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to create packaging')).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('server error is displayed with alert role', async () => {
    const user = userEvent.setup()
    mockCreate.mockRejectedValue(new Error('DUPLICATE_NAME'))

    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Packaging Name/)
    const priceInput = screen.getByLabelText(/Unit Price/)

    await user.type(nameInput, 'Existing Packaging')
    await user.clear(priceInput)
    await user.type(priceInput, '10')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      const errorElement = screen.getByRole('alert')
      expect(errorElement).toHaveTextContent('A packaging material with this name already exists')
    })
  })
})

describe('CreatePackagingPage translations', () => {
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  it('renders in Dutch when language is set to Dutch', async () => {
    const testI18n = createTestI18n('nl')

    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    expect(screen.getByText('Nieuwe Verpakking Aanmaken')).toBeInTheDocument()
    expect(screen.getByLabelText(/Verpakkingsnaam/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Stukprijs/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Eenheidstype/)).toBeInTheDocument()
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
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const nameInput = screen.getByLabelText(/Verpakkingsnaam/)
    const priceInput = screen.getByLabelText(/Stukprijs/)

    await user.type(nameInput, 'Test')
    await user.clear(priceInput)
    await user.type(priceInput, '10')

    const submitButton = screen.getByText('Opslaan')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('Er bestaat al een verpakking met deze naam')
      ).toBeInTheDocument()
    })
  })

  it('shows Dutch unit type labels', async () => {
    const testI18n = createTestI18n('nl')

    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const unitSelect = screen.getByLabelText(/Eenheidstype/) as HTMLSelectElement
    const options = unitSelect.querySelectorAll('option')

    expect(options[0]).toHaveTextContent('Stuk')
    expect(options[1]).toHaveTextContent('Meter')
    expect(options[2]).toHaveTextContent('Rol')
    expect(options[3]).toHaveTextContent('Vel')
    expect(options[4]).toHaveTextContent('Doos')
    expect(options[5]).toHaveTextContent('Zak')
  })

  it('has all required English translation keys for create packaging', () => {
    const testI18n = createTestI18n('en')

    expect(testI18n.t('packaging.create.title')).toBe('Create New Packaging')
    expect(testI18n.t('packaging.create.fields.name')).toBe('Packaging Name')
    expect(testI18n.t('packaging.create.fields.unitPrice')).toBe('Unit Price')
    expect(testI18n.t('packaging.create.fields.unitType')).toBe('Unit Type')
    expect(testI18n.t('packaging.create.fields.supplier')).toBe('Supplier')
    expect(testI18n.t('packaging.create.fields.sku')).toBe('SKU')
    expect(testI18n.t('packaging.create.fields.notes')).toBe('Notes')
    expect(testI18n.t('packaging.create.success')).toBe('Packaging created successfully')
    expect(testI18n.t('packaging.create.errors.duplicateName')).toBe(
      'A packaging material with this name already exists'
    )
    expect(testI18n.t('packaging.create.errors.createFailed')).toBe('Failed to create packaging')
  })

  it('has all required Dutch translation keys for create packaging', () => {
    const testI18n = createTestI18n('nl')

    expect(testI18n.t('packaging.create.title')).toBe('Nieuwe Verpakking Aanmaken')
    expect(testI18n.t('packaging.create.fields.name')).toBe('Verpakkingsnaam')
    expect(testI18n.t('packaging.create.fields.unitPrice')).toBe('Stukprijs')
    expect(testI18n.t('packaging.create.fields.unitType')).toBe('Eenheidstype')
    expect(testI18n.t('packaging.create.fields.supplier')).toBe('Leverancier')
    expect(testI18n.t('packaging.create.fields.sku')).toBe('SKU')
    expect(testI18n.t('packaging.create.fields.notes')).toBe('Notities')
    expect(testI18n.t('packaging.create.success')).toBe('Verpakking succesvol aangemaakt')
    expect(testI18n.t('packaging.create.errors.duplicateName')).toBe(
      'Er bestaat al een verpakking met deze naam'
    )
    expect(testI18n.t('packaging.create.errors.createFailed')).toBe('Verpakking aanmaken mislukt')
  })
})

describe('CreatePackagingPage accessibility', () => {
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
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Packaging Name/)
      expect(nameInput).toHaveAttribute('aria-invalid', 'true')
    })
  })

  it('has proper form labels for all inputs', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    // All form fields should be accessible via their labels
    expect(screen.getByLabelText(/Packaging Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Unit Price/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Unit Type/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Supplier/)).toBeInTheDocument()
    expect(screen.getByLabelText(/SKU/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Notes/)).toBeInTheDocument()
  })

  it('shows required field indicators', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
      </I18nextProvider>
    )

    // Required fields should have asterisk
    const requiredIndicators = screen.getAllByText('*')
    expect(requiredIndicators.length).toBe(3) // name, price, unit type
  })

  it('has field errors with role alert', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <CreatePackagingPage onCancel={mockOnCancel} onSuccess={mockOnSuccess} />
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
