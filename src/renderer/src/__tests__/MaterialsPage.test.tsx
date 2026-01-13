import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { MaterialsPage } from '../pages/MaterialsPage'
import type { Material } from '../../../shared/types'

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

// Mock materials data (using camelCase to match Prisma output)
const mockMaterials: Material[] = [
  {
    id: '1',
    name: 'Beef',
    categoryId: null,
    currentPrice: 12.5,
    unitOfMeasure: 'kg',
    supplier: 'Local Farm',
    sku: 'BF001',
    notes: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isArchived: false
  },
  {
    id: '2',
    name: 'Pork',
    categoryId: null,
    currentPrice: 8.75,
    unitOfMeasure: 'kg',
    supplier: 'Supplier B',
    sku: 'PK001',
    notes: 'Premium quality',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    isArchived: false
  },
  {
    id: '3',
    name: 'Archived Material',
    categoryId: null,
    currentPrice: 5.0,
    unitOfMeasure: 'g',
    supplier: null,
    sku: null,
    notes: null,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
    isArchived: true
  }
]

// Setup window.api mock
const mockGetAll = vi.fn()
const mockArchive = vi.fn()
const mockUnarchive = vi.fn()

beforeEach(() => {
  // Reset mock before each test
  mockGetAll.mockReset()
  mockArchive.mockReset()
  mockUnarchive.mockReset()

  // Setup window.api mock
  Object.defineProperty(window, 'api', {
    value: {
      materials: {
        getAll: mockGetAll,
        archive: mockArchive,
        unarchive: mockUnarchive
      }
    },
    writable: true,
    configurable: true
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('MaterialsPage', () => {
  let testI18n: typeof i18n
  const mockOnCreateMaterial = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCreateMaterial.mockReset()
  })

  it('shows loading state initially', () => {
    mockGetAll.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
      </I18nextProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows empty state when no materials exist', async () => {
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(
        screen.getByText('No materials found. Add your first material to get started.')
      ).toBeInTheDocument()
    })
  })

  it('displays materials in a table', async () => {
    mockGetAll.mockResolvedValue(mockMaterials.filter((m) => !m.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Beef')).toBeInTheDocument()
      expect(screen.getByText('Pork')).toBeInTheDocument()
    })

    // Check price formatting
    expect(screen.getByText('€12.50')).toBeInTheDocument()
    expect(screen.getByText('€8.75')).toBeInTheDocument()

    // Check supplier
    expect(screen.getByText('Local Farm')).toBeInTheDocument()
    expect(screen.getByText('Supplier B')).toBeInTheDocument()
  })

  it('displays table headers correctly', async () => {
    mockGetAll.mockResolvedValue(mockMaterials.filter((m) => !m.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Price')).toBeInTheDocument()
      expect(screen.getByText('Unit')).toBeInTheDocument()
      expect(screen.getByText('Supplier')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })
  })

  it('shows Add Material button', async () => {
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Material')).toBeInTheDocument()
    })
  })

  it('calls onCreateMaterial when Add Material button is clicked', async () => {
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Material')).toBeInTheDocument()
    })

    const addButton = screen.getByText('Add Material')
    fireEvent.click(addButton)

    expect(mockOnCreateMaterial).toHaveBeenCalledTimes(1)
  })

  it('calls onEditMaterial with material id when Edit button is clicked', async () => {
    const mockOnEditMaterial = vi.fn()
    mockGetAll.mockResolvedValue(mockMaterials.filter((m) => !m.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage
          onCreateMaterial={mockOnCreateMaterial}
          onEditMaterial={mockOnEditMaterial}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Beef')).toBeInTheDocument()
    })

    // Get the first edit button (for 'Beef' material)
    const editButtons = screen.getAllByTitle('Edit')
    fireEvent.click(editButtons[0])

    expect(mockOnEditMaterial).toHaveBeenCalledTimes(1)
    expect(mockOnEditMaterial).toHaveBeenCalledWith('1')
  })

  it('shows Show archived checkbox unchecked by default', async () => {
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
      </I18nextProvider>
    )

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })
  })

  it('fetches materials with includeArchived=false by default', async () => {
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenCalledWith(false)
    })
  })

  it('fetches materials with includeArchived=true when checkbox is checked', async () => {
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenCalledWith(false)
    })

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenCalledWith(true)
    })
  })

  it('displays archived badge for archived materials', async () => {
    mockGetAll.mockResolvedValue(mockMaterials)

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
      </I18nextProvider>
    )

    // Check the show archived checkbox
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    await waitFor(() => {
      expect(screen.getByText('Archived')).toBeInTheDocument()
    })
  })

  it('displays dash for missing supplier', async () => {
    mockGetAll.mockResolvedValue([mockMaterials[2]]) // Archived material has no supplier

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('-')).toBeInTheDocument()
    })
  })

  it('displays unit of measure correctly', async () => {
    mockGetAll.mockResolvedValue(mockMaterials.filter((m) => !m.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
      </I18nextProvider>
    )

    await waitFor(() => {
      const kgCells = screen.getAllByText('kg')
      expect(kgCells.length).toBeGreaterThan(0)
    })
  })

  it('has edit and archive buttons enabled and delete buttons disabled', async () => {
    mockGetAll.mockResolvedValue(mockMaterials.filter((m) => !m.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
      </I18nextProvider>
    )

    await waitFor(() => {
      const editButtons = screen.getAllByTitle('Edit')
      const deleteButtons = screen.getAllByTitle('Delete')
      const archiveButtons = screen.getAllByTitle('Archive')

      // Edit buttons are enabled
      editButtons.forEach((btn) => expect(btn).toBeEnabled())
      // Archive buttons are enabled
      archiveButtons.forEach((btn) => expect(btn).toBeEnabled())
      // Delete buttons are still disabled (placeholders)
      deleteButtons.forEach((btn) => expect(btn).toBeDisabled())
    })
  })

  it('shows error state when API call fails', async () => {
    mockGetAll.mockRejectedValue(new Error('Network error'))

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })
  })

  it('retries fetching materials when retry button is clicked', async () => {
    mockGetAll.mockRejectedValueOnce(new Error('Network error'))
    mockGetAll.mockResolvedValueOnce([])

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    })

    const retryButton = screen.getByText('Retry')
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('No materials found. Add your first material to get started.')).toBeInTheDocument()
    })

    expect(mockGetAll).toHaveBeenCalledTimes(2)
  })

  it('renders in Dutch when language is set to Dutch', async () => {
    testI18n = createTestI18n('nl')
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Materiaal toevoegen')).toBeInTheDocument()
      expect(screen.getByText('Gearchiveerde materialen tonen')).toBeInTheDocument()
      expect(
        screen.getByText('Geen materialen gevonden. Voeg je eerste materiaal toe om te beginnen.')
      ).toBeInTheDocument()
    })
  })
})

