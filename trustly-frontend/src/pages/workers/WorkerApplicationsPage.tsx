import { Check, Eye, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminWorkerApi } from '../../api/worker.api'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Select, enumToOptions } from '../../components/ui/Select'
import { SlideOver } from '../../components/ui/SlideOver'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { Textarea } from '../../components/ui/Textarea'
import { useFormErrors } from '../../hooks/useFormErrors'
import { WorkerApplicationStatus } from '../../types/enums'
import type { WorkerApplicationResponse } from '../../types/models'

export function WorkerApplicationsPage() {
  const [applications, setApplications] = useState<WorkerApplicationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectId, setRejectId] = useState<number | null>(null)
  const [remark, setRemark] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { getError, handleApiError, clearErrors, formError } = useFormErrors()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const status = statusFilter ? (statusFilter as WorkerApplicationStatus) : undefined
      const page = await adminWorkerApi.getApplications(status)
      setApplications(page.content)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    load()
  }, [load])

  const handleApprove = async (id: number) => {
    try {
      await adminWorkerApi.approve(id)
      toast.success('Application approved')
      load()
    } catch (err) {
      toast.error(String(err))
    }
  }

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectId) return
    clearErrors()
    setSubmitting(true)
    try {
      await adminWorkerApi.reject(rejectId, { remark })
      toast.success('Application rejected')
      setRejectOpen(false)
      load()
    } catch (err) {
      handleApiError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Worker Applications</h1>
        <p>Review and approve worker applications</p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <Select label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={enumToOptions(Object.values(WorkerApplicationStatus))} placeholder="All statuses" />
      </div>

      <div className="card">
        {loading ? (
          <TableSkeleton cols={5} />
        ) : applications.length === 0 ? (
          <div className="empty-state">No applications</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Email</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td style={{ fontWeight: 600 }}>{app.applicantName}</td>
                    <td>{app.email}</td>
                    <td>{app.categoryName}</td>
                    <td><Badge value={app.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        <Link to={`/worker-applications/${app.id}`}>
                          <Button variant="ghost" size="sm"><Eye size={16} /></Button>
                        </Link>
                        {app.status === 'PENDING' && (
                          <>
                            <Button size="sm" onClick={() => handleApprove(app.id)}><Check size={16} /></Button>
                            <Button size="sm" variant="danger" onClick={() => { setRejectId(app.id); setRemark(''); clearErrors(); setRejectOpen(true) }}><X size={16} /></Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SlideOver open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Application">
        <form onSubmit={handleReject} className="form-grid">
          <Textarea label="Remark" name="remark" value={remark} onChange={(e) => setRemark(e.target.value)} error={getError('remark')} required />
          {formError && <p className="form-error">{formError}</p>}
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button type="submit" variant="danger" loading={submitting}>Reject</Button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
