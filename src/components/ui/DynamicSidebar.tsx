'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'
import { getUnreadMessagesCountAction } from '@/app/actions/messages'
import { createClient } from '@/lib/supabase/client'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  LucideIcon,
  Search,
  X,
  User as UserIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number | string
  description?: string
}

export interface NavSection {
  id: string
  title?: string
  items: NavItem[]
  collapsible?: boolean
}

export interface SidebarUserInfo {
  id?: string
  name?: string
  avatarUrl?: string
  role?: string
  profileHref?: string
}

export interface DynamicSidebarProps {
  sections?: NavSection[]
  navItems?: NavItem[]
  brandName?: string
  brandIcon?: React.ReactNode
  brandLogoUrl?: string | null
  iconUrl?: string | null
  subtitle?: string
  headerAction?: React.ReactNode
  user?: SidebarUserInfo
}

const MIN_WIDTH = 80
const MAX_WIDTH = 420
const DEFAULT_WIDTH = 270
const COLLAPSE_THRESHOLD = 120

export const DynamicSidebar: React.FC<DynamicSidebarProps> = ({
  sections,
  navItems,
  brandIcon,
  brandLogoUrl,
  iconUrl,
  brandName = 'Workforce',
  subtitle,
  headerAction,
  user,
}) => {
  const pathname = usePathname()

  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const [unreadMsgCount, setUnreadMsgCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  const sidebarRef = useRef<HTMLElement>(null)

  // Normalize nav input to standard sections array
  const computedSections: NavSection[] = useMemo(() => {
    if (sections && sections.length > 0) {
      return sections.filter((sec) => sec.items && sec.items.length > 0)
    }
    if (navItems && navItems.length > 0) {
      return [{ id: 'general', items: navItems }]
    }
    return []
  }, [sections, navItems])

  // Fetch and track live unread messages count
  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadMessagesCountAction()
      setUnreadMsgCount(count)
    } catch {
      // ignore
    }
  }, [])

  // Restore client-side persisted state post-hydration (prevents React Error #418)
  useEffect(() => {
    let animFrame: number
    try {
      const stored = localStorage.getItem('sidebar_width')
      const storedCollapsed = localStorage.getItem('sidebar_collapsed_sections')
      
      animFrame = requestAnimationFrame(() => {
        if (stored) {
          const parsed = parseInt(stored, 10)
          if (!isNaN(parsed) && parsed !== DEFAULT_WIDTH) {
            setSidebarWidth(parsed)
          }
        }
        if (storedCollapsed) {
          try {
            const parsedCollapsed = JSON.parse(storedCollapsed)
            if (parsedCollapsed && typeof parsedCollapsed === 'object') {
              setCollapsedSections(parsedCollapsed)
            }
          } catch {
            // ignore
          }
        }
      })
    } catch {
      // ignore
    }

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame)
    }
  }, [])

  useEffect(() => {
    let isCurrent = true

    getUnreadMessagesCountAction()
      .then((count) => {
        if (isCurrent && typeof count === 'number') {
          setUnreadMsgCount(count)
        }
      })
      .catch(() => {})

    // Real-time Supabase subscription for incoming messages
    const supabase = createClient()
    const channelTopic = `sidebar-unread-messages-${Math.random().toString(36).slice(2, 7)}`
    const channel = supabase
      .channel(channelTopic)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages' },
        () => {
          refreshUnreadCount()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_participants' },
        () => {
          refreshUnreadCount()
        }
      )
      .subscribe()

    // Local custom event listener
    const handleLocalUpdate = () => {
      refreshUnreadCount()
    }
    window.addEventListener('unread-messages-count-updated', handleLocalUpdate)

    return () => {
      isCurrent = false
      supabase.removeChannel(channel)
      window.removeEventListener('unread-messages-count-updated', handleLocalUpdate)
    }
  }, [refreshUnreadCount])

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = { ...prev, [sectionId]: !prev[sectionId] }
      localStorage.setItem('sidebar_collapsed_sections', JSON.stringify(next))
      return next
    })
  }

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
    localStorage.setItem('sidebar_width', String(sidebarWidth))
  }, [sidebarWidth])

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing && sidebarRef.current) {
        const newWidth = e.clientX - sidebarRef.current.getBoundingClientRect().left
        if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
          setSidebarWidth(newWidth)
        } else if (newWidth < MIN_WIDTH) {
          setSidebarWidth(MIN_WIDTH)
        } else if (newWidth > MAX_WIDTH) {
          setSidebarWidth(MAX_WIDTH)
        }
      }
    },
    [isResizing]
  )

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResizing)
      document.body.style.cursor = 'col-resize'
    } else {
      document.body.style.cursor = 'default'
    }

    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
      document.body.style.cursor = 'default'
    }
  }, [isResizing, resize, stopResizing])

  const toggleCollapse = () => {
    if (sidebarWidth <= COLLAPSE_THRESHOLD) {
      setSidebarWidth(DEFAULT_WIDTH)
      localStorage.setItem('sidebar_width', String(DEFAULT_WIDTH))
    } else {
      setSidebarWidth(MIN_WIDTH)
      localStorage.setItem('sidebar_width', String(MIN_WIDTH))
    }
  }

  const isCollapsed = sidebarWidth <= COLLAPSE_THRESHOLD

  // Filter sections when search query is active
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return computedSections
    const q = searchQuery.toLowerCase().trim()
    return computedSections
      .map((sec) => ({
        ...sec,
        items: sec.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            (item.description && item.description.toLowerCase().includes(q))
        ),
      }))
      .filter((sec) => sec.items.length > 0)
  }, [computedSections, searchQuery])

  return (
    <aside
      ref={sidebarRef}
      style={{ width: `${sidebarWidth}px` }}
      className={`hidden md:flex relative flex-col border-r border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] shrink-0 min-h-screen sticky top-0 h-screen select-none ${
        isResizing ? 'transition-none select-none' : 'transition-[width] duration-300 ease-in-out'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`flex items-center ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
        } py-3.5 h-18 border-b border-[var(--md-sys-color-outline-variant)] overflow-hidden transition-all whitespace-nowrap shrink-0`}
      >
        <div
          className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${
            isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 flex-1'
          }`}
        >
          {brandLogoUrl ? (
            <img
              src={brandLogoUrl}
              alt={brandName}
              className="h-8 max-w-[130px] object-contain shrink-0"
            />
          ) : iconUrl ? (
            <img
              src={iconUrl}
              alt={brandName}
              className="w-9 h-9 rounded-[var(--md-sys-shape-corner-medium)] object-contain shrink-0 border border-[var(--md-sys-color-outline-variant)]"
            />
          ) : brandIcon ? (
            <div className="w-9 h-9 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0 shadow-2xs">
              {brandIcon}
            </div>
          ) : null}

          {(!brandLogoUrl || subtitle) && (
            <div className="overflow-hidden min-w-0">
              {!brandLogoUrl && (
                <h1 className="text-sm font-bold truncate tracking-tight text-[var(--md-sys-color-on-surface)]">
                  {brandName}
                </h1>
              )}
              {subtitle && (
                <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] truncate leading-tight mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Collapsed State Monogram / Icon */}
        {isCollapsed && (
          <div className="w-9 h-9 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
            {iconUrl ? (
              <img
                src={iconUrl}
                alt={brandName}
                className="w-full h-full object-contain rounded-[var(--md-sys-shape-corner-medium)]"
              />
            ) : brandIcon ? (
              brandIcon
            ) : (
              brandName.charAt(0).toUpperCase()
            )}
          </div>
        )}

        {/* Header Action & Toggle Button */}
        <div className="flex items-center gap-1 shrink-0">
          {!isCollapsed && headerAction}
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] transition-colors shrink-0 flex items-center justify-center z-10 cursor-pointer active:scale-95"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick Search Bar (when expanded) */}
      {!isCollapsed && (
        <div className="px-3 pt-2.5 pb-1 shrink-0">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-[var(--md-sys-color-on-surface-variant)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick search..."
              className="w-full h-8 pl-8.5 pr-7 text-xs bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] rounded-lg text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)]/60 focus:outline-none focus:border-[var(--md-sys-color-primary)] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 p-0.5 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation List Organized by Sections */}
      <nav className="flex-1 flex flex-col gap-3 p-2.5 overflow-y-auto overflow-x-hidden select-none no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {filteredSections.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
            No matching menus found
          </div>
        ) : (
          filteredSections.map((section, secIdx) => {
            const isSectionCollapsed = !!collapsedSections[section.id] && !searchQuery
            const hasTitle = Boolean(section.title)

            return (
              <div key={section.id || secIdx} className="flex flex-col">
                {/* Section Header */}
                {hasTitle && (
                  <>
                    {!isCollapsed ? (
                      <div
                        onClick={() => section.collapsible !== false && toggleSectionCollapse(section.id)}
                        className={`flex items-center justify-between px-2.5 py-1 mb-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]/80 hover:text-[var(--md-sys-color-on-surface)] transition-colors ${
                          section.collapsible !== false ? 'cursor-pointer hover:bg-[var(--md-sys-color-surface-container-low)]' : ''
                        }`}
                      >
                        <span className="truncate">{section.title}</span>
                        {section.collapsible !== false && (
                          <ChevronDown
                            className={`w-3 h-3 transition-transform duration-200 opacity-60 ${
                              isSectionCollapsed ? '-rotate-90' : 'rotate-0'
                            }`}
                          />
                        )}
                      </div>
                    ) : (
                      /* Collapsed Rail Divider */
                      secIdx > 0 && (
                        <div className="w-6 h-[1px] bg-[var(--md-sys-color-outline-variant)] mx-auto my-1.5 opacity-60" />
                      )
                    )}
                  </>
                )}

                {/* Section Items */}
                {(!isSectionCollapsed || isCollapsed) && (
                  <div className="flex flex-col gap-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isActive =
                        pathname === item.href ||
                        (item.href !== '/admin' &&
                          item.href !== '/candidate' &&
                          pathname.startsWith(item.href))
                      const isMessagesRoute = item.href.includes('/messages')
                      const effectiveBadge =
                        item.badge !== undefined
                          ? item.badge
                          : isMessagesRoute
                          ? unreadMsgCount
                          : undefined
                      const hasBadge = effectiveBadge !== undefined && Number(effectiveBadge) > 0

                      return (
                        <div key={item.href} className="relative group">
                          <Link
                            href={item.href}
                            prefetch={true}
                            className={`flex items-center ${
                              isCollapsed ? 'justify-center px-0' : 'px-3'
                            } py-2 h-10 text-xs font-medium rounded-xl transition-all duration-150 cursor-pointer ${
                              isActive
                                ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold shadow-2xs'
                                : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)]'
                            }`}
                          >
                            <div className="relative flex items-center justify-center">
                              <Icon
                                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                                  isActive ? 'text-[var(--md-sys-color-primary)]' : ''
                                }`}
                              />

                              {/* Collapsed Badge Pill */}
                              {isCollapsed && hasBadge && (
                                <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center px-1 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-[9px] font-black shadow-xs ring-2 ring-[var(--md-sys-color-surface)]">
                                  {Number(effectiveBadge) > 9 ? '9+' : effectiveBadge}
                                </span>
                              )}
                            </div>

                            {!isCollapsed && (
                              <span className="ml-2.5 truncate flex-1">{item.label}</span>
                            )}

                            {/* Expanded Badge Pill */}
                            {!isCollapsed && hasBadge && (
                              <span className="ml-auto flex h-4.5 min-w-4.5 items-center justify-center px-1.5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-[10px] font-black shadow-2xs">
                                {Number(effectiveBadge) > 99 ? '99+' : effectiveBadge}
                              </span>
                            )}
                          </Link>

                          {/* Tooltip for Collapsed State */}
                          {isCollapsed && !isResizing && (
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1.5 bg-[var(--md-sys-color-on-surface)] text-[var(--md-sys-color-surface)] text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none shadow-md flex items-center gap-1.5">
                              {section.title && (
                                <span className="text-[10px] opacity-70 border-r border-[var(--md-sys-color-surface)]/20 pr-1.5">
                                  {section.title}
                                </span>
                              )}
                              <span>{item.label}</span>
                              {hasBadge && (
                                <span className="px-1 py-0.2 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-[9px] font-bold rounded-full ml-1">
                                  {effectiveBadge}
                                </span>
                              )}
                              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[var(--md-sys-color-on-surface)]" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </nav>

      {/* User Profile & Sign Out Footer */}
      <div className="p-2.5 border-t border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] shrink-0">
        {user ? (
          !isCollapsed ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/70 gap-2">
              <Link
                href={user.profileHref || '/admin/profile'}
                className="flex items-center gap-2.5 min-w-0 flex-1 group cursor-pointer"
                title="View Profile"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-[var(--md-sys-color-outline-variant)] shrink-0 shadow-2xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                    {user.name?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
                  </div>
                )}
                <div className="overflow-hidden min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] truncate group-hover:text-[var(--md-sys-color-primary)] transition-colors">
                    {user.name || 'Account'}
                  </p>
                  {user.role && (
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)] truncate mt-0.5">
                      {user.role.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </Link>

              <form action={logoutAction} className="shrink-0">
                <button
                  type="submit"
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="p-1.5 rounded-lg text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)]/40 transition-colors cursor-pointer active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <Link
                href={user.profileHref || '/admin/profile'}
                className="group cursor-pointer relative"
                title={`${user.name || 'User'} (${user.role || ''})`}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-[var(--md-sys-color-outline-variant)] shrink-0 shadow-2xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                    {user.name?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
                  </div>
                )}
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="p-1.5 rounded-lg text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)]/40 transition-colors cursor-pointer active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )
        ) : (
          <form action={logoutAction} className="w-full">
            <button
              type="submit"
              title="Sign Out"
              className={`flex items-center ${
                isCollapsed ? 'justify-center px-0' : 'px-3'
              } w-full h-8 text-xs font-medium rounded-xl text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-all cursor-pointer`}
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              {!isCollapsed && <span className="ml-2 truncate">Sign Out</span>}
            </button>
          </form>
        )}
      </div>

      {/* Resizer Handle */}
      <div
        className="absolute top-0 right-[-3px] w-[6px] h-full cursor-col-resize z-50 flex items-center justify-center group/resizer"
        onMouseDown={startResizing}
      >
        <div
          className={`w-0.5 h-full transition-colors ${
            isResizing
              ? 'bg-[var(--md-sys-color-primary)]'
              : 'group-hover/resizer:bg-[var(--md-sys-color-primary)]/50 bg-transparent'
          }`}
        />
      </div>
    </aside>
  )
}
