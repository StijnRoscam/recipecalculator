import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { PackagingMaterial } from '../../../shared/types'
import { useDebounce } from '../hooks/useDebounce'
import './PackagingPage.css'

interface PackagingPageProps {
  onCreatePackaging?: () => void
  onEditPackaging?: (id: string) => void
}

/**
 * Packaging page component for managing packaging materials
 * Displays a table of packaging materials with filtering, archive toggle, and CRUD actions
 */
export function PackagingPage({ onCreatePackaging, onEditPackaging }: PackagingPageProps): JSX.Element {
  const { t } = useTranslation()
  const [packagingMaterials, setPackagingMaterials] = useState<PackagingMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    const fetchPackaging = async (): Promise<void> => {
      setLoading(true)
      setError(null)
      try {
        const data = await window.api.packaging.getAll(showArchived)
        setPackagingMaterials(data)
      } catch (err) {
        console.error('Failed to fetch packaging materials:', err)
        setError(t('errors.loadFailed'))
      } finally {
        setLoading(false)
      }
    }

    fetchPackaging()
  }, [showArchived, t])

  const handleRetry = (): void => {
    setError(null)
    setLoading(true)
    window.api.packaging
      .getAll(showArchived)
      .then(setPackagingMaterials)
      .catch((err) => {
        console.error('Failed to fetch packaging materials:', err)
        setError(t('errors.loadFailed'))
      })
      .finally(() => setLoading(false))
  }

  const formatPrice = (price: number): string => {
    return `€${price.toFixed(2)}`
  }

  const formatUnitType = (unitType: string): string => {
    return t(`packaging.unitTypes.${unitType}`, { defaultValue: unitType })
  }

  // Filter packaging materials based on debounced search term
  const filteredPackaging = useMemo(() => {
    if (!debouncedSearchTerm) {
      return packagingMaterials
    }

    const searchLower = debouncedSearchTerm.toLowerCase()
    return packagingMaterials.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(searchLower)
      const supplierMatch = item.supplier?.toLowerCase().includes(searchLower)
      return nameMatch || supplierMatch
    })
  }, [packagingMaterials, debouncedSearchTerm])

  // Handle Escape key to clear search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && searchTerm) {
        setSearchTerm('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchTerm])

  const handleClearSearch = (): void => {
    setSearchTerm('')
  }

  // Check if we're showing "no search results" vs "empty state"
  const hasSearchTerm = debouncedSearchTerm.length > 0
  const hasNoSearchResults = hasSearchTerm && filteredPackaging.length === 0
  const hasNoPackaging = packagingMaterials.length === 0

  return (
    <div className="packaging-page">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">{t('navigation.packaging')}</h2>
        </div>
        <div className="page-header-right">
          <button className="btn-primary" onClick={onCreatePackaging}>
            {t('packaging.addPackaging')}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="success-message" role="status">
          {successMessage}
        </div>
      )}

      <div className="page-controls">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder={t('packaging.search.placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label={t('packaging.search.placeholder')}
          />
          {searchTerm && (
            <button
              className="search-clear-btn"
              onClick={handleClearSearch}
              title={t('packaging.search.clear')}
              aria-label={t('packaging.search.clear')}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="checkbox"
          />
          <span>{t('packaging.showArchived')}</span>
        </label>
      </div>

      <div className="packaging-content">
        {loading ? (
          <div className="loading-state">
            <p>{t('common.loading')}</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button className="btn-secondary" onClick={handleRetry}>
              {t('common.retry')}
            </button>
          </div>
        ) : hasNoPackaging ? (
          <div className="empty-state">
            <p>{t('packaging.emptyState')}</p>
          </div>
        ) : hasNoSearchResults ? (
          <div className="empty-state">
            <p>{t('packaging.search.noResults')}</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="packaging-table">
              <thead>
                <tr>
                  <th>{t('packaging.table.name')}</th>
                  <th>{t('packaging.table.unitPrice')}</th>
                  <th>{t('packaging.table.unitType')}</th>
                  <th>{t('packaging.table.supplier')}</th>
                  <th className="actions-column">{t('packaging.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackaging.map((item) => (
                  <tr
                    key={item.id}
                    className={item.isArchived ? 'archived-row' : ''}
                  >
                    <td>
                      <div className="packaging-name">
                        {item.name}
                        {item.isArchived && (
                          <span className="archived-badge">{t('packaging.archived')}</span>
                        )}
                      </div>
                    </td>
                    <td>{formatPrice(item.unitPrice)}</td>
                    <td>{formatUnitType(item.unitType)}</td>
                    <td>{item.supplier || '-'}</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          title={t('common.edit')}
                          aria-label={t('common.edit')}
                          onClick={() => onEditPackaging?.(item.id)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L4.99967 13.6667L1.33301 14.6667L2.33301 11L11.333 2.00004Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <button
                          className="btn-icon"
                          title={
                            item.isArchived
                              ? t('packaging.unarchive')
                              : t('packaging.archive')
                          }
                          disabled
                          aria-label={
                            item.isArchived
                              ? t('packaging.unarchive')
                              : t('packaging.archive')
                          }
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M14 5.33337V14C14 14.3536 13.8595 14.6928 13.6095 14.9428C13.3594 15.1929 13.0203 15.3334 12.6667 15.3334H3.33333C2.97971 15.3334 2.64057 15.1929 2.39052 14.9428C2.14048 14.6928 2 14.3536 2 14V5.33337M14 5.33337H2M14 5.33337L12.6667 0.666706H3.33333L2 5.33337M10 8.00004H6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          title={t('common.delete')}
                          disabled
                          aria-label={t('common.delete')}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2 4H3.33333M3.33333 4H14M3.33333 4V13.3333C3.33333 13.687 3.47381 14.0261 3.72386 14.2762C3.97391 14.5262 4.31304 14.6667 4.66667 14.6667H11.3333C11.687 14.6667 12.0261 14.5262 12.2761 14.2762C12.5262 14.0261 12.6667 13.687 12.6667 13.3333V4H3.33333ZM5.33333 4V2.66667C5.33333 2.31304 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31304 1.33333 6.66667 1.33333H9.33333C9.68696 1.33333 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31304 10.6667 2.66667V4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
