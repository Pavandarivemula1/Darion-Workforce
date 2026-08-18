import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CandidateLayout } from '@/components/candidate/CandidateLayout'
import { CandidateTasksClient } from '@/components/candidate/tasks/CandidateTasksClient'
import { TaskRecord } from '@/components/candidate/tasks/TaskEntryModal'

export default async function CandidateTasksPage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'admin') {
    redirect('/admin/tasks')
  }

  const supabase = await createClient()

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  // Fetch concurrently
  const [
    { data: profile },
    { data: activeSession },
    { data: todaySession },
    { data: tasksData },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', user.id)
      .single(),
    supabase
      .from('attendance')
      .select('id')
      .eq('user_id', user.id)
      .is('logout_time', null)
      .maybeSingle(),
    supabase
      .from('attendance')
      .select('id, login_time, logout_time, break_duration_seconds')
      .eq('user_id', user.id)
      .gte('login_time', startOfToday.toISOString())
      .order('login_time', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  let todayAttendanceHours = 0
  if (todaySession?.logout_time) {
    const gross = new Date(todaySession.logout_time).getTime() - new Date(todaySession.login_time).getTime()
    const net = Math.max(0, gross - (todaySession.break_duration_seconds || 0) * 1000)
    todayAttendanceHours = Math.round((net / (1000 * 60 * 60)) * 10) / 10
  }

  const tasks: TaskRecord[] = (tasksData || []).map((t: any) => ({
    id: t.id,
    user_id: t.user_id,
    attendance_id: t.attendance_id,
    task_date: t.task_date,
    title: t.title,
    description: t.description,
    project_name: t.project_name || 'General',
    status: t.status || 'completed',
    priority: t.priority || 'medium',
    hours_spent: Number(t.hours_spent || 0),
    proof_url: t.proof_url,
    blocker_description: t.blocker_description,
    admin_feedback: t.admin_feedback,
    created_at: t.created_at,
    updated_at: t.updated_at,
  }))

  return (
    <CandidateLayout
      candidateId={user.id}
      candidateName={profile?.full_name || 'Candidate'}
      candidateAvatarUrl={profile?.avatar_url || undefined}
    >
      <main className="max-w-5xl w-full mx-auto flex flex-col gap-5 sm:gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
            Daily Task Reporting
          </h2>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Log what you accomplished, track in-progress work, and report blockers for each shift
          </p>
        </div>

        <CandidateTasksClient
          initialTasks={tasks}
          candidateName={profile?.full_name || 'Candidate'}
          activeAttendanceId={activeSession?.id || null}
          todayAttendanceHours={todayAttendanceHours}
        />
      </main>
    </CandidateLayout>
  )
}
