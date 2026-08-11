import React from 'react'

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
    info: 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)]',
    error: 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]',
    success: 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]',
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 min-w-[320px] max-w-[560px] animate-fade-in">
      <div
        className={`flex items-center justify-between gap-4 px-4 py-3 rounded-[var(--md-sys-shape-corner-extra-small)] shadow-[var(--md-sys-elevation-3)] ${bgStyles[variant]}`}
      >
        <span className="text-sm font-normal leading-5">{message}</span>
        <div className="flex items-center gap-2">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="text-sm font-medium uppercase tracking-wider text-[var(--md-sys-color-primary)] hover:opacity-80 transition-opacity cursor-pointer"
            >
              {actionLabel}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-sm opacity-70 hover:opacity-100 transition-opacity cursor-pointer px-1"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
