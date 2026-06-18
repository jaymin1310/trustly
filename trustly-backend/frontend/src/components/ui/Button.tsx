import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const variants = {
  primary: {
    background: 'var(--primary)',
    color: '#fff',
    border: '1px solid transparent',
  },
  secondary: {
    background: 'var(--bg-hover)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
  },
  danger: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: 'var(--danger)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid transparent',
  },
}

const sizes = {
  sm: { padding: '0.375rem 0.75rem', fontSize: '0.8125rem', minHeight: '36px' },
  md: { padding: '0.5rem 1rem', fontSize: '0.875rem', minHeight: '44px' },
  lg: { padding: '0.75rem 1.25rem', fontSize: '1rem', minHeight: '48px' },
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  children,
  style,
  className,
  ...props
}: ButtonProps) {
  return (
    <motion.div whileTap={{ scale: disabled || loading ? 1 : 0.97 }} style={{ display: 'inline-flex' }}>
      <button
        disabled={disabled || loading}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          borderRadius: 'var(--radius)',
          fontWeight: 600,
          transition: 'opacity 0.2s, background 0.2s',
          opacity: disabled || loading ? 0.6 : 1,
          ...variants[variant],
          ...sizes[size],
          ...style,
        }}
        {...props}
      >
        {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
        {children}
      </button>
    </motion.div>
  )
}
