'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { DynamicSidebar } from '@/components/ui/DynamicSidebar'
import { useBranding } from '@/components/providers/BrandingProvider'
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
  MessagesSquare,
  CalendarDays,
  Palmtree,
  Video,
  KeyRound,
  ChevronRight,
  CheckSquare,
  Paintbrush,
  Crown,
} from 'lucide-react'

import { NotificationBell } from '@/components/notifications/NotificationBell'
import { GlobalPushNotificationManager } from '@/components/notifications/GlobalPushNotificationManager'
import { hasModuleAccess, getRoleDisplayName, ROLE_METADATA, UserRole, AppModule } from '@/lib/auth/permissions'

export interface AdminLayoutProps {
  children: React.ReactNode
  adminId?: string
  adminName?: string
  adminAvatarUrl?: string
  adminRole?: string
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  adminId, 
  adminName, 
  adminAvatarUrl,
  adminRole = 'admin'
}) => {
  const pathname = usePathname()
  const branding = useBranding()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const isFullBleed = pathname.startsWith('/admin/messages') || pathname.startsWith('/admin/calendar')

  // Full raw nav items mapped with their required module key
  const rawNavItems: Array<{ label: string; href: string; icon: any; module: AppModule }> = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, module: 'dashboard' },
    { label: 'Teams Chat', href: '/admin/messages', icon: MessagesSquare, module: 'messages' },
    { label: 'Calendar', href: '/admin/calendar', icon: CalendarDays, module: 'calendar' },
    { label: 'SuperAdmin Console', href: '/admin/superadmin', icon: Crown, module: 'superadmin_console' },
    { label: 'Task Reports', href: '/admin/tasks', icon: CheckSquare, module: 'tasks' },
    { label: 'Video Meets', href: '/admin/meets', icon: Video, module: 'meets' },
    { label: 'Candidates', href: '/admin/candidates', icon: Users, module: 'candidates' },
    { label: 'Shifts', href: '/admin/shifts', icon: Clock, module: 'shifts' },
    { label: 'Attendance', href: '/admin/attendance', icon: CalendarCheck, module: 'attendance' },
    { label: 'Timesheet', href: '/admin/timesheet', icon: FileSpreadsheet, module: 'timesheet' },
    { label: 'Leaves', href: '/admin/leaves', icon: Palmtree, module: 'leaves' },
    { label: 'Payroll', href: '/admin/payroll', icon: Banknote, module: 'payroll' },
    { label: 'Feedback', href: '/admin/feedback', icon: MessageSquare, module: 'feedback' },
    { label: 'Branding Studio', href: '/admin/settings/branding', icon: Paintbrush, module: 'branding' },
    { label: 'Reset Requests', href: '/admin/reset-requests', icon: KeyRound, module: 'reset_requests' },
    { label: 'Security', href: '/admin/security', icon: ShieldAlert, module: 'security' },
    { label: 'Profile', href: '/admin/profile', icon: User, module: 'profile' },
  ]

  // Filter nav items based on user role permissions
  const allNavItems = rawNavItems
    .filter((item) => hasModuleAccess(adminRole, item.module))
    .map(({ label, href, icon }) => ({ label, href, icon }))

  // Primary mobile bottom tabs (filtered by permissions)
  const rawMobilePrimaryTabs: Array<{ label: string; href: string; icon: any; module: AppModule }> = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, module: 'dashboard' },
    { label: 'Chat', href: '/admin/messages', icon: MessagesSquare, module: 'messages' },
    { label: 'Calendar', href: '/admin/calendar', icon: CalendarDays, module: 'calendar' },
    { label: 'Console', href: '/admin/superadmin', icon: Crown, module: 'superadmin_console' },
    { label: 'Tasks', href: '/admin/tasks', icon: CheckSquare, module: 'tasks' },
    { label: 'Shifts', href: '/admin/shifts', icon: Clock, module: 'shifts' },
    { label: 'Payroll', href: '/admin/payroll', icon: Banknote, module: 'payroll' },
    { label: 'Leaves', href: '/admin/leaves', icon: Palmtree, module: 'leaves' },
  ]

  const mobilePrimaryTabs = rawMobilePrimaryTabs
    .filter((item) => hasModuleAccess(adminRole, item.module))
    .slice(0, 4)
    .map(({ label, href, icon }) => ({ label, href, icon }))

  // Secondary items in "More" bottom sheet (filtered by permissions)
  const rawMoreSheetItems: Array<{ label: string; href: string; icon: any; desc: string; module: AppModule }> = [
    { label: 'Teams Chat & Channels', href: '/admin/messages', icon: MessagesSquare, desc: 'Real-time DMs & team channels', module: 'messages' },
    { label: 'Workforce Calendar', href: '/admin/calendar', icon: CalendarDays, desc: 'Master schedule & event planning', module: 'calendar' },
    { label: 'SuperAdmin Control Console', href: '/admin/superadmin', icon: Crown, desc: 'Telemetry, audit logs & system health', module: 'superadmin_console' },
    { label: 'Daily Task Reports', href: '/admin/tasks', icon: CheckSquare, desc: 'Candidate task logs & blockers', module: 'tasks' },
    { label: 'Candidates Directory', href: '/admin/candidates', icon: Users, desc: 'Manage workforce & rates', module: 'candidates' },
    { label: 'Video Meets', href: '/admin/meets', icon: Video, desc: 'Host & manage video meetings', module: 'meets' },
    { label: 'Attendance Logs', href: '/admin/attendance', icon: CalendarCheck, desc: 'Live & past clock records', module: 'attendance' },
    { label: 'Timesheet Matrix', href: '/admin/timesheet', icon: FileSpreadsheet, desc: 'Weekly candidate matrix', module: 'timesheet' },
    { label: 'Leave Requests', href: '/admin/leaves', icon: Palmtree, desc: 'Review & approve leaves', module: 'leaves' },
    { label: 'Staff Feedback', href: '/admin/feedback', icon: MessageSquare, desc: 'Candidate ratings & comments', module: 'feedback' },
    { label: 'Branding & White-Label', href: '/admin/settings/branding', icon: Paintbrush, desc: 'Logos, theme colors & custom domain', module: 'branding' },
    { label: 'Reset Requests', href: '/admin/reset-requests', icon: KeyRound, desc: 'Password & MFA reset queue', module: 'reset_requests' },
    { label: 'Security & 2FA', href: '/admin/security', icon: ShieldAlert, desc: 'Access logs & MFA enforcement', module: 'security' },
    { label: 'Admin Profile', href: '/admin/profile', icon: User, desc: 'Account settings & credentials', module: 'profile' },
  ]

  const moreSheetItems = rawMoreSheetItems
    .filter((item) => hasModuleAccess(adminRole, item.module))
    .map(({ label, href, icon, desc }) => ({ label, href, icon, desc }))

  const isMoreActive = moreSheetItems.some((item) => pathname === item.href)
  const roleDisplay = getRoleDisplayName(adminRole)
  const roleMeta = ROLE_METADATA[(adminRole in ROLE_METADATA ? adminRole : 'admin') as UserRole] || ROLE_METADATA.admin

  return (
    <div className="min-h-screen min-h-screen-safe bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex flex-col md:flex-row">
      {/* Desktop Dynamic Sidebar Navigation */}
      <DynamicSidebar
        navItems={allNavItems}
        brandIcon={<ShieldCheck className="w-6 h-6" />}
        brandName={branding.appTitle}
        brandLogoUrl={branding.logoLightUrl}
        iconUrl={branding.iconUrl}
        subtitle={`${adminName || 'Admin'} • ${roleDisplay}`}
        headerAction={<NotificationBell userId={adminId} />}
      />

      {/* MNC Sticky Mobile Top Header (< 768px) */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-3 h-14 bg-[var(--md-sys-color-surface)]/95 backdrop-blur-md border-b border-[var(--md-sys-color-outline-variant)] pt-safe">
        <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
          {branding.iconUrl ? (
            <img src={branding.iconUrl} alt={branding.appTitle} className="w-8 h-8 rounded-[var(--md-sys-shape-corner-medium)] object-contain shrink-0 border border-[var(--md-sys-color-outline-variant)]" />
          ) : branding.logoLightUrl ? (
            <img src={branding.logoLightUrl} alt={branding.appTitle} className="h-7 max-w-[110px] object-contain shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-[var(--md-sys-color-on-surface)] truncate">
                {branding.appTitle}
              </span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider shrink-0 ${roleMeta.badgeBg} ${roleMeta.badgeText}`}>
                {roleDisplay}
              </span>
            </div>
            {adminName && (
              <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] truncate leading-tight">
                {adminName}
              </span>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <NotificationBell userId={adminId} />
          <Link
            href="/admin/profile"
            className="flex items-center gap-1.5 p-0.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] active:scale-95 transition-all"
          >
            {adminAvatarUrl ? (
              <img src={adminAvatarUrl} alt={adminName || 'Admin'} className="w-7 h-7 rounded-full object-cover border border-[var(--md-sys-color-outline-variant)]" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-[10px] font-bold flex items-center justify-center">
                {adminName?.charAt(0).toUpperCase() || 'A'}
              </div>
            )}
          </Link>
        </div>
      </header>

      {/* Main Content Container */}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isFullBleed ? 'h-screen md:h-screen overflow-hidden' : ''}`}>
        <div className={isFullBleed ? 'w-full h-full flex-1 flex flex-col p-0 pb-16 md:pb-0 relative overflow-hidden' : 'max-w-7xl w-full mx-auto px-2 py-2 sm:p-5 lg:p-8 flex-1 pb-20 md:pb-8 relative'}>
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
                type="submit"
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

      {/* Global Push & In-App Notification Manager */}
      <GlobalPushNotificationManager userId={adminId} />
    </div>
  )
}
