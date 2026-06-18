import { formatEnum } from '../../types/enums'

const toneStyles: Record<string, { bg: string; color: string }> = {
  default: { bg: 'var(--bg-hover)', color: 'var(--text-muted)' },
  success: { bg: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)' },
  warning: { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' },
  danger: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' },
  info: { bg: 'var(--primary-soft)', color: 'var(--primary)' },
}

const statusTones: Record<string, keyof typeof toneStyles> = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  APPROVED: 'success',
  COMPLETED: 'success',
  RESOLVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'default',
  UNDER_REVIEW: 'info',
  WORK_COMPLETION_REQUESTED: 'info',
}

interface BadgeProps {
  value: string
  tone?: keyof typeof toneStyles
}

export function Badge({ value, tone }: BadgeProps) {
  const resolvedTone = tone ?? statusTones[value] ?? 'default'
  const style = toneStyles[resolvedTone]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.625rem',
        borderRadius: 999,
        fontSize: '0.75rem',
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        whiteSpace: 'nowrap',
      }}
    >
      {formatEnum(value)}
    </span>
  )
}
