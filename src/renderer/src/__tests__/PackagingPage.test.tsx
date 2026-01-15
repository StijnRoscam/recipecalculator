import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act, within } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { PackagingPage } from '../pages/PackagingPage'
import type { PackagingMaterial } from '../../../shared/types'

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

// Mock packaging materials data
const mockPackagingMaterials: PackagingMaterial[] = [
  {
    id: '1',
    name: 'Vacuum Bag Small',
    unitPrice: 0.25,
    unitType: 'piece',
    supplier: 'Packaging Co',
    sku: 'VBS001',
    notes: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isArchived: false
  },
  {
    id: '2',
    name: 'Label Roll',
    unitPrice: 15.0,
    unitType: 'roll',
    supplier: 'Label Supplies',
    sku: 'LR001',
    notes: 'Standard size',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    isArchived: false
  },
  {
    id: '3',
    name: 'Archived Packaging',
    unitPrice: 5.0,
    unitType: 'box',
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
const mockDelete = vi.fn()

beforeEach(() => {
  // Reset mock before each test
  mockGetAll.mockReset()
  mockDelete.mockReset()

  // Setup window.api mock
  Object.defineProperty(window, 'api', {
    value: {
      packaging: {
        getAll: mockGetAll,
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

describe('PackagingPage', () => {
  let testI18n: typeof i18n
  const mockOnCreatePackaging = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCreatePackaging.mockReset()
  })

  it('shows loading state initially', () => {
    mockGetAll.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows empty state when no packaging materials exist', async () => {
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(
        screen.getByText('No packaging materials found. Add your first packaging to get started.')
      ).toBeInTheDocument()
    })
  })

  it('displays packaging materials in a table', async () => {
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
      expect(screen.getByText('Label Roll')).toBeInTheDocument()
    })

    // Check price formatting
    expect(screen.getByText('€0.25')).toBeInTheDocument()
    expect(screen.getByText('€15.00')).toBeInTheDocument()

    // Check supplier
    expect(screen.getByText('Packaging Co')).toBeInTheDocument()
    expect(screen.getByText('Label Supplies')).toBeInTheDocument()
  })

  it('displays table headers correctly', async () => {
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Unit Price')).toBeInTheDocument()
      expect(screen.getByText('Unit Type')).toBeInTheDocument()
      expect(screen.getByText('Supplier')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })
  })

  it('shows Add Packaging button', async () => {
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Packaging')).toBeInTheDocument()
    })
  })

  it('calls onCreatePackaging when Add Packaging button is clicked', async () => {
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Packaging')).toBeInTheDocument()
    })

    const addButton = screen.getByText('Add Packaging')
    fireEvent.click(addButton)

    expect(mockOnCreatePackaging).toHaveBeenCalledTimes(1)
  })

  it('calls onEditPackaging with packaging id when Edit button is clicked', async () => {
    const mockOnEditPackaging = vi.fn()
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage
          onCreatePackaging={mockOnCreatePackaging}
          onEditPackaging={mockOnEditPackaging}
        />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
    })

    // Get the first edit button (for 'Vacuum Bag Small')
    const editButtons = screen.getAllByTitle('Edit')
    fireEvent.click(editButtons[0])

    expect(mockOnEditPackaging).toHaveBeenCalledTimes(1)
    expect(mockOnEditPackaging).toHaveBeenCalledWith('1')
  })

  it('shows Show archived checkbox unchecked by default', async () => {
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })
  })

  it('fetches packaging materials with includeArchived=false by default', async () => {
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenCalledWith(false)
    })
  })

  it('fetches packaging materials with includeArchived=true when checkbox is checked', async () => {
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
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

  it('displays archived badge for archived packaging materials', async () => {
    mockGetAll.mockResolvedValue(mockPackagingMaterials)

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
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
    mockGetAll.mockResolvedValue([mockPackagingMaterials[2]]) // Archived packaging has no supplier

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('-')).toBeInTheDocument()
    })
  })

  it('displays unit type correctly', async () => {
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Piece')).toBeInTheDocument()
      expect(screen.getByText('Roll')).toBeInTheDocument()
    })
  })

  it('has edit and delete buttons enabled and archive buttons disabled', async () => {
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      const editButtons = screen.getAllByTitle('Edit')
      const deleteButtons = screen.getAllByTitle('Delete')
      const archiveButtons = screen.getAllByTitle('Archive')

      // Edit buttons are enabled
      editButtons.forEach((btn) => expect(btn).toBeEnabled())
      // Archive buttons are disabled (placeholder)
      archiveButtons.forEach((btn) => expect(btn).toBeDisabled())
      // Delete buttons are enabled
      deleteButtons.forEach((btn) => expect(btn).toBeEnabled())
    })
  })

  it('shows error state when API call fails', async () => {
    mockGetAll.mockRejectedValue(new Error('Network error'))

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })
  })

  it('retries fetching packaging materials when retry button is clicked', async () => {
    mockGetAll.mockRejectedValueOnce(new Error('Network error'))
    mockGetAll.mockResolvedValueOnce([])

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    })

    const retryButton = screen.getByText('Retry')
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('No packaging materials found. Add your first packaging to get started.')).toBeInTheDocument()
    })

    expect(mockGetAll).toHaveBeenCalledTimes(2)
  })

  it('renders in Dutch when language is set to Dutch', async () => {
    testI18n = createTestI18n('nl')
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Verpakking toevoegen')).toBeInTheDocument()
      expect(screen.getByText('Gearchiveerde verpakkingen tonen')).toBeInTheDocument()
      expect(
        screen.getByText('Geen verpakkingsmaterialen gevonden. Voeg je eerste verpakking toe om te beginnen.')
      ).toBeInTheDocument()
    })
  })
})

