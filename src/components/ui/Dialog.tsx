import React from 'react'

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
  if (!isOpen) return null

  const confirmBtnStyles =
    variant === 'error'
      ? 'bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] hover:opacity-90'
      : 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className={`w-full ${maxWidth} bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] rounded-[var(--md-sys-shape-corner-extra-large)] p-6 border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-4 my-8 max-h-[90vh] overflow-y-auto shadow-2xl`}>
        <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        {description && (
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            {description}
          </p>
        )}
        
        {children}

        {!hideFooter && (onConfirm || (!children && cancelLabel)) && (
          <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-[var(--md-sys-color-outline-variant)]">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 h-10 rounded-[var(--md-sys-shape-corner-full)] text-sm font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            {onConfirm && (
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`px-5 h-10 rounded-[var(--md-sys-shape-corner-full)] text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center gap-2 ${confirmBtnStyles}`}
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
