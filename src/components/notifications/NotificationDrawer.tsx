'use client'

import React, { useEffect, useState, useTransition, useMemo } from 'react'
import {
  X,
  CheckCheck,
  Trash2,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
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
import { createClient } from '@/lib/supabase/client'
import { NotificationItem, NotificationType } from '@/lib/utils/notifications'
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  deleteNotificationAction,
  clearAllReadNotificationsAction,
} from '@/app/actions/notifications'
import { useRouter } from 'next/navigation'

interface NotificationDrawerProps {
  isOpen: boolean
  onClose: () => void
  userId?: string
  initialNotifications?: NotificationItem[]
  unreadCount: number
  onUnreadCountChange: (count: number) => void
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
  userId,
  initialNotifications = [],
  unreadCount,
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [isPending, startTransition] = useTransition()
  const [desktopAlertsEnabled, setDesktopAlertsEnabled] = useState(false)
  const router = useRouter()

  // Check desktop notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setDesktopAlertsEnabled(Notification.permission === 'granted')
    }
  }, [])

  // Sync initial notifications if props change
  useEffect(() => {
    if (initialNotifications && initialNotifications.length > 0) {
      setNotifications(initialNotifications)
    }
  }, [initialNotifications])

  // Supabase Realtime Subscription
  useEffect(() => {
    if (!userId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as NotificationItem
          setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)])
          onUnreadCountChange(unreadCount + 1)

          // Native Desktop Notification if granted
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(newNotif.title, {
                body: newNotif.message,
                icon: '/favicon.ico',
              })
            } catch (err) {
              console.warn('[Desktop notification error]:', err)
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as NotificationItem
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const deletedId = (payload.old as any)?.id
          if (deletedId) {
            setNotifications((prev) => prev.filter((n) => n.id !== deletedId))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, unreadCount, onUnreadCountChange])

  // Recalculate unread count
  useEffect(() => {
    const count = notifications.filter((n) => !n.read).length
    onUnreadCountChange(count)
  }, [notifications, onUnreadCountChange])

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

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    startTransition(async () => {
      await markNotificationAsReadAction(id)
    })
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    startTransition(async () => {
      await markAllNotificationsAsReadAction()
    })
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    startTransition(async () => {
      await deleteNotificationAction(id)
    })
  }

  const handleClearRead = () => {
    setNotifications((prev) => prev.filter((n) => !n.read))
    startTransition(async () => {
      await clearAllReadNotificationsAction()
    })
  }

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.read) {
      handleMarkAsRead(item.id)
    }
    if (item.link) {
      onClose()
      router.push(item.link)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-out Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[var(--md-sys-color-surface-container)] border-l border-[var(--md-sys-color-outline-variant)] shadow-2xl flex flex-col transform transition ease-in-out duration-300">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between bg-[var(--md-sys-color-surface)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
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
              className="p-2 rounded-xl text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer"
              title="Close drawer"
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
          <div className="px-4 py-3 bg-[var(--md-sys-color-surface-container-low)] border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between text-xs">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-[var(--md-sys-color-surface)] p-1 rounded-xl border border-[var(--md-sys-color-outline-variant)]">
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
                  onClick={handleMarkAllAsRead}
                  disabled={isPending}
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
                  onClick={handleClearRead}
                  disabled={isPending}
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
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--md-sys-color-outline-variant)]">
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
                        ? 'bg-[var(--md-sys-color-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'
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
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                          className="p-1 rounded-md text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-high)] cursor-pointer"
                          title="Mark as read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, e)}
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
    </div>
  )
}
