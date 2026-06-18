import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="error-page">
      <h1>404</h1>
      <p style={{ color: 'var(--text-muted)' }}>The page you are looking for does not exist.</p>
      <Link to="/">
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  )
}

export function ForbiddenPage() {
  return (
    <div className="error-page">
      <h1>403</h1>
      <p style={{ color: 'var(--text-muted)' }}>You do not have permission to view this page.</p>
      <Link to="/">
        <Button variant="secondary">Back to Dashboard</Button>
      </Link>
    </div>
  )
}