describe('PackagingPage search functionality', () => {
  let testI18n: typeof i18n
  const mockOnCreatePackaging = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCreatePackaging.mockReset()
  })

  it('shows search input with placeholder', async () => {
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search packaging...')
      expect(searchInput).toBeInTheDocument()
    })
  })

  it('filters packaging materials by name as user types (case-insensitive)', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
    expect(screen.getByText('Label Roll')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search packaging...')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'vacuum' } })
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
    expect(screen.queryByText('Label Roll')).not.toBeInTheDocument()

    vi.useRealTimers()
  })

  it('filters packaging materials by partial name match', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Label Roll')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search packaging...')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'roll' } })
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(screen.getByText('Label Roll')).toBeInTheDocument()
    expect(screen.queryByText('Vacuum Bag Small')).not.toBeInTheDocument()

    vi.useRealTimers()
  })

  it('filters packaging materials by supplier', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search packaging...')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Packaging Co' } })
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
    expect(screen.queryByText('Label Roll')).not.toBeInTheDocument()

    vi.useRealTimers()
  })

  it('shows no results message when search has no matches', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search packaging...')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'xyz' } })
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(screen.getByText('No packaging materials match your search')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('shows clear button when search has text', async () => {
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
    })

    // Clear button should not be visible initially
    expect(screen.queryByTitle('Clear search')).not.toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search packaging...')
    fireEvent.change(searchInput, { target: { value: 'test' } })

    // Clear button should now be visible
    expect(screen.getByTitle('Clear search')).toBeInTheDocument()
  })

  it('clears search when clear button is clicked', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search packaging...')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'vacuum' } })
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(screen.queryByText('Label Roll')).not.toBeInTheDocument()

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

    expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
    expect(screen.getByText('Label Roll')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('clears search when Escape key is pressed', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search packaging...')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'vacuum' } })
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(screen.queryByText('Label Roll')).not.toBeInTheDocument()

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

    expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
    expect(screen.getByText('Label Roll')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('debounces search input (only triggers after 300ms delay)', async () => {
    vi.useFakeTimers()
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search packaging...')

    // Type multiple characters quickly
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'v' } })
      await vi.advanceTimersByTimeAsync(100)
      fireEvent.change(searchInput, { target: { value: 'va' } })
      await vi.advanceTimersByTimeAsync(100)
      fireEvent.change(searchInput, { target: { value: 'vac' } })
      await vi.advanceTimersByTimeAsync(100)
      fireEvent.change(searchInput, { target: { value: 'vacu' } })
    })

    // Before debounce completes, both items should still be visible
    expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
    expect(screen.getByText('Label Roll')).toBeInTheDocument()

    // After debounce delay
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
    expect(screen.queryByText('Label Roll')).not.toBeInTheDocument()

    vi.useRealTimers()
  })

  it('renders search placeholder in Dutch', async () => {
    testI18n = createTestI18n('nl')
    mockGetAll.mockResolvedValue([])

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Verpakkingen zoeken...')).toBeInTheDocument()
    })
  })

  it('renders no search results message in Dutch', async () => {
    vi.useFakeTimers()
    testI18n = createTestI18n('nl')
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))

    await act(async () => {
      render(
        <I18nextProvider i18n={testI18n}>
          <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
        </I18nextProvider>
      )
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Verpakkingen zoeken...')

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'xyz' } })
      await vi.advanceTimersByTimeAsync(300)
    })

    expect(
      screen.getByText('Geen verpakkingsmaterialen gevonden voor uw zoekopdracht')
    ).toBeInTheDocument()

    vi.useRealTimers()
  })
})

