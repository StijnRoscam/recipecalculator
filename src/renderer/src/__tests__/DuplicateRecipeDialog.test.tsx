import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { DuplicateRecipeDialog } from '../components/DuplicateRecipeDialog'

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
const mockGetSuggestedDuplicateName = vi.fn()
const mockCheckNameAvailable = vi.fn()

beforeEach(() => {
  mockGetSuggestedDuplicateName.mockReset()
  mockCheckNameAvailable.mockReset()

  Object.defineProperty(window, 'api', {
    value: {
      recipes: {
        getSuggestedDuplicateName: mockGetSuggestedDuplicateName,
        checkNameAvailable: mockCheckNameAvailable
      }
    },
    writable: true,
    configurable: true
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('DuplicateRecipeDialog', () => {
  let testI18n: typeof i18n
  const mockOnConfirm = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    testI18n = createTestI18n('en')
    mockOnConfirm.mockReset()
    mockOnCancel.mockReset()
    mockGetSuggestedDuplicateName.mockResolvedValue('Test Recipe (Copy)')
    mockCheckNameAvailable.mockResolvedValue(true)
  })

  const renderDialog = (props: Partial<Parameters<typeof DuplicateRecipeDialog>[0]> = {}) => {
    return render(
      <I18nextProvider i18n={testI18n}>
        <DuplicateRecipeDialog
          isOpen={true}
          recipeId="test-recipe-id"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
          {...props}
        />
      </I18nextProvider>
    )
  }

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      renderDialog({ isOpen: false })

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should render dialog when isOpen is true', async () => {
      renderDialog()

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('should display the dialog title', async () => {
      renderDialog()

      await waitFor(() => {
        expect(screen.getByText('Duplicate Recipe')).toBeInTheDocument()
      })
    })

    it('should display loading state while fetching suggested name', async () => {
      mockGetSuggestedDuplicateName.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('Test (Copy)'), 100))
      )

      renderDialog()

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should display input with suggested name after loading', async () => {
      renderDialog()

      await waitFor(() => {
        const input = screen.getByLabelText(/New Recipe Name/i)
        expect(input).toHaveValue('Test Recipe (Copy)')
      })
    })

    it('should display confirm and cancel buttons', async () => {
      renderDialog()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Duplicate/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
      })
    })
  })

  describe('Interactions', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      renderDialog()

      await waitFor(() => {
        expect(screen.getByLabelText(/New Recipe Name/i)).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should call onCancel when Escape key is pressed', async () => {
      renderDialog()

      await waitFor(() => {
        expect(screen.getByLabelText(/New Recipe Name/i)).toBeInTheDocument()
      })

      fireEvent.keyDown(window, { key: 'Escape' })

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should call onCancel when clicking backdrop', async () => {
      renderDialog()

      await waitFor(() => {
        expect(screen.getByLabelText(/New Recipe Name/i)).toBeInTheDocument()
      })

      // The overlay div has role="dialog" and handles click on itself (not children)
      const overlay = screen.getByRole('dialog')
      // Simulate clicking directly on the overlay (not on the dialog content)
      fireEvent.click(overlay)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should allow user to change the recipe name', async () => {
      renderDialog()

      await waitFor(() => {
        expect(screen.getByLabelText(/New Recipe Name/i)).toBeInTheDocument()
      })

      const input = screen.getByLabelText(/New Recipe Name/i)
      fireEvent.change(input, { target: { value: 'My Custom Name' } })

      expect(input).toHaveValue('My Custom Name')
    })

    it('should call onConfirm with the new name when form is submitted', async () => {
      renderDialog()

      await waitFor(() => {
        expect(screen.getByLabelText(/New Recipe Name/i)).toBeInTheDocument()
      })

      const input = screen.getByLabelText(/New Recipe Name/i)
      fireEvent.change(input, { target: { value: 'My Custom Recipe' } })

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Duplicate/i }))
      })

      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith('My Custom Recipe')
      })
    })

    it('should validate name availability before confirming', async () => {
      renderDialog()

      await waitFor(() => {
        expect(screen.getByLabelText(/New Recipe Name/i)).toBeInTheDocument()
      })

      const input = screen.getByLabelText(/New Recipe Name/i)
      fireEvent.change(input, { target: { value: 'New Recipe Name' } })

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Duplicate/i }))
      })

      await waitFor(() => {
        expect(mockCheckNameAvailable).toHaveBeenCalledWith('New Recipe Name')
      })
    })
  })

  describe('Validation', () => {
    it('should disable submit button when name is empty', async () => {
      renderDialog()

      await waitFor(() => {
        expect(screen.getByLabelText(/New Recipe Name/i)).toBeInTheDocument()
      })

      const input = screen.getByLabelText(/New Recipe Name/i)
      fireEvent.change(input, { target: { value: '' } })

      // Submit button should be disabled when name is empty
      expect(screen.getByRole('button', { name: /Duplicate/i })).toBeDisabled()
      expect(mockOnConfirm).not.toHaveBeenCalled()
    })

    it('should disable submit button when name is whitespace only', async () => {
      renderDialog()

      await waitFor(() => {
        expect(screen.getByLabelText(/New Recipe Name/i)).toBeInTheDocument()
      })

      const input = screen.getByLabelText(/New Recipe Name/i)
      fireEvent.change(input, { target: { value: '   ' } })

      // Submit button should be disabled when name is only whitespace
      expect(screen.getByRole('button', { name: /Duplicate/i })).toBeDisabled()
      expect(mockOnConfirm).not.toHaveBeenCalled()
    })

    it('should show error when name already exists', async () => {
      mockCheckNameAvailable.mockResolvedValue(false)

      renderDialog()

      await waitFor(() => {
        expect(screen.getByLabelText(/New Recipe Name/i)).toBeInTheDocument()
      })

      const input = screen.getByLabelText(/New Recipe Name/i)
      fireEvent.change(input, { target: { value: 'Existing Recipe' } })

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Duplicate/i }))
      })

      await waitFor(() => {
        expect(screen.getByText('A recipe with this name already exists')).toBeInTheDocument()
      })

      expect(mockOnConfirm).not.toHaveBeenCalled()
    })

    it('should clear duplicate name error when user types after an error', async () => {
      mockCheckNameAvailable.mockResolvedValue(false)

      renderDialog()

      await waitFor(() => {
        expect(screen.getByLabelText(/New Recipe Name/i)).toBeInTheDocument()
      })

      const input = screen.getByLabelText(/New Recipe Name/i)
      fireEvent.change(input, { target: { value: 'Existing Recipe' } })

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Duplicate/i }))
      })

      await waitFor(() => {
        expect(screen.getByText('A recipe with this name already exists')).toBeInTheDocument()
      })

      // Type in the input to clear the error
      fireEvent.change(input, { target: { value: 'New Name' } })

      await waitFor(() => {
        expect(screen.queryByText('A recipe with this name already exists')).not.toBeInTheDocument()
      })
    })
  })

  describe('Loading states', () => {
    it('should disable buttons when isLoading is true', async () => {
      renderDialog({ isLoading: true })

      await waitFor(() => {
        expect(screen.getByLabelText(/New Recipe Name/i)).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /Loading/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled()
    })

    it('should not call onCancel when clicking cancel during loading', async () => {
      renderDialog({ isLoading: true })

      await waitFor(() => {
        expect(screen.getByLabelText(/New Recipe Name/i)).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))

      expect(mockOnCancel).not.toHaveBeenCalled()
    })

    it('should disable confirm button when name is empty', async () => {
      renderDialog()

      await waitFor(() => {
        expect(screen.getByLabelText(/New Recipe Name/i)).toBeInTheDocument()
      })

      const input = screen.getByLabelText(/New Recipe Name/i)
      fireEvent.change(input, { target: { value: '' } })

      expect(screen.getByRole('button', { name: /Duplicate/i })).toBeDisabled()
    })
  })

  describe('Internationalization', () => {
    it('should display Dutch translations when language is Dutch', async () => {
      testI18n = createTestI18n('nl')

      render(
        <I18nextProvider i18n={testI18n}>
          <DuplicateRecipeDialog
            isOpen={true}
            recipeId="test-recipe-id"
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
          />
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Recept Dupliceren')).toBeInTheDocument()
        expect(screen.getByText('Nieuwe Receptnaam')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Annuleren/i })).toBeInTheDocument()
      })
    })
  })
})
