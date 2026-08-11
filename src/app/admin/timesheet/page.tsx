import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { getWeekBoundaries } from '@/lib/utils/timesheet'
import { TimesheetClientView } from './TimesheetClientView'

export interface PageProps {
  searchParams: Promise<{
    week?: string
  }>
}

export default async function AdminTimesheetPage({ searchParams }: PageProps) {
  const params = await searchParams
  const weekParam = params.week || ''

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

  // Calculate week boundaries in Asia/Kolkata
  const referenceDate = weekParam ? new Date(weekParam) : new Date()
  const { startOfWeek, endOfWeek } = getWeekBoundaries(referenceDate)

  // Fetch Candidates
  const { data: candidates } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'candidate')
    .order('created_at', { ascending: true })

  // Fetch Attendance Records for the week
  const { data: records } = await supabase
    .from('attendance')
    .select('*')
    .gte('login_time', startOfWeek.toISOString())
    .lte('login_time', endOfWeek.toISOString())
    .order('login_time', { ascending: true })

  const referenceDateIso = referenceDate.toISOString().split('T')[0]

  return (
    <AdminLayout adminName={adminProfile.full_name}>
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Weekly Timesheet</h2>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
            Weekly working duration matrix per candidate formatted in Asia/Kolkata timezone
          </p>
        </div>

        <TimesheetClientView
          candidates={candidates || []}
          records={records || []}
          referenceDateIso={referenceDateIso}
        />
      </main>
    </AdminLayout>
  )
}
