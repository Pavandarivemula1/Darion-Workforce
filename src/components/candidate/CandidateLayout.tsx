'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { DynamicSidebar, NavSection } from '@/components/ui/DynamicSidebar'
import { useBranding } from '@/components/providers/BrandingProvider'
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
  MessagesSquare,
  CalendarDays,
  Palmtree,
  Video,
  ChevronRight,
  CheckSquare,
} from 'lucide-react'
import { FeedbackWidget } from './FeedbackWidget'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { GlobalPushNotificationManager } from '@/components/notifications/GlobalPushNotificationManager'
import { GlobalCallManager } from '@/components/calls/GlobalCallManager'

export interface CandidateLayoutProps {
  children: React.ReactNode
  candidateId?: string
  candidateName?: string
  candidateAvatarUrl?: string
}

export const CandidateLayout: React.FC<CandidateLayoutProps> = ({ 
  children, 
  candidateId, 
  candidateName, 
  candidateAvatarUrl 
}) => {
  const pathname = usePathname()
  const branding = useBranding()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const isFullBleed = pathname.startsWith('/candidate/messages') || pathname.startsWith('/candidate/calendar')

  // Grouped Candidate sections
  const candidateSections: NavSection[] = [
    {
      id: 'workspace',
      title: 'Workspace',
      items: [
        { label: 'Dashboard', href: '/candidate', icon: LayoutDashboard, description: 'Personal shift stats & fast clock in/out' },
        { label: 'Daily Tasks', href: '/candidate/tasks', icon: CheckSquare, description: 'Submit daily work logs & blockers' },
        { label: 'Attendance', href: '/candidate/attendance', icon: History, description: 'View clock history & logged hours' },
      ],
    },
    {
      id: 'connect',
      title: 'Connect & Collaborate',
      items: [
        { label: 'Teams Chat', href: 'https://chat.darion.in', icon: MessagesSquare, description: 'Real-time team DMs & channels', target: '_blank', external: true },
        { label: 'Calendar', href: '/candidate/calendar', icon: CalendarDays, description: 'Assigned shifts & company events' },
        { label: 'Video Meets', href: '/candidate/meets', icon: Video, description: 'Join scheduled video calls' },
      ],
    },
    {
      id: 'hr_account',
      title: 'My Work & HR',
      items: [
        { label: 'Earnings', href: '/candidate/payroll', icon: Banknote, description: 'View daily pay rate & payslips' },
        { label: 'Leaves', href: '/candidate/leaves', icon: Palmtree, description: 'Apply for time off & check status' },
        { label: 'Feedback', href: '/candidate/feedback', icon: MessageSquare, description: 'Submit shift ratings & comments' },
        { label: 'Profile', href: '/candidate/profile', icon: User, description: 'Account settings & MFA security' },
      ],
    },
  ]

  // Primary 4 mobile bottom tabs
  const mobilePrimaryTabs: Array<{ label: string; href: string; icon: any; target?: string; external?: boolean }> = [
    { label: 'Home', href: '/candidate', icon: LayoutDashboard },
    { label: 'Chat', href: 'https://chat.darion.in', icon: MessagesSquare, target: '_blank', external: true },
    { label: 'Calendar', href: '/candidate/calendar', icon: CalendarDays },
    { label: 'Tasks', href: '/candidate/tasks', icon: CheckSquare },
  ]

  const isMoreActive = candidateSections.some((sec) =>
    sec.items.some((item) => pathname === item.href)
  )

  return (
    <div className={`min-h-screen min-h-screen-safe bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex flex-col md:flex-row ${isFullBleed ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : ''}`}>
      {/* Desktop Dynamic Sidebar Navigation */}
      <DynamicSidebar
        sections={candidateSections}
        brandIcon={<Clock className="w-5 h-5" />}
        brandName={branding.appTitle}
        brandLogoUrl={branding.logoLightUrl}
        iconUrl={branding.iconUrl}
        subtitle={candidateName || 'Candidate'}
        headerAction={<NotificationBell userId={candidateId} />}
        user={{
          id: candidateId,
          name: candidateName,
          avatarUrl: candidateAvatarUrl,
          role: 'Candidate',
          profileHref: '/candidate/profile',
        }}
      />

      {/* MNC Sticky Mobile Top Header (< 768px) */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-3 h-14 shrink-0 bg-[var(--md-sys-color-surface)]/95 backdrop-blur-md border-b border-[var(--md-sys-color-outline-variant)] pt-safe">
        <Link href="/candidate" className="flex items-center gap-2.5 min-w-0">
          {branding.iconUrl ? (
            <img src={branding.iconUrl} alt={branding.appTitle} className="w-8 h-8 rounded-[var(--md-sys-shape-corner-medium)] object-contain shrink-0 border border-[var(--md-sys-color-outline-variant)]" />
          ) : branding.logoLightUrl ? (
            <img src={branding.logoLightUrl} alt={branding.appTitle} className="h-7 max-w-[110px] object-contain shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0 shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-[var(--md-sys-color-on-surface)] truncate">
                {branding.appTitle}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold uppercase tracking-wider shrink-0">
                Candidate
              </span>
            </div>
            {candidateName && (
              <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] truncate leading-tight">
                {candidateName}
              </span>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <NotificationBell userId={candidateId} />
          <Link
            href="/candidate/profile"
            className="flex items-center gap-1.5 p-0.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] active:scale-95 transition-all"
          >
            {candidateAvatarUrl ? (
              <img src={candidateAvatarUrl} alt={candidateName || 'Candidate'} className="w-7 h-7 rounded-full object-cover border border-[var(--md-sys-color-outline-variant)]" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-[10px] font-bold flex items-center justify-center">
                {candidateName?.charAt(0).toUpperCase() || 'C'}
              </div>
            )}
          </Link>
        </div>
      </header>

      {/* Main Content Container */}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isFullBleed ? 'h-full overflow-hidden' : ''}`}>
        <div className={isFullBleed ? 'w-full h-full flex-1 flex flex-col p-0 pb-14 md:pb-0 relative overflow-hidden' : 'max-w-7xl w-full mx-auto px-2 py-2 sm:p-5 lg:p-8 flex-1 pb-20 md:pb-8 relative'}>
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
            const isExternal = item.href.startsWith('http') || item.external
            const targetAttr = item.target || (isExternal ? '_blank' : undefined)
            const relAttr = isExternal ? 'noopener noreferrer' : undefined

            return (
              <Link
                key={item.href}
                href={item.href}
                target={targetAttr}
                rel={relAttr}
                prefetch={!isExternal}
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
          <div className="relative z-10 w-full bg-[var(--md-sys-color-surface)] rounded-t-3xl p-4 sm:p-5 flex flex-col gap-3 border-t border-[var(--md-sys-color-outline-variant)] max-h-[85dvh] overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden animate-slide-up shadow-2xl pb-safe">
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

            <nav className="flex flex-col gap-4 pt-1">
              {candidateSections.map((sec, sIdx) => (
                <div key={sIdx} className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] px-1">
                    {sec.title}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {sec.items.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      const isExternal = item.href.startsWith('http') || item.external
                      const targetAttr = item.target || (isExternal ? '_blank' : undefined)
                      const relAttr = isExternal ? 'noopener noreferrer' : undefined

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          target={targetAttr}
                          rel={relAttr}
                          prefetch={!isExternal}
                          onClick={() => setIsMoreOpen(false)}
                          className={`flex items-center justify-between p-2.5 rounded-2xl transition-all active:scale-[0.98] ${
                            isActive
                              ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold'
                              : 'text-[var(--md-sys-color-on-surface)] bg-[var(--md-sys-color-surface-container-low)] hover:bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]' : 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)]'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold leading-tight">{item.label}</p>
                              {item.description && (
                                <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] leading-tight mt-0.5">{item.description}</p>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-50" />
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <form action={logoutAction} className="pt-2">
              <Button
                type="submit"
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

      {/* Global Push & In-App Notification Manager */}
      <GlobalPushNotificationManager userId={candidateId} />

      {/* Global Call Ringing & High-Priority Overlays */}
      <GlobalCallManager currentUserId={candidateId} />
    </div>
  )
}
