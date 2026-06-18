import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminWorkerApi } from '../../api/worker.api'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import type { WorkerApplicationDetailResponse } from '../../types/models'
import { formatDate } from '../../utils/format'

export function WorkerApplicationDetailPage() {
  const { id } = useParams()
  const [app, setApp] = useState<WorkerApplicationDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    adminWorkerApi
      .getById(Number(id))
      .then(setApp)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Skeleton height={300} />
  if (notFound || !app) {
    return (
      <div className="empty-state">
        <h2>Not found</h2>
        <Link to="/worker-applications"><Button variant="secondary">Back</Button></Link>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>{app.applicantName}</h1>
          <Badge value={app.status} />
        </div>
        <Link to="/worker-applications"><Button variant="secondary">Back</Button></Link>
      </div>
      <div className="card detail-grid">
        <div className="detail-row"><span className="detail-label">Email</span><span>{app.applicantEmail}</span></div>
        <div className="detail-row"><span className="detail-label">Phone</span><span>{app.phone}</span></div>
        <div className="detail-row"><span className="detail-label">Category</span><span>{app.categoryName}</span></div>
        <div className="detail-row"><span className="detail-label">Experience</span><span>{app.experienceYears} years</span></div>
        <div className="detail-row"><span className="detail-label">Address</span><span>{app.address}</span></div>
        <div className="detail-row"><span className="detail-label">Document</span><span><Badge value={app.documentType} /> {app.documentNumber}</span></div>
        <div className="detail-row"><span className="detail-label">Document File</span><a href={app.documentUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>View document</a></div>
        {app.adminRemark && <div className="detail-row"><span className="detail-label">Admin Remark</span><span>{app.adminRemark}</span></div>}
        <div className="detail-row"><span className="detail-label">Submitted</span><span>{formatDate(app.createdAt)}</span></div>
      </div>
    </div>
  )
}
