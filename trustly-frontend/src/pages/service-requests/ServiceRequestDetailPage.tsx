import { MessageSquareWarning, Star } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import { complaintApi } from '../../api/complaint.api'
import { reviewApi } from '../../api/review.api'
import { serviceRequestApi } from '../../api/serviceRequest.api'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Select, enumToOptions } from '../../components/ui/Select'
import { Skeleton } from '../../components/ui/Skeleton'
import { SlideOver } from '../../components/ui/SlideOver'
import { Textarea } from '../../components/ui/Textarea'
import { useAuth } from '../../context/AuthContext'
import { useFormErrors } from '../../hooks/useFormErrors'
import { ComplaintCategory } from '../../types/enums'
import type { ReviewResponse, ServiceRequestResponse } from '../../types/models'
import { formatDate } from '../../utils/format'

export function ServiceRequestDetailPage() {
  const { id } = useParams()
  const { isCustomer } = useAuth()
  const { getError, handleApiError, clearErrors, formError } = useFormErrors()
  const [request, setRequest] = useState<ServiceRequestResponse | null>(null)
  const [review, setReview] = useState<ReviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reviewPanelOpen, setReviewPanelOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(1)
  const [reviewText, setReviewText] = useState('')
  const [complaintPanelOpen, setComplaintPanelOpen] = useState(false)
  const [complaintCategory, setComplaintCategory] = useState('')
  const [complaintDescription, setComplaintDescription] = useState('')
  const [complaintFiles, setComplaintFiles] = useState<FileList | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setNotFound(false)
    try {
      const [customerReqs, workerReqs] = await Promise.all([
        serviceRequestApi.getCustomerRequests(),
        serviceRequestApi.getWorkerRequests(),
      ])
      const found = [...customerReqs, ...workerReqs].find((r) => r.id === Number(id))
      if (!found) {
        setNotFound(true)
        return
      }
      setRequest(found)
      try {
        const rev = await reviewApi.getByServiceRequest(Number(id))
        setReview(rev)
      } catch {
        setReview(null)
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const openReviewPanel = () => {
    clearErrors()
    setReviewRating(review?.rating ?? 1)
    setReviewText(review?.reviewText ?? '')
    setReviewPanelOpen(true)
  }

  const openComplaintPanel = () => {
    clearErrors()
    setComplaintCategory('')
    setComplaintDescription('')
    setComplaintFiles(null)
    setComplaintPanelOpen(true)
  }

  const handleReview = async (e: FormEvent) => {
    e.preventDefault()
    if (!request) return
    clearErrors()
    setSubmitting(true)
    try {
      const saved = review
        ? await reviewApi.update(review.id, {
            rating: reviewRating,
            reviewText: reviewText || undefined,
          })
        : await reviewApi.create({
            serviceRequestId: request.id,
            rating: reviewRating,
            reviewText: reviewText || undefined,
          })
      setReview(saved)
      toast.success(review ? 'Review updated' : 'Review submitted')
      setReviewPanelOpen(false)
    } catch (err) {
      handleApiError(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleComplaint = async (e: FormEvent) => {
    e.preventDefault()
    if (!request) return
    clearErrors()
    setSubmitting(true)
    try {
      await complaintApi.create(
        {
          serviceRequestId: request.id,
          category: complaintCategory as ComplaintCategory,
          description: complaintDescription,
        },
        complaintFiles ? Array.from(complaintFiles) : undefined,
      )
      toast.success('Complaint filed successfully')
      setComplaintPanelOpen(false)
      setComplaintCategory('')
      setComplaintDescription('')
      setComplaintFiles(null)
    } catch (err) {
      handleApiError(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Skeleton height={300} />
  if (notFound) {
    return (
      <div className="empty-state">
        <h2>Not found</h2>
        <p>Service request not found or you do not have access.</p>
        <Link to="/service-requests"><Button variant="secondary">Back</Button></Link>
      </div>
    )
  }
  if (!request) return null

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>{request.title}</h1>
          <Badge value={request.status} />
        </div>
        <Link to="/service-requests"><Button variant="secondary">Back</Button></Link>
      </div>

      <div className="card detail-grid">
        <div className="detail-row"><span className="detail-label">Customer</span><span>{request.customer.name}</span></div>
        <div className="detail-row"><span className="detail-label">Worker</span><span>{request.worker.name}</span></div>
        <div className="detail-row"><span className="detail-label">Category</span><span>{request.category.name}</span></div>
        <div className="detail-row"><span className="detail-label">Description</span><span>{request.description}</span></div>
        <div className="detail-row"><span className="detail-label">Address</span><span>{request.address}</span></div>
        <div className="detail-row"><span className="detail-label">Requested</span><span>{formatDate(request.requestedAt)}</span></div>
        {request.completedAt && (
          <div className="detail-row"><span className="detail-label">Completed</span><span>{formatDate(request.completedAt)}</span></div>
        )}
        {request.workerRemark && (
          <div className="detail-row"><span className="detail-label">Worker Remark</span><span>{request.workerRemark}</span></div>
        )}
        {request.customerRemark && (
          <div className="detail-row"><span className="detail-label">Cancellation Remark</span><span>{request.customerRemark}</span></div>
        )}
        {review && (
          <div className="detail-row">
            <span className="detail-label">Review</span>
            <span>{review.rating}/5 - {review.reviewText ?? 'No comment'}</span>
          </div>
        )}
        {isCustomer && request.status === 'COMPLETED' && (
          <div className="detail-row">
            <span className="detail-label">Actions</span>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button type="button" onClick={openReviewPanel}>
                <Star size={16} /> {review ? 'Edit Review' : 'Leave Review'}
              </Button>
              <Button type="button" variant="secondary" onClick={openComplaintPanel}>
                <MessageSquareWarning size={16} /> Complaint
              </Button>
            </div>
          </div>
        )}
      </div>

      <SlideOver
        open={reviewPanelOpen}
        onClose={() => setReviewPanelOpen(false)}
        title={review ? 'Edit Review' : 'Rate Completed Service'}
      >
        <form onSubmit={handleReview} className="form-grid">
          <div className="form-field">
            <span className="form-label">Rating</span>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`star-btn ${n <= reviewRating ? 'active' : ''}`}
                  onClick={() => setReviewRating(n)}
                  aria-label={`${n} stars`}
                >
                  <Star size={24} fill={n <= reviewRating ? 'var(--warning)' : 'none'} />
                </button>
              ))}
            </div>
            {getError('rating') && <span className="form-error">{getError('rating')}</span>}
          </div>
          <Textarea
            label="Review (optional)"
            name="reviewText"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            error={getError('reviewText')}
            maxLength={1000}
            placeholder="Share how the service went"
          />
          {formError && <p className="form-error">{formError}</p>}
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => setReviewPanelOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>{review ? 'Update Review' : 'Submit Review'}</Button>
          </div>
        </form>
      </SlideOver>

      <SlideOver
        open={complaintPanelOpen}
        onClose={() => setComplaintPanelOpen(false)}
        title="File Complaint"
      >
        <form onSubmit={handleComplaint} className="form-grid">
          <Select
            label="Category"
            name="category"
            value={complaintCategory}
            onChange={(e) => setComplaintCategory(e.target.value)}
            options={enumToOptions(Object.values(ComplaintCategory))}
            placeholder="Select category"
            error={getError('category')}
            required
          />
          <Textarea
            label="Description"
            name="description"
            value={complaintDescription}
            onChange={(e) => setComplaintDescription(e.target.value)}
            error={getError('description')}
            required
            placeholder="Explain the issue with this completed request"
          />
          <div className="form-field">
            <label className="form-label">Evidence (optional)</label>
            <input type="file" multiple onChange={(e) => setComplaintFiles(e.target.files)} style={{ minHeight: 44 }} />
          </div>
          {formError && <p className="form-error">{formError}</p>}
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => setComplaintPanelOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Submit Complaint</Button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