describe('PackagingPage translations', () => {
  it('has all required English translation keys for packaging', () => {
    const testI18n = createTestI18n('en')

    expect(testI18n.t('packaging.addPackaging')).toBe('Add Packaging')
    expect(testI18n.t('packaging.showArchived')).toBe('Show archived packaging')
    expect(testI18n.t('packaging.emptyState')).toBe(
      'No packaging materials found. Add your first packaging to get started.'
    )
    expect(testI18n.t('packaging.archived')).toBe('Archived')
    expect(testI18n.t('packaging.archive')).toBe('Archive')
    expect(testI18n.t('packaging.unarchive')).toBe('Unarchive')
    expect(testI18n.t('packaging.table.name')).toBe('Name')
    expect(testI18n.t('packaging.table.unitPrice')).toBe('Unit Price')
    expect(testI18n.t('packaging.table.unitType')).toBe('Unit Type')
    expect(testI18n.t('packaging.table.supplier')).toBe('Supplier')
    expect(testI18n.t('packaging.table.actions')).toBe('Actions')
    expect(testI18n.t('packaging.search.placeholder')).toBe('Search packaging...')
    expect(testI18n.t('packaging.search.noResults')).toBe('No packaging materials match your search')
    expect(testI18n.t('packaging.search.clear')).toBe('Clear search')
    expect(testI18n.t('packaging.unitTypes.piece')).toBe('Piece')
    expect(testI18n.t('packaging.unitTypes.meter')).toBe('Meter')
    expect(testI18n.t('packaging.unitTypes.roll')).toBe('Roll')
    expect(testI18n.t('packaging.unitTypes.sheet')).toBe('Sheet')
    expect(testI18n.t('packaging.unitTypes.box')).toBe('Box')
    expect(testI18n.t('packaging.unitTypes.bag')).toBe('Bag')
  })

  it('has all required Dutch translation keys for packaging', () => {
    const testI18n = createTestI18n('nl')

    expect(testI18n.t('packaging.addPackaging')).toBe('Verpakking toevoegen')
    expect(testI18n.t('packaging.showArchived')).toBe('Gearchiveerde verpakkingen tonen')
    expect(testI18n.t('packaging.emptyState')).toBe(
      'Geen verpakkingsmaterialen gevonden. Voeg je eerste verpakking toe om te beginnen.'
    )
    expect(testI18n.t('packaging.archived')).toBe('Gearchiveerd')
    expect(testI18n.t('packaging.archive')).toBe('Archiveren')
    expect(testI18n.t('packaging.unarchive')).toBe('Herstellen')
    expect(testI18n.t('packaging.table.name')).toBe('Naam')
    expect(testI18n.t('packaging.table.unitPrice')).toBe('Stukprijs')
    expect(testI18n.t('packaging.table.unitType')).toBe('Eenheidstype')
    expect(testI18n.t('packaging.table.supplier')).toBe('Leverancier')
    expect(testI18n.t('packaging.table.actions')).toBe('Acties')
    expect(testI18n.t('packaging.search.placeholder')).toBe('Verpakkingen zoeken...')
    expect(testI18n.t('packaging.search.noResults')).toBe(
      'Geen verpakkingsmaterialen gevonden voor uw zoekopdracht'
    )
    expect(testI18n.t('packaging.search.clear')).toBe('Zoekopdracht wissen')
    expect(testI18n.t('packaging.unitTypes.piece')).toBe('Stuk')
    expect(testI18n.t('packaging.unitTypes.meter')).toBe('Meter')
    expect(testI18n.t('packaging.unitTypes.roll')).toBe('Rol')
    expect(testI18n.t('packaging.unitTypes.sheet')).toBe('Vel')
    expect(testI18n.t('packaging.unitTypes.box')).toBe('Doos')
    expect(testI18n.t('packaging.unitTypes.bag')).toBe('Zak')
  })

  it('has all required English translation keys for delete functionality', () => {
    const testI18n = createTestI18n('en')

    expect(testI18n.t('packaging.delete.confirmTitle')).toBe('Delete Packaging Material?')
    expect(testI18n.t('packaging.delete.confirmMessage', { name: 'Test' })).toBe(
      'Are you sure you want to permanently delete "Test"? This action cannot be undone.'
    )
    expect(testI18n.t('packaging.delete.success')).toBe('Packaging material deleted successfully')
    expect(testI18n.t('packaging.delete.error')).toBe('Failed to delete packaging material')
    expect(testI18n.t('packaging.delete.notFoundError')).toBe('Packaging material not found')
    expect(testI18n.t('packaging.delete.inUseError', { recipes: 'Recipe A, Recipe B' })).toBe(
      'Cannot delete this packaging material because it is used in the following recipes: Recipe A, Recipe B. Consider archiving it instead.'
    )
  })

  it('has all required Dutch translation keys for delete functionality', () => {
    const testI18n = createTestI18n('nl')

    expect(testI18n.t('packaging.delete.confirmTitle')).toBe('Verpakking verwijderen?')
    expect(testI18n.t('packaging.delete.confirmMessage', { name: 'Test' })).toBe(
      'Weet u zeker dat u "Test" permanent wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.'
    )
    expect(testI18n.t('packaging.delete.success')).toBe('Verpakking succesvol verwijderd')
    expect(testI18n.t('packaging.delete.error')).toBe('Verpakking verwijderen mislukt')
    expect(testI18n.t('packaging.delete.notFoundError')).toBe('Verpakking niet gevonden')
    expect(testI18n.t('packaging.delete.inUseError', { recipes: 'Recipe A, Recipe B' })).toBe(
      'Deze verpakking kan niet worden verwijderd omdat deze wordt gebruikt in de volgende recepten: Recipe A, Recipe B. Overweeg om deze te archiveren.'
    )
  })
})

