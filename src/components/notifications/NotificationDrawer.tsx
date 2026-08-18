'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  CheckCheck,
  Trash2,
  Bell,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Square,
  CalendarPlus,
  AlertTriangle,
  Zap,
  CalendarDays,
  ShieldAlert,
  ExternalLink,
  BellRing,
  Volume2,
} from 'lucide-react'
import { NotificationItem, NotificationType } from '@/lib/utils/notifications'
import { useRouter } from 'next/navigation'

interface NotificationDrawerProps {
  isOpen: boolean
  onClose: () => void
  notifications: NotificationItem[]
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
  onClearRead: () => void
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'shift_approved':
      return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
    case 'shift_rejected':
      return <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
    case 'timer_started':
      return <PlayCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" />
    case 'timer_stopped':
      return <Square className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
    case 'manual_shift':
      return <CalendarPlus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
    case 'auto_cutoff':
      return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
    case 'overshift_requested':
    case 'overshift_status':
      return <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
    case 'leave_requested':
    case 'leave_status':
      return <CalendarDays className="w-4 h-4 text-teal-600 dark:text-teal-400" />
    case 'mfa_reset':
      return <ShieldAlert className="w-4 h-4 text-orange-600 dark:text-orange-400" />
    default:
      return <Bell className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
  }
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffSec < 45) return 'Just now'
  if (diffSec < 90) return '1m ago'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 7200) return '1h ago'
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  if (diffSec < 172800) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearRead,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [desktopAlertsEnabled, setDesktopAlertsEnabled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setDesktopAlertsEnabled(Notification.permission === 'granted')
    }
  }, [])

  // Close on Escape key & lock body scroll
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.read)
    }
    return notifications
  }, [notifications, filter])

  const handleRequestDesktopPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission()
      setDesktopAlertsEnabled(perm === 'granted')
    }
  }

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.read) {
      onMarkAsRead(item.id)
    }
    if (item.link) {
      onClose()
      router.push(item.link)
    }
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in z-[99999]"
        onClick={onClose}
      />

      {/* Slide-out Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 z-[100000]">
        <div className="w-screen max-w-md bg-[var(--md-sys-color-surface)] border-l border-[var(--md-sys-color-outline-variant)] shadow-2xl flex flex-col transform transition ease-in-out duration-300 animate-slide-in-right">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between bg-[var(--md-sys-color-surface-container-low)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)]">
                      {unreadCount}
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                  Live platform alerts & shift activity
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
              title="Close drawer (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop Push Alert Banner (If not yet enabled) */}
          {!desktopAlertsEnabled && typeof window !== 'undefined' && 'Notification' in window && (
            <div className="px-4 py-2.5 bg-[var(--md-sys-color-primary-container)]/30 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
                Enable desktop alerts for live shifts
              </span>
              <button
                type="button"
                onClick={handleRequestDesktopPermission}
                className="text-[11px] font-bold text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
              >
                Enable
              </button>
            </div>
          )}

          {/* Filter & Action Toolbar */}
          <div className="px-4 py-3 bg-[var(--md-sys-color-surface)] border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between text-xs">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-[var(--md-sys-color-surface-container-low)] p-1 rounded-xl border border-[var(--md-sys-color-outline-variant)]">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filter === 'all'
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filter === 'unread'
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="text-[11px] font-semibold text-[var(--md-sys-color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark Read
                </button>
              )}
              {notifications.some((n) => n.read) && (
                <button
                  type="button"
                  onClick={onClearRead}
                  className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Clear all read notifications"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)]">
            {filteredNotifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-[var(--md-sys-color-on-surface-variant)]">
                <div className="w-12 h-12 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] flex items-center justify-center mb-3 text-[var(--md-sys-color-on-surface-variant)]">
                  <Bell className="w-6 h-6 opacity-40" />
                </div>
                <p className="font-semibold text-sm text-[var(--md-sys-color-on-surface)]">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 max-w-[220px]">
                  {filter === 'unread'
                    ? "You're all caught up! Shift and attendance updates will appear here."
                    : 'System alerts and shift activities will appear here in real time.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-4 transition-colors flex items-start gap-3 relative cursor-pointer group ${
                      !item.read
                        ? 'bg-[var(--md-sys-color-surface-container-lowest)] hover:bg-[var(--md-sys-color-surface-container-low)]'
                        : 'bg-transparent hover:bg-[var(--md-sys-color-surface-container-low)] opacity-85'
                    }`}
                  >
                    {/* Unread Indicator Dot */}
                    {!item.read && (
                      <span className="absolute left-1.5 top-5 w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)] ring-2 ring-[var(--md-sys-color-surface)]" />
                    )}

                    {/* Notification Icon Container */}
                    <div className="w-8 h-8 rounded-xl bg-[var(--md-sys-color-surface-container-high)] flex items-center justify-center shrink-0 mt-0.5 border border-[var(--md-sys-color-outline-variant)]">
                      {getNotificationIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4
                          className={`text-xs font-bold truncate ${
                            !item.read
                              ? 'text-[var(--md-sys-color-on-surface)]'
                              : 'text-[var(--md-sys-color-on-surface-variant)]'
                          }`}
                        >
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-mono shrink-0">
                          {formatRelativeTime(item.created_at)}
                        </span>
                      </div>

                      <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      {item.link && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-[var(--md-sys-color-primary)] hover:underline">
                          <span>View Details</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Action buttons (hover) */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                      {!item.read && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onMarkAsRead(item.id)
                          }}
                          className="p-1 rounded-md text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-high)] cursor-pointer"
                          title="Mark as read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(item.id)
                        }}
                        className="p-1 rounded-md text-[var(--md-sys-color-on-surface-variant)] hover:text-red-500 hover:bg-[var(--md-sys-color-surface-container-high)] cursor-pointer"
                        title="Dismiss notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
