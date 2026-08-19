import { createClient, getCurrentUserFast, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { canAccessAdminPortal } from '@/lib/auth/permissions'
import { AdminFeedbackClient, FeedbackWithCandidate } from '@/components/admin/feedback/AdminFeedbackClient'

export default async function AdminFeedbackPage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  if (!canAccessAdminPortal(user.role)) {
    redirect('/candidate')
  }

  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Concurrently fetch admin profile, feedbacks, profiles, and auth users
  const [
    { data: adminProfile },
    { data: feedbacksData, error: feedbackError },
    { data: candidateProfiles },
    { data: authUsersData },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url')
      .eq('id', user.id)
      .single(),
    supabaseAdmin
      .from('feedbacks')
      .select('id, user_id, type, rating, mood, tags, title, message, status, admin_notes, attendance_id, created_at')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('profiles')
      .select('id, full_name, avatar_url'),
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

  const feedbacksList: FeedbackWithCandidate[] = (feedbacksData || []).map((f: any) => {
    const prof = profileMap.get(f.user_id)
    return {
      id: f.id,
      user_id: f.user_id,
      type: f.type || 'shift',
      rating: f.rating || 5,
      mood: f.mood || null,
      tags: f.tags || [],
      title: f.title || null,
      message: f.message || '',
      status: (f.status || 'new') as 'new' | 'in_review' | 'resolved' | 'dismissed',
      admin_notes: f.admin_notes || null,
      attendance_id: f.attendance_id || null,
      created_at: f.created_at,
      candidateName: prof?.full_name || 'Unknown Candidate',
      candidateEmail: emailMap.get(f.user_id) || '',
      candidateAvatarUrl: prof?.avatar_url || null,
    }
  })

  return (
    <AdminLayout 
      adminId={user.id} 
      adminName={adminProfile?.full_name || 'Admin'} 
      adminAvatarUrl={adminProfile?.avatar_url}
      adminRole={user.role}
    >
      <main className="max-w-7xl w-full mx-auto px-2 py-2 sm:p-6 lg:p-8 flex flex-col gap-2.5 sm:gap-6">
        <AdminFeedbackClient feedbacks={feedbacksList} />
      </main>
    </AdminLayout>
  )
}
