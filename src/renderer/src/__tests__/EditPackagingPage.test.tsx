import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { EditPackagingPage } from '../pages/EditPackagingPage'

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

// Mock packaging data
const mockPackaging = {
  id: 'test-uuid-123',
  name: 'Vacuum Bag',
  unitPrice: 0.25,
  unitType: 'piece',
  supplier: 'Packaging Co',
  sku: 'VB001',
  notes: 'Small size bag',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isArchived: false
}

// Setup window.api mock
const mockGet = vi.fn()
const mockUpdate = vi.fn()

beforeEach(() => {
  // Reset mocks before each test
  mockGet.mockReset()
  mockUpdate.mockReset()

  // Setup window.api mock
  Object.defineProperty(window, 'api', {
    value: {
      packaging: {
        get: mockGet,
        update: mockUpdate
      }
    },
    writable: true,
    configurable: true
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('EditPackagingPage loading state', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
  })

  it('shows loading state while fetching packaging', async () => {
    mockGet.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByText('Edit Packaging Material')).toBeInTheDocument()
  })

  it('shows back button during loading', async () => {
    mockGet.mockImplementation(() => new Promise(() => {}))

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })
})

describe('EditPackagingPage error states', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
  })

  it('shows not found error when packaging does not exist', async () => {
    mockGet.mockResolvedValue(null)

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="non-existent-id"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Packaging material not found')).toBeInTheDocument()
    })
  })

  it('shows load failed error when API throws', async () => {
    mockGet.mockRejectedValue(new Error('Network error'))

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Failed to load packaging material')).toBeInTheDocument()
    })
  })

  it('shows back button on error state', async () => {
    mockGet.mockResolvedValue(null)

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="non-existent-id"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Packaging material not found')).toBeInTheDocument()
    })

    // There are multiple "Back" elements - get the one in the error state
    const backButtons = screen.getAllByText('Back')
    fireEvent.click(backButtons[1]) // Click the button in error state

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })
})

describe('EditPackagingPage form display', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
  })

  it('renders the edit packaging form with pre-populated values', async () => {
    mockGet.mockResolvedValue(mockPackaging)

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

    expect(screen.getByLabelText(/Unit Price/)).toHaveValue(0.25)
    expect(screen.getByLabelText(/Unit Type/)).toHaveValue('piece')
    expect(screen.getByLabelText(/Supplier/)).toHaveValue('Packaging Co')
    expect(screen.getByLabelText(/SKU/)).toHaveValue('VB001')
    expect(screen.getByLabelText(/Notes/)).toHaveValue('Small size bag')
  })

  it('shows packaging name in page title', async () => {
    mockGet.mockResolvedValue(mockPackaging)

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/: Vacuum Bag/)).toBeInTheDocument()
    })
  })

  it('shows cancel and save buttons', async () => {
    mockGet.mockResolvedValue(mockPackaging)

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    mockGet.mockResolvedValue(mockPackaging)

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when back button is clicked', async () => {
    mockGet.mockResolvedValue(mockPackaging)

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('pre-populates form with meter unit when packaging uses meters', async () => {
    mockGet.mockResolvedValue({ ...mockPackaging, unitType: 'meter' })

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Unit Type/)).toHaveValue('meter')
    })
  })

  it('shows empty fields for optional null values', async () => {
    mockGet.mockResolvedValue({
      ...mockPackaging,
      supplier: null,
      sku: null,
      notes: null
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

    expect(screen.getByLabelText(/Supplier/)).toHaveValue('')
    expect(screen.getByLabelText(/SKU/)).toHaveValue('')
    expect(screen.getByLabelText(/Notes/)).toHaveValue('')
  })
})

describe('EditPackagingPage form validation', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
    mockGet.mockResolvedValue(mockPackaging)
  })

  it('shows error when name is cleared and submitted', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

    const nameInput = screen.getByLabelText(/Packaging Name/)
    await user.clear(nameInput)

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('shows error when price is negative', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

    const priceInput = screen.getByLabelText(/Unit Price/)
    await user.clear(priceInput)
    await user.type(priceInput, '-5')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Please enter a positive number')).toBeInTheDocument()
    })

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('validates name is not longer than 200 characters', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

    const nameInput = screen.getByLabelText(/Packaging Name/)
    const longName = 'a'.repeat(201)
    await user.clear(nameInput)
    await user.type(nameInput, longName)

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Maximum 200 characters allowed/)).toBeInTheDocument()
    })

    expect(mockUpdate).not.toHaveBeenCalled()
  })
})

