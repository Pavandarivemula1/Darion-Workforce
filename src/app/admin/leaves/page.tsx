import { createClient, getCurrentUserFast, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminLeavesClient, AdminLeaveRecord } from '@/components/admin/leaves/AdminLeavesClient'

export default async function AdminLeavesPage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'admin') {
    redirect('/candidate')
  }

  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Concurrently fetch admin profile, leaves, candidate profiles, and auth users
  const [
    { data: adminProfile },
    { data: leavesData },
    { data: candidateProfiles },
    { data: authUsersData },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url')
      .eq('id', user.id)
      .single(),
    supabaseAdmin
      .from('leaves')
      .select('id, user_id, leave_type, start_date, end_date, total_days, reason, status, admin_notes, created_at')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('profiles')
      .select('id, full_name, avatar_url'),
    supabaseAdmin.auth.admin.listUsers(),
  ])

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

  const leavesList: AdminLeaveRecord[] = (leavesData || []).map((l: any) => {
    const prof = profileMap.get(l.user_id)
    return {
      id: l.id,
      user_id: l.user_id,
      leave_type: l.leave_type || 'casual',
      start_date: l.start_date,
      end_date: l.end_date,
      total_days: Number(l.total_days || 1),
      reason: l.reason || '',
      status: (l.status || 'pending') as 'pending' | 'approved' | 'rejected' | 'cancelled',
      admin_notes: l.admin_notes || null,
      created_at: l.created_at,
      candidateName: prof?.full_name || 'Unknown Candidate',
      candidateEmail: emailMap.get(l.user_id) || '',
      candidateAvatarUrl: prof?.avatar_url || null,
    }
  })

  return (
    <AdminLayout adminName={adminProfile?.full_name || 'Admin'} adminAvatarUrl={adminProfile?.avatar_url}>
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <AdminLeavesClient leaves={leavesList} />
      </main>
    </AdminLayout>
  )
}
