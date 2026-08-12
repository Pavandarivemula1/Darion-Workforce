import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { CandidateManagementClient } from './CandidateManagementClient'

export default async function AdminCandidatesPage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'admin') {
    redirect('/candidate')
  }

  const supabase = await createClient()

  // Execute all queries concurrently (Promise.all)
  const [{ data: adminProfile }, { data: candidateProfiles }, { data: activeSessions }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', user.id)
      .single(),
    supabase
      .from('profiles')
      .select('id, full_name, role, created_at, hourly_rate')
      .eq('role', 'candidate')
      .order('created_at', { ascending: true }),
    supabase
      .from('attendance')
      .select('user_id')
      .is('logout_time', null),
  ])

  const activeUserIds = new Set(activeSessions?.map((s) => s.user_id) || [])

  const candidateUsers = (candidateProfiles || []).map((c) => ({
    id: c.id,
    full_name: c.full_name,
    role: c.role,
    created_at: c.created_at,
    hourly_rate: c.hourly_rate || 0,
    isWorking: activeUserIds.has(c.id),
  }))

  return (
    <AdminLayout adminName={adminProfile?.full_name || 'Admin'}>
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6">
        <CandidateManagementClient candidates={candidateUsers} />
      </main>
    </AdminLayout>
  )
}