describe('EditPackagingPage form submission', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
    mockGet.mockResolvedValue(mockPackaging)
  })

  it('submits form with updated data and calls onSuccess', async () => {
    const user = userEvent.setup()
    mockUpdate.mockResolvedValue({
      ...mockPackaging,
      name: 'Large Vacuum Bag',
      unitPrice: 0.5
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

    const nameInput = screen.getByLabelText(/Packaging Name/)
    const priceInput = screen.getByLabelText(/Unit Price/)

    await user.clear(nameInput)
    await user.type(nameInput, 'Large Vacuum Bag')
    await user.clear(priceInput)
    await user.type(priceInput, '0.5')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('test-uuid-123', {
        name: 'Large Vacuum Bag',
        unitPrice: 0.5,
        unitType: 'piece',
        supplier: 'Packaging Co',
        sku: 'VB001',
        notes: 'Small size bag'
      })
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('allows submitting with unchanged name (no false duplicate error)', async () => {
    const user = userEvent.setup()
    mockUpdate.mockResolvedValue({
      ...mockPackaging,
      unitPrice: 0.3
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

    // Only change price, keep name the same
    const priceInput = screen.getByLabelText(/Unit Price/)
    await user.clear(priceInput)
    await user.type(priceInput, '0.3')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('test-uuid-123', {
        name: 'Vacuum Bag',
        unitPrice: 0.3,
        unitType: 'piece',
        supplier: 'Packaging Co',
        sku: 'VB001',
        notes: 'Small size bag'
      })
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('allows changing unit type', async () => {
    const user = userEvent.setup()
    mockUpdate.mockResolvedValue({
      ...mockPackaging,
      unitType: 'meter'
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

    const unitSelect = screen.getByLabelText(/Unit Type/)
    await user.selectOptions(unitSelect, 'meter')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        'test-uuid-123',
        expect.objectContaining({
          unitType: 'meter'
        })
      )
    })
  })

  it('allows selecting all unit types', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

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
    mockUpdate.mockImplementation(() => new Promise(() => {}))

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    expect(submitButton).toBeDisabled()
  })

  it('disables buttons while submitting', async () => {
    const user = userEvent.setup()
    mockUpdate.mockImplementation(() => new Promise(() => {}))

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

    const submitButton = screen.getByText('Save')
    const cancelButton = screen.getByText('Cancel')

    await user.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })
  })
})

describe('EditPackagingPage error handling', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
    mockGet.mockResolvedValue(mockPackaging)
  })

  it('shows duplicate name error when packaging name already exists', async () => {
    const user = userEvent.setup()
    mockUpdate.mockRejectedValue(new Error('DUPLICATE_NAME'))

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

    const nameInput = screen.getByLabelText(/Packaging Name/)
    await user.clear(nameInput)
    await user.type(nameInput, 'Existing Packaging')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('A packaging material with this name already exists')
      ).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('shows not found error when packaging was deleted during edit', async () => {
    const user = userEvent.setup()
    mockUpdate.mockRejectedValue(new Error('NOT_FOUND'))

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Packaging material not found')).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('shows generic error for other failures', async () => {
    const user = userEvent.setup()
    mockUpdate.mockRejectedValue(new Error('Network error'))

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to update packaging')).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('server error is displayed with alert role', async () => {
    const user = userEvent.setup()
    mockUpdate.mockRejectedValue(new Error('DUPLICATE_NAME'))

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

    const nameInput = screen.getByLabelText(/Packaging Name/)
    await user.clear(nameInput)
    await user.type(nameInput, 'Duplicate Name')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      const errorElement = screen.getByRole('alert')
      expect(errorElement).toHaveTextContent('A packaging material with this name already exists')
    })
  })
})

