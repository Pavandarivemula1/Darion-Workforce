import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CandidateNav } from '@/components/candidate/CandidateNav'
import { WorkStatusCard } from '@/components/candidate/WorkStatusCard'
import { AttendanceTable } from '@/components/candidate/AttendanceTable'
import { CandidateAnalyticsCharts } from '@/components/candidate/CandidateAnalyticsCharts'
import { getWeekBoundaries, getKolkataDateKey, formatDurationMs } from '@/lib/utils/timesheet'
import Link from 'next/link'
import { ArrowRight, History } from 'lucide-react'

export default async function CandidateDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    redirect('/admin')
  }

  // 1. Fetch active session for user
  const { data: activeSession } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', user.id)
    .is('logout_time', null)
    .maybeSingle()

  // 2. Fetch today's most recent session
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const { data: todaySession } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', user.id)
    .gte('login_time', startOfToday.toISOString())
    .order('login_time', { ascending: false })
    .limit(1)
    .maybeSingle()

  // 3. Calculate Current Week Hours & Daily Bar Graph Data
  const { startOfWeek, endOfWeek, daysHeader } = getWeekBoundaries()

  const { data: weekRecords } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', user.id)
    .gte('login_time', startOfWeek.toISOString())
    .lte('login_time', endOfWeek.toISOString())

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

  // 4. Calculate Current Month Total Hours
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const { data: monthRecords } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', user.id)
    .gte('login_time', startOfMonth.toISOString())

  let monthTotalMs = 0
  monthRecords?.forEach((r) => {
    if (r.logout_time) {
      monthTotalMs += Math.max(0, new Date(r.logout_time).getTime() - new Date(r.login_time).getTime())
    }
  })

  // 5. Fetch recent 5 attendance records for table
  const { data: recentRecords } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', user.id)
    .order('login_time', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex flex-col">
      <CandidateNav userName={profile?.full_name || user.email} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Welcome back, {profile?.full_name || 'Candidate'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Track your daily attendance, shift progress, and weekly performance
          </p>
        </div>

        {/* Work Status Card (Start/End Work) */}
        <WorkStatusCard
          activeSession={activeSession || null}
          todaySession={todaySession || null}
        />

        {/* Visual Analytics Bar Graph & Weekly Target Progress */}
        <CandidateAnalyticsCharts
          dailyData={dailyData}
          weeklyTotalMs={weeklyTotalMs}
          formattedWeeklyTotal={formatDurationMs(weeklyTotalMs)}
          formattedMonthTotal={formatDurationMs(monthTotalMs)}
          completedShiftsCount={completedShiftsCount}
        />

        {/* Recent Activity Table */}
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
      </main>
    </div>
  )
}
