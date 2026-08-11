import React from 'react'

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
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
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="relative flex items-center">
        {startIcon && (
          <span className="absolute left-3 text-[var(--md-sys-color-on-surface-variant)] pointer-events-none">
            {startIcon}
          </span>
        )}
        <input
          id={inputId}
          placeholder=" "
          className={`peer w-full h-14 rounded-[var(--md-sys-shape-corner-extra-small)] bg-[var(--md-sys-color-surface-container-highest)] border-b-2 px-4 ${
            startIcon ? 'pl-10' : ''
          } ${endIcon ? 'pr-10' : ''} pt-4 pb-1 text-sm text-[var(--md-sys-color-on-surface)] transition-all duration-200 focus:outline-none ${
            error
              ? 'border-[var(--md-sys-color-error)] text-[var(--md-sys-color-error)]'
              : 'border-[var(--md-sys-color-outline)] focus:border-[var(--md-sys-color-primary)]'
          } ${className}`}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={`absolute text-xs transition-all duration-200 pointer-events-none ${
            startIcon ? 'left-10' : 'left-4'
          } top-2 ${
            error
              ? 'text-[var(--md-sys-color-error)]'
              : 'text-[var(--md-sys-color-on-surface-variant)] peer-focus:text-[var(--md-sys-color-primary)]'
          } peer-placeholder-shown:text-sm peer-placeholder-shown:top-4`}
        >
          {label}
        </label>
        {endIcon && (
          <span className="absolute right-3 text-[var(--md-sys-color-on-surface-variant)]">
            {endIcon}
          </span>
        )}
      </div>
      {(error || supportingText) && (
        <span
          className={`text-xs px-4 ${
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
