import { Plus, Eye } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { serviceRequestApi } from '../../api/serviceRequest.api'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select, enumToOptions } from '../../components/ui/Select'
import { SlideOver } from '../../components/ui/SlideOver'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { Textarea } from '../../components/ui/Textarea'
import { useAuth } from '../../context/AuthContext'
import { useFormErrors } from '../../hooks/useFormErrors'
import { ServiceRequestStatus } from '../../types/enums'
import type { ServiceRequestResponse } from '../../types/models'
import { formatDate } from '../../utils/format'

export function ServiceRequestsPage() {
  const { isWorker, isCustomer } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [requests, setRequests] = useState<ServiceRequestResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [cancelPanelOpen, setCancelPanelOpen] = useState(false)
  const [rejectPanelOpen, setRejectPanelOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { getError, handleApiError, clearErrors, formError } = useFormErrors()

  const [selectedWorkerProfileId, setSelectedWorkerProfileId] = useState('')
  const [selectedWorkerName, setSelectedWorkerName] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [actionRequestId, setActionRequestId] = useState<number | null>(null)
  const [cancelRemark, setCancelRemark] = useState('')
  const [rejectRemark, setRejectRemark] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const status = statusFilter ? (statusFilter as ServiceRequestStatus) : undefined
      const data = isWorker
        ? await serviceRequestApi.getWorkerRequests(status)
        : await serviceRequestApi.getCustomerRequests(status)
      setRequests(data)
    } finally {
      setLoading(false)
    }
  }, [isWorker, statusFilter])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const workerId = searchParams.get('workerProfileId')
    if (!workerId || !isCustomer) return

    setSelectedWorkerProfileId(workerId)
    setSelectedWorkerName(searchParams.get('workerName') ?? 'Selected worker')
    setPanelOpen(true)
  }, [searchParams, isCustomer])

  const resetCreateForm = () => {
    setTitle('')
    setDescription('')
    setAddress('')
    setSelectedWorkerProfileId('')
    setSelectedWorkerName('')
    if (searchParams.has('workerProfileId')) {
      const next = new URLSearchParams(searchParams)
      next.delete('workerProfileId')
      next.delete('workerName')
      setSearchParams(next, { replace: true })
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()

    if (!selectedWorkerProfileId) {
      toast.error('Please select a worker first')
      navigate('/workers')
      return
    }

    setSubmitting(true)
    try {
      await serviceRequestApi.create({
        workerProfileId: Number(selectedWorkerProfileId),
        title,
        description,
        address,
      })
      toast.success('Service request created')
      setPanelOpen(false)
      resetCreateForm()
      load()
    } catch (err) {
      handleApiError(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAccept = async (id: number) => {
    try {
      await serviceRequestApi.accept(id)
      toast.success('Request accepted')
      load()
    } catch (err) {
      toast.error(String(err))
    }
  }

  const handleRequestCompletion = async (id: number) => {
    try {
      await serviceRequestApi.requestCompletion(id)
      toast.success('Completion requested')
      load()
    } catch (err) {
      toast.error(String(err))
    }
  }

  const handleComplete = async (id: number) => {
    try {
      await serviceRequestApi.complete(id)
      toast.success('Request completed')
      load()
    } catch (err) {
      toast.error(String(err))
    }
  }

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!actionRequestId) return
    clearErrors()
    setSubmitting(true)
    try {
      await serviceRequestApi.cancel(actionRequestId, { customerRemark: cancelRemark })
      toast.success('Request cancelled')
      setCancelPanelOpen(false)
      setCancelRemark('')
      setActionRequestId(null)
      load()
    } catch (err) {
      handleApiError(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!actionRequestId) return
    clearErrors()
    setSubmitting(true)
    try {
      await serviceRequestApi.reject(actionRequestId, { workerRemark: rejectRemark })
      toast.success('Request rejected')
      setRejectPanelOpen(false)
      setRejectRemark('')
      setActionRequestId(null)
      load()
    } catch (err) {
      handleApiError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>{isWorker ? 'Incoming Requests' : 'My Service Requests'}</h1>
          <p>{isWorker ? 'Review and manage customer requests' : 'Track requests you sent to workers'}</p>
        </div>
        {isCustomer && (
          <Button onClick={() => navigate('/workers')}>
            <Plus size={18} /> New Request
          </Button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <Select
          label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={enumToOptions(Object.values(ServiceRequestStatus))}
          placeholder="All statuses"
        />
      </div>

      <div className="card">
        {loading ? (
          <TableSkeleton cols={5} />
        ) : requests.length === 0 ? (
          <div className="empty-state">No service requests found</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>{isWorker ? 'Customer' : 'Worker'}</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 600 }}>{req.title}</td>
                    <td>{isWorker ? req.customer.name : req.worker.name}</td>
                    <td>{req.category.name}</td>
                    <td><Badge value={req.status} /></td>
                    <td>{formatDate(req.requestedAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                        <Link to={`/service-requests/${req.id}`}>
                          <Button variant="ghost" size="sm"><Eye size={16} /></Button>
                        </Link>
                        {isWorker && req.status === 'PENDING' && (
                          <>
                            <Button size="sm" onClick={() => handleAccept(req.id)}>Accept</Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                clearErrors()
                                setActionRequestId(req.id)
                                setRejectRemark('')
                                setRejectPanelOpen(true)
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {isWorker && req.status === 'ACCEPTED' && (
                          <Button size="sm" variant="secondary" onClick={() => handleRequestCompletion(req.id)}>
                            Request Completion
                          </Button>
                        )}
                        {isCustomer && req.status === 'WORK_COMPLETION_REQUESTED' && (
                          <Button size="sm" onClick={() => handleComplete(req.id)}>Complete</Button>
                        )}
                        {isCustomer && ['PENDING', 'ACCEPTED'].includes(req.status) && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              clearErrors()
                              setActionRequestId(req.id)
                              setCancelRemark('')
                              setCancelPanelOpen(true)
                            }}
                          >
                            Cancel
                          </Button>
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

      <SlideOver
        open={panelOpen}
        onClose={() => {
          setPanelOpen(false)
          resetCreateForm()
        }}
        title="New Service Request"
      >
        <form onSubmit={handleCreate} className="form-grid">
          {selectedWorkerProfileId ? (
            <div className="form-field">
              <span className="form-label">Worker</span>
              <div
                style={{
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 600,
                }}
              >
                {selectedWorkerName}
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>
              No worker selected. Go to Find Workers and click Request Service on a profile.
            </p>
          )}
          <Input label="Title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} error={getError('title')} required />
          <Textarea label="Description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} error={getError('description')} required />
          <Textarea label="Address" name="address" value={address} onChange={(e) => setAddress(e.target.value)} error={getError('address')} required />
          {formError && <p className="form-error">{formError}</p>}
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => { setPanelOpen(false); resetCreateForm() }}>Close</Button>
            <Button type="submit" loading={submitting} disabled={!selectedWorkerProfileId}>Submit Request</Button>
          </div>
        </form>
      </SlideOver>

      <SlideOver
        open={cancelPanelOpen}
        onClose={() => {
          setCancelPanelOpen(false)
          setCancelRemark('')
          setActionRequestId(null)
        }}
        title="Cancel Request"
      >
        <form onSubmit={handleCancel} className="form-grid">
          <Textarea
            label="Cancellation remark"
            name="customerRemark"
            value={cancelRemark}
            onChange={(e) => setCancelRemark(e.target.value)}
            error={getError('customerRemark')}
            required
            placeholder="Please provide a reason for cancellation"
          />
          {formError && <p className="form-error">{formError}</p>}
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => setCancelPanelOpen(false)}>Close</Button>
            <Button type="submit" variant="danger" loading={submitting}>Confirm Cancel</Button>
          </div>
        </form>
      </SlideOver>

      <SlideOver
        open={rejectPanelOpen}
        onClose={() => {
          setRejectPanelOpen(false)
          setRejectRemark('')
          setActionRequestId(null)
        }}
        title="Reject Request"
      >
        <form onSubmit={handleReject} className="form-grid">
          <Textarea
            label="Rejection remark"
            name="workerRemark"
            value={rejectRemark}
            onChange={(e) => setRejectRemark(e.target.value)}
            error={getError('workerRemark')}
            required
            placeholder="Please provide a reason for rejection"
          />
          {formError && <p className="form-error">{formError}</p>}
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => setRejectPanelOpen(false)}>Close</Button>
            <Button type="submit" variant="danger" loading={submitting}>Confirm Reject</Button>
          </div>
        </form>
      </SlideOver>

    </div>
  )
}
