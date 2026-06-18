import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { adminComplaintApi, complaintApi } from '../../api/complaint.api'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import type { ComplaintDetailsResponse } from '../../types/models'
import { formatDate } from '../../utils/format'

export function ComplaintDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin/')
  const [complaint, setComplaint] = useState<ComplaintDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetcher = isAdmin ? adminComplaintApi.getById : complaintApi.getById
    fetcher(Number(id))
      .then(setComplaint)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id, isAdmin])

  const backPath = isAdmin ? '/admin/complaints' : '/complaints'

  if (loading) return <Skeleton height={300} />
  if (notFound || !complaint) {
    return (
      <div className="empty-state">
        <h2>Not found</h2>
        <Link to={backPath}><Button variant="secondary">Back</Button></Link>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>Complaint #{complaint.id}</h1>
          <Badge value={complaint.status} />
        </div>
        <Link to={backPath}><Button variant="secondary">Back</Button></Link>
      </div>
      <div className="card detail-grid">
        <div className="detail-row"><span className="detail-label">Category</span><Badge value={complaint.category} tone="warning" /></div>
        <div className="detail-row"><span className="detail-label">Customer</span><span>{complaint.customerName}</span></div>
        <div className="detail-row"><span className="detail-label">Worker</span><span>{complaint.workerName}</span></div>
        <div className="detail-row"><span className="detail-label">Description</span><span>{complaint.description}</span></div>
        <div className="detail-row"><span className="detail-label">Created</span><span>{formatDate(complaint.createdAt)}</span></div>
        {complaint.resolutionNote && (
          <div className="detail-row"><span className="detail-label">Resolution</span><span>{complaint.resolutionNote}</span></div>
        )}
        {complaint.evidences?.length > 0 && (
          <div className="detail-row">
            <span className="detail-label">Evidence</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {complaint.evidences.map((e) => (
                <a key={e.id} href={e.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
                  View file ({e.fileType})
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
