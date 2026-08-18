import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { getWeekBoundaries, getKolkataDateKey } from '@/lib/utils/timesheet'
import { TimesheetClientView } from './TimesheetClientView'

export interface PageProps {
  searchParams: Promise<{
    week?: string
  }>
}

export default async function AdminTimesheetPage({ searchParams }: PageProps) {
  const params = await searchParams
  const weekParam = params.week || ''

  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'admin') {
    redirect('/candidate')
  }

  const supabase = await createClient()

  // Calculate week boundaries in Asia/Kolkata
  const referenceDate = weekParam ? new Date(weekParam) : new Date()
  const { startOfWeek, endOfWeek } = getWeekBoundaries(referenceDate)

  // Execute All Queries Concurrently (Promise.all)
  const [{ data: adminProfile }, { data: candidates }, { data: records }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url')
      .eq('id', user.id)
      .single(),
    supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .eq('role', 'candidate')
      .order('created_at', { ascending: true }),
    supabase
      .from('attendance')
      .select('id, user_id, login_time, logout_time, break_start_time, break_duration_seconds, created_at')
      .gte('login_time', startOfWeek.toISOString())
      .lte('login_time', endOfWeek.toISOString())
      .order('login_time', { ascending: true }),
  ])

  const referenceDateIso = getKolkataDateKey(referenceDate.toISOString())

  return (
    <AdminLayout adminId={user.id} adminName={adminProfile?.full_name || 'Admin'} adminAvatarUrl={adminProfile?.avatar_url}>
      <main className="max-w-6xl w-full mx-auto px-2 py-2 sm:p-6 flex flex-col gap-2.5 sm:gap-6">
        <div className="hidden md:block">
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
