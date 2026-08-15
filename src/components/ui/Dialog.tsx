import React, { useEffect } from 'react'

export interface DialogProps {
  isOpen: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'primary' | 'error'
  isLoading?: boolean
  maxWidth?: string
  hideFooter?: boolean
  onConfirm?: () => void
  onClose: () => void
  children?: React.ReactNode
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
  maxWidth = 'max-w-md',
  hideFooter = false,
  onConfirm,
  onClose,
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const confirmBtnStyles =
    variant === 'error'
      ? 'bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] hover:opacity-90'
      : 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-hidden">
      {/* Backdrop click dismiss */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal / Bottom Sheet Card */}
      <div
        className={`relative z-10 w-full ${maxWidth} bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] rounded-t-3xl sm:rounded-[var(--md-sys-shape-corner-extra-large)] p-4 sm:p-6 border-t sm:border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-3 sm:gap-4 max-h-[88dvh] sm:max-h-[90vh] shadow-2xl animate-slide-up sm:animate-none`}
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="w-12 h-1 bg-[var(--md-sys-color-outline-variant)] rounded-full mx-auto sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] active:scale-95 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {description && (
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            {description}
          </p>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto pr-0.5">
          {children}
        </div>

        {/* Footer Actions */}
        {!hideFooter && (onConfirm || (!children && cancelLabel)) && (
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-[var(--md-sys-color-outline-variant)] pb-safe sm:pb-0">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 sm:flex-none px-4 h-10 rounded-[var(--md-sys-shape-corner-full)] text-xs sm:text-sm font-semibold text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            {onConfirm && (
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 sm:flex-none px-5 h-10 rounded-[var(--md-sys-shape-corner-full)] text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 ${confirmBtnStyles}`}
              >
                {isLoading && (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
                {confirmLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

