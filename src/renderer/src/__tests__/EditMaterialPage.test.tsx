import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { EditMaterialPage } from '../pages/EditMaterialPage'

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

// Mock material data
const mockMaterial = {
  id: 'test-uuid-123',
  name: 'Beef',
  currentPrice: 15.5,
  unitOfMeasure: 'kg',
  supplier: 'Local Farm',
  sku: 'BF001',
  notes: 'Premium quality beef',
  categoryId: null,
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
      materials: {
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

describe('EditMaterialPage loading state', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
  })

  it('shows loading state while fetching material', async () => {
    mockGet.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByText('Edit Material')).toBeInTheDocument()
  })

  it('shows back button during loading', async () => {
    mockGet.mockImplementation(() => new Promise(() => {}))

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
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

describe('EditMaterialPage error states', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
  })

  it('shows not found error when material does not exist', async () => {
    mockGet.mockResolvedValue(null)

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="non-existent-id"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Material not found')).toBeInTheDocument()
    })
  })

  it('shows load failed error when API throws', async () => {
    mockGet.mockRejectedValue(new Error('Network error'))

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Failed to load material')).toBeInTheDocument()
    })
  })

  it('shows back button on error state', async () => {
    mockGet.mockResolvedValue(null)

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="non-existent-id"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Material not found')).toBeInTheDocument()
    })

    // There are multiple "Back" elements - get the one in the error state
    const backButtons = screen.getAllByText('Back')
    fireEvent.click(backButtons[1]) // Click the button in error state

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })
})

describe('EditMaterialPage form display', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
  })

  it('renders the edit material form with pre-populated values', async () => {
    mockGet.mockResolvedValue(mockMaterial)

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Material Name/)).toHaveValue('Beef')
    })

    expect(screen.getByLabelText(/Price per Unit/)).toHaveValue(15.5)
    expect(screen.getByLabelText(/Unit of Measure/)).toHaveValue('kg')
    expect(screen.getByLabelText(/Supplier/)).toHaveValue('Local Farm')
    expect(screen.getByLabelText(/SKU/)).toHaveValue('BF001')
    expect(screen.getByLabelText(/Notes/)).toHaveValue('Premium quality beef')
  })

  it('shows material name in page title', async () => {
    mockGet.mockResolvedValue(mockMaterial)

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/: Beef/)).toBeInTheDocument()
    })
  })

  it('shows cancel and save buttons', async () => {
    mockGet.mockResolvedValue(mockMaterial)

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Material Name/)).toHaveValue('Beef')
    })

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    mockGet.mockResolvedValue(mockMaterial)

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Material Name/)).toHaveValue('Beef')
    })

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when back button is clicked', async () => {
    mockGet.mockResolvedValue(mockMaterial)

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Material Name/)).toHaveValue('Beef')
    })

    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('pre-populates form with gram unit when material uses grams', async () => {
    mockGet.mockResolvedValue({ ...mockMaterial, unitOfMeasure: 'g' })

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Unit of Measure/)).toHaveValue('g')
    })
  })
})

describe('EditMaterialPage form validation', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
    mockGet.mockResolvedValue(mockMaterial)
  })

  it('shows error when name is cleared and submitted', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Material Name/)).toHaveValue('Beef')
    })

    const nameInput = screen.getByLabelText(/Material Name/)
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
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Material Name/)).toHaveValue('Beef')
    })

    const priceInput = screen.getByLabelText(/Price per Unit/)
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
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Material Name/)).toHaveValue('Beef')
    })

    const nameInput = screen.getByLabelText(/Material Name/)
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

describe('EditMaterialPage form submission', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
    mockGet.mockResolvedValue(mockMaterial)
  })

  it('submits form with updated data and calls onSuccess', async () => {
    const user = userEvent.setup()
    mockUpdate.mockResolvedValue({
      ...mockMaterial,
      name: 'Premium Beef',
      currentPrice: 20.0
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Material Name/)).toHaveValue('Beef')
    })

    const nameInput = screen.getByLabelText(/Material Name/)
    const priceInput = screen.getByLabelText(/Price per Unit/)

    await user.clear(nameInput)
    await user.type(nameInput, 'Premium Beef')
    await user.clear(priceInput)
    await user.type(priceInput, '20')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('test-uuid-123', {
        name: 'Premium Beef',
        currentPrice: 20,
        unitOfMeasure: 'kg',
        supplier: 'Local Farm',
        sku: 'BF001',
        notes: 'Premium quality beef'
      })
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('allows submitting with unchanged name (no false duplicate error)', async () => {
    const user = userEvent.setup()
    mockUpdate.mockResolvedValue({
      ...mockMaterial,
      currentPrice: 18.0
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Material Name/)).toHaveValue('Beef')
    })

    // Only change price, keep name the same
    const priceInput = screen.getByLabelText(/Price per Unit/)
    await user.clear(priceInput)
    await user.type(priceInput, '18')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('test-uuid-123', {
        name: 'Beef',
        currentPrice: 18,
        unitOfMeasure: 'kg',
        supplier: 'Local Farm',
        sku: 'BF001',
        notes: 'Premium quality beef'
      })
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('allows changing unit of measure', async () => {
    const user = userEvent.setup()
    mockUpdate.mockResolvedValue({
      ...mockMaterial,
      unitOfMeasure: 'g'
    })

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Material Name/)).toHaveValue('Beef')
    })

    const unitSelect = screen.getByLabelText(/Unit of Measure/)
    await user.selectOptions(unitSelect, 'g')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        'test-uuid-123',
        expect.objectContaining({
          unitOfMeasure: 'g'
        })
      )
    })
  })

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup()
    mockUpdate.mockImplementation(() => new Promise(() => {}))

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Material Name/)).toHaveValue('Beef')
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
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Material Name/)).toHaveValue('Beef')
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

