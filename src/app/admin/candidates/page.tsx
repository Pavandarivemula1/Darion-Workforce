import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { CandidateManagementClient } from './CandidateManagementClient'

export default async function AdminCandidatesPage() {
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

  // Fetch candidate profiles
  const { data: candidateProfiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'candidate')
    .order('created_at', { ascending: true })

  // Fetch active sessions to determine working status
  const { data: activeSessions } = await supabase
    .from('attendance')
    .select('user_id')
    .is('logout_time', null)

  const activeUserIds = new Set(activeSessions?.map((s) => s.user_id) || [])

  const candidateUsers = (candidateProfiles || []).map((c) => ({
    id: c.id,
    full_name: c.full_name,
    role: c.role,
    created_at: c.created_at,
    isWorking: activeUserIds.has(c.id),
  }))

  return (
    <AdminLayout adminName={adminProfile.full_name}>
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6">
        <CandidateManagementClient candidates={candidateUsers} />
      </main>
    </AdminLayout>
  )
}
