'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { DynamicSidebar } from '@/components/ui/DynamicSidebar'
import {
  Clock,
  History,
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  Banknote,
  MessageSquare,
} from 'lucide-react'
import { FeedbackWidget } from './FeedbackWidget'

export interface CandidateLayoutProps {
  children: React.ReactNode
  candidateName?: string
  candidateAvatarUrl?: string
}

export const CandidateLayout: React.FC<CandidateLayoutProps> = ({ children, candidateName, candidateAvatarUrl }) => {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navItems = [
    { label: 'Dashboard', href: '/candidate', icon: LayoutDashboard },
    { label: 'Attendance', href: '/candidate/attendance', icon: History },
    { label: 'Earnings', href: '/candidate/payroll', icon: Banknote },
    { label: 'Feedback', href: '/candidate/feedback', icon: MessageSquare },
    { label: 'Profile', href: '/candidate/profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex flex-col md:flex-row">
      {/* Desktop Dynamic Sidebar Navigation Drawer */}
      <DynamicSidebar
        navItems={navItems}
        brandIcon={<Clock className="w-6 h-6" />}
        brandName="Darion Workforce"
        subtitle={candidateName || 'Candidate'}
      />

      {/* Mobile Top Header (< 768px) */}
      <header className="md:hidden border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">Darion Workforce</h1>
            <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">{candidateName || 'Candidate'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {candidateAvatarUrl && (
            <img src={candidateAvatarUrl} alt={candidateName} className="w-8 h-8 rounded-full object-cover" />
          )}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end animate-fade-in">
          <div className="bg-[var(--md-sys-color-surface)] rounded-t-[var(--md-sys-shape-corner-extra-large)] p-6 flex flex-col gap-4 border-t border-[var(--md-sys-color-outline-variant)] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--md-sys-color-outline-variant)]">
              <span className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                Candidate Navigation
              </span>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-[var(--md-sys-shape-corner-full)] transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold'
                        : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <form action={logoutAction} className="pt-2">
              <Button
                variant="outlined"
                size="md"
                className="w-full"
                icon={<LogOut className="w-4 h-4" />}
              >
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Main Content Container (Centered Max Width on Ultrawide Displays) */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 relative">
          {children}
        </div>
      </div>

      {/* Floating Feedback Widget */}
      <FeedbackWidget />
    </div>
  )
}
