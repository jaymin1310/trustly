import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useState, type InputHTMLAttributes } from 'react'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
}

export function PasswordInput({ label, error, id, style, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const inputId = id ?? props.name

  return (
    <div className="form-field">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <motion.div animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ position: 'relative' }}>
          <input
            id={inputId}
            type={visible ? 'text' : 'password'}
            style={{
              width: '100%',
              padding: '0.625rem 2.75rem 0.625rem 0.875rem',
              borderRadius: 'var(--radius)',
              border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
              background: 'var(--bg)',
              color: 'var(--text)',
              minHeight: '44px',
              outline: 'none',
              ...style,
            }}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              minWidth: '24px',
              minHeight: '24px',
            }}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </motion.div>
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}
