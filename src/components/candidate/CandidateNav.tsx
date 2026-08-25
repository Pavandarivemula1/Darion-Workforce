'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { useBranding } from '@/components/providers/BrandingProvider'
import { Clock, History, LogOut, LayoutDashboard, User, Banknote, MessageSquare, MessagesSquare, CalendarDays, Palmtree, CheckSquare } from 'lucide-react'
import { LogoutSubmitButton } from '@/components/ui/LogoutSubmitButton'

export interface CandidateNavProps {
  userName?: string
}

export const CandidateNav: React.FC<CandidateNavProps> = ({ userName }) => {
  const pathname = usePathname()
  const branding = useBranding()

  const navItems = [
    { label: 'Dashboard', href: '/candidate', icon: LayoutDashboard },
    { label: 'Chat', href: '/candidate/messages', icon: MessagesSquare },
    { label: 'Calendar', href: '/candidate/calendar', icon: CalendarDays },
    { label: 'Tasks', href: '/candidate/tasks', icon: CheckSquare },
    { label: 'Attendance', href: '/candidate/attendance', icon: History },
    { label: 'Earnings', href: '/candidate/payroll', icon: Banknote },
    { label: 'Leaves', href: '/candidate/leaves', icon: Palmtree },
    { label: 'Feedback', href: '/candidate/feedback', icon: MessageSquare },
    { label: 'Profile', href: '/candidate/profile', icon: User },
  ]

  return (
    <>
      {/* Top Navigation Header */}
      <header className="border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand & User Info */}
          <div className="flex items-center gap-3">
            {branding.iconUrl ? (
              <img src={branding.iconUrl} alt={branding.appTitle} className="w-9 h-9 rounded-[var(--md-sys-shape-corner-small)] object-contain shrink-0 border border-[var(--md-sys-color-outline-variant)]" />
            ) : branding.logoLightUrl ? (
              <img src={branding.logoLightUrl} alt={branding.appTitle} className="h-8 max-w-[120px] object-contain shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
            )}
            <div>
              <h1 className="text-sm sm:text-base font-bold text-[var(--md-sys-color-on-surface)] leading-tight">
                {branding.appTitle} Candidate
              </h1>
              {userName && (
                <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] truncate max-w-[150px] sm:max-w-[220px]">
                  {userName}
                </p>
              )}
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden sm:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-[var(--md-sys-shape-corner-full)] transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold'
                      : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--md-sys-color-primary)]' : ''}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Sign Out Action Button */}
          <form action={logoutAction}>
            <LogoutSubmitButton variant="header" />
          </form>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (< 640px) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--md-sys-color-surface)] border-t border-[var(--md-sys-color-outline-variant)] px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-[var(--md-sys-shape-corner-medium)] text-[10px] font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'text-[var(--md-sys-color-primary)]'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <div
                className={`w-10 h-7 rounded-full flex items-center justify-center mb-0.5 transition-all ${
                  isActive
                    ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                    : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
