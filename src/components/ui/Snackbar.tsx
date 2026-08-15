import React from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

export interface SnackbarProps {
  message: string | null
  actionLabel?: string
  onAction?: () => void
  onClose?: () => void
  variant?: 'info' | 'error' | 'success'
}

export const Snackbar: React.FC<SnackbarProps> = ({
  message,
  actionLabel,
  onAction,
  onClose,
  variant = 'info',
}) => {
  if (!message) return null

  const bgStyles = {
    info: 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border-[var(--md-sys-color-outline-variant)]',
    error: 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] border-[var(--md-sys-color-error)]/30',
    success: 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)]/30',
  }

  const icons = {
    info: <Info className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-[var(--md-sys-color-error)] shrink-0" />,
    success: <CheckCircle2 className="w-4 h-4 text-[var(--md-sys-color-success)] shrink-0" />,
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-auto min-w-[300px] max-w-lg animate-slide-up shadow-lg">
      <div
        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border ${bgStyles[variant]}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {icons[variant]}
          <span className="text-xs sm:text-sm font-medium leading-tight truncate">{message}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)] hover:opacity-80 transition-opacity cursor-pointer active:scale-95"
            >
              {actionLabel}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-full opacity-70 hover:opacity-100 transition-all cursor-pointer active:scale-95"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

