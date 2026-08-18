'use client'

import React, { useState, useEffect, useTransition, useCallback } from 'react'
import { Bell } from 'lucide-react'
import { NotificationDrawer } from './NotificationDrawer'
import { NotificationItem } from '@/lib/utils/notifications'
import {
  fetchUserNotificationsAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  deleteNotificationAction,
  clearAllReadNotificationsAction,
} from '@/app/actions/notifications'
import { createClient } from '@/lib/supabase/client'

interface NotificationBellProps {
  userId?: string
  className?: string
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(userId)
  const [, startTransition] = useTransition()

  // Calculate unread count purely from state (derived, no state loop)
  const unreadCount = notifications.filter((n) => !n.read).length

  // Resolve user id once if not provided
  useEffect(() => {
    if (userId) {
      setCurrentUserId(userId)
      return
    }

    let isMounted = true
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (isMounted && data.user?.id) {
        setCurrentUserId(data.user.id)
      }
    })

    return () => {
      isMounted = false
    }
  }, [userId])

  // Fetch initial notifications once userId is resolved
  useEffect(() => {
    if (!currentUserId) return

    let isMounted = true

    fetchUserNotificationsAction().then((res) => {
      if (isMounted && res?.notifications) {
        setNotifications(res.notifications)
      }
    })

    // Subscribe to realtime changes once with instance-unique channel name
    const supabase = createClient()
    const channelName = `notifs-${currentUserId}-${Math.random().toString(36).slice(2, 9)}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          const newNotif = payload.new as NotificationItem
          setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)])

          // Native Desktop Notification if permitted
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(newNotif.title, {
                body: newNotif.message,
                icon: '/favicon.ico',
              })
            } catch {
              // Ignore native notification errors
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
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          const updated = payload.new as NotificationItem
          setNotifications((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUserId}`,
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
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [currentUserId])

  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    startTransition(async () => {
      await markNotificationAsReadAction(id)
    })
  }, [])

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    startTransition(async () => {
      await markAllNotificationsAsReadAction()
    })
  }, [])

  const handleDelete = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    startTransition(async () => {
      await deleteNotificationAction(id)
    })
  }, [])

  const handleClearRead = useCallback(() => {
    setNotifications((prev) => prev.filter((n) => !n.read))
    startTransition(async () => {
      await clearAllReadNotificationsAction()
    })
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open notifications"
        className={`relative p-2 rounded-xl text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-all cursor-pointer ${className}`}
      >
        <Bell className="w-5 h-5" />

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] shadow-xs animate-scale-in">
            {unreadCount > 99 ? '99+' : unreadCount}
            <span className="absolute inset-0 rounded-full bg-[var(--md-sys-color-error)] animate-ping opacity-60 pointer-events-none" />
          </span>
        )}
      </button>

      <NotificationDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDelete={handleDelete}
        onClearRead={handleClearRead}
      />
    </>
  )
}
