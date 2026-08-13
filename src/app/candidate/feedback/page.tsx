import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CandidateLayout } from '@/components/candidate/CandidateLayout'
import { CandidateFeedbackClient } from '@/components/candidate/CandidateFeedbackClient'

export default async function CandidateFeedbackPage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'admin') {
    redirect('/admin/feedback')
  }

  const supabase = await createClient()

  // Fetch candidate profile for layout header
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  // Fetch candidate feedbacks
  const { data: feedbacks } = await supabase
    .from('feedbacks')
    .select('id, type, rating, mood, tags, title, message, status, admin_notes, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <CandidateLayout
      candidateName={profile?.full_name || 'Candidate'}
      candidateAvatarUrl={profile?.avatar_url || undefined}
    >
      <CandidateFeedbackClient feedbacks={feedbacks || []} />
    </CandidateLayout>
  )
}
