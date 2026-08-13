import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminAttendanceClient } from './AdminAttendanceClient'

export interface PageProps {
  searchParams: Promise<{
    candidateId?: string
    filter?: string
    startDate?: string
    endDate?: string
  }>
}

export default async function AdminAttendancePage({ searchParams }: PageProps) {
  const params = await searchParams
  const candidateId = params.candidateId || 'all'
  const filter = params.filter || 'this_week'
  const customStart = params.startDate
  const customEnd = params.endDate

  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

  // Calculate Date Filters
  const now = new Date()
  let rangeStart: Date | null = null
  let rangeEnd: Date | null = null

  if (filter === 'today') {
    rangeStart = new Date()
    rangeStart.setHours(0, 0, 0, 0)
  } else if (filter === 'this_week') {
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
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

  // Prepare Concurrent Queries
  const adminProfilePromise = supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single()

  const candidatesPromise = supabase
    .from('profiles')
    .select('id, full_name, hourly_rate')
    .eq('role', 'candidate')

  let attendanceQuery = supabase
    .from('attendance')
    .select('id, user_id, login_time, logout_time, break_start_time, break_duration_seconds, approval_status, rejection_reason, payout_amount, created_at, profiles(full_name)')
    .order('login_time', { ascending: false })

  if (candidateId !== 'all') {
    attendanceQuery = attendanceQuery.eq('user_id', candidateId)
  }
  if (rangeStart) {
    attendanceQuery = attendanceQuery.gte('login_time', rangeStart.toISOString())
  }
  if (rangeEnd) {
    attendanceQuery = attendanceQuery.lte('login_time', rangeEnd.toISOString())
  }

  // Execute All Queries Concurrently (Promise.all)
  const [{ data: adminProfile }, { data: candidates }, { data: attendanceData }, { data: overshiftsData }] = await Promise.all([
    adminProfilePromise,
    candidatesPromise,
    attendanceQuery,
    supabase
      .from('overshift_requests')
      .select('id, user_id, request_date, status, created_at, profiles(full_name)')
      .order('created_at', { ascending: false })
  ])

  if (!adminProfile || adminProfile.role !== 'admin') {
    redirect('/candidate')
  }

  const systemRecords = (attendanceData || []).map((r: {
    id: string
    user_id: string
    login_time: string
    logout_time: string | null
    break_start_time?: string | null
    break_duration_seconds?: number
    approval_status?: 'pending' | 'approved' | 'rejected'
    rejection_reason?: string | null
    payout_amount?: number | null
    created_at: string
    profiles?: { full_name: string } | { full_name: string }[] | null
  }) => {
    const profileObj = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
    return {
      id: r.id,
      user_id: r.user_id,
      login_time: r.login_time,
      logout_time: r.logout_time,
      break_start_time: r.break_start_time,
      break_duration_seconds: r.break_duration_seconds,
      approval_status: r.approval_status || 'pending',
      rejection_reason: r.rejection_reason || null,
      payout_amount: r.payout_amount || 0,
      created_at: r.created_at,
      candidateName: profileObj?.full_name || 'Unknown Candidate',
    }
  })

  const overshiftRecords = (overshiftsData || []).map((r: any) => ({
    id: r.id,
    user_id: r.user_id,
    request_date: r.request_date,
    status: r.status,
    created_at: r.created_at,
    candidateName: (Array.isArray(r.profiles) ? r.profiles[0] : r.profiles)?.full_name || 'Unknown',
  }))

  return (
    <AdminLayout adminName={adminProfile.full_name}>
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6">
        <AdminAttendanceClient
          candidates={candidates || []}
          records={systemRecords}
          overshiftRequests={overshiftRecords}
        />
      </main>
    </AdminLayout>
  )
}