describe('PackagingPage delete functionality', () => {
  let testI18n: typeof i18n
  const mockOnCreatePackaging = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnCreatePackaging.mockReset()
  })

  it('opens confirmation dialog when delete button is clicked', async () => {
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('Delete')
    fireEvent.click(deleteButtons[0])

    // Dialog should be open with the packaging name
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Delete Packaging Material?')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Are you sure you want to permanently delete "Vacuum Bag Small"? This action cannot be undone.'
      )
    ).toBeInTheDocument()
  })

  it('closes dialog when Cancel button is clicked', async () => {
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('Delete')
    fireEvent.click(deleteButtons[0])

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    // Item should still be in the list
    expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
  })

  it('closes dialog when Escape key is pressed', async () => {
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('Delete')
    fireEvent.click(deleteButtons[0])

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Press Escape to close the dialog (the search has no text so won't interfere)
    fireEvent.keyDown(window, { key: 'Escape' })

    // Dialog should be closed after Escape
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    // Item should still be in the list
    expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
  })

  it('deletes packaging material when Delete button is confirmed', async () => {
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))
    mockDelete.mockResolvedValue(undefined)

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
    })
    expect(screen.getByText('Label Roll')).toBeInTheDocument()

    const deleteButtons = screen.getAllByTitle('Delete')
    fireEvent.click(deleteButtons[0])

    const dialog = screen.getByRole('dialog')
    const confirmButton = within(dialog).getByRole('button', { name: 'Delete' })
    fireEvent.click(confirmButton)

    // Wait for the delete to complete
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('1')
    })

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Item should be removed from the list
    expect(screen.queryByText('Vacuum Bag Small')).not.toBeInTheDocument()
    expect(screen.getByText('Label Roll')).toBeInTheDocument()

    // Success message should be shown
    expect(screen.getByText('Packaging material deleted successfully')).toBeInTheDocument()
  })

  it('shows error message when packaging is in use by recipes', async () => {
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))
    mockDelete.mockRejectedValue(new Error('PACKAGING_IN_USE:Recipe A,Recipe B'))

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('Delete')
    fireEvent.click(deleteButtons[0])

    const dialog = screen.getByRole('dialog')
    const confirmButton = within(dialog).getByRole('button', { name: 'Delete' })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('1')
    })

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Error message should be shown
    expect(
      screen.getByText(
        'Cannot delete this packaging material because it is used in the following recipes: Recipe A, Recipe B. Consider archiving it instead.'
      )
    ).toBeInTheDocument()

    // Item should still be in the list
    expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
  })

  it('shows error message when packaging is not found', async () => {
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))
    mockDelete.mockRejectedValue(new Error('NOT_FOUND'))

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('Delete')
    fireEvent.click(deleteButtons[0])

    const dialog = screen.getByRole('dialog')
    const confirmButton = within(dialog).getByRole('button', { name: 'Delete' })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('1')
    })

    // Error message should be shown
    await waitFor(() => {
      expect(screen.getByText('Packaging material not found')).toBeInTheDocument()
    })
  })

  it('shows generic error message when delete fails for unknown reason', async () => {
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))
    mockDelete.mockRejectedValue(new Error('Unknown error'))

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('Delete')
    fireEvent.click(deleteButtons[0])

    const dialog = screen.getByRole('dialog')
    const confirmButton = within(dialog).getByRole('button', { name: 'Delete' })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('1')
    })

    // Error message should be shown
    await waitFor(() => {
      expect(screen.getByText('Failed to delete packaging material')).toBeInTheDocument()
    })
  })

  it('displays success message after successful delete', async () => {
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))
    mockDelete.mockResolvedValue(undefined)

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('Delete')
    fireEvent.click(deleteButtons[0])

    const dialog = screen.getByRole('dialog')
    const confirmButton = within(dialog).getByRole('button', { name: 'Delete' })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('1')
    })

    await waitFor(() => {
      expect(screen.getByText('Packaging material deleted successfully')).toBeInTheDocument()
    })
  })

  it('renders delete confirmation dialog in Dutch', async () => {
    testI18n = createTestI18n('nl')
    mockGetAll.mockResolvedValue(mockPackagingMaterials.filter((m) => !m.isArchived))

    render(
      <I18nextProvider i18n={testI18n}>
        <PackagingPage onCreatePackaging={mockOnCreatePackaging} />
      </I18nextProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Vacuum Bag Small')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('Verwijderen')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    expect(screen.getByText('Verpakking verwijderen?')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Weet u zeker dat u "Vacuum Bag Small" permanent wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Annuleren')).toBeInTheDocument()
    // Use the dialog to scope the query for the confirm button
    const dialog = screen.getByRole('dialog')
    const confirmButton = dialog.querySelector('.btn-danger')
    expect(confirmButton).toHaveTextContent('Verwijderen')
  })
})
