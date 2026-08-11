import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
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

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Verify Admin Authorization
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!adminProfile || adminProfile.role !== 'admin') {
    redirect('/candidate')
  }

  // 1. Query candidate count
  const { data: candidates } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'candidate')

  const totalCandidates = candidates?.length || 0

  // 2. Query active sessions ("Working Now")
  const { data: activeSessions } = await supabase
    .from('attendance')
    .select('*, profiles(full_name)')
    .is('logout_time', null)

  const workingNowCount = activeSessions?.length || 0

  // 3. Query Today's records count
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const { data: todayRecords } = await supabase
    .from('attendance')
    .select('*')
    .gte('login_time', startOfToday.toISOString())

  const todayRecordsCount = todayRecords?.length || 0

  // 4. Query This Week total hours
  const now = new Date()
  const day = now.getDay()
  const diffToMon = now.getDate() - day + (day === 0 ? -6 : 1)
  const startOfWeek = new Date(now.setDate(diffToMon))
  startOfWeek.setHours(0, 0, 0, 0)

  const { data: weekRecords } = await supabase
    .from('attendance')
    .select('*')
    .gte('login_time', startOfWeek.toISOString())

  let totalWeekMs = 0
  weekRecords?.forEach((r) => {
    if (r.login_time && r.logout_time) {
      totalWeekMs += new Date(r.logout_time).getTime() - new Date(r.login_time).getTime()
    } else if (r.login_time && !r.logout_time) {
      totalWeekMs += new Date().getTime() - new Date(r.login_time).getTime()
    }
  })

  const weekHours = Math.floor(totalWeekMs / (1000 * 60 * 60))
  const weekMins = Math.floor((totalWeekMs % (1000 * 60 * 60)) / (1000 * 60))
  const thisWeekDuration = `${weekHours}h ${weekMins.toString().padStart(2, '0')}m`

  return (
    <AdminLayout adminName={adminProfile.full_name}>
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h2>
            <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
              Overview of candidate time tracking activity and working sessions
            </p>
          </div>
          <Link
            href="/admin/candidates"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:shadow-[var(--md-sys-elevation-1)] transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Manage Candidates</span>
          </Link>
        </div>

        {/* 4 MD3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Candidates */}
          <Card variant="elevated" className="flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                Candidates
              </span>
              <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold">{totalCandidates}</span>
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] ml-2">/ 2 Max</span>
            </div>
          </Card>

          {/* Card 2: Working Now */}
          <Card variant="elevated" className="flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                Working Now
              </span>
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold">{workingNowCount}</span>
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] ml-2">Active Shifts</span>
            </div>
          </Card>

          {/* Card 3: Today's Records */}
          <Card variant="elevated" className="flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                Today&apos;s Records
              </span>
              <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold">{todayRecordsCount}</span>
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] ml-2">Logged Today</span>
            </div>
          </Card>

          {/* Card 4: This Week */}
          <Card variant="elevated" className="flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                This Week
              </span>
              <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold font-mono">{thisWeekDuration}</span>
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">Combined Hours</span>
            </div>
          </Card>
        </div>

        {/* Live Working Candidates Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="outlined" className="flex flex-col gap-4 border border-[var(--md-sys-color-outline-variant)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--md-sys-color-outline-variant)]">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                Active Sessions Right Now
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                {workingNowCount} Working
              </span>
            </div>

            {activeSessions && activeSessions.length > 0 ? (
              <div className="flex flex-col divide-y divide-[var(--md-sys-color-outline-variant)]">
                {activeSessions.map((session: { id: string; login_time: string; profiles: { full_name: string } | null }) => (
                  <div key={session.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{session.profiles?.full_name || 'Candidate'}</p>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                        Login: {new Date(session.login_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      In Progress
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8 opacity-40" />
                No candidates are currently checked in.
              </div>
            )}
          </Card>

          {/* Quick Links Card */}
          <Card variant="outlined" className="flex flex-col gap-4 border border-[var(--md-sys-color-outline-variant)]">
            <div className="pb-3 border-b border-[var(--md-sys-color-outline-variant)]">
              <h3 className="text-base font-bold">Admin Controls</h3>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/admin/candidates"
                className="p-4 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold">Candidate Roster</p>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">View profiles and manage candidate credentials</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
              </Link>

              <Link
                href="/admin/attendance"
                className="p-4 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold">System Attendance Records</p>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Filter attendance logs by candidate, date, or week</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
              </Link>

              <Link
                href="/admin/timesheet"
                className="p-4 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold">Weekly Timesheet Matrix</p>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Aggregate total working hours per candidate</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </AdminLayout>
  )
}
