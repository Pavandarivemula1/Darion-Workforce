'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function RealtimeAttendanceListener() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    
    // Subscribe to any changes on the attendance table
    const attendanceChannel = supabase
      .channel('attendance_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, and DELETE
          schema: 'public',
          table: 'attendance',
        },
        () => {
          // Tell Next.js to re-fetch the Server Components silently
          router.refresh()
        }
      )
      .subscribe()

    // Subscribe to any changes on the overshift_requests table
    const overshiftChannel = supabase
      .channel('overshift_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'overshift_requests',
        },
        () => {
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(attendanceChannel)
      supabase.removeChannel(overshiftChannel)
    }
  }, [router])

  return null
}
