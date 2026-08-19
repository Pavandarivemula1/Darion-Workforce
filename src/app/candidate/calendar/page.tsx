import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CandidateLayout } from '@/components/candidate/CandidateLayout'
import { PerfectCalendarWorkspace } from '@/components/calendar/PerfectCalendarWorkspace'
import { getUnifiedCalendarFeedAction } from '@/app/actions/calendar'

export const dynamic = 'force-dynamic'

export default async function CandidateCalendarPage() {
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

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString().split('T')[0]

  const initialEvents = await getUnifiedCalendarFeedAction({
    startDate: startOfMonth,
    endDate: endOfMonth,
    candidateId: user.id,
  })

  return (
    <CandidateLayout
      candidateId={user.id}
      candidateName={candidateProfile?.full_name || 'Candidate'}
      candidateAvatarUrl={candidateProfile?.avatar_url}
    >
      <PerfectCalendarWorkspace
        currentUserId={user.id}
        currentUserRole={user.role}
        initialEvents={initialEvents}
      />
    </CandidateLayout>
  )
}
