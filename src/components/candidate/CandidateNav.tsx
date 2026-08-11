'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { Clock, History, LogOut, LayoutDashboard } from 'lucide-react'

export interface CandidateNavProps {
  userName?: string
}

export const CandidateNav: React.FC<CandidateNavProps> = ({ userName }) => {
  const pathname = usePathname()

  const navItems = [
    { label: 'Dashboard', href: '/candidate', icon: LayoutDashboard },
    { label: 'Attendance History', href: '/candidate/attendance', icon: History },
  ]

  return (
    <header className="border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] shadow-[var(--md-sys-elevation-1)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">
              Candidate Portal
            </h1>
            {userName && (
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate max-w-[200px]">
                {userName}
              </p>
            )}
          </div>

          <form action={logoutAction} className="ml-auto sm:hidden">
            <Button variant="outlined" size="sm" icon={<LogOut className="w-4 h-4" />}>
              Logout
            </Button>
          </form>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--md-sys-shape-corner-full)] transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] shadow-xs'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Desktop Logout Button */}
        <form action={logoutAction} className="hidden sm:block">
          <Button variant="outlined" size="sm" icon={<LogOut className="w-4 h-4" />}>
            Sign Out
          </Button>
        </form>
      </div>
    </header>
  )
}