describe('EditPackagingPage translations', () => {
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    mockGet.mockResolvedValue(mockPackaging)
  })

  it('renders in Dutch when language is set to Dutch', async () => {
    const testI18n = createTestI18n('nl')

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Verpakkingsnaam/)).toHaveValue('Vacuum Bag')
    })

    expect(screen.getByText(/Verpakking Bewerken/)).toBeInTheDocument()
    expect(screen.getByText('Opslaan')).toBeInTheDocument()
    expect(screen.getByText('Annuleren')).toBeInTheDocument()
    expect(screen.getByText('Terug')).toBeInTheDocument()
  })

  it('shows Dutch error messages', async () => {
    const testI18n = createTestI18n('nl')
    const user = userEvent.setup()
    mockUpdate.mockRejectedValue(new Error('DUPLICATE_NAME'))

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Verpakkingsnaam/)).toHaveValue('Vacuum Bag')
    })

    const nameInput = screen.getByLabelText(/Verpakkingsnaam/)
    await user.clear(nameInput)
    await user.type(nameInput, 'Duplicate')

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
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Verpakkingsnaam/)).toHaveValue('Vacuum Bag')
    })

    const unitSelect = screen.getByLabelText(/Eenheidstype/) as HTMLSelectElement
    const options = unitSelect.querySelectorAll('option')

    expect(options[0]).toHaveTextContent('Stuk')
    expect(options[1]).toHaveTextContent('Meter')
    expect(options[2]).toHaveTextContent('Rol')
    expect(options[3]).toHaveTextContent('Vel')
    expect(options[4]).toHaveTextContent('Doos')
    expect(options[5]).toHaveTextContent('Zak')
  })

  it('has all required English translation keys for edit packaging', () => {
    const testI18n = createTestI18n('en')

    expect(testI18n.t('packaging.edit.title')).toBe('Edit Packaging Material')
    expect(testI18n.t('packaging.edit.success')).toBe('Packaging updated successfully')
    expect(testI18n.t('packaging.edit.errors.notFound')).toBe('Packaging material not found')
    expect(testI18n.t('packaging.edit.errors.duplicateName')).toBe(
      'A packaging material with this name already exists'
    )
    expect(testI18n.t('packaging.edit.errors.updateFailed')).toBe(
      'Failed to update packaging'
    )
    expect(testI18n.t('packaging.edit.errors.loadFailed')).toBe(
      'Failed to load packaging material'
    )
  })

  it('has all required Dutch translation keys for edit packaging', () => {
    const testI18n = createTestI18n('nl')

    expect(testI18n.t('packaging.edit.title')).toBe('Verpakking Bewerken')
    expect(testI18n.t('packaging.edit.success')).toBe('Verpakking succesvol bijgewerkt')
    expect(testI18n.t('packaging.edit.errors.notFound')).toBe('Verpakking niet gevonden')
    expect(testI18n.t('packaging.edit.errors.duplicateName')).toBe(
      'Er bestaat al een verpakking met deze naam'
    )
    expect(testI18n.t('packaging.edit.errors.updateFailed')).toBe(
      'Verpakking bijwerken mislukt'
    )
    expect(testI18n.t('packaging.edit.errors.loadFailed')).toBe(
      'Verpakking laden mislukt'
    )
  })
})

describe('EditPackagingPage accessibility', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockGet.mockResolvedValue(mockPackaging)
  })

  it('has proper aria-invalid attributes for invalid fields', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

    const nameInput = screen.getByLabelText(/Packaging Name/)
    await user.clear(nameInput)

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(nameInput).toHaveAttribute('aria-invalid', 'true')
    })
  })

  it('has proper form labels for all inputs', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

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
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

    const requiredIndicators = screen.getAllByText('*')
    expect(requiredIndicators.length).toBe(3) // name, price, unit type
  })

  it('has field errors with role alert', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <EditPackagingPage
          packagingId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Packaging Name/)).toHaveValue('Vacuum Bag')
    })

    const nameInput = screen.getByLabelText(/Packaging Name/)
    await user.clear(nameInput)

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert')
      expect(alerts.length).toBeGreaterThan(0)
    })
  })
})
