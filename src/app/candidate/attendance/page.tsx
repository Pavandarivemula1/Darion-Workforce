import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CandidateNav } from '@/components/candidate/CandidateNav'
import { CandidateAttendanceClient } from './CandidateAttendanceClient'

export interface PageProps {
  searchParams: Promise<{
    filter?: string
  }>
}

export default async function CandidateAttendancePage({ searchParams }: PageProps) {
  const params = await searchParams
  const initialFilter = params.filter || 'this_week'

  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'admin') {
    redirect('/admin')
  }

  const supabase = await createClient()

  // Fetch Profile & All User Attendance Records Concurrently (Promise.all)
  const [{ data: profile }, { data: records }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', user.id)
      .single(),
    supabase
      .from('attendance')
      .select('id, user_id, login_time, logout_time, break_start_time, break_duration_seconds, approval_status, rejection_reason, payout_amount, created_at')
      .eq('user_id', user.id)
      .order('login_time', { ascending: false }),
  ])

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex flex-col">
      <CandidateNav userName={profile?.full_name || 'Candidate'} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 pb-24 sm:pb-6 flex flex-col gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Attendance History</h2>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Review your past shifts, work durations, and status logs
          </p>
        </div>

        {/* Client Container for Instant (< 1ms) Tab Switching */}
        <CandidateAttendanceClient
          allRecords={records || []}
          initialFilter={initialFilter}
        />
      </main>
    </div>
  )
}
