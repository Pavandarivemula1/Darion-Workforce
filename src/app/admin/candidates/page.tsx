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

  // Execute queries concurrently
  let [{ data: adminProfile }, { data: candidateProfiles, error: candidateError }, { data: activeSessions }, { data: shiftsData }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url')
      .eq('id', user.id)
      .single(),
    supabase
      .from('profiles')
      .select('id, full_name, role, created_at, hourly_rate, avatar_url, phone_number, address, id_number, shift_id')
      .eq('role', 'candidate')
      .order('created_at', { ascending: true }),
    supabase
      .from('attendance')
      .select('user_id')
      .is('logout_time', null),
    supabase
      .from('shifts')
      .select('id, name, start_time, end_time, is_default, is_overnight, grace_period_mins, auto_logout_enabled')
      .order('is_default', { ascending: false })
      .order('start_time', { ascending: true }),
  ])

  // Resilient fallback if shift_id column is not yet migrated in database
  let candidateProfilesList: any[] = candidateProfiles || []
  if (candidateError || !candidateProfiles) {
    const { data: fallbackProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at, hourly_rate, avatar_url, phone_number, address, id_number')
      .eq('role', 'candidate')
      .order('created_at', { ascending: true })
    candidateProfilesList = fallbackProfiles || []
  }

  const activeUserIds = new Set(activeSessions?.map((s) => s.user_id) || [])

  const candidateUsers = candidateProfilesList.map((c: any) => ({
    id: c.id,
    full_name: c.full_name,
    role: c.role,
    created_at: c.created_at,
    hourly_rate: c.hourly_rate || 0,
    avatar_url: c.avatar_url,
    phone_number: c.phone_number,
    address: c.address,
    id_number: c.id_number,
    shift_id: c.shift_id || null,
    isWorking: activeUserIds.has(c.id),
  }))

  const shifts = shiftsData || []

  return (
    <AdminLayout adminName={adminProfile?.full_name || 'Admin'} adminAvatarUrl={adminProfile?.avatar_url}>
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6">
        <CandidateManagementClient candidates={candidateUsers} shifts={shifts} />
      </main>
    </AdminLayout>
  )
}
