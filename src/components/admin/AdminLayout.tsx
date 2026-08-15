'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { DynamicSidebar } from '@/components/ui/DynamicSidebar'
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileSpreadsheet,
  User,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Banknote,
  MoreHorizontal,
  X,
  Clock,
  MessageSquare,
  Palmtree,
  Video,
  KeyRound,
  ChevronRight,
} from 'lucide-react'

export interface AdminLayoutProps {
  children: React.ReactNode
  adminName?: string
  adminAvatarUrl?: string
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, adminName, adminAvatarUrl }) => {
  const pathname = usePathname()
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  // Full nav items for desktop sidebar
  const allNavItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Video Meets', href: '/admin/meets', icon: Video },
    { label: 'Candidates', href: '/admin/candidates', icon: Users },
    { label: 'Shifts', href: '/admin/shifts', icon: Clock },
    { label: 'Attendance', href: '/admin/attendance', icon: CalendarCheck },
    { label: 'Timesheet', href: '/admin/timesheet', icon: FileSpreadsheet },
    { label: 'Leaves', href: '/admin/leaves', icon: Palmtree },
    { label: 'Payroll', href: '/admin/payroll', icon: Banknote },
    { label: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
    { label: 'Reset Requests', href: '/admin/reset-requests', icon: KeyRound },
    { label: 'Security', href: '/admin/security', icon: ShieldAlert },
    { label: 'Profile', href: '/admin/profile', icon: User },
  ]

  // Primary 4 mobile bottom tabs
  const mobilePrimaryTabs = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Shifts', href: '/admin/shifts', icon: Clock },
    { label: 'Payroll', href: '/admin/payroll', icon: Banknote },
    { label: 'Meets', href: '/admin/meets', icon: Video },
  ]

  // Secondary items in "More" bottom sheet
  const moreSheetItems = [
    { label: 'Candidates Directory', href: '/admin/candidates', icon: Users, desc: 'Manage workforce & rates' },
    { label: 'Attendance Logs', href: '/admin/attendance', icon: CalendarCheck, desc: 'Live & past clock records' },
    { label: 'Timesheet Matrix', href: '/admin/timesheet', icon: FileSpreadsheet, desc: 'Weekly candidate matrix' },
    { label: 'Leave Requests', href: '/admin/leaves', icon: Palmtree, desc: 'Review & approve leaves' },
    { label: 'Staff Feedback', href: '/admin/feedback', icon: MessageSquare, desc: 'Candidate ratings & comments' },
    { label: 'Reset Requests', href: '/admin/reset-requests', icon: KeyRound, desc: 'Password & MFA reset queue' },
    { label: 'Security & 2FA', href: '/admin/security', icon: ShieldAlert, desc: 'Access logs & MFA enforcement' },
    { label: 'Admin Profile', href: '/admin/profile', icon: User, desc: 'Account settings & credentials' },
  ]

  const isMoreActive = moreSheetItems.some((item) => pathname === item.href)

  return (
    <div className="min-h-screen min-h-screen-safe bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex flex-col md:flex-row">
      {/* Desktop Dynamic Sidebar Navigation */}
      <DynamicSidebar
        navItems={allNavItems}
        brandIcon={<ShieldCheck className="w-6 h-6" />}
        brandName="Darion Workforce"
        subtitle={adminName || 'System Admin'}
      />

      {/* Compact MNC Mobile Top Header (< 768px) */}
      <header className="md:hidden border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)]/90 backdrop-blur-md px-3.5 py-2.5 flex items-center justify-between sticky top-0 z-30 pt-safe">
        <Link href="/admin" className="flex items-center gap-2.5 active:scale-95 transition-all">
          <div className="w-7 h-7 rounded-lg bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold leading-tight tracking-tight">Darion Workforce Admin</h1>
            <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] leading-none truncate max-w-[150px]">
              {adminName || 'System Admin'}
            </p>
          </div>
        </Link>

        <Link
          href="/admin/profile"
          className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] active:scale-95 transition-all"
        >
          {adminAvatarUrl ? (
            <img src={adminAvatarUrl} alt={adminName} className="w-7 h-7 rounded-full object-cover border border-[var(--md-sys-color-outline-variant)]" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-[11px] font-bold flex items-center justify-center">
              {adminName?.charAt(0).toUpperCase() || 'A'}
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
        aria-label="Mobile Admin Navigation"
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
                System Administration
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
                Sign Out of Admin Console
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

