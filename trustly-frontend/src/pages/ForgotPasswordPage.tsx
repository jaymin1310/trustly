import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth.api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useFormErrors } from '../hooks/useFormErrors'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { getError, handleApiError, clearErrors, formError } = useFormErrors()
  const [step, setStep] = useState<'request' | 'reset'>('request')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    setLoading(true)
    try {
      const response = await authApi.forgotPassword({ email })
      toast.success(response.message || 'If account exists, OTP has been sent')
      setStep('reset')
    } catch (err) {
      handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    setLoading(true)
    try {
      const response = await authApi.resetPassword({ email, otp, newPassword })
      if (!response.success) {
        toast.error(response.message || 'Password reset failed')
        return
      }
      toast.success(response.message || 'Password reset successfully')
      navigate('/login')
    } catch (err) {
      handleApiError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      const response = await authApi.resendResetOtp({ email })
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Reset Password</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {step === 'request'
              ? 'Enter your email to receive a reset OTP'
              : 'Enter the OTP and your new password'}
          </p>
        </div>

        {step === 'request' ? (
          <form onSubmit={handleRequestOtp} className="form-grid">
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
            {formError && <p className="form-error">{formError}</p>}
            <Button type="submit" loading={loading} style={{ width: '100%' }}>
              Send reset OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="form-grid">
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
              placeholder="******"
            />
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={getError('newPassword')}
              required
              autoComplete="new-password"
            />
            {formError && <p className="form-error">{formError}</p>}
            <Button type="submit" loading={loading} style={{ width: '100%' }}>
              Reset password
            </Button>
          </form>
        )}

        {step === 'reset' && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Button variant="ghost" loading={resending} onClick={handleResend}>
              Resend OTP
            </Button>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
          <Link to="/login" style={{ color: 'var(--primary)' }}>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
