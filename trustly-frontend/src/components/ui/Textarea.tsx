import { motion } from 'framer-motion'
import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  className?: string
}

export function Textarea({ label, error, id, style, className, ...props }: TextareaProps) {
  const textareaId = id ?? props.name

  return (
    <div className={`form-field ${className ?? ''}`}>
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
        </label>
      )}
      <motion.div animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
        <textarea
          id={textareaId}
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            borderRadius: 'var(--radius)',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
            background: 'var(--bg)',
            color: 'var(--text)',
            minHeight: '100px',
            resize: 'vertical',
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
