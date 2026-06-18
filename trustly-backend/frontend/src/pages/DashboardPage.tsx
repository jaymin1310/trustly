import { motion } from 'framer-motion'
import { Users, Wrench, FolderTree, Star, Shield, Clock, CheckCircle, Briefcase } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { adminApi } from '../api/admin.api'
import { categoryApi } from '../api/category.api'
import { serviceRequestApi } from '../api/serviceRequest.api'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { useCountUp } from '../hooks/useCountUp'
import { ServiceRequestStatus } from '../types/enums'
import type { AdminDashboardResponse, ServiceRequestResponse } from '../types/models'

function KpiCard({ label, value, icon: Icon, delay }: { label: string; value: number; icon: typeof Users; delay: number }) {
  const count = useCountUp(value)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card"
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</span>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius)',
            background: 'var(--primary-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
          }}
        >
          <Icon size={20} />
        </div>
      </div>
      <span style={{ fontSize: '2rem', fontWeight: 700 }}>{count.toLocaleString()}</span>
    </motion.div>
  )
}

function WorkerDashboard({ requests }: { requests: ServiceRequestResponse[] }) {
  const pending = requests.filter((r) => r.status === ServiceRequestStatus.PENDING).length
  const accepted = requests.filter((r) => r.status === ServiceRequestStatus.ACCEPTED).length
  const completionRequested = requests.filter((r) => r.status === ServiceRequestStatus.WORK_COMPLETION_REQUESTED).length
  const completed = requests.filter((r) => r.status === ServiceRequestStatus.COMPLETED).length
  const pendingRequests = requests.filter((r) => r.status === ServiceRequestStatus.PENDING)

  return (
    <div>
      <div className="page-header">
        <h1>Worker Dashboard</h1>
        <p>Your incoming requests and active jobs</p>
      </div>
      <div className="grid-kpi">
        <KpiCard label="Pending Requests" value={pending} icon={Clock} delay={0} />
        <KpiCard label="Accepted Jobs" value={accepted} icon={Wrench} delay={0.05} />
        <KpiCard label="Awaiting Customer Approval" value={completionRequested} icon={CheckCircle} delay={0.1} />
        <KpiCard label="Completed Requests" value={completed} icon={Star} delay={0.15} />
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <h3 className="card-title">Pending Requests</h3>
          <Link to="/service-requests">
            <Button variant="secondary" size="sm">View all</Button>
          </Link>
        </div>
        {pendingRequests.length === 0 ? (
          <div className="empty-state">No pending requests right now</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingRequests.slice(0, 5).map((req) => (
              <div key={req.id} className="flex-between" style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{req.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {req.customer.name} · {req.category.name}
                  </div>
                </div>
                <Link to={`/service-requests/${req.id}`}>
                  <Button size="sm">Review</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { isAdmin, isWorker, isCustomer } = useAuth()
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null)
  const [categoryCount, setCategoryCount] = useState(0)
  const [requestCount, setRequestCount] = useState(0)
  const [workerRequests, setWorkerRequests] = useState<ServiceRequestResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        if (isAdmin) {
          const data = await adminApi.getDashboard()
          setDashboard(data)
        } else if (isWorker) {
          const data = await serviceRequestApi.getWorkerRequests()
          setWorkerRequests(data)
        } else if (isCustomer) {
          const [categories, requests] = await Promise.all([
            categoryApi.getActive(),
            serviceRequestApi.getCustomerRequests(),
          ])
          setCategoryCount(categories.length)
          setRequestCount(requests.length)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isAdmin, isWorker, isCustomer])

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <Skeleton height={32} width={200} />
          <Skeleton height={16} width={300} style={{ marginTop: 8 }} />
        </div>
        <div className="grid-kpi">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={120} />
          ))}
        </div>
      </div>
    )
  }

  if (isAdmin && dashboard) {
    return (
      <div>
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Platform overview and key metrics</p>
        </div>
        <div className="grid-kpi">
          <KpiCard label="Total Users" value={dashboard.totalUsers} icon={Users} delay={0} />
          <KpiCard label="Workers" value={dashboard.totalWorkers} icon={Wrench} delay={0.05} />
          <KpiCard label="Categories" value={dashboard.totalCategories} icon={FolderTree} delay={0.1} />
          <KpiCard label="Service Requests" value={dashboard.totalServiceRequests} icon={Wrench} delay={0.15} />
          <KpiCard label="Reviews" value={dashboard.totalReviews} icon={Star} delay={0.2} />
          <KpiCard label="Active Penalties" value={dashboard.activePenalties} icon={Shield} delay={0.25} />
        </div>
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {[
            { title: 'Service Requests', data: dashboard.serviceRequestsByStatus },
            { title: 'Worker Applications', data: dashboard.workerApplicationsByStatus },
            { title: 'Complaints', data: dashboard.complaintsByStatus },
          ].map((section) => (
            <div key={section.title} className="card">
              <h3 className="card-title" style={{ marginBottom: '1rem' }}>{section.title}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Object.entries(section.data ?? {}).map(([key, val]) => (
                  <div key={key} className="flex-between">
                    <Badge value={key} />
                    <span style={{ fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isWorker) {
    return <WorkerDashboard requests={workerRequests} />
  }

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to Trustly - find trusted workers near you</p>
      </div>
      <div className="grid-kpi">
        <KpiCard label="Service Categories" value={categoryCount} icon={FolderTree} delay={0} />
        <KpiCard label="My Requests" value={requestCount} icon={Wrench} delay={0.05} />
      </div>
      <div
        className="customer-dashboard-actions"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 360px)',
          gap: '1rem',
          marginTop: '1.5rem',
        }}
      >
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h2 className="card-title">Book a trusted service</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Search by category, location, and rating.</p>
          </div>
          <Link to="/workers">
            <Button>Find Workers</Button>
          </Link>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius)',
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Briefcase size={18} />
            </div>
            <h2 className="card-title">Partner Path</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            A separate track for people who want to offer services on Trustly.
          </p>
          <Link to="/worker/apply">
            <Button variant="secondary" size="sm">Open Partner Path</Button>
          </Link>
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) {
          .customer-dashboard-actions {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
