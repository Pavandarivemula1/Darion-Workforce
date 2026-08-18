'use client'

import React, { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { NotificationDrawer } from './NotificationDrawer'
import { NotificationItem } from '@/lib/utils/notifications'
import { fetchUserNotificationsAction } from '@/app/actions/notifications'
import { createClient } from '@/lib/supabase/client'

interface NotificationBellProps {
  userId?: string
  className?: string
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(userId)

  // Fetch initial notifications
  useEffect(() => {
    let mounted = true

    async function load() {
      const res = await fetchUserNotificationsAction()
      if (mounted && res) {
        setNotifications(res.notifications)
        setUnreadCount(res.unreadCount)
      }
    }

    // Resolve user id if not provided via props
    if (!currentUserId) {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => {
        if (mounted && data.user) {
          setCurrentUserId(data.user.id)
        }
      })
    }

    load()

    return () => {
      mounted = false
    }
  }, [currentUserId])

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
        userId={currentUserId}
        initialNotifications={notifications}
        unreadCount={unreadCount}
        onUnreadCountChange={setUnreadCount}
      />
    </>
  )
}
