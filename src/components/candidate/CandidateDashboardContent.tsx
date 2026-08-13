import { createClient } from '@/lib/supabase/server'
import { WorkStatusCard } from '@/components/candidate/WorkStatusCard'
import { AttendanceTable } from '@/components/candidate/AttendanceTable'
import { CandidateAnalyticsCharts } from '@/components/candidate/CandidateAnalyticsCharts'
import { getWeekBoundaries, getKolkataDateKey, formatDurationMs } from '@/lib/utils/timesheet'
import Link from 'next/link'
import { ArrowRight, History } from 'lucide-react'

export default async function CandidateDashboardContent({ userId }: { userId: string }) {
  const supabase = await createClient()

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

  return (
    <>
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
    </>
  )
}
