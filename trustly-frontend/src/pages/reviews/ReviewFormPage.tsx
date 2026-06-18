import { Star } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { reviewApi } from '../../api/review.api'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Textarea'
import { useFormErrors } from '../../hooks/useFormErrors'

export function ReviewFormPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const serviceRequestId = searchParams.get('serviceRequestId') ?? ''
  const { getError, handleApiError, clearErrors, formError } = useFormErrors()
  const [rating, setRating] = useState(1)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    setSubmitting(true)
    try {
      await reviewApi.create({
        serviceRequestId: Number(serviceRequestId),
        rating,
        reviewText: reviewText || undefined,
      })
      toast.success('Review submitted!')
      navigate(`/service-requests/${serviceRequestId}`)
    } catch (err) {
      handleApiError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Leave a Review</h1>
        <p>Share your experience for service request #{serviceRequestId}</p>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-field">
            <span className="form-label">Rating</span>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" className={`star-btn ${n <= rating ? 'active' : ''}`} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                  <Star size={24} fill={n <= rating ? 'var(--warning)' : 'none'} />
                </button>
              ))}
            </div>
            {getError('rating') && <span className="form-error">{getError('rating')}</span>}
          </div>
          <Textarea label="Review (optional)" name="reviewText" value={reviewText} onChange={(e) => setReviewText(e.target.value)} error={getError('reviewText')} maxLength={1000} />
          {formError && <p className="form-error">{formError}</p>}
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Submit Review</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
