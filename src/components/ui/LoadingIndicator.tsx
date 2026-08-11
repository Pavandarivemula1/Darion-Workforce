import React from 'react'

export interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'md',
  label,
}) => {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <div
        className={`${sizeMap[size]} border-[var(--md-sys-color-primary)] border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      />
      {label && (
        <span className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)]">
          {label}
        </span>
      )}
    </div>
  )
}
