import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { categoryApi } from '../../api/category.api'
import { workerApi } from '../../api/worker.api'
import { workerProfileApi } from '../../api/workerProfile.api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select, enumToOptions } from '../../components/ui/Select'
import { Skeleton } from '../../components/ui/Skeleton'
import { Textarea } from '../../components/ui/Textarea'
import { useFormErrors } from '../../hooks/useFormErrors'
import { DocumentType, WorkerApplicationStatus } from '../../types/enums'
import type { CategoryResponse, MyWorkerApplicationResponse, WorkerProfileResponse } from '../../types/models'
import { Badge } from '../../components/ui/Badge'
import { formatDate } from '../../utils/format'

export function WorkerApplyPage() {
  const navigate = useNavigate()
  const { getError, handleApiError, clearErrors, formError } = useFormErrors()
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [existing, setExisting] = useState<MyWorkerApplicationResponse | null>(null)
  const [profile, setProfile] = useState<WorkerProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [phone, setPhone] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [experienceYears, setExperienceYears] = useState('0')
  const [address, setAddress] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [document, setDocument] = useState<File | null>(null)

  useEffect(() => {
    Promise.all([
      categoryApi.getActive(),
      workerApi.getMyApplication().catch(() => null),
    ]).then(async ([cats, app]) => {
      setCategories(cats)
      setExisting(app)
      if (app?.status === WorkerApplicationStatus.APPROVED) {
        const myProfile = await workerProfileApi.getMy().catch(() => null)
        setProfile(myProfile)
        if (myProfile && !myProfile.profileCompleted) {
          toast('Your worker application is approved. Complete your worker profile to continue.', {
            icon: '!',
            id: 'complete-worker-profile',
          })
        }
      }
    }).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!document) {
      toast.error('Please upload a document')
      return
    }
    clearErrors()
    setSubmitting(true)
    try {
      await workerApi.apply(
        {
          phone,
          categoryId: Number(categoryId),
          experienceYears: Number(experienceYears),
          address,
          documentType: documentType as DocumentType,
          documentNumber,
        },
        document,
      )
      toast.success('Application submitted!')
      navigate('/')
    } catch (err) {
      handleApiError(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Skeleton height={300} />

  if (existing) {
    return (
      <div>
        <div className="page-header">
          <h1>Worker Application</h1>
          <p>Your application status</p>
        </div>
        <div className="card detail-grid">
          <div className="detail-row"><span className="detail-label">Category</span><span>{existing.categoryName}</span></div>
          <div className="detail-row"><span className="detail-label">Status</span><Badge value={existing.status} /></div>
          {existing.adminRemark && <div className="detail-row"><span className="detail-label">Remark</span><span>{existing.adminRemark}</span></div>}
          <div className="detail-row"><span className="detail-label">Submitted</span><span>{formatDate(existing.createdAt)}</span></div>
          {existing.status === WorkerApplicationStatus.APPROVED && profile && !profile.profileCompleted && (
            <div className="form-actions full-width">
              <Button type="button" onClick={() => navigate('/worker-profile')}>Complete Profile</Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>Become a Worker</h1>
        <p>Submit your application to join Trustly as a service provider</p>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit} className="form-grid two-col">
          <Input label="Phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} error={getError('phone')} placeholder="10-digit mobile" required />
          <Select label="Category" name="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} options={categories.map((c) => ({ value: String(c.id), label: c.name }))} placeholder="Select category" error={getError('categoryId')} required />
          <Input label="Experience (years)" name="experienceYears" type="number" min={0} value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} error={getError('experienceYears')} />
          <Select label="Document Type" name="documentType" value={documentType} onChange={(e) => setDocumentType(e.target.value)} options={enumToOptions(Object.values(DocumentType))} placeholder="Select document" error={getError('documentType')} required />
          <Input label="Document Number" name="documentNumber" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} error={getError('documentNumber')} required />
          <Textarea label="Address" name="address" value={address} onChange={(e) => setAddress(e.target.value)} error={getError('address')} required className="full-width" />
          <div className="form-field full-width">
            <label className="form-label">Upload Document</label>
            <input type="file" accept="image/*,.pdf" onChange={(e) => setDocument(e.target.files?.[0] ?? null)} required style={{ minHeight: 44 }} />
          </div>
          {formError && <p className="form-error full-width">{formError}</p>}
          <div className="form-actions full-width">
            <Button type="submit" loading={submitting}>Submit Application</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
