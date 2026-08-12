import React from 'react'

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  supportingText?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  error,
  supportingText,
  startIcon,
  endIcon,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined)

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={`text-xs font-semibold tracking-wide ${
            error
              ? 'text-[var(--md-sys-color-error)]'
              : 'text-[var(--md-sys-color-on-surface-variant)]'
          }`}
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {startIcon && (
          <span className="absolute left-3 text-[var(--md-sys-color-on-surface-variant)] pointer-events-none">
            {startIcon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full h-11 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface)] border px-3.5 ${
            startIcon ? 'pl-10' : ''
          } ${endIcon ? 'pr-10' : ''} text-sm text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)]/50 transition-all duration-200 focus:outline-none ${
            error
              ? 'border-[var(--md-sys-color-error)] text-[var(--md-sys-color-error)] focus:border-[var(--md-sys-color-error)]'
              : 'border-[var(--md-sys-color-outline-variant)] focus:border-[var(--md-sys-color-primary)]'
          } ${className}`}
          {...props}
        />
        {endIcon && (
          <span className="absolute right-3 text-[var(--md-sys-color-on-surface-variant)]">
            {endIcon}
          </span>
        )}
      </div>
      {(error || supportingText) && (
        <span
          className={`text-xs px-1 ${
            error
              ? 'text-[var(--md-sys-color-error)]'
              : 'text-[var(--md-sys-color-on-surface-variant)]'
          }`}
        >
          {error || supportingText}
        </span>
      )}
    </div>
  )
}
