import { motion } from 'framer-motion'
import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ label, error, options, placeholder, id, style, ...props }: SelectProps) {
  const selectId = id ?? props.name

  return (
    <div className="form-field">
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
        </label>
      )}
      <motion.div animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
        <select
          id={selectId}
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            borderRadius: 'var(--radius)',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
            background: 'var(--bg)',
            color: 'var(--text)',
            minHeight: '44px',
            outline: 'none',
            cursor: 'pointer',
            ...style,
          }}
          {...props}
        >
          {placeholder && (
            <option value="">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </motion.div>
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

export function enumToOptions(values: readonly string[]): { value: string; label: string }[] {
  return values.map((v) => ({
    value: v,
    label: v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  }))
}
