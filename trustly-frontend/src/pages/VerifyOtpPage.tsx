import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth.api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { useFormErrors } from '../hooks/useFormErrors'

export function VerifyOtpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { establishSession } = useAuth()
  const { getError, handleApiError, clearErrors, formError } = useFormErrors()
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [otp, setOtp] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    setLoading(true)
    try {
      const response = await authApi.verifyOtp({ email, otp })
      establishSession(response)
      toast.success('Email verified successfully!')
      navigate('/')
    } catch (err) {
      handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      toast.error('Enter your email first')
      return
    }
    setResending(true)
    try {
      const response = await authApi.resendVerificationOtp({ email })
      toast.success(response.message || 'OTP resent')
    } catch (err) {
      handleApiError(err)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Verify Email</h1>
          <p style={{ color: 'var(--text-muted)' }}>Enter the 6-digit OTP sent to your email</p>
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
          <Input
            label="OTP"
            name="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            error={getError('otp')}
            required
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
          />
          {formError && <p className="form-error">{formError}</p>}
          <Button type="submit" loading={loading} style={{ width: '100%' }}>
            Verify &amp; continue
          </Button>
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Button variant="ghost" loading={resending} onClick={handleResend}>
            Resend OTP
          </Button>
        </div>
        <p style={{ textAlign: 'center', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
          <Link to="/login" style={{ color: 'var(--primary)' }}>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
