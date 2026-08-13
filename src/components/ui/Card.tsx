import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'filled'
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-[var(--md-sys-shape-corner-large)] p-6 transition-all duration-200'

  const variantStyles = {
    elevated: 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)]',
    outlined: 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]',
    filled: 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)]',
  }

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  )
}
