import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './Button'

interface SlideOverProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  width?: number
}

export function SlideOver({ open, onClose, title, children, width = 480 }: SlideOverProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.55)',
              zIndex: 100,
            }}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: width,
              background: 'var(--bg-elevated)',
              borderLeft: '1px solid var(--border)',
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{title}</h2>
              <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
                <X size={20} />
              </Button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '1.25rem' }}>{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
