'use client'

import React, { useState } from 'react'
import {
  Menu,
  Search,
  ChevronDown,
  HelpCircle,
  Settings,
  LayoutGrid,
  X,
  Sparkles,
  Check,
} from 'lucide-react'

interface GoogleChatHeaderProps {
  currentUserId: string
  currentUserName: string
  currentUserRole: string
  currentUserAvatar?: string
  searchQuery: string
  onSearchChange: (query: string) => void
  onToggleSidebar?: () => void
  onOpenSettings?: () => void
}

export const GoogleChatHeader: React.FC<GoogleChatHeaderProps> = ({
  currentUserName,
  currentUserAvatar,
  searchQuery,
  onSearchChange,
  onToggleSidebar,
  onOpenSettings,
}) => {
  const [status, setStatus] = useState<'active' | 'away' | 'dnd'>('active')
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)

  return (
    <header className="h-14 w-full bg-[var(--md-sys-color-surface-container-lowest)] border-b border-[var(--md-sys-color-outline-variant)] px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 shrink-0 z-40 select-none">
      {/* 1. LEFT BRANDING */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
          title="Main menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {/* Material Green Chat Icon */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <span className="text-lg sm:text-xl font-medium text-[var(--md-sys-color-on-surface)] tracking-tight">
            Chat
          </span>
        </div>
      </div>

      {/* 2. CENTER CAPSULE SEARCH BAR */}
      <div className="flex-1 max-w-2xl px-2">
        <div className="relative w-full flex items-center">
          <Search className="w-4 h-4 absolute left-4 text-[var(--md-sys-color-on-surface-variant)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search chat"
            className="w-full pl-11 pr-9 py-2 rounded-full bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] focus:bg-[var(--md-sys-color-surface-container-lowest)] border border-transparent focus:border-[var(--md-sys-color-outline-variant)] text-xs sm:text-sm text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-on-surface-variant)] shadow-2xs focus:shadow-md transition-all outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. RIGHT STATUS & CONTROLS */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Status Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] text-xs font-semibold text-[var(--md-sys-color-on-surface)] transition-all cursor-pointer"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                status === 'active'
                  ? 'bg-emerald-500'
                  : status === 'away'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            <span className="capitalize">{status}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--md-sys-color-on-surface-variant)]" />
          </button>

          {isStatusDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              {(['active', 'away', 'dnd'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatus(s)
                    setIsStatusDropdownOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer ${
                    status === s ? 'bg-[var(--md-sys-color-surface-container)]' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        s === 'active'
                          ? 'bg-emerald-500'
                          : s === 'away'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />
                    <span className="capitalize">
                      {s === 'dnd' ? 'Do not disturb' : s}
                    </span>
                  </div>
                  {status === s && <Check className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Help */}
        <button
          type="button"
          className="p-2 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer hidden sm:block"
          title="Support & Feedback"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer hidden sm:block"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Upgrade pill button */}
        <button
          type="button"
          className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] text-xs font-semibold text-[var(--md-sys-color-primary)] transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Upgrade</span>
        </button>

        {/* 9-dot launcher grid */}
        <button
          type="button"
          className="p-2 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer hidden sm:block"
          title="Google apps"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>

        {/* User Profile Avatar */}
        <div className="relative ml-1">
          {currentUserAvatar ? (
            <img
              src={currentUserAvatar}
              alt={currentUserName}
              className="w-8 h-8 rounded-full object-cover border border-[var(--md-sys-color-outline-variant)]"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-outline-variant)] flex items-center justify-center font-bold text-xs shadow-xs">
              {currentUserName.charAt(0).toUpperCase()}
            </div>
          )}
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--md-sys-color-surface-container-lowest)] ${
              status === 'active'
                ? 'bg-emerald-500'
                : status === 'away'
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
          />
        </div>
      </div>
    </header>
  )
}
