import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CandidateLayout } from '@/components/candidate/CandidateLayout'
import { TeamsChatWorkspace } from '@/components/chat/TeamsChatWorkspace'
import { getConversationsListAction } from '@/app/actions/messages'

export const dynamic = 'force-dynamic'

export default async function CandidateMessagesPage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

  const { data: candidateProfile } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  const conversations = await getConversationsListAction()

  return (
    <CandidateLayout
      candidateId={user.id}
      candidateName={candidateProfile?.full_name || 'Candidate'}
      candidateAvatarUrl={candidateProfile?.avatar_url}
    >
      <TeamsChatWorkspace
        currentUserId={user.id}
        currentUserName={candidateProfile?.full_name || 'Candidate'}
        currentUserRole={user.role}
        currentUserAvatar={candidateProfile?.avatar_url}
        initialConversations={conversations}
      />
    </CandidateLayout>
  )
}
