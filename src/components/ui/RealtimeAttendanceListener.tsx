'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function RealtimeAttendanceListener() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    
    // Subscribe to any changes on the attendance table
    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  return null
}
