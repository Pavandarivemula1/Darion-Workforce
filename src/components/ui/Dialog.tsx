import React from 'react'

export interface DialogProps {
  isOpen: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'primary' | 'error'
  isLoading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null

  const confirmBtnStyles =
    variant === 'error'
      ? 'bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] hover:opacity-90'
      : 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] rounded-[var(--md-sys-shape-corner-extra-large)] p-6 shadow-[var(--md-sys-elevation-3)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-4">
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
          {description}
        </p>

        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 h-10 rounded-[var(--md-sys-shape-corner-full)] text-sm font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
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
        </div>
      </div>
    </div>
  )
}
