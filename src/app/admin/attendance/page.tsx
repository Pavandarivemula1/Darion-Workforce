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
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .eq('id', user.id)
    .single()

  const candidatesPromise = supabase
    .from('profiles')
    .select('id, full_name, hourly_rate, avatar_url, shift_id')
    .eq('role', 'candidate')

  const shiftsPromise = supabase
    .from('shifts')
    .select('*')

  let attendanceQuery = supabase
    .from('attendance')
    .select('id, user_id, login_time, logout_time, break_start_time, break_duration_seconds, approval_status, rejection_reason, payout_amount, admin_notes, is_auto_cutoff, created_at, profiles(full_name, avatar_url, shift_id)')
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

  const activeSessionsPromise = supabase
    .from('attendance')
    .select('id, user_id, login_time, logout_time, break_start_time, break_duration_seconds, approval_status, rejection_reason, payout_amount, admin_notes, is_auto_cutoff, created_at, profiles(full_name, avatar_url, shift_id)')
    .is('logout_time', null)
    .order('login_time', { ascending: false })

  // Execute All Queries Concurrently (Promise.all)
  const [{ data: candidates }, { data: shifts }, { data: attendanceData }, { data: activeSessionsData }, { data: overshiftsData }] = await Promise.all([
    candidatesPromise,
    shiftsPromise,
    attendanceQuery,
    activeSessionsPromise,
    supabase
      .from('overshift_requests')
      .select('id, user_id, request_date, request_type, status, created_at, profiles(full_name)')
      .order('created_at', { ascending: false })
  ])

  const mapRecord = (r: any) => {
    const profileObj = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
    return {
      id: r.id,
      user_id: r.user_id,
      login_time: r.login_time,
      logout_time: r.logout_time,
      break_start_time: r.break_start_time,
      break_duration_seconds: r.break_duration_seconds,
      approval_status: (r.approval_status || 'pending') as 'pending' | 'approved' | 'rejected',
      rejection_reason: r.rejection_reason || null,
      payout_amount: r.payout_amount || 0,
      admin_notes: r.admin_notes || null,
      is_auto_cutoff: r.is_auto_cutoff || false,
      created_at: r.created_at,
      candidateName: profileObj?.full_name || 'Unknown Candidate',
      candidateAvatarUrl: profileObj?.avatar_url || null,
      shiftId: profileObj?.shift_id || null,
    }
  }

  const systemRecords = (attendanceData || []).map(mapRecord)
  const activeSessions = (activeSessionsData || []).map(mapRecord)

  const overshiftRecords = (overshiftsData || []).map((r: any) => {
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
    return {
      id: r.id,
      user_id: r.user_id,
      request_date: r.request_date,
      request_type: r.request_type,
      status: r.status,
      created_at: r.created_at,
      candidateName: profile?.full_name || 'Unknown',
      candidateAvatarUrl: profile?.avatar_url || null,
    }
  })

  return (
    <AdminLayout adminId={user.id} adminName={adminProfile?.full_name || 'Admin'} adminAvatarUrl={adminProfile?.avatar_url}>
      <main className="max-w-6xl w-full mx-auto px-2 py-2 sm:p-6">
        <AdminAttendanceClient
          candidates={candidates || []}
          shifts={shifts || []}
          records={systemRecords}
          activeSessions={activeSessions}
          overshiftRequests={overshiftRecords}
        />
      </main>
    </AdminLayout>
  )

}
