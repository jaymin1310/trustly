import { Plus, Pencil } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { categoryApi } from '../../api/category.api'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { SlideOver } from '../../components/ui/SlideOver'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { Textarea } from '../../components/ui/Textarea'
import { Toggle } from '../../components/ui/Toggle'
import { useFormErrors } from '../../hooks/useFormErrors'
import type { CategoryResponse } from '../../types/models'
import { formatDate } from '../../utils/format'

export function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { getError, handleApiError, clearErrors, formError } = useFormErrors()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [active, setActive] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setCategories(await categoryApi.getAll())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setName('')
    setDescription('')
    setActive(true)
    clearErrors()
    setPanelOpen(true)
  }

  const openEdit = (cat: CategoryResponse) => {
    setEditing(cat)
    setName(cat.name)
    setDescription(cat.description ?? '')
    setActive(cat.active)
    clearErrors()
    setPanelOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    setSubmitting(true)
    try {
      if (editing) {
        await categoryApi.update(editing.id, { name, description, active })
        toast.success('Category updated')
      } else {
        await categoryApi.create({ name, description })
        toast.success('Category created')
      }
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
      <div className="page-header flex-between">
        <div>
          <h1>Categories</h1>
          <p>Manage service categories</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={18} /> New Category
        </Button>
      </div>

      <div className="card">
        {loading ? (
          <TableSkeleton />
        ) : categories.length === 0 ? (
          <div className="empty-state">No categories yet</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td style={{ fontWeight: 600 }}>{cat.name}</td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: 280 }}>{cat.description ?? '—'}</td>
                    <td>
                      <Badge value={cat.active ? 'APPROVED' : 'REJECTED'} tone={cat.active ? 'success' : 'default'} />
                    </td>
                    <td>{formatDate(cat.createdAt)}</td>
                    <td>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}>
                        <Pencil size={16} />
                      </Button>
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
        onClose={() => setPanelOpen(false)}
        title={editing ? 'Edit Category' : 'New Category'}
      >
        <form onSubmit={handleSubmit} className="form-grid">
          <Input
            label="Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={getError('name')}
            required
            maxLength={100}
          />
          <Textarea
            label="Description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={getError('description')}
            maxLength={500}
          />
          {editing && (
            <Toggle label="Active" checked={active} onChange={setActive} error={getError('active')} />
          )}
          {formError && <p className="form-error">{formError}</p>}
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => setPanelOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editing ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
