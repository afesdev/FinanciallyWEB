import { useEffect, useId, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

type ModalProps = {
  open: boolean
  title: string
  subtitle?: string
  accentColor?: string
  locked?: boolean
  maxWidth?: string
  onClose: () => void
  children: ReactNode
}

export default function Modal({
  open,
  title,
  subtitle,
  accentColor,
  locked = false,
  maxWidth = 'max-w-lg',
  onClose,
  children,
}: ModalProps) {
  const reduceMotion = useReducedMotion()
  const titleId = useId()

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !locked) onClose()
    }
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previo
      window.removeEventListener('keydown', onKey)
    }
  }, [open, locked, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center px-0 py-0 sm:items-center sm:px-4 sm:py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !locked && onClose()}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 24, scale: reduceMotion ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 16, scale: reduceMotion ? 1 : 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={`relative isolate w-full ${maxWidth} max-h-[92vh] overflow-y-auto overflow-x-hidden rounded-t-3xl border border-slate-900/5 bg-white shadow-2xl shadow-slate-900/20 dark:border-slate-700 dark:bg-slate-900 sm:rounded-3xl`}
          >
            {accentColor && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-[0.12] blur-2xl"
                style={{ backgroundColor: accentColor }}
              />
            )}

            <header className="relative flex items-start justify-between gap-4 px-6 pt-6">
              <div>
                <h2
                  id={titleId}
                  className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50"
                >
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={locked}
                aria-label="Cerrar"
                className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  aria-hidden="true"
                  className="h-4.5 w-4.5"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </header>

            <div className="relative px-6 pb-6 pt-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
