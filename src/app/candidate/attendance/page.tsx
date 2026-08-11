import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CandidateNav } from '@/components/candidate/CandidateNav'
import { AttendanceFilters } from '@/components/candidate/AttendanceFilters'
import { AttendanceTable } from '@/components/candidate/AttendanceTable'
import { Card } from '@/components/ui/Card'
import { Clock, CalendarRange, CheckCircle } from 'lucide-react'

export interface PageProps {
  searchParams: Promise<{
    filter?: string
    startDate?: string
    endDate?: string
  }>
}

export default async function CandidateAttendancePage({ searchParams }: PageProps) {
  const params = await searchParams
  const filter = params.filter || 'this_week'
  const customStart = params.startDate
  const customEnd = params.endDate

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

  // Calculate Date Range Filters
  const now = new Date()
  let rangeStart: Date | null = null
  let rangeEnd: Date | null = null

  if (filter === 'this_week') {
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday as start of week
    rangeStart = new Date(now.setDate(diff))
    rangeStart.setHours(0, 0, 0, 0)
  } else if (filter === 'last_week') {
    const day = now.getDay()
    const diff = now.getDate() - day - 6
    rangeStart = new Date(now.setDate(diff))
    rangeStart.setHours(0, 0, 0, 0)
    rangeEnd = new Date(rangeStart)
    rangeEnd.setDate(rangeEnd.getDate() + 6)
    rangeEnd.setHours(23, 59, 59, 999)
  } else if (filter === 'this_month') {
    rangeStart = new Date(now.getFullYear(), now.getMonth(), 1)
  } else if (filter === 'custom' && (customStart || customEnd)) {
    if (customStart) rangeStart = new Date(customStart)
    if (customEnd) {
      rangeEnd = new Date(customEnd)
      rangeEnd.setHours(23, 59, 59, 999)
    }
  }

  // Build Supabase Query
  let query = supabase
    .from('attendance')
    .select('*')
    .eq('user_id', user.id)
    .order('login_time', { ascending: false })

  if (rangeStart) {
    query = query.gte('login_time', rangeStart.toISOString())
  }
  if (rangeEnd) {
    query = query.lte('login_time', rangeEnd.toISOString())
  }

  const { data: records } = await query

  // Calculate summary metrics
  const totalShifts = records?.length || 0
  const completedShifts = records?.filter((r) => r.logout_time).length || 0

  let totalDurationMs = 0
  records?.forEach((r) => {
    if (r.login_time && r.logout_time) {
      totalDurationMs += new Date(r.logout_time).getTime() - new Date(r.login_time).getTime()
    }
  })

  const totalHours = Math.floor(totalDurationMs / (1000 * 60 * 60))
  const totalMins = Math.floor((totalDurationMs % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex flex-col">
      <CandidateNav userName={profile?.full_name || user.email} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Attendance History</h2>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Review your past shifts, work durations, and status logs
          </p>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card variant="elevated" className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
              <CalendarRange className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Total Shifts</p>
              <p className="text-lg font-bold">{totalShifts}</p>
            </div>
          </Card>

          <Card variant="elevated" className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Completed Shifts</p>
              <p className="text-lg font-bold">{completedShifts}</p>
            </div>
          </Card>

          <Card variant="elevated" className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Total Hours Worked</p>
              <p className="text-lg font-bold font-mono">{totalHours}h {totalMins}m</p>
            </div>
          </Card>
        </div>

        {/* Date Filter Bar */}
        <AttendanceFilters />

        {/* Full History Table */}
        <AttendanceTable records={records || []} />
      </main>
    </div>
  )
}
