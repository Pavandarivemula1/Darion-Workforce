import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import {
  Users,
  Clock,
  CalendarCheck,
  TrendingUp,
  UserPlus,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import { getWeekBoundaries, getKolkataDateKey, formatDurationMs } from '@/lib/utils/timesheet'
import { DashboardAnalyticsCharts } from '@/components/admin/dashboard/DashboardAnalyticsCharts'
import { LiveTabTitle } from '@/components/ui/LiveTabTitle'
import { RealtimeAttendanceListener } from '@/components/ui/RealtimeAttendanceListener'

export default async function AdminDashboardContent() {
  const supabase = await createClient()

  const { startOfWeek, endOfWeek, daysHeader } = getWeekBoundaries()
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const [
    { data: candidates },
    { data: activeSessions },
    { data: todayRecords },
    { data: weekRecords },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, role, hourly_rate, created_at')
      .eq('role', 'candidate')
      .order('created_at', { ascending: true }),
    supabase
      .from('attendance')
      .select('id, user_id, login_time, break_start_time, profiles(full_name)')
      .is('logout_time', null),
    supabase
      .from('attendance')
      .select('id, payout_amount')
      .gte('login_time', startOfToday.toISOString()),
    supabase
      .from('attendance')
      .select('id, user_id, login_time, logout_time, break_start_time, break_duration_seconds, payout_amount')
      .gte('login_time', startOfWeek.toISOString())
      .lte('login_time', endOfWeek.toISOString()),
  ])

  const totalCandidates = candidates?.length || 0
  const workingNowCount = activeSessions?.length || 0
  const todayRecordsCount = todayRecords?.length || 0

  let totalWeekMs = 0
  let completedCount = 0
  let incompleteCount = 0

  const todayKolkataKey = getKolkataDateKey(new Date().toISOString())

  weekRecords?.forEach((r) => {
    if (r.logout_time) {
      totalWeekMs += new Date(r.logout_time).getTime() - new Date(r.login_time).getTime()
      completedCount++
    } else {
      const recKey = getKolkataDateKey(r.login_time)
      if (recKey !== todayKolkataKey) {
        incompleteCount++
      }
    }
  })

  const weekHours = Math.floor(totalWeekMs / (1000 * 60 * 60))
  const weekMins = Math.floor((totalWeekMs % (1000 * 60 * 60)) / (1000 * 60))
  const thisWeekDuration = `${weekHours}h ${weekMins.toString().padStart(2, '0')}m`

  const dailyData = daysHeader.map(({ dayName, dateStr, dateIso }) => {
    let dayMs = 0
    const dayRecs = (weekRecords || []).filter(
      (r) => getKolkataDateKey(r.login_time) === dateIso
    )

    dayRecs.forEach((r) => {
      if (r.logout_time) {
        dayMs += Math.max(0, new Date(r.logout_time).getTime() - new Date(r.login_time).getTime())
      }
    })

    const hoursNum = dayMs / (1000 * 60 * 60)

    return {
      dayName,
      dateStr,
      dateIso,
      totalMs: dayMs,
      formattedDuration: formatDurationMs(dayMs),
      hoursNum: Math.round(hoursNum * 10) / 10,
    }
  })

  const candidateBreakdowns = (candidates || []).map((cand) => {
    const candRecs = (weekRecords || []).filter((r) => r.user_id === cand.id)
    let candMs = 0
    let candCompleted = 0

    candRecs.forEach((r) => {
      if (r.logout_time) {
        candMs += Math.max(0, new Date(r.logout_time).getTime() - new Date(r.login_time).getTime())
        candCompleted++
      }
    })

    const targetMs = 40 * 60 * 60 * 1000
    const percentOfTarget = Math.round((candMs / targetMs) * 100)

    return {
      id: cand.id,
      name: cand.full_name,
      totalMs: candMs,
      formattedDuration: formatDurationMs(candMs),
      completedCount: candCompleted,
      percentOfTarget,
    }
  })

  return (
    <>
      <RealtimeAttendanceListener />
      <LiveTabTitle count={workingNowCount} />

      {/* 4 MD3 Metric Cards - High Density 2-Column Mobile Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Candidates */}
        <Card variant="elevated" className="flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)] p-3 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Candidates
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className="text-xl sm:text-3xl font-bold font-mono">{totalCandidates}</span>
            <span className="text-[10px] sm:text-xs text-[var(--md-sys-color-on-surface-variant)] block truncate">Registered</span>
          </div>
        </Card>

        {/* Card 2: Working Now */}
        <Card variant="elevated" className="flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)] p-3 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Working Now
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className="text-xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{workingNowCount}</span>
            <span className="text-[10px] sm:text-xs text-[var(--md-sys-color-on-surface-variant)] block truncate">Active Shifts</span>
          </div>
        </Card>

        {/* Card 3: Today's Records */}
        <Card variant="elevated" className="flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)] p-3 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Today&apos;s Logs
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center">
              <CalendarCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className="text-xl sm:text-3xl font-bold font-mono">{todayRecordsCount}</span>
            <span className="text-[10px] sm:text-xs text-[var(--md-sys-color-on-surface-variant)] block truncate">Logged Today</span>
          </div>
        </Card>

        {/* Card 4: This Week */}
        <Card variant="elevated" className="flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)] p-3 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              This Week
            </span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <span className="text-lg sm:text-2xl font-bold font-mono truncate">{thisWeekDuration}</span>
            <span className="text-[10px] sm:text-xs text-[var(--md-sys-color-on-surface-variant)] block truncate">Combined Hours</span>
          </div>
        </Card>
      </div>

      {/* Visual Analytics Bar Chart & Distribution */}
      <DashboardAnalyticsCharts
        dailyData={dailyData}
        candidateBreakdowns={candidateBreakdowns}
        completedCount={completedCount}
        workingNowCount={workingNowCount}
        incompleteCount={incompleteCount}
      />

      {/* Live Working Candidates & Quick Controls Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card variant="outlined" className="flex flex-col gap-3 sm:gap-4 border border-[var(--md-sys-color-outline-variant)] p-3.5 sm:p-5">
          <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-[var(--md-sys-color-outline-variant)]">
            <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              Active Sessions Right Now
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              {workingNowCount} Working
            </span>
          </div>

          {activeSessions && activeSessions.length > 0 ? (
            <div className="flex flex-col divide-y divide-[var(--md-sys-color-outline-variant)] max-h-[300px] overflow-y-auto pr-1">
              {activeSessions.map((session) => {
                const profileObj = Array.isArray(session.profiles) ? session.profiles[0] : session.profiles
                const isOnBreak = !!session.break_start_time
                
                return (
                  <div key={session.id} className="py-2.5 sm:py-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold truncate">{profileObj?.full_name || 'Candidate'}</p>
                      <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]" suppressHydrationWarning>
                        Login: {new Date(session.login_time).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })}
                      </p>
                    </div>
                    {isOnBreak ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        On Break
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        In Progress
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8 opacity-40" />
              No candidates are currently checked in.
            </div>
          )}
        </Card>

        {/* Quick Links Card */}
        <Card variant="outlined" className="flex flex-col gap-3 sm:gap-4 border border-[var(--md-sys-color-outline-variant)] p-3.5 sm:p-5">
          <div className="pb-2.5 sm:pb-3 border-b border-[var(--md-sys-color-outline-variant)]">
            <h3 className="text-sm sm:text-base font-bold">Admin Controls</h3>
          </div>

          <div className="flex flex-col gap-2 sm:gap-2.5">
            <Link
              href="/admin/candidates"
              className="p-3 sm:p-3.5 rounded-xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] active:scale-[0.98] transition-all flex items-center justify-between"
            >
              <div>
                <p className="text-xs sm:text-sm font-semibold">Candidate Roster</p>
                <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">Manage profiles, credentials & rates</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
            </Link>

            <Link
              href="/admin/attendance"
              className="p-3 sm:p-3.5 rounded-xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] active:scale-[0.98] transition-all flex items-center justify-between"
            >
              <div>
                <p className="text-xs sm:text-sm font-semibold">System Attendance Records</p>
                <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">Filter attendance logs by candidate & date</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
            </Link>

            <Link
              href="/admin/timesheet"
              className="p-3 sm:p-3.5 rounded-xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] active:scale-[0.98] transition-all flex items-center justify-between"
            >
              <div>
                <p className="text-xs sm:text-sm font-semibold">Weekly Timesheet Matrix</p>
                <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">Aggregate total working hours per candidate</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
            </Link>

            <Link
              href="/admin/reset-requests"
              className="p-3 sm:p-3.5 rounded-xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] active:scale-[0.98] transition-all flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold">Password Reset Requests</p>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Review and approve forgot password requests</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
            </Link>
          </div>
        </Card>
      </div>
    </>
  )
}
