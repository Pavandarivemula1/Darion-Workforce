import { createClient } from '@/lib/supabase/server'
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

  // Fetch candidate list for dropdown
  const { data: candidates } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'candidate')

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

  // Query Attendance Records
  let query = supabase
    .from('attendance')
    .select('*, profiles(full_name)')
    .order('login_time', { ascending: false })

  if (candidateId !== 'all') {
    query = query.eq('user_id', candidateId)
  }
  if (rangeStart) {
    query = query.gte('login_time', rangeStart.toISOString())
  }
  if (rangeEnd) {
    query = query.lte('login_time', rangeEnd.toISOString())
  }

  const { data: attendanceData } = await query

  const systemRecords = (attendanceData || []).map(
    (r: {
      id: string
      user_id: string
      login_time: string
      logout_time: string | null
      created_at: string
      profiles: { full_name: string } | null
    }) => ({
      id: r.id,
      user_id: r.user_id,
      login_time: r.login_time,
      logout_time: r.logout_time,
      created_at: r.created_at,
      candidateName: r.profiles?.full_name || 'Unknown Candidate',
    })
  )

  return (
    <AdminLayout adminName={adminProfile.full_name}>
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6">
        <AdminAttendanceClient
          candidates={candidates || []}
          records={systemRecords}
        />
      </main>
    </AdminLayout>
  )
}
