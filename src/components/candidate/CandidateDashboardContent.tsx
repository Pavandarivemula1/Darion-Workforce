import { createClient, createAdminClient } from '@/lib/supabase/server'
import { WorkStatusCard } from '@/components/candidate/WorkStatusCard'
import { AttendanceTable } from '@/components/candidate/AttendanceTable'
import { CandidateAnalyticsCharts } from '@/components/candidate/CandidateAnalyticsCharts'
import { getWeekBoundaries, getKolkataDateKey, formatDurationMs } from '@/lib/utils/timesheet'
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
    { data: activeSession },
    { data: todaySession },
    { data: weekRecords },
    { data: monthRecords },
    { data: recentRecords },
    { data: overshiftRequest },
    { data: allActiveSessions },
  ] = await Promise.all([
    supabase
      .from('attendance')
      .select('id, user_id, login_time, logout_time, break_start_time, break_duration_seconds, created_at')
      .eq('user_id', userId)
      .is('logout_time', null)
      .maybeSingle(),
    supabase
      .from('attendance')
      .select('id, user_id, login_time, logout_time, break_start_time, break_duration_seconds, created_at')
      .eq('user_id', userId)
      .gte('login_time', startOfToday.toISOString())
      .order('login_time', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('attendance')
      .select('id, user_id, login_time, logout_time, break_start_time, break_duration_seconds, created_at')
      .eq('user_id', userId)
      .gte('login_time', startOfWeek.toISOString())
      .lte('login_time', endOfWeek.toISOString()),
    supabase
      .from('attendance')
      .select('id, user_id, login_time, logout_time, break_start_time, break_duration_seconds, created_at')
      .eq('user_id', userId)
      .gte('login_time', startOfMonth.toISOString()),
    supabase
      .from('attendance')
      .select('id, user_id, login_time, logout_time, break_start_time, break_duration_seconds, created_at')
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
  ])

  let weeklyTotalMs = 0
  let completedShiftsCount = 0

  weekRecords?.forEach((r) => {
    if (r.logout_time) {
      weeklyTotalMs += Math.max(0, new Date(r.logout_time).getTime() - new Date(r.login_time).getTime())
      completedShiftsCount++
    }
  })

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

  let monthTotalMs = 0
  monthRecords?.forEach((r) => {
    if (r.logout_time) {
      const grossMs = Math.max(0, new Date(r.logout_time).getTime() - new Date(r.login_time).getTime())
      const breakMs = (r.break_duration_seconds || 0) * 1000
      monthTotalMs += Math.max(0, grossMs - breakMs)
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
      />

      <CandidateAnalyticsCharts
        dailyData={dailyData}
        weeklyTotalMs={weeklyTotalMs}
        formattedWeeklyTotal={formatDurationMs(weeklyTotalMs)}
        formattedMonthTotal={formatDurationMs(monthTotalMs)}
        completedShiftsCount={completedShiftsCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-2">
              <History className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
              Recent Shift Activity
            </h3>
            <Link
              href="/candidate/attendance"
              className="text-xs font-semibold text-[var(--md-sys-color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Full History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <AttendanceTable records={recentRecords || []} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              Who's Working Now
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              {workingNowCount} Active
            </span>
          </div>

          <Card variant="outlined" className="flex flex-col border border-[var(--md-sys-color-outline-variant)] h-full">
            {allActiveSessions && allActiveSessions.length > 0 ? (
              <div className="flex flex-col divide-y divide-[var(--md-sys-color-outline-variant)] max-h-[400px] overflow-y-auto px-4">
                {allActiveSessions.map((session) => {
                  const profileObj = Array.isArray(session.profiles) ? session.profiles[0] : session.profiles
                  const isMe = session.user_id === userId
                  const isOnBreak = !!session.break_start_time
                  
                  return (
                    <div key={session.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold flex items-center gap-2">
                          {profileObj?.full_name || 'Candidate'}
                          {isMe && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]" suppressHydrationWarning>
                          Login: {new Date(session.login_time).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                      </div>
                      {isOnBreak ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          On Break
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          Working
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] flex flex-col items-center justify-center gap-2 h-full">
                <Clock className="w-8 h-8 opacity-40" />
                No one else is currently working.
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
