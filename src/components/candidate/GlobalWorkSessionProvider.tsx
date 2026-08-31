'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import { FaviconStatusManager, type FaviconStatus } from '@/components/ui/FaviconStatusManager'
import { useBranding } from '@/components/providers/BrandingProvider'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ActiveSession {
  id: string
  login_time: string
  break_start_time: string | null
  break_duration_seconds: number
}

interface WorkSessionContextValue {
  activeSession: ActiveSession | null
  faviconStatus: FaviconStatus
  workDuration: string // live "00h 00m 00s"
  isOnBreak: boolean
}

const WorkSessionContext = createContext<WorkSessionContextValue>({
  activeSession: null,
  faviconStatus: 'offline',
  workDuration: '00h 00m 00s',
  isOnBreak: false,
})

export function useWorkSession() {
  return useContext(WorkSessionContext)
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function GlobalWorkSessionProvider({
  userId,
  children,
}: {
  userId: string | undefined
  children: React.ReactNode
}) {
  const branding = useBranding()
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null)
  const [workDuration, setWorkDuration] = useState('00h 00m 00s')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Fetch active session from Supabase ─────────────────────────────────────
  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    async function fetchSession() {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
      const { data } = await supabase
        .from('attendance')
        .select('id, login_time, break_start_time, break_duration_seconds')
        .eq('user_id', userId!)
        .gte('login_time', `${today}T00:00:00`)
        .is('logout_time', null)
        .maybeSingle()

      setActiveSession(data as ActiveSession | null)
    }

    fetchSession()

    // Subscribe to realtime changes on the attendance table for this user
    const channel = supabase
      .channel(`work-session-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: `user_id=eq.${userId}`,
        },
        () => { fetchSession() }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  // ── Live work duration ticker ──────────────────────────────────────────────
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)

    if (!activeSession) {
      setWorkDuration('00h 00m 00s')
      return
    }

    const tick = () => {
      const start = new Date(activeSession.login_time).getTime()
      const now = Date.now()
      const grossMs = Math.max(0, now - start)

      let breakSecs = activeSession.break_duration_seconds || 0
      if (activeSession.break_start_time) {
        const bStart = new Date(activeSession.break_start_time).getTime()
        breakSecs += Math.max(0, Math.floor((now - bStart) / 1000))
      }

      const netMs = Math.max(0, grossMs - breakSecs * 1000)
      const h = Math.floor(netMs / 3_600_000)
      const m = Math.floor((netMs % 3_600_000) / 60_000)
      const s = Math.floor((netMs % 60_000) / 1000)

      setWorkDuration(
        `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
      )
    }

    tick()
    timerRef.current = setInterval(tick, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [activeSession])

  // ── Document title ─────────────────────────────────────────────────────────
  const isOnBreak = !!activeSession?.break_start_time
  const faviconStatus: FaviconStatus = activeSession
    ? isOnBreak ? 'break' : 'active'
    : 'offline'

  useEffect(() => {
    const brandTitle = branding.appTitle || 'Workforce'
    if (!activeSession) {
      document.title = brandTitle
      return
    }
    document.title = isOnBreak
      ? `On Break | ${brandTitle}`
      : `${workDuration} | ${brandTitle}`

    return () => { document.title = brandTitle }
  }, [activeSession, isOnBreak, workDuration, branding.appTitle])

  return (
    <WorkSessionContext.Provider value={{ activeSession, faviconStatus, workDuration, isOnBreak }}>
      {/* Favicon manager lives here — persists across all candidate pages */}
      <FaviconStatusManager status={faviconStatus} />
      {children}
    </WorkSessionContext.Provider>
  )
}
