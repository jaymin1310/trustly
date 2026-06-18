import { motion } from 'framer-motion'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, style, ...props }: InputProps) {
  const inputId = id ?? props.name

  return (
    <div className="form-field">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <motion.div animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
        <input
          id={inputId}
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
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
      </motion.div>
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}
