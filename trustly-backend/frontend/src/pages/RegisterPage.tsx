import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth.api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { PasswordInput } from '../components/ui/PasswordInput'
import { useFormErrors } from '../hooks/useFormErrors'

export function RegisterPage() {
  const navigate = useNavigate()
  const { getError, handleApiError, clearErrors, formError, setFieldErrors } = useFormErrors()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' })
      return
    }

    setLoading(true)
    try {
      const response = await authApi.register({ name, email, password })
      toast.success(response.message || 'Verification OTP sent')
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`)
    } catch (err) {
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
          <p style={{ color: 'var(--text-muted)' }}>Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="form-grid">
          <Input
            label="Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={getError('name')}
            required
            autoComplete="name"
          />
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
            autoComplete="new-password"
          />
          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={getError('confirmPassword')}
            required
            autoComplete="new-password"
          />
          {formError && <p className="form-error">{formError}</p>}
          <Button type="submit" loading={loading} style={{ width: '100%' }}>
            Create account
          </Button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
