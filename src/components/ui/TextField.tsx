'use client'

import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  supportingText?: string
  helperText?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  error,
  supportingText,
  helperText,
  startIcon,
  endIcon,
  id,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined)
  const isPassword = props.type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : props.type
  const hasRightElement = endIcon || isPassword
  const helper = error || supportingText || helperText

  return (
    <div className="flex flex-col gap-1 w-full">
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
          <span className="absolute left-3 text-[var(--md-sys-color-on-surface-variant)] pointer-events-none flex items-center">
            {startIcon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full h-10 sm:h-11 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface)] border px-3.5 ${
            startIcon ? 'pl-9 sm:pl-10' : ''
          } ${hasRightElement ? (endIcon && isPassword ? 'pr-16' : 'pr-10') : ''} text-base sm:text-sm text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)]/50 transition-all duration-150 focus:outline-none ${
            error
              ? 'border-[var(--md-sys-color-error)] text-[var(--md-sys-color-error)] focus:border-[var(--md-sys-color-error)]'
              : 'border-[var(--md-sys-color-outline-variant)] focus:border-[var(--md-sys-color-primary)] shadow-2xs'
          } ${className}`}
          {...props}
          type={inputType}
        />
        <div className="absolute right-2.5 sm:right-3 flex items-center gap-1 text-[var(--md-sys-color-on-surface-variant)]">
          {endIcon && <span>{endIcon}</span>}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 rounded-full hover:bg-[var(--md-sys-color-surface-container-highest)] hover:text-[var(--md-sys-color-on-surface)] transition-colors focus:outline-none cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      {helper && (
        <span
          className={`text-[11px] px-1 ${
            error
              ? 'text-[var(--md-sys-color-error)]'
              : 'text-[var(--md-sys-color-on-surface-variant)]'
          }`}
        >
          {helper}
        </span>
      )}
    </div>
  )
}