describe('MaterialsPage search functionality', () => {
  let testI18n: typeof i18n
  const mockOnCreateMaterial = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCreateMaterial.mockReset()
  })

  it('shows search input with placeholder', async () => {
    mockGetAll.mockResolvedValue(mockMaterials.filter((m) => !m.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
      </I18nextProvider>
    )

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search materials...')
      expect(searchInput).toBeInTheDocument()
    })
  })

  it('filters materials by name as user types (case-insensitive)', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockMaterials.filter((m) => !m.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef')).toBeInTheDocument()
    expect(screen.getByText('Pork')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search materials...')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'beef' } })
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(screen.getByText('Beef')).toBeInTheDocument()
    expect(screen.queryByText('Pork')).not.toBeInTheDocument()

    vi.useRealTimers()
  })

  it('filters materials by partial name match', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockMaterials.filter((m) => !m.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Pork')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search materials...')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'ork' } })
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(screen.getByText('Pork')).toBeInTheDocument()
    expect(screen.queryByText('Beef')).not.toBeInTheDocument()

    vi.useRealTimers()
  })

  it('filters materials by supplier', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockMaterials.filter((m) => !m.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search materials...')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Local Farm' } })
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(screen.getByText('Beef')).toBeInTheDocument()
    expect(screen.queryByText('Pork')).not.toBeInTheDocument()

    vi.useRealTimers()
  })

  it('shows no results message when search has no matches', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockMaterials.filter((m) => !m.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search materials...')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'xyz' } })
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(screen.getByText('No materials match your search')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('shows clear button when search has text', async () => {
    mockGetAll.mockResolvedValue(mockMaterials.filter((m) => !m.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Beef')).toBeInTheDocument()
    })

    // Clear button should not be visible initially
    expect(screen.queryByTitle('Clear search')).not.toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search materials...')
    fireEvent.change(searchInput, { target: { value: 'test' } })

    // Clear button should now be visible
    expect(screen.getByTitle('Clear search')).toBeInTheDocument()
  })

  it('clears search when clear button is clicked', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockMaterials.filter((m) => !m.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search materials...')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'beef' } })
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(screen.queryByText('Pork')).not.toBeInTheDocument()

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

    expect(screen.getByText('Beef')).toBeInTheDocument()
    expect(screen.getByText('Pork')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('clears search when Escape key is pressed', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockMaterials.filter((m) => !m.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search materials...')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'beef' } })
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(screen.queryByText('Pork')).not.toBeInTheDocument()

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

    expect(screen.getByText('Beef')).toBeInTheDocument()
    expect(screen.getByText('Pork')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('debounces search input (only triggers after 300ms delay)', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockMaterials.filter((m) => !m.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search materials...')

    // Type multiple characters quickly
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'b' } })
      await vi.advanceTimersByTimeAsync(100)
      fireEvent.change(searchInput, { target: { value: 'be' } })
      await vi.advanceTimersByTimeAsync(100)
      fireEvent.change(searchInput, { target: { value: 'bee' } })
      await vi.advanceTimersByTimeAsync(100)
      fireEvent.change(searchInput, { target: { value: 'beef' } })
    })

    // Before debounce completes, both items should still be visible
    expect(screen.getByText('Beef')).toBeInTheDocument()
    expect(screen.getByText('Pork')).toBeInTheDocument()

    // After debounce delay
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(screen.getByText('Beef')).toBeInTheDocument()
    expect(screen.queryByText('Pork')).not.toBeInTheDocument()

    vi.useRealTimers()
  })

  it('renders search placeholder in Dutch', async () => {
    testI18n = createTestI18n('nl')
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Materialen zoeken...')).toBeInTheDocument()
    })
  })

  it('renders no search results message in Dutch', async () => {
    vi.useFakeTimers()
    testI18n = createTestI18n('nl')
    mockGetAll.mockResolvedValue(mockMaterials.filter((m) => !m.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Materialen zoeken...')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'xyz' } })
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(
      screen.getByText('Geen materialen gevonden voor uw zoekopdracht')
    ).toBeInTheDocument()

    vi.useRealTimers()
  })
})

describe('MaterialsPage archive functionality', () => {
  let testI18n: typeof i18n
  const mockOnCreateMaterial = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCreateMaterial.mockReset()
  })

  it('calls archive API when archive button is clicked', async () => {
    const activeMaterials = mockMaterials.filter((m) => !m.isArchived)
    mockGetAll.mockResolvedValue(activeMaterials)
    mockArchive.mockResolvedValue({ ...activeMaterials[0], isArchived: true })

    render(
      <I18nextProvider i18n={testI18n}>
        <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Beef')).toBeInTheDocument()
    })

    const archiveButtons = screen.getAllByTitle('Archive')
    fireEvent.click(archiveButtons[0])

    await waitFor(() => {
      expect(mockArchive).toHaveBeenCalledWith('1')
    })
  })

  it('shows success message after archiving', async () => {
    vi.useFakeTimers()
    const activeMaterials = mockMaterials.filter((m) => !m.isArchived)
    // First call returns active materials, second call after archive returns remaining
    mockGetAll
      .mockResolvedValueOnce(activeMaterials)
      .mockResolvedValueOnce([activeMaterials[1]])
    mockArchive.mockResolvedValue({ ...activeMaterials[0], isArchived: true })

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef')).toBeInTheDocument()

    const archiveButtons = screen.getAllByTitle('Archive')

    await act(async () => {
      fireEvent.click(archiveButtons[0])
      // Only advance enough to complete the async operations, not clear the 3s timeout
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(screen.getByText('Material archived successfully')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('refreshes materials list after archiving', async () => {
    vi.useFakeTimers()
    const activeMaterials = mockMaterials.filter((m) => !m.isArchived)
    mockGetAll
      .mockResolvedValueOnce(activeMaterials)
      .mockResolvedValueOnce([activeMaterials[1]]) // After archive, only one material left
    mockArchive.mockResolvedValue({ ...activeMaterials[0], isArchived: true })

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef')).toBeInTheDocument()

    const archiveButtons = screen.getAllByTitle('Archive')

    await act(async () => {
      fireEvent.click(archiveButtons[0])
      await vi.runAllTimersAsync()
    })

    expect(mockGetAll).toHaveBeenCalledTimes(2)

    vi.useRealTimers()
  })

  it('calls unarchive API when unarchive button is clicked on archived material', async () => {
    vi.useFakeTimers()
    // First call returns materials without archived, second with archived, third after unarchive
    mockGetAll
      .mockResolvedValueOnce(mockMaterials.filter((m) => !m.isArchived))
      .mockResolvedValueOnce(mockMaterials)
      .mockResolvedValueOnce(mockMaterials.map(m => m.id === '3' ? { ...m, isArchived: false } : m))
    mockUnarchive.mockResolvedValue({ ...mockMaterials[2], isArchived: false })

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    // Check the show archived checkbox to see archived materials
    const checkbox = screen.getByRole('checkbox')

    await act(async () => {
      fireEvent.click(checkbox)
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Archived Material')).toBeInTheDocument()

    // Find the unarchive button for the archived material
    const unarchiveButton = screen.getByTitle('Unarchive')

    await act(async () => {
      fireEvent.click(unarchiveButton)
      await vi.runAllTimersAsync()
    })

    expect(mockUnarchive).toHaveBeenCalledWith('3')

    vi.useRealTimers()
  })

  it('shows success message after unarchiving', async () => {
    vi.useFakeTimers()
    // First call returns materials without archived, second with archived, third after unarchive
    mockGetAll
      .mockResolvedValueOnce(mockMaterials.filter((m) => !m.isArchived))
      .mockResolvedValueOnce(mockMaterials)
      .mockResolvedValueOnce(mockMaterials.map(m => m.id === '3' ? { ...m, isArchived: false } : m))
    mockUnarchive.mockResolvedValue({ ...mockMaterials[2], isArchived: false })

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    // Check the show archived checkbox to see archived materials
    const checkbox = screen.getByRole('checkbox')

    await act(async () => {
      fireEvent.click(checkbox)
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Archived Material')).toBeInTheDocument()

    const unarchiveButton = screen.getByTitle('Unarchive')

    await act(async () => {
      fireEvent.click(unarchiveButton)
      // Only advance enough to complete the async operations, not clear the 3s timeout
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(screen.getByText('Material unarchived successfully')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('shows error message when archive fails', async () => {
    vi.useFakeTimers()
    const activeMaterials = mockMaterials.filter((m) => !m.isArchived)
    mockGetAll.mockResolvedValue(activeMaterials)
    mockArchive.mockRejectedValue(new Error('Archive failed'))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef')).toBeInTheDocument()

    const archiveButtons = screen.getAllByTitle('Archive')

    await act(async () => {
      fireEvent.click(archiveButtons[0])
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Failed to archive material')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('shows error message when unarchive fails', async () => {
    vi.useFakeTimers()
    // First call returns materials without archived, second with archived
    mockGetAll
      .mockResolvedValueOnce(mockMaterials.filter((m) => !m.isArchived))
      .mockResolvedValueOnce(mockMaterials)
    mockUnarchive.mockRejectedValue(new Error('Unarchive failed'))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    // Check the show archived checkbox to see archived materials
    const checkbox = screen.getByRole('checkbox')

    await act(async () => {
      fireEvent.click(checkbox)
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Archived Material')).toBeInTheDocument()

    const unarchiveButton = screen.getByTitle('Unarchive')

    await act(async () => {
      fireEvent.click(unarchiveButton)
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Failed to unarchive material')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('disables archive button while archiving is in progress', async () => {
    vi.useFakeTimers()
    const activeMaterials = mockMaterials.filter((m) => !m.isArchived)
    mockGetAll.mockResolvedValue(activeMaterials)
    // Create a promise that we can control when it resolves
    let resolveArchive: (value: Material) => void
    mockArchive.mockImplementation(() => new Promise((resolve) => {
      resolveArchive = resolve
    }))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef')).toBeInTheDocument()

    const archiveButtons = screen.getAllByTitle('Archive')
    const firstArchiveButton = archiveButtons[0]

    await act(async () => {
      fireEvent.click(firstArchiveButton)
    })

    // The button for the material being archived should be disabled
    expect(firstArchiveButton).toBeDisabled()

    // Resolve the archive promise
    await act(async () => {
      resolveArchive({ ...activeMaterials[0], isArchived: true })
      await vi.runAllTimersAsync()
    })

    vi.useRealTimers()
  })

  it('success message disappears after 3 seconds', async () => {
    vi.useFakeTimers()
    const activeMaterials = mockMaterials.filter((m) => !m.isArchived)
    // First call returns active materials, second call after archive returns remaining
    mockGetAll
      .mockResolvedValueOnce(activeMaterials)
      .mockResolvedValueOnce([activeMaterials[1]])
    mockArchive.mockResolvedValue({ ...activeMaterials[0], isArchived: true })

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef')).toBeInTheDocument()

    const archiveButtons = screen.getAllByTitle('Archive')

    await act(async () => {
      fireEvent.click(archiveButtons[0])
      // Advance enough for API to complete but not for the 3s timeout
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(screen.getByText('Material archived successfully')).toBeInTheDocument()

    // Advance time by 3 seconds to clear the message
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })

    expect(screen.queryByText('Material archived successfully')).not.toBeInTheDocument()

    vi.useRealTimers()
  })

  it('renders archive success message in Dutch', async () => {
    vi.useFakeTimers()
    testI18n = createTestI18n('nl')
    const activeMaterials = mockMaterials.filter((m) => !m.isArchived)
    // First call returns active materials, second call after archive returns remaining
    mockGetAll
      .mockResolvedValueOnce(activeMaterials)
      .mockResolvedValueOnce([activeMaterials[1]])
    mockArchive.mockResolvedValue({ ...activeMaterials[0], isArchived: true })

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <MaterialsPage onCreateMaterial={mockOnCreateMaterial} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Beef')).toBeInTheDocument()

    const archiveButtons = screen.getAllByTitle('Archiveren')

    await act(async () => {
      fireEvent.click(archiveButtons[0])
      // Advance enough for API to complete but not for the 3s timeout
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(screen.getByText('Materiaal succesvol gearchiveerd')).toBeInTheDocument()

    vi.useRealTimers()
  })
})

describe('MaterialsPage translations', () => {
  it('has all required English translation keys for materials', () => {
    const testI18n = createTestI18n('en')

    expect(testI18n.t('materials.addMaterial')).toBe('Add Material')
    expect(testI18n.t('materials.showArchived')).toBe('Show archived materials')
    expect(testI18n.t('materials.emptyState')).toBe(
      'No materials found. Add your first material to get started.'
    )
    expect(testI18n.t('materials.archived')).toBe('Archived')
    expect(testI18n.t('materials.archive')).toBe('Archive')
    expect(testI18n.t('materials.unarchive')).toBe('Unarchive')
    expect(testI18n.t('materials.table.name')).toBe('Name')
    expect(testI18n.t('materials.table.price')).toBe('Price')
    expect(testI18n.t('materials.table.unit')).toBe('Unit')
    expect(testI18n.t('materials.table.supplier')).toBe('Supplier')
    expect(testI18n.t('materials.table.actions')).toBe('Actions')
    expect(testI18n.t('materials.search.placeholder')).toBe('Search materials...')
    expect(testI18n.t('materials.search.noResults')).toBe('No materials match your search')
    expect(testI18n.t('materials.search.clear')).toBe('Clear search')
    expect(testI18n.t('materials.archiveSuccess')).toBe('Material archived successfully')
    expect(testI18n.t('materials.unarchiveSuccess')).toBe('Material unarchived successfully')
    expect(testI18n.t('materials.archiveError')).toBe('Failed to archive material')
    expect(testI18n.t('materials.unarchiveError')).toBe('Failed to unarchive material')
  })

  it('has all required Dutch translation keys for materials', () => {
    const testI18n = createTestI18n('nl')

    expect(testI18n.t('materials.addMaterial')).toBe('Materiaal toevoegen')
    expect(testI18n.t('materials.showArchived')).toBe('Gearchiveerde materialen tonen')
    expect(testI18n.t('materials.emptyState')).toBe(
      'Geen materialen gevonden. Voeg je eerste materiaal toe om te beginnen.'
    )
    expect(testI18n.t('materials.archived')).toBe('Gearchiveerd')
    expect(testI18n.t('materials.archive')).toBe('Archiveren')
    expect(testI18n.t('materials.unarchive')).toBe('Herstellen')
    expect(testI18n.t('materials.table.name')).toBe('Naam')
    expect(testI18n.t('materials.table.price')).toBe('Prijs')
    expect(testI18n.t('materials.table.unit')).toBe('Eenheid')
    expect(testI18n.t('materials.table.supplier')).toBe('Leverancier')
    expect(testI18n.t('materials.table.actions')).toBe('Acties')
    expect(testI18n.t('materials.search.placeholder')).toBe('Materialen zoeken...')
    expect(testI18n.t('materials.search.noResults')).toBe(
      'Geen materialen gevonden voor uw zoekopdracht'
    )
    expect(testI18n.t('materials.search.clear')).toBe('Zoekopdracht wissen')
    expect(testI18n.t('materials.archiveSuccess')).toBe('Materiaal succesvol gearchiveerd')
    expect(testI18n.t('materials.unarchiveSuccess')).toBe('Materiaal succesvol hersteld')
    expect(testI18n.t('materials.archiveError')).toBe('Materiaal archiveren mislukt')
    expect(testI18n.t('materials.unarchiveError')).toBe('Materiaal herstellen mislukt')
  })
})
