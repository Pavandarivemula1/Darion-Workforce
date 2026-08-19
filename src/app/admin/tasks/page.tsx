import { createClient, getCurrentUserFast, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { canAccessAdminPortal } from '@/lib/auth/permissions'
import { AdminTasksClient, CandidateInfo } from '@/components/admin/tasks/AdminTasksClient'
import { AdminTaskItem } from '@/components/admin/tasks/TaskFeedbackModal'

export default async function AdminTasksPage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  if (!canAccessAdminPortal(user.role)) {
    redirect('/candidate')
  }

  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Concurrently fetch admin profile, candidate profiles, active attendance sessions, and all tasks
  const [
    { data: adminProfile },
    { data: candidateProfiles },
    { data: activeSessions },
    { data: tasksData },
    { data: authUsersData },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url')
      .eq('id', user.id)
      .single(),
    supabaseAdmin
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .order('full_name', { ascending: true }),
    supabaseAdmin
      .from('attendance')
      .select('user_id')
      .is('logout_time', null),
    supabaseAdmin
      .from('daily_tasks')
      .select('*')
      .order('created_at', { ascending: false }),
    supabaseAdmin.auth.admin.listUsers(),
  ])

  // Build maps for profile name/avatar and auth emails
  const profileMap = new Map<string, { full_name: string; avatar_url: string | null }>()
  if (candidateProfiles) {
    candidateProfiles.forEach((p) => {
      profileMap.set(p.id, { full_name: p.full_name, avatar_url: p.avatar_url })
    })
  }

  const emailMap = new Map<string, string>()
  if (authUsersData?.users) {
    authUsersData.users.forEach((u) => {
      if (u.email) emailMap.set(u.id, u.email)
    })
  }

  const candidatesList: CandidateInfo[] = (candidateProfiles || []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    avatar_url: p.avatar_url,
    email: emailMap.get(p.id) || null,
    role: p.role,
  }))

  const activeShiftUserIds = (activeSessions || []).map((s) => s.user_id)

  const tasksList: AdminTaskItem[] = (tasksData || []).map((t: any) => {
    const prof = profileMap.get(t.user_id)
    return {
      id: t.id,
      user_id: t.user_id,
      candidate_name: prof?.full_name || 'Candidate',
      candidate_avatar: prof?.avatar_url || null,
      candidate_email: emailMap.get(t.user_id) || null,
      attendance_id: t.attendance_id || null,
      task_date: t.task_date,
      title: t.title,
      description: t.description || null,
      project_name: t.project_name || 'General',
      status: t.status || 'completed',
      priority: t.priority || 'medium',
      hours_spent: Number(t.hours_spent || 0),
      proof_url: t.proof_url || null,
      blocker_description: t.blocker_description || null,
      admin_feedback: t.admin_feedback || null,
      created_at: t.created_at,
      updated_at: t.updated_at,
    }
  })

  return (
    <AdminLayout
      adminId={user.id}
      adminName={adminProfile?.full_name || 'Admin'}
      adminAvatarUrl={adminProfile?.avatar_url}
      adminRole={user.role}
    >
      <main className="max-w-7xl w-full mx-auto px-2 py-2 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-6">
        <div className="hidden md:block">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
            Daily Task Reporting Matrix
          </h2>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
            Monitor which candidate completed which task, track deliverables, investigate blockers, and provide guidance
          </p>
        </div>

        <AdminTasksClient
          initialTasks={tasksList}
          candidates={candidatesList}
          activeShiftUserIds={activeShiftUserIds}
        />
      </main>
    </AdminLayout>
  )
}
