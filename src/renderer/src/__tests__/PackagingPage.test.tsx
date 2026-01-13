import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
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

beforeEach(() => {
  // Reset mock before each test
  mockGetAll.mockReset()

  // Setup window.api mock
  Object.defineProperty(window, 'api', {
    value: {
      packaging: {
        getAll: mockGetAll
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

  it('has edit buttons enabled and archive/delete buttons disabled', async () => {
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
      // Delete buttons are disabled (placeholder)
      deleteButtons.forEach((btn) => expect(btn).toBeDisabled())
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
})
