import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'filled'
  density?: 'compact' | 'normal' | 'spacious'
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  density = 'normal',
  className = '',
  ...props
}) => {
  const densityStyles = {
    compact: 'p-2.5 sm:p-3.5 rounded-[var(--md-sys-shape-corner-medium)]',
    normal: 'p-3.5 sm:p-5 lg:p-6 rounded-[var(--md-sys-shape-corner-large)]',
    spacious: 'p-5 sm:p-7 lg:p-8 rounded-[var(--md-sys-shape-corner-large)]',
  }

  const baseStyles = 'transition-all duration-200 shadow-2xs'

  const variantStyles = {
    elevated: 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)]',
    outlined: 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]',
    filled: 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)]',
  }

  return (
    <div className={`${baseStyles} ${densityStyles[density]} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  )
}