describe('EditMaterialPage error handling', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCancel.mockReset()
    mockOnSuccess.mockReset()
    mockGet.mockResolvedValue(mockMaterial)
  })

  it('shows duplicate name error when material name already exists', async () => {
    const user = userEvent.setup()
    mockUpdate.mockRejectedValue(new Error('DUPLICATE_NAME'))

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Material Name/)).toHaveValue('Beef')
    })

    const nameInput = screen.getByLabelText(/Material Name/)
    await user.clear(nameInput)
    await user.type(nameInput, 'Existing Material')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('A material with this name already exists')
      ).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('shows not found error when material was deleted during edit', async () => {
    const user = userEvent.setup()
    mockUpdate.mockRejectedValue(new Error('NOT_FOUND'))

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Material Name/)).toHaveValue('Beef')
    })

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Material not found')).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('shows generic error for other failures', async () => {
    const user = userEvent.setup()
    mockUpdate.mockRejectedValue(new Error('Network error'))

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Material Name/)).toHaveValue('Beef')
    })

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to update material')).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('server error is displayed with alert role', async () => {
    const user = userEvent.setup()
    mockUpdate.mockRejectedValue(new Error('DUPLICATE_NAME'))

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Material Name/)).toHaveValue('Beef')
    })

    const nameInput = screen.getByLabelText(/Material Name/)
    await user.clear(nameInput)
    await user.type(nameInput, 'Duplicate Name')

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      const errorElement = screen.getByRole('alert')
      expect(errorElement).toHaveTextContent('A material with this name already exists')
    })
  })
})

describe('EditMaterialPage translations', () => {
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    mockGet.mockResolvedValue(mockMaterial)
  })

  it('renders in Dutch when language is set to Dutch', async () => {
    const testI18n = createTestI18n('nl')

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Materiaalnaam/)).toHaveValue('Beef')
    })

    expect(screen.getByText(/Materiaal Bewerken/)).toBeInTheDocument()
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
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Materiaalnaam/)).toHaveValue('Beef')
    })

    const nameInput = screen.getByLabelText(/Materiaalnaam/)
    await user.clear(nameInput)
    await user.type(nameInput, 'Duplicate')

    const submitButton = screen.getByText('Opslaan')
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('Er bestaat al een materiaal met deze naam')
      ).toBeInTheDocument()
    })
  })

  it('has all required English translation keys for edit material', () => {
    const testI18n = createTestI18n('en')

    expect(testI18n.t('materials.edit.title')).toBe('Edit Material')
    expect(testI18n.t('materials.edit.success')).toBe('Material updated successfully')
    expect(testI18n.t('materials.edit.errors.notFound')).toBe('Material not found')
    expect(testI18n.t('materials.edit.errors.duplicateName')).toBe(
      'A material with this name already exists'
    )
    expect(testI18n.t('materials.edit.errors.updateFailed')).toBe(
      'Failed to update material'
    )
    expect(testI18n.t('materials.edit.errors.loadFailed')).toBe(
      'Failed to load material'
    )
  })

  it('has all required Dutch translation keys for edit material', () => {
    const testI18n = createTestI18n('nl')

    expect(testI18n.t('materials.edit.title')).toBe('Materiaal Bewerken')
    expect(testI18n.t('materials.edit.success')).toBe('Materiaal succesvol bijgewerkt')
    expect(testI18n.t('materials.edit.errors.notFound')).toBe('Materiaal niet gevonden')
    expect(testI18n.t('materials.edit.errors.duplicateName')).toBe(
      'Er bestaat al een materiaal met deze naam'
    )
    expect(testI18n.t('materials.edit.errors.updateFailed')).toBe(
      'Materiaal bijwerken mislukt'
    )
    expect(testI18n.t('materials.edit.errors.loadFailed')).toBe(
      'Materiaal laden mislukt'
    )
  })
})

describe('EditMaterialPage accessibility', () => {
  let testI18n: typeof i18n
  const mockOnCancel = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockGet.mockResolvedValue(mockMaterial)
  })

  it('has proper aria-invalid attributes for invalid fields', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Material Name/)).toHaveValue('Beef')
    })

    const nameInput = screen.getByLabelText(/Material Name/)
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
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Material Name/)).toHaveValue('Beef')
    })

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
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Material Name/)).toHaveValue('Beef')
    })

    const requiredIndicators = screen.getAllByText('*')
    expect(requiredIndicators.length).toBe(3) // name, price, unit
  })

  it('has field errors with role alert', async () => {
    const user = userEvent.setup()

    render(
      <I18nextProvider i18n={testI18n}>
        <EditMaterialPage
          materialId="test-uuid-123"
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Material Name/)).toHaveValue('Beef')
    })

    const nameInput = screen.getByLabelText(/Material Name/)
    await user.clear(nameInput)

    const submitButton = screen.getByText('Save')
    await user.click(submitButton)

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert')
      expect(alerts.length).toBeGreaterThan(0)
    })
  })
})
