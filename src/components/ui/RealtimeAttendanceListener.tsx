'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function RealtimeAttendanceListener() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let refreshTimeout: NodeJS.Timeout | null = null

    const debouncedRefresh = () => {
      if (refreshTimeout) clearTimeout(refreshTimeout)
      refreshTimeout = setTimeout(() => {
        router.refresh()
      }, 300)
    }
    
    // Subscribe to any changes on the attendance table
    const attChannelName = `att_${Math.random().toString(36).slice(2, 9)}`
    const attendanceChannel = supabase
      .channel(attChannelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, and DELETE
          schema: 'public',
          table: 'attendance',
        },
        debouncedRefresh
      )
      .subscribe()

    // Subscribe to any changes on the overshift_requests table
    const overshiftChannelName = `overshift_${Math.random().toString(36).slice(2, 9)}`
    const overshiftChannel = supabase
      .channel(overshiftChannelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'overshift_requests',
        },
        debouncedRefresh
      )
      .subscribe()

    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout)
      supabase.removeChannel(attendanceChannel)
      supabase.removeChannel(overshiftChannel)
    }
  }, [router])

  return null
}
