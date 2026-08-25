'use client'

import React from 'react'
import { useFormStatus } from 'react-dom'
import { LogOut } from 'lucide-react'

export interface LogoutSubmitButtonProps {
  isCollapsed?: boolean
  variant?: 'sidebar' | 'header' | 'mobile'
}

export const LogoutSubmitButton: React.FC<LogoutSubmitButtonProps> = ({ 
  isCollapsed = false,
  variant = 'sidebar'
}) => {
  const { pending } = useFormStatus()

  // Icon changes to a spinner if pending
  const IconRender = pending ? (
    <svg className="animate-spin h-3.5 w-3.5 shrink-0 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ) : (
    <LogOut className="w-3.5 h-3.5 shrink-0" />
  )

  if (variant === 'header') {
    return (
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.96] h-8 px-3.5 text-xs rounded-[var(--md-sys-shape-corner-full)] gap-1.5 border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10"
      >
        <span className="shrink-0 flex items-center">
          {IconRender}
        </span>
        <span className="hidden sm:inline">{pending ? 'Signing Out...' : 'Sign Out'}</span>
        <span className="sm:hidden">{pending ? '...' : 'Exit'}</span>
      </button>
    )
  }

  // Sidebar variant (used in DynamicSidebar for admin view)
  if (isCollapsed) {
    return (
      <button
        type="submit"
        title="Sign Out"
        aria-label="Sign Out"
        disabled={pending}
        className="p-1.5 rounded-lg text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)]/40 transition-colors cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center w-full"
      >
        {IconRender}
      </button>
    )
  }

  // Expanded Sidebar variant
  return (
    <button
      type="submit"
      title="Sign Out"
      disabled={pending}
      className={`flex items-center px-3 w-full h-8 text-xs font-medium rounded-xl text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-all cursor-pointer disabled:opacity-50`}
    >
      {IconRender}
      <span className="ml-2 truncate">{pending ? 'Signing Out...' : 'Sign Out'}</span>
    </button>
  )
}
