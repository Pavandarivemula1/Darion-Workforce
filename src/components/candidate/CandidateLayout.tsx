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
  MoreHorizontal,
  X,
  Banknote,
  MessageSquare,
  Palmtree,
  Video,
  ChevronRight,
} from 'lucide-react'
import { FeedbackWidget } from './FeedbackWidget'

export interface CandidateLayoutProps {
  children: React.ReactNode
  candidateName?: string
  candidateAvatarUrl?: string
}

export const CandidateLayout: React.FC<CandidateLayoutProps> = ({ children, candidateName, candidateAvatarUrl }) => {
  const pathname = usePathname()
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  // Primary desktop & full items
  const allNavItems = [
    { label: 'Dashboard', href: '/candidate', icon: LayoutDashboard },
    { label: 'Video Meets', href: '/candidate/meets', icon: Video },
    { label: 'Attendance', href: '/candidate/attendance', icon: History },
    { label: 'Earnings', href: '/candidate/payroll', icon: Banknote },
    { label: 'Leaves', href: '/candidate/leaves', icon: Palmtree },
    { label: 'Feedback', href: '/candidate/feedback', icon: MessageSquare },
    { label: 'Profile', href: '/candidate/profile', icon: User },
  ]

  // Primary 4 mobile bottom tabs
  const mobilePrimaryTabs = [
    { label: 'Home', href: '/candidate', icon: LayoutDashboard },
    { label: 'Attendance', href: '/candidate/attendance', icon: History },
    { label: 'Earnings', href: '/candidate/payroll', icon: Banknote },
    { label: 'Meets', href: '/candidate/meets', icon: Video },
  ]

  // Secondary items in "More" bottom sheet
  const moreSheetItems = [
    { label: 'Leave Requests', href: '/candidate/leaves', icon: Palmtree, desc: 'Apply & track time off' },
    { label: 'Shift Feedback', href: '/candidate/feedback', icon: MessageSquare, desc: 'Submit ratings & remarks' },
    { label: 'Account Profile', href: '/candidate/profile', icon: User, desc: 'Personal details & MFA security' },
  ]

  const isMoreActive = moreSheetItems.some((item) => pathname === item.href)

  return (
    <div className="min-h-screen min-h-screen-safe bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex flex-col md:flex-row">
      {/* Desktop Dynamic Sidebar Navigation */}
      <DynamicSidebar
        navItems={allNavItems}
        brandIcon={<Clock className="w-6 h-6" />}
        brandName="Darion Workforce"
        subtitle={candidateName || 'Candidate'}
      />

      {/* Compact MNC Mobile Top Header (< 768px) */}
      <header className="md:hidden border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)]/90 backdrop-blur-md px-3.5 py-2.5 flex items-center justify-between sticky top-0 z-30 pt-safe">
        <Link href="/candidate" className="flex items-center gap-2.5 active:scale-95 transition-all">
          <div className="w-7 h-7 rounded-lg bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold leading-tight tracking-tight">Darion Workforce</h1>
            <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] leading-none truncate max-w-[150px]">
              {candidateName || 'Candidate'}
            </p>
          </div>
        </Link>

        <Link
          href="/candidate/profile"
          className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] active:scale-95 transition-all"
        >
          {candidateAvatarUrl ? (
            <img src={candidateAvatarUrl} alt={candidateName} className="w-7 h-7 rounded-full object-cover border border-[var(--md-sys-color-outline-variant)]" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-[11px] font-bold flex items-center justify-center">
              {candidateName?.charAt(0).toUpperCase() || 'C'}
            </div>
          )}
        </Link>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <div className="max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-8 flex-1 pb-24 md:pb-8 relative">
          {children}
        </div>
      </main>

      {/* MNC Ergonomic Bottom App Bar (< 768px) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--md-sys-color-surface)]/95 backdrop-blur-lg border-t border-[var(--md-sys-color-outline-variant)] pb-safe shadow-lg"
      >
        <div className="grid grid-cols-5 h-14 items-center px-1">
          {mobilePrimaryTabs.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex flex-col items-center justify-center h-full gap-0.5 transition-all active:scale-90 ${
                  isActive
                    ? 'text-[var(--md-sys-color-primary)] font-bold'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                <div className={`p-1 rounded-full transition-all ${isActive ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] px-3' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </Link>
            )
          })}

          {/* More Action Tab */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center h-full gap-0.5 transition-all active:scale-90 cursor-pointer ${
              isMoreActive || isMoreOpen
                ? 'text-[var(--md-sys-color-primary)] font-bold'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
            }`}
          >
            <div className={`p-1 rounded-full transition-all ${isMoreActive || isMoreOpen ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] px-3' : ''}`}>
              <MoreHorizontal className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </div>
      </nav>

      {/* "More" Draggable Bottom Sheet */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end animate-fade-in">
          <div className="fixed inset-0" onClick={() => setIsMoreOpen(false)} aria-hidden="true" />
          <div className="relative z-10 w-full bg-[var(--md-sys-color-surface)] rounded-t-3xl p-4 sm:p-5 flex flex-col gap-3 border-t border-[var(--md-sys-color-outline-variant)] max-h-[85dvh] overflow-y-auto animate-slide-up shadow-2xl pb-safe">
            {/* Drag Handle */}
            <div className="w-12 h-1 bg-[var(--md-sys-color-outline-variant)] rounded-full mx-auto shrink-0 mb-1" />

            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
              <span className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                Workforce Menu
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] active:scale-95 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex flex-col gap-1.5 pt-1">
              {moreSheetItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all active:scale-[0.98] ${
                      isActive
                        ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold'
                        : 'text-[var(--md-sys-color-on-surface)] bg-[var(--md-sys-color-surface-container-low)] hover:bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]' : 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)]'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">{item.label}</p>
                        <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] leading-tight mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </Link>
                )
              })}
            </nav>

            <form action={logoutAction} className="pt-2">
              <Button
                variant="outlined"
                size="md"
                className="w-full text-xs"
                icon={<LogOut className="w-4 h-4" />}
              >
                Sign Out of Workspace
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Feedback Widget */}
      <FeedbackWidget />
    </div>
  )
}

