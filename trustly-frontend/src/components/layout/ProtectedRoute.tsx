import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Role } from '../../types/enums'
import { Skeleton } from '../ui/Skeleton'

interface ProtectedRouteProps {
  roles?: Role[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <Skeleton height={32} width={200} style={{ marginBottom: '1rem' }} />
        <Skeleton height={200} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.some((r) => hasRole(r))) {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet />
}
