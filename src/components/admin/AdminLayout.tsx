'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileSpreadsheet,
  User,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react'

export interface AdminLayoutProps {
  children: React.ReactNode
  adminName?: string
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, adminName }) => {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Candidates', href: '/admin/candidates', icon: Users },
    { label: 'Attendance', href: '/admin/attendance', icon: CalendarCheck },
    { label: 'Timesheet', href: '/admin/timesheet', icon: FileSpreadsheet },
    { label: 'Profile', href: '/admin/profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] flex flex-col md:flex-row">
      {/* Desktop Sidebar Navigation Drawer */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] p-4 shrink-0 shadow-[var(--md-sys-elevation-1)] min-h-screen sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-[var(--md-sys-color-outline-variant)]">
          <div className="w-10 h-10 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-base font-bold truncate">Admin Portal</h1>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">
              {adminName || 'System Admin'}
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-[var(--md-sys-shape-corner-full)] transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold shadow-xs'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[var(--md-sys-color-primary)]' : ''}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer Sign Out */}
        <div className="pt-4 border-t border-[var(--md-sys-color-outline-variant)]">
          <form action={logoutAction}>
            <Button
              variant="outlined"
              size="md"
              className="w-full justify-start"
              icon={<LogOut className="w-4 h-4" />}
            >
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile Top Header (< 768px) */}
      <header className="md:hidden border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] px-4 py-3 flex items-center justify-between shadow-[var(--md-sys-elevation-1)] sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">Admin Portal</h1>
            <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">{adminName || 'System Admin'}</p>
          </div>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end animate-fade-in">
          <div className="bg-[var(--md-sys-color-surface-container-low)] rounded-t-[var(--md-sys-shape-corner-extra-large)] p-6 flex flex-col gap-4 border-t border-[var(--md-sys-color-outline-variant)] shadow-[var(--md-sys-elevation-3)] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--md-sys-color-outline-variant)]">
              <span className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                System Navigation
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
      <div className="flex-1 flex flex-col min-w-0">
        <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
