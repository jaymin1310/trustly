import { Eye } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { complaintApi } from '../../api/complaint.api'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { TableSkeleton } from '../../components/ui/Skeleton'
import type { ComplaintResponse } from '../../types/models'
import { formatDate } from '../../utils/format'

export function ComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setComplaints(await complaintApi.getMy())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <div className="page-header">
        <h1>My Complaints</h1>
        <p>Track complaints filed from completed service requests</p>
      </div>

      <div className="card">
        {loading ? (
          <TableSkeleton cols={5} />
        ) : complaints.length === 0 ? (
          <div className="empty-state">No complaints filed</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Status</th>
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
                    <td>{formatDate(c.createdAt)}</td>
                    <td>
                      <Link to={`/complaints/${c.id}`}>
                        <Button variant="ghost" size="sm"><Eye size={16} /></Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
