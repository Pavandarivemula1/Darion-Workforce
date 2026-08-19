'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'
import { ChevronLeft, ChevronRight, LogOut, LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface DynamicSidebarProps {
  navItems: NavItem[]
  brandName?: string
  brandIcon?: React.ReactNode
  brandLogoUrl?: string | null
  iconUrl?: string | null
  subtitle?: string
  headerAction?: React.ReactNode
}

const MIN_WIDTH = 80
const MAX_WIDTH = 400
const DEFAULT_WIDTH = 256
const COLLAPSE_THRESHOLD = 120

export const DynamicSidebar: React.FC<DynamicSidebarProps> = ({
  navItems,
  brandIcon,
  brandLogoUrl,
  iconUrl,
  brandName = 'Workforce',
  subtitle,
  headerAction,
}) => {
  const pathname = usePathname()
  
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH)
  const [isMounted, setIsMounted] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setIsMounted(true)
    const stored = localStorage.getItem('sidebar_width')
    if (stored) {
      setSidebarWidth(parseInt(stored, 10))
    }
  }, [])

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

  return (
    <aside
      ref={sidebarRef}
      style={{ width: `${sidebarWidth}px` }}
      className={`hidden md:flex relative flex-col border-r border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] shrink-0 min-h-screen sticky top-0 h-screen ${isResizing ? 'transition-none select-none' : 'transition-[width] duration-300 ease-in-out'}`}
    >
      {/* Brand Header */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'} py-4 h-20 border-b border-[var(--md-sys-color-outline-variant)] overflow-hidden transition-all whitespace-nowrap`}>
        <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 flex-1'}`}>
          {brandLogoUrl ? (
            <img
              src={brandLogoUrl}
              alt={brandName}
              className="h-9 max-w-[140px] object-contain shrink-0"
            />
          ) : iconUrl ? (
            <img
              src={iconUrl}
              alt={brandName}
              className="w-10 h-10 rounded-[var(--md-sys-shape-corner-medium)] object-contain shrink-0 border border-[var(--md-sys-color-outline-variant)]"
            />
          ) : brandIcon ? (
            <div className="w-10 h-10 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
              {brandIcon}
            </div>
          ) : null}

          {(!brandLogoUrl || subtitle) && (
            <div className="overflow-hidden">
              {!brandLogoUrl && (
                <h1 className="text-base font-bold truncate tracking-tight">{brandName}</h1>
              )}
              {subtitle && (
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Collapsed State Monogram / Icon */}
        {isCollapsed && (
          <div className="w-9 h-9 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center font-bold text-sm shrink-0">
            {iconUrl ? (
              <img src={iconUrl} alt={brandName} className="w-full h-full object-contain rounded-[var(--md-sys-shape-corner-medium)]" />
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
            className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] transition-colors shrink-0 flex items-center justify-center z-10 cursor-pointer"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 flex flex-col gap-1.5 p-3 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/candidate' && pathname.startsWith(item.href))
          
          return (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                prefetch={true}
                className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 h-12 text-sm font-medium rounded-[var(--md-sys-shape-corner-full)] transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[var(--md-sys-color-primary)]' : ''}`} />
                {!isCollapsed && (
                  <span className="ml-3 truncate">{item.label}</span>
                )}
              </Link>
              
              {/* Tooltip for Collapsed State */}
              {isCollapsed && isMounted && !isResizing && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-[var(--md-sys-color-on-surface)] text-[var(--md-sys-color-surface)] text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                  {item.label}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[var(--md-sys-color-on-surface)]" />
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer Sign Out */}
      <div className="p-3 border-t border-[var(--md-sys-color-outline-variant)]">
        <form action={logoutAction}>
          <button
            type="submit"
            className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} w-full h-10 text-sm font-medium rounded-[var(--md-sys-shape-corner-full)] border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 active:scale-[0.98] transition-colors cursor-pointer`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="ml-2 truncate">Sign Out</span>}
          </button>
        </form>
      </div>

      {/* Resizer Handle */}
      <div
        className="absolute top-0 right-[-3px] w-[6px] h-full cursor-col-resize z-50 flex items-center justify-center group/resizer"
        onMouseDown={startResizing}
      >
        <div className={`w-0.5 h-full transition-colors ${isResizing ? 'bg-[var(--md-sys-color-primary)]' : 'group-hover/resizer:bg-[var(--md-sys-color-primary)]/50 bg-transparent'}`} />
      </div>
    </aside>
  )
}
