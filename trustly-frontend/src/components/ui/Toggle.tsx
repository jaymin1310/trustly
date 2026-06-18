import { motion } from 'framer-motion'

interface ToggleProps {
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
  disabled?: boolean
}

export function Toggle({ label, checked, onChange, error, disabled }: ToggleProps) {
  return (
    <div className="form-field">
      {label && <span className="form-label">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          minHeight: '44px',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <motion.span
          layout
          style={{
            width: 48,
            height: 26,
            borderRadius: 999,
            background: checked ? 'var(--primary)' : 'var(--border)',
            padding: 3,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          <motion.span
            layout
            animate={{ x: checked ? 22 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#fff',
            }}
          />
        </motion.span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {checked ? 'Active' : 'Inactive'}
        </span>
      </button>
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}
