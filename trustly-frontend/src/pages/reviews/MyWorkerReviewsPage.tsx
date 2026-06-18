import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { reviewApi } from '../../api/review.api'
import { workerProfileApi } from '../../api/workerProfile.api'
import { Skeleton } from '../../components/ui/Skeleton'
import type { ReviewResponse, WorkerProfileResponse } from '../../types/models'
import { formatDate } from '../../utils/format'

export function MyWorkerReviewsPage() {
  const [profile, setProfile] = useState<WorkerProfileResponse | null>(null)
  const [reviews, setReviews] = useState<ReviewResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const myProfile = await workerProfileApi.getMy()
        setProfile(myProfile)
        const page = await reviewApi.getByWorker(myProfile.id, 0, 100)
        setReviews(page.content)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) return <Skeleton height={300} />

  return (
    <div>
      <div className="page-header">
        <h1>My Reviews</h1>
        <p>{profile?.workerName ? `Reviews customers left for ${profile.workerName}` : 'Reviews customers left for your work'}</p>
      </div>

      <div className="card">
        {reviews.length === 0 ? (
          <div className="empty-state">No reviews yet</div>
        ) : (
          <div className="form-grid">
            {reviews.map((review) => (
              <div
                key={review.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '1rem',
                  background: 'var(--bg)',
                }}
              >
                <div className="flex-between" style={{ marginBottom: '0.625rem' }}>
                  <div>
                    <strong>{review.customerName}</strong>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      Service request #{review.serviceRequestId} - {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--warning)', fontWeight: 700 }}>
                    <Star size={16} fill="var(--warning)" /> {review.rating}/5
                  </span>
                </div>
                <p style={{ color: review.reviewText ? 'var(--text)' : 'var(--text-muted)' }}>
                  {review.reviewText || 'No comment'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
