import { Eye, Gavel } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminComplaintApi } from '../../api/complaint.api'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select, enumToOptions } from '../../components/ui/Select'
import { SlideOver } from '../../components/ui/SlideOver'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { Textarea } from '../../components/ui/Textarea'
import { useFormErrors } from '../../hooks/useFormErrors'
import { ComplaintDecision, ComplaintStatus } from '../../types/enums'
import type { ComplaintResponse } from '../../types/models'
import { formatDate } from '../../utils/format'

export function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { getError, handleApiError, clearErrors, formError } = useFormErrors()

  const [decision, setDecision] = useState('')
  const [resolutionNote, setResolutionNote] = useState('')
  const [suspensionDays, setSuspensionDays] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const status = statusFilter ? (statusFilter as ComplaintStatus) : undefined
      setComplaints(await adminComplaintApi.getAll(status))
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    load()
  }, [load])

  const openDecision = (id: number) => {
    setSelectedId(id)
    setDecision('')
    setResolutionNote('')
    setSuspensionDays('')
    clearErrors()
    setPanelOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return
    clearErrors()
    setSubmitting(true)
    try {
      await adminComplaintApi.decide(selectedId, {
        decision: decision as ComplaintDecision,
        resolutionNote,
        suspensionDays: suspensionDays ? Number(suspensionDays) : undefined,
      })
      toast.success('Decision recorded')
      setPanelOpen(false)
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
        <h1>Admin Complaints</h1>
        <p>Review and resolve customer complaints</p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <Select label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={enumToOptions(Object.values(ComplaintStatus))} placeholder="All statuses" />
      </div>

      <div className="card">
        {loading ? (
          <TableSkeleton cols={6} />
        ) : complaints.length === 0 ? (
          <div className="empty-state">No complaints</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Worker ID</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id}>
                    <td>#{c.id}</td>
                    <td><Badge value={c.category} tone="warning" /></td>
                    <td><Badge value={c.status} /></td>
                    <td>{c.workerProfileId}</td>
                    <td>{formatDate(c.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <Link to={`/admin/complaints/${c.id}`}>
                          <Button variant="ghost" size="sm"><Eye size={16} /></Button>
                        </Link>
                        {c.status !== 'RESOLVED' && c.status !== 'REJECTED' && (
                          <Button size="sm" onClick={() => openDecision(c.id)}><Gavel size={16} /> Decide</Button>
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

      <SlideOver open={panelOpen} onClose={() => setPanelOpen(false)} title="Complaint Decision">
        <form onSubmit={handleSubmit} className="form-grid">
          <Select label="Decision" name="decision" value={decision} onChange={(e) => setDecision(e.target.value)} options={enumToOptions(Object.values(ComplaintDecision))} placeholder="Select decision" error={getError('decision')} required />
          <Textarea label="Resolution Note" name="resolutionNote" value={resolutionNote} onChange={(e) => setResolutionNote(e.target.value)} error={getError('resolutionNote')} required />
          {decision === 'TEMP_SUSPENSION' && (
            <Input label="Suspension Days" name="suspensionDays" type="number" min={1} value={suspensionDays} onChange={(e) => setSuspensionDays(e.target.value)} error={getError('suspensionDays')} />
          )}
          {formError && <p className="form-error">{formError}</p>}
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => setPanelOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Submit Decision</Button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
