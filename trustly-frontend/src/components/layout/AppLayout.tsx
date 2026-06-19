import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { workerProfileApi } from '../../api/workerProfile.api'
import { useAuth } from '../../context/AuthContext'
import { Navbar, Sidebar } from './Sidebar'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [networkError, setNetworkError] = useState(false)
  const { email, roles, isAdmin, isWorker, logout, logoutAll } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onNetwork = () => setNetworkError(true)
    const onNetworkClear = () => setNetworkError(false)
    const onExpired = () => {
      toast.error('Session expired. Please log in again.')
      navigate('/login')
    }
    const onForbidden = () => navigate('/forbidden')

    window.addEventListener('network-error', onNetwork)
    window.addEventListener('online', onNetworkClear)
    window.addEventListener('auth-expired', onExpired)
    window.addEventListener('forbidden-error', onForbidden)

    return () => {
      window.removeEventListener('network-error', onNetwork)
      window.removeEventListener('online', onNetworkClear)
      window.removeEventListener('auth-expired', onExpired)
      window.removeEventListener('forbidden-error', onForbidden)
    }
  }, [navigate])

  useEffect(() => {
    if (!isWorker || isAdmin) return

    if (location.pathname === '/worker-profile') {
      toast.dismiss('complete-worker-profile')
      return
    }

    workerProfileApi
      .getMy()
      .then((profile) => {
        if (profile.profileCompleted) {
          toast.dismiss('complete-worker-profile')
          return
        }

        toast(
          (t) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span>Complete your worker profile</span>
              <button
                type="button"
                onClick={() => {
                  toast.dismiss(t.id)
                  navigate('/worker-profile')
                }}
                style={{
                  color: 'var(--primary)',
                  fontWeight: 700,
                  minHeight: 32,
                }}
              >
                Edit Profile
              </button>
            </div>
          ),
          { id: 'complete-worker-profile' },
        )
      })
      .catch(() => undefined)
  }, [isAdmin, isWorker, location.pathname, navigate])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const handleLogoutAll = async () => {
    await logoutAll()
    toast.success('Logged out from all devices')
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className={`main-area ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {networkError && (
          <div className="network-banner">Cannot connect to server — check your connection</div>
        )}
        <Navbar
          onMenuClick={() => setMobileOpen(true)}
          onLogout={handleLogout}
          onLogoutAll={handleLogoutAll}
          email={email}
          roles={roles}
        />
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="page-content"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  )
}
