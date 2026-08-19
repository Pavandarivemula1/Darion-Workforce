import { createClient, createAdminClient } from '@/lib/supabase/server'
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
import { MobileAdminDashboard } from '@/components/admin/dashboard/MobileAdminDashboard'
import { LiveTabTitle } from '@/components/ui/LiveTabTitle'
import { RealtimeAttendanceListener } from '@/components/ui/RealtimeAttendanceListener'

// Dedicated Role Dashboards
import { SuperAdminDashboard } from '@/components/admin/dashboard/SuperAdminDashboard'
import { HRManagerDashboard } from '@/components/admin/dashboard/HRManagerDashboard'
import { SupervisorDashboard } from '@/components/admin/dashboard/SupervisorDashboard'
import { AuditorDashboard } from '@/components/admin/dashboard/AuditorDashboard'
import { getPlatformTelemetryAction, getAuditLogsAction } from '@/app/actions/superadmin'

export interface AdminDashboardContentProps {
  role?: string
}

export default async function AdminDashboardContent({ role = 'admin' }: AdminDashboardContentProps) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  // 1. DEDICATED SUPERADMIN DASHBOARD
  if (role === 'super_admin') {
    const [telemetryRes, auditLogsRes] = await Promise.all([
      getPlatformTelemetryAction(),
      getAuditLogsAction({ limit: 5 }),
    ])

    return (
      <SuperAdminDashboard
        telemetry={telemetryRes.telemetry}
        recentAuditLogs={auditLogsRes.logs || []}
        diagnosticsHealthy={true}
      />
    )
  }

  // 2. DEDICATED HR & PAYROLL MANAGER DASHBOARD
  if (role === 'hr_manager') {
    const [
      { data: candidates },
      { data: pendingLeavesRaw },
      { data: unpaidShifts },
      { data: activeSessions },
    ] = await Promise.all([
      supabase.from('profiles').select('id, full_name, hourly_rate').eq('role', 'candidate'),
      supabase
        .from('leaves')
        .select('id, user_id, leave_type, start_date, end_date, total_days, reason, status, profiles(full_name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
      supabase
        .from('attendance')
        .select('id, payout_amount')
        .eq('payment_status', 'unpaid')
        .not('logout_time', 'is', null),
      supabase.from('attendance').select('id').is('logout_time', null),
    ])

    const totalCandidates = candidates?.length || 0
    const missingHourlyRateCount = candidates?.filter((c) => !c.hourly_rate || Number(c.hourly_rate) === 0).length || 0
    const unpaidShiftsCount = unpaidShifts?.length || 0
    const unsettledPayrollAmount = unpaidShifts?.reduce((acc, s) => acc + (Number(s.payout_amount) || 0), 0) || 0

    const pendingLeaves = (pendingLeavesRaw || []).map((l: any) => {
      const p = Array.isArray(l.profiles) ? l.profiles[0] : l.profiles
      return {
        ...l,
        candidateName: p?.full_name || 'Staff Member',
      }
    })

    return (
      <HRManagerDashboard
        totalCandidates={totalCandidates}
        pendingLeaves={pendingLeaves}
        unsettledPayrollAmount={Math.round(unsettledPayrollAmount * 100) / 100}
        unpaidShiftsCount={unpaidShiftsCount}
        missingHourlyRateCount={missingHourlyRateCount}
        workingNowCount={activeSessions?.length || 0}
      />
    )
  }

  // 3. DEDICATED SHIFT SUPERVISOR DASHBOARD
  if (role === 'supervisor') {
    const todayIso = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

    const [
      { data: teamMembers },
      { data: activeSessions },
      { data: pendingOvershiftRaw },
      { data: todayTasks },
    ] = await Promise.all([
      supabase.from('profiles').select('id, full_name').eq('role', 'candidate'),
      supabase
        .from('attendance')
        .select('id, user_id, login_time, break_start_time, break_duration_seconds, profiles(full_name)')
        .is('logout_time', null),
      supabase
        .from('overshift_requests')
        .select('id, user_id, request_date, request_type, reason, status, profiles(full_name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
      supabase
        .from('daily_tasks')
        .select('id, status, admin_feedback, task_date')
        .eq('task_date', todayIso),
    ])

    const workingNowCount = activeSessions?.length || 0
    const onBreakCount = activeSessions?.filter((s) => s.break_start_time).length || 0
    const todayTasksSubmitted = todayTasks?.length || 0
    const unreviewedTasksCount = todayTasks?.filter((t) => !t.admin_feedback).length || 0

    const pendingOvershift = (pendingOvershiftRaw || []).map((o: any) => {
      const p = Array.isArray(o.profiles) ? o.profiles[0] : o.profiles
      return {
        ...o,
        candidateName: p?.full_name || 'Team Member',
      }
    })

    return (
      <SupervisorDashboard
        totalTeamMembers={teamMembers?.length || 0}
        workingNowCount={workingNowCount}
        onBreakCount={onBreakCount}
        activeSessions={activeSessions || []}
        pendingOvershiftRequests={pendingOvershift}
        todayTasksSubmitted={todayTasksSubmitted}
        unreviewedTasksCount={unreviewedTasksCount}
      />
    )
  }

  // 4. DEDICATED AUDITOR & COMPLIANCE DASHBOARD
  if (role === 'auditor') {
    const [
      { count: totalAttendanceCount },
      { data: allAttendance },
      { data: autoCutoffs },
      { data: paidShifts },
    ] = await Promise.all([
      adminClient.from('attendance').select('id', { count: 'exact', head: true }),
      adminClient.from('attendance').select('id, login_time, logout_time'),
      adminClient.from('attendance').select('id').eq('is_auto_cutoff', true),
      adminClient.from('attendance').select('payout_amount').eq('payment_status', 'paid'),
    ])

    let completedCount = 0
    let incompleteCount = 0
    let totalMs = 0

    allAttendance?.forEach((r) => {
      if (r.logout_time) {
        completedCount++
        totalMs += new Date(r.logout_time).getTime() - new Date(r.login_time).getTime()
      } else {
        incompleteCount++
      }
    })

    const totalHours = Math.floor(totalMs / (1000 * 60 * 60))
    const totalDisbursed = paidShifts?.reduce((acc, s) => acc + (Number(s.payout_amount) || 0), 0) || 0

    return (
      <AuditorDashboard
        totalAttendanceRecords={totalAttendanceCount || 0}
        completedShiftsCount={completedCount}
        incompleteShiftsCount={incompleteCount}
        autoCutoffCount={autoCutoffs?.length || 0}
        totalDisbursedPayroll={Math.round(totalDisbursed * 100) / 100}
        totalWeeklyHours={`${totalHours}h`}
      />
    )
  }

  // 5. DEFAULT / ORG ADMIN DASHBOARD (admin)
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

  const candidateDurationsMap: Record<string, number> = {}
  candidates?.forEach((c) => {
    candidateDurationsMap[c.id] = 0
  })

  weekRecords?.forEach((r) => {
    if (r.logout_time && candidateDurationsMap[r.user_id] !== undefined) {
      candidateDurationsMap[r.user_id] += Math.max(
        0,
        new Date(r.logout_time).getTime() - new Date(r.login_time).getTime()
      )
    }
  })

  const candidateBreakdowns = (candidates || []).map((c) => {
    const totalMs = candidateDurationsMap[c.id] || 0
    const targetMs = 40 * 60 * 60 * 1000 // 40 hours target
    const percentOfTarget = Math.min(100, Math.round((totalMs / targetMs) * 100))
    const userCompletedCount = (weekRecords || []).filter((r) => r.user_id === c.id && r.logout_time).length
    return {
      id: c.id,
      name: c.full_name,
      totalMs,
      formattedDuration: formatDurationMs(totalMs),
      completedCount: userCompletedCount,
      percentOfTarget,
    }
  })

  return (
    <>
      <LiveTabTitle count={workingNowCount} />
      <RealtimeAttendanceListener />

      {/* DEDICATED MOBILE VIEW (< 768px) */}
      <div className="md:hidden">
        <MobileAdminDashboard
          totalCandidates={totalCandidates}
          workingNowCount={workingNowCount}
          todayRecordsCount={todayRecordsCount}
          thisWeekDuration={thisWeekDuration}
          dailyData={dailyData}
          candidateBreakdowns={candidateBreakdowns}
          completedCount={completedCount}
          incompleteCount={incompleteCount}
          activeSessions={activeSessions || []}
        />
      </div>

      {/* DESKTOP VIEW (>= 768px) */}
      <div className="hidden md:flex flex-col gap-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="outlined" className="p-4 rounded-3xl flex flex-col justify-between border-[var(--md-sys-color-outline-variant)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">Total Workforce</span>
              <div className="w-8 h-8 rounded-full bg-blue-500/15 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black font-mono text-[var(--md-sys-color-on-surface)]">{totalCandidates}</span>
              <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">Enrolled Candidates</span>
            </div>
          </Card>

          <Card variant="outlined" className="p-4 rounded-3xl flex flex-col justify-between border-[var(--md-sys-color-outline-variant)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">Working Now</span>
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black font-mono text-emerald-600 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                {workingNowCount}
              </span>
              <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">Active Live Sessions</span>
            </div>
          </Card>

          <Card variant="outlined" className="p-4 rounded-3xl flex flex-col justify-between border-[var(--md-sys-color-outline-variant)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">Today&apos;s Records</span>
              <div className="w-8 h-8 rounded-full bg-purple-500/15 text-purple-600 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black font-mono text-[var(--md-sys-color-on-surface)]">{todayRecordsCount}</span>
              <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">Shifts Logged Today</span>
            </div>
          </Card>

          <Card variant="outlined" className="p-4 rounded-3xl flex flex-col justify-between border-[var(--md-sys-color-outline-variant)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">Total Week Hours</span>
              <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black font-mono text-[var(--md-sys-color-on-surface)]">{thisWeekDuration}</span>
              <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">{completedCount} shifts completed</span>
            </div>
          </Card>
        </div>

        {/* Analytics Charts */}
        <DashboardAnalyticsCharts
          dailyData={dailyData}
          candidateBreakdowns={candidateBreakdowns}
          completedCount={completedCount}
          workingNowCount={workingNowCount}
          incompleteCount={incompleteCount}
        />

        {/* Quick Management Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/candidates">
            <Card variant="outlined" className="p-4 rounded-2xl hover:bg-[var(--md-sys-color-surface-container)] transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">Candidates Management</p>
                  <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">Add or edit employee profiles</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)]" />
            </Card>
          </Link>

          <Link href="/admin/shifts">
            <Card variant="outlined" className="p-4 rounded-2xl hover:bg-[var(--md-sys-color-surface-container)] transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">Shift Templates</p>
                  <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">Manage rosters and hours</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)]" />
            </Card>
          </Link>

          <Link href="/admin/payroll">
            <Card variant="outlined" className="p-4 rounded-2xl hover:bg-[var(--md-sys-color-surface-container)] transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">Payroll Settlements</p>
                  <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">Review and disburse wages</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)]" />
            </Card>
          </Link>
        </div>
      </div>
    </>
  )
}
