import {
  Briefcase,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  MessageSquareWarning,
  Search,
  Sun,
  Star,
  UserCircle,
  Wrench,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { formatEnum, type Role } from '../../types/enums'

type NavAudience = 'customer' | 'worker' | 'admin'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  audience: NavAudience[]
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, audience: ['customer', 'worker', 'admin'] },
  { to: '/workers', label: 'Find Workers', icon: Search, audience: ['customer'] },
  { to: '/service-requests', label: 'My Requests', icon: Wrench, audience: ['customer'] },
  { to: '/complaints', label: 'My Complaints', icon: MessageSquareWarning, audience: ['customer', 'worker'] },
  { to: '/service-requests', label: 'Incoming Requests', icon: Wrench, audience: ['worker'] },
  { to: '/my-reviews', label: 'My Reviews', icon: Star, audience: ['worker'] },
  { to: '/worker-profile', label: 'My Profile', icon: UserCircle, audience: ['worker'] },
  { to: '/categories', label: 'Categories', icon: FolderTree, audience: ['admin'] },
  { to: '/worker-applications', label: 'Applications', icon: Briefcase, audience: ['admin'] },
  { to: '/admin/complaints', label: 'Admin Complaints', icon: MessageSquareWarning, audience: ['admin'] },
]

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onCloseMobile: () => void
}

export function Sidebar({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }: SidebarProps) {
  const { isAdmin, isWorker, isCustomer } = useAuth()

  const visibleItems = navItems.filter((item) => {
    if (isAdmin) return item.audience.includes('admin')
    if (isWorker && item.audience.includes('worker')) return true
    if (isCustomer && item.audience.includes('customer')) return true
    return false
  })

  const content = (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: '1rem',
          borderBottom: '1px solid var(--border)',
          minHeight: 'var(--header-height)',
        }}
      >
        {!collapsed && (
          <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--primary)' }}>Trustly</span>
        )}
        <button
          onClick={() => {
            if (window.matchMedia('(max-width: 768px)').matches) {
              onCloseMobile()
            } else {
              onToggleCollapse()
            }
          }}
          aria-label="Toggle sidebar"
          style={{
            minWidth: 44,
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--sidebar-icon-color, #ffffff)',
          }}
          className="sidebar-toggle-btn"
        >
          <Menu size={20} />
        </button>
      </div>
      <nav style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {visibleItems.map((item, i) => (
          <motion.div
            key={`${item.audience.join('-')}-${item.to}-${item.label}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
          >
            <NavLink
              to={item.to}
              end={item.to === '/'}
              onClick={onCloseMobile}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: collapsed ? '0.75rem' : '0.75rem 1rem',
                borderRadius: 'var(--radius)',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                background: isActive ? 'var(--primary-soft)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                minHeight: 44,
                justifyContent: collapsed ? 'center' : 'flex-start',
              })}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          </motion.div>
        ))}
      </nav>
    </>
  )

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }}
          className="mobile-overlay"
        />
      )}
      <motion.aside
        animate={{ width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)' }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          background: 'var(--bg-elevated)',
          borderRight: '1px solid var(--border)',
          zIndex: 95,
          overflow: 'hidden',
          transform: mobileOpen ? 'translateX(0)' : undefined,
        }}
        className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {content}
      </motion.aside>
      <style>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); transition: transform 0.25s ease; }
          .sidebar.mobile-open { transform: translateX(0); width: var(--sidebar-width) !important; }
        }
      `}</style>
    </>
  )
}

export function Navbar({
  onMenuClick,
  onLogout,
  onLogoutAll,
  email,
  roles,
}: {
  onMenuClick: () => void
  onLogout: () => void
  onLogoutAll: () => void
  email: string | null
  roles: Role[]
}) {
  const initials = email ? email.slice(0, 2).toUpperCase() : '?'
  const { toggleTheme, isDark } = useTheme()
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const handleLogout = () => {
    setAccountOpen(false)
    onLogout()
  }

  const handleLogoutAll = () => {
    setAccountOpen(false)
    onLogoutAll()
  }

  return (
    <header
      style={{
        height: 'var(--header-height)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        background: 'var(--bg-elevated)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        style={{
          minWidth: 44,
          minHeight: 44,
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className="mobile-menu-btn"
      >
        <Menu size={22} />
      </button>
      <div style={{ flex: 1 }} />
      <div ref={accountRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setAccountOpen((open) => !open)}
          aria-label="Open profile menu"
          aria-expanded={accountOpen}
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'var(--primary-soft)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.8125rem',
            border: accountOpen ? '1px solid var(--primary)' : '1px solid transparent',
          }}
        >
          {initials}
        </button>

        {accountOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.625rem)',
              right: 0,
              width: 280,
              maxWidth: 'calc(100vw - 2rem)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow)',
              padding: '0.875rem',
              zIndex: 120,
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', paddingBottom: '0.875rem', borderBottom: '1px solid var(--border)' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  flex: '0 0 auto',
                }}
              >
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>Profile</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', wordBreak: 'break-word' }}>
                  {email}
                </div>
              </div>
            </div>

            <div style={{ padding: '0.875rem 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.375rem' }}>Roles</div>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {roles.length === 0 ? (
                  <span style={{ color: 'var(--text-muted)' }}>No role</span>
                ) : (
                  roles.map((role) => (
                    <span
                      key={role}
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '999px',
                        background: 'var(--primary-soft)',
                        color: 'var(--primary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {formatEnum(role)}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div style={{ padding: '0.875rem 0', borderBottom: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.875rem',
                  minHeight: 36,
                  borderRadius: '999px',
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  transition: 'background 0.25s ease, transform 0.2s ease, border-color 0.2s ease, color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                {isDark ? (
                  <>
                    <Sun size={16} /> Light mode
                  </>
                ) : (
                  <>
                    <Moon size={16} /> Dark mode
                  </>
                )}
              </button>
            </div>

            <div style={{ display: 'grid', gap: '0.5rem', paddingTop: '0.875rem' }}>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  minHeight: 40,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  color: 'var(--text)',
                  padding: '0.5rem 0.625rem',
                  borderRadius: 'var(--radius)',
                  textAlign: 'left',
                }}
              >
                <LogOut size={18} /> Logout current device
              </button>
              <button
                type="button"
                onClick={handleLogoutAll}
                style={{
                  minHeight: 40,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  color: 'var(--danger)',
                  padding: '0.5rem 0.625rem',
                  borderRadius: 'var(--radius)',
                  textAlign: 'left',
                }}
              >
                <LogOut size={18} /> Logout all devices
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  )
}
