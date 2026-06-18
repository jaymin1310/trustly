import { Eye, Filter, Star, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoryApi } from '../../api/category.api'
import { reviewApi } from '../../api/review.api'
import { workerSearchApi } from '../../api/workerProfile.api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { SlideOver } from '../../components/ui/SlideOver'
import type { CategoryResponse, ReviewResponse, WorkerSearchResponse } from '../../types/models'
import { formatDate, formatRating } from '../../utils/format'

const SEARCH_DEBOUNCE_MS = 400

function useDebouncedValue<T>(value: T, delay = SEARCH_DEBOUNCE_MS): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export function WorkerSearchPage() {
  const [workers, setWorkers] = useState<WorkerSearchResponse[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [minimumRating, setMinimumRating] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<WorkerSearchResponse | null>(null)
  const [reviewsOpen, setReviewsOpen] = useState(false)
  const [reviews, setReviews] = useState<ReviewResponse[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)

  const debouncedCategory = useDebouncedValue(category)
  const debouncedCity = useDebouncedValue(city)
  const debouncedState = useDebouncedValue(state)
  const debouncedMinimumRating = useDebouncedValue(minimumRating)

  const search = useCallback(async () => {
    setLoading(true)
    try {
      const result = await workerSearchApi.search({
        category: debouncedCategory ? Number(debouncedCategory) : undefined,
        city: debouncedCity || undefined,
        state: debouncedState || undefined,
        minimumRating: debouncedMinimumRating ? Number(debouncedMinimumRating) : undefined,
        page: 0,
        size: 20,
      })
      setWorkers(result.content)
    } finally {
      setLoading(false)
    }
  }, [debouncedCategory, debouncedCity, debouncedState, debouncedMinimumRating])

  useEffect(() => {
    categoryApi.getActive().then(setCategories)
  }, [])

  useEffect(() => {
    search()
  }, [search])

  const hasAdvancedFilters = state || minimumRating

  const clearFilters = () => {
    setCategory('')
    setCity('')
    setState('')
    setMinimumRating('')
    setFiltersOpen(false)
  }

  const openWorkerDetails = (worker: WorkerSearchResponse) => {
    setSelectedWorker(worker)
    setReviewsOpen(false)
    setReviews([])
  }

  const loadReviews = async () => {
    if (!selectedWorker) return
    setReviewsOpen(true)
    setReviewsLoading(true)
    try {
      const page = await reviewApi.getByWorker(selectedWorker.id, 0, 100)
      setReviews(page.content)
    } finally {
      setReviewsLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Find Workers</h1>
        <p>Search trusted workers by category and location</p>
      </div>

      <div className="card" style={{ marginBottom: '1rem', padding: '0.875rem' }}>
        <div
          className="worker-filter-bar"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(180px, 1.1fr) minmax(160px, 1fr) auto auto',
            gap: '0.75rem',
            alignItems: 'end',
          }}
        >
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
            placeholder="All categories"
            style={{ minHeight: 40, padding: '0.5rem 0.75rem' }}
          />
          <Input
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Any city"
            style={{ minHeight: 40, padding: '0.5rem 0.75rem' }}
          />
          <Button type="button" variant={hasAdvancedFilters ? 'primary' : 'secondary'} onClick={() => setFiltersOpen((open) => !open)}>
            <Filter size={16} /> Filters
          </Button>
          <Button type="button" variant="ghost" onClick={clearFilters} disabled={!category && !city && !state && !minimumRating}>
            <X size={16} />
          </Button>
        </div>

        {filtersOpen && (
          <div
            className="worker-advanced-filters"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(160px, 1fr))',
              gap: '0.75rem',
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border)',
            }}
          >
            <Input
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Any state"
              style={{ minHeight: 40, padding: '0.5rem 0.75rem' }}
            />
            <Input
              label="Min Rating"
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={minimumRating}
              onChange={(e) => setMinimumRating(e.target.value)}
              placeholder="0 - 5"
              style={{ minHeight: 40, padding: '0.5rem 0.75rem' }}
            />
          </div>
        )}

        <style>{`
          @media (max-width: 900px) {
            .worker-filter-bar {
              grid-template-columns: 1fr 1fr !important;
            }
          }

          @media (max-width: 560px) {
            .worker-filter-bar,
            .worker-advanced-filters {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>

      <div className="card">
        {loading ? (
          <TableSkeleton cols={5} />
        ) : workers.length === 0 ? (
          <div className="empty-state">No workers found</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Rating</th>
                  <th>Experience</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 600 }}>
                      <button
                        type="button"
                        onClick={() => openWorkerDetails(w)}
                        style={{
                          color: 'var(--text)',
                          fontWeight: 700,
                          minHeight: 36,
                          textAlign: 'left',
                        }}
                      >
                        {w.workerName}
                      </button>
                    </td>
                    <td>{w.categoryName}</td>
                    <td>{w.city}, {w.state}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Star size={14} color="var(--warning)" fill="var(--warning)" />
                        {formatRating(w.averageRating)} ({w.totalReviews})
                      </span>
                    </td>
                    <td>{w.experienceYears} yrs</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                        <Button size="sm" variant="secondary" onClick={() => openWorkerDetails(w)}>
                          <Eye size={16} /> Details
                        </Button>
                        <Link to={`/service-requests/new?workerProfileId=${w.id}&workerName=${encodeURIComponent(w.workerName)}`}>
                          <Button size="sm">Request Service</Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SlideOver
        open={Boolean(selectedWorker)}
        onClose={() => {
          setSelectedWorker(null)
          setReviewsOpen(false)
          setReviews([])
        }}
        title={selectedWorker?.workerName ?? 'Worker Details'}
        width={560}
      >
        {selectedWorker && (
          <div className="form-grid">
            <div className="detail-grid">
              <div className="detail-row"><span className="detail-label">Category</span><span>{selectedWorker.categoryName}</span></div>
              <div className="detail-row"><span className="detail-label">Location</span><span>{selectedWorker.city}, {selectedWorker.state}</span></div>
              <div className="detail-row"><span className="detail-label">Experience</span><span>{selectedWorker.experienceYears} years</span></div>
              <div className="detail-row"><span className="detail-label">Rating</span><span>{formatRating(selectedWorker.averageRating)} ({selectedWorker.totalReviews} reviews)</span></div>
              <div className="detail-row"><span className="detail-label">Bio</span><span>{selectedWorker.bio || 'No bio added'}</span></div>
            </div>

            <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
              <Button type="button" variant="secondary" onClick={loadReviews}>
                <Star size={16} /> View Reviews
              </Button>
              <Link to={`/service-requests/new?workerProfileId=${selectedWorker.id}&workerName=${encodeURIComponent(selectedWorker.workerName)}`}>
                <Button type="button">Request Service</Button>
              </Link>
            </div>

            {reviewsOpen && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Reviews</h3>
                {reviewsLoading ? (
                  <TableSkeleton cols={2} rows={3} />
                ) : reviews.length === 0 ? (
                  <div className="empty-state" style={{ padding: '1.5rem 0' }}>No reviews yet</div>
                ) : (
                  <div className="form-grid">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          padding: '0.875rem',
                          background: 'var(--bg)',
                        }}
                      >
                        <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                          <strong>{review.customerName}</strong>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--warning)' }}>
                            <Star size={14} fill="var(--warning)" /> {review.rating}/5
                          </span>
                        </div>
                        <p style={{ color: review.reviewText ? 'var(--text)' : 'var(--text-muted)' }}>
                          {review.reviewText || 'No comment'}
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </SlideOver>
    </div>
  )
}
