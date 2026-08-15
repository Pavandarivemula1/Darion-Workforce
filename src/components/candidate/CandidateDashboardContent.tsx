import { createClient, createAdminClient } from '@/lib/supabase/server'
import { WorkStatusCard } from '@/components/candidate/WorkStatusCard'
import { AttendanceTable } from '@/components/candidate/AttendanceTable'
import { CandidateAnalyticsCharts } from '@/components/candidate/CandidateAnalyticsCharts'
import { getWeekBoundaries, getKolkataDateKey, formatDurationMs } from '@/lib/utils/timesheet'
import { DEFAULT_FALLBACK_SHIFT, type ShiftConfig } from '@/lib/utils/shift'
import Link from 'next/link'
import { ArrowRight, History, Clock, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { LiveTabTitle } from '@/components/ui/LiveTabTitle'
import { RealtimeAttendanceListener } from '@/components/ui/RealtimeAttendanceListener'

export default async function CandidateDashboardContent({ userId }: { userId: string }) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const { startOfWeek, endOfWeek, daysHeader } = getWeekBoundaries()
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const [
    { data: profileData, error: profileError },
    { data: activeSession },
    { data: todaySession },
    { data: weekRecords },
    { data: monthRecords },
    { data: recentRecords },
    { data: overshiftRequest },
    { data: allActiveSessions },
    { data: defaultShiftData },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('hourly_rate, shift_id')
      .eq('id', userId)
      .single(),
    supabase
      .from('attendance')
      .select('id, user_id, login_time, logout_time, break_start_time, break_duration_seconds, payout_amount, created_at')
      .eq('user_id', userId)
      .is('logout_time', null)
      .maybeSingle(),
    supabase
      .from('attendance')
      .select('id, user_id, login_time, logout_time, break_start_time, break_duration_seconds, payout_amount, created_at')
      .eq('user_id', userId)
      .gte('login_time', startOfToday.toISOString())
      .order('login_time', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('attendance')
      .select('id, user_id, login_time, logout_time, break_start_time, break_duration_seconds, payout_amount, created_at')
      .eq('user_id', userId)
      .gte('login_time', startOfWeek.toISOString())
      .lte('login_time', endOfWeek.toISOString()),
    supabase
      .from('attendance')
      .select('id, user_id, login_time, logout_time, break_start_time, break_duration_seconds, payout_amount, created_at')
      .eq('user_id', userId)
      .gte('login_time', startOfMonth.toISOString()),
    supabase
      .from('attendance')
      .select('id, user_id, login_time, logout_time, break_start_time, break_duration_seconds, payout_amount, created_at')
      .eq('user_id', userId)
      .order('login_time', { ascending: false })
      .limit(5),
    supabase
      .from('overshift_requests')
      .select('status')
      .eq('user_id', userId)
      .eq('request_date', getKolkataDateKey(new Date().toISOString()))
      .maybeSingle(),
    supabaseAdmin
      .from('attendance')
      .select('id, user_id, login_time, break_start_time, profiles(full_name)')
      .is('logout_time', null),
    supabase
      .from('shifts')
      .select('id, name, start_time, end_time, grace_period_mins, auto_logout_enabled, is_overnight, is_default')
      .eq('is_default', true)
      .maybeSingle(),
  ])

  let profile: { hourly_rate?: number | null; shift_id?: string | null } | null = profileData
  if (profileError || !profile) {
    const { data: fallbackProfile } = await supabase
      .from('profiles')
      .select('hourly_rate')
      .eq('id', userId)
      .maybeSingle()
    profile = fallbackProfile ? { hourly_rate: fallbackProfile.hourly_rate, shift_id: null } : null
  }

  // If candidate has a custom assigned shift_id, fetch it; otherwise use system default shift
  let assignedShift: ShiftConfig = defaultShiftData || DEFAULT_FALLBACK_SHIFT
  if (profile?.shift_id) {
    const { data: customShift } = await supabase
      .from('shifts')
      .select('id, name, start_time, end_time, grace_period_mins, auto_logout_enabled, is_overnight, is_default')
      .eq('id', profile.shift_id)
      .maybeSingle()
    if (customShift) {
      assignedShift = customShift
    }
  }

  const hourlyRate = Number(profile?.hourly_rate || 0)

  let weeklyTotalMs = 0
  let completedShiftsCount = 0
  let weeklyPay = 0

  weekRecords?.forEach((r) => {
    if (r.logout_time) {
      const gross = Math.max(0, new Date(r.logout_time).getTime() - new Date(r.login_time).getTime())
      const breakMs = (r.break_duration_seconds || 0) * 1000
      const net = Math.max(0, gross - breakMs)
      weeklyTotalMs += net
      completedShiftsCount++

      const shiftPay = typeof r.payout_amount === 'number' && r.payout_amount > 0
        ? r.payout_amount
        : Math.round((net / (1000 * 60 * 60)) * hourlyRate * 100) / 100
      weeklyPay += shiftPay
    }
  })

  const dailyData = daysHeader.map(({ dayName, dateStr, dateIso }) => {
    let dayMs = 0
    let dayPay = 0
    const dayRecs = (weekRecords || []).filter(
      (r) => getKolkataDateKey(r.login_time) === dateIso
    )

    dayRecs.forEach((r) => {
      if (r.logout_time) {
        const gross = Math.max(0, new Date(r.logout_time).getTime() - new Date(r.login_time).getTime())
        const breakMs = (r.break_duration_seconds || 0) * 1000
        const net = Math.max(0, gross - breakMs)
        dayMs += net

        const p = typeof r.payout_amount === 'number' && r.payout_amount > 0
          ? r.payout_amount
          : Math.round((net / (1000 * 60 * 60)) * hourlyRate * 100) / 100
        dayPay += p
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
      dailyPay: Math.round(dayPay * 100) / 100,
    }
  })

  let monthTotalMs = 0
  let monthPay = 0
  monthRecords?.forEach((r) => {
    if (r.logout_time) {
      const grossMs = Math.max(0, new Date(r.logout_time).getTime() - new Date(r.login_time).getTime())
      const breakMs = (r.break_duration_seconds || 0) * 1000
      const net = Math.max(0, grossMs - breakMs)
      monthTotalMs += net

      const p = typeof r.payout_amount === 'number' && r.payout_amount > 0
        ? r.payout_amount
        : Math.round((net / (1000 * 60 * 60)) * hourlyRate * 100) / 100
      monthPay += p
    }
  })

  const workingNowCount = allActiveSessions?.length || 0

  return (
    <>
      <RealtimeAttendanceListener />
      {!activeSession && <LiveTabTitle count={workingNowCount} />}
      
      <WorkStatusCard
        activeSession={activeSession || null}
        todaySession={todaySession || null}
        overshiftStatus={overshiftRequest?.status || null}
        hourlyRate={hourlyRate}
        todayPayoutAmount={todaySession?.payout_amount || 0}
        assignedShift={assignedShift}
      />

      <CandidateAnalyticsCharts
        dailyData={dailyData}
        weeklyTotalMs={weeklyTotalMs}
        formattedWeeklyTotal={formatDurationMs(weeklyTotalMs)}
        formattedMonthTotal={formatDurationMs(monthTotalMs)}
        completedShiftsCount={completedShiftsCount}
        weeklyPay={Math.round(weeklyPay * 100) / 100}
        monthPay={Math.round(monthPay * 100) / 100}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
              <History className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
              Recent Shift Activity
            </h3>
            <Link
              href="/candidate/attendance"
              className="text-xs font-semibold text-[var(--md-sys-color-primary)] hover:underline flex items-center gap-1 cursor-pointer active:scale-95"
            >
              View Full <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <AttendanceTable records={recentRecords || []} />
        </div>

        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              Who&apos;s Working Now
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              {workingNowCount} Active
            </span>
          </div>

          <Card variant="outlined" className="flex flex-col border border-[var(--md-sys-color-outline-variant)] h-full p-3 sm:p-4">
            {allActiveSessions && allActiveSessions.length > 0 ? (
              <div className="flex flex-col divide-y divide-[var(--md-sys-color-outline-variant)] max-h-[320px] sm:max-h-[400px] overflow-y-auto pr-1">
                {allActiveSessions.map((session) => {
                  const profileObj = Array.isArray(session.profiles) ? session.profiles[0] : session.profiles
                  const isMe = session.user_id === userId
                  const isOnBreak = !!session.break_start_time
                  
                  return (
                    <div key={session.id} className="py-2.5 sm:py-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 truncate">
                          <span className="truncate">{profileObj?.full_name || 'Candidate'}</span>
                          {isMe && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold uppercase tracking-wider shrink-0">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]" suppressHydrationWarning>
                          In: {new Date(session.login_time).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })}
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
                          Working
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
                No other candidates active right now.
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
