import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { parseErrorMessage } from '../api/client'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { PasswordInput } from '../components/ui/PasswordInput'
import { useAuth } from '../context/AuthContext'
import { useFormErrors } from '../hooks/useFormErrors'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { getError, handleApiError, clearErrors, formError } = useFormErrors()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    setLoading(true)
    try {
      await login({ email, password })
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      const message = parseErrorMessage(err)
      if (message.toLowerCase().includes('not verified')) {
        toast.error('Please verify your email first')
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`)
        return
      }
      handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Trustly</h1>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="form-grid">
          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={getError('email')}
            required
            autoComplete="email"
          />
          <PasswordInput
            label="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={getError('password')}
            required
            autoComplete="current-password"
          />
          <div style={{ textAlign: 'right' }}>
            <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>
              Forgot password?
            </Link>
          </div>
          {formError && <p className="form-error">{formError}</p>}
          <Button type="submit" loading={loading} style={{ width: '100%' }}>
            Sign in
          </Button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
