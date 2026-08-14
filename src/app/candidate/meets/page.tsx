import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CandidateLayout } from '@/components/candidate/CandidateLayout'
import { CandidateMeetsClient } from '@/components/candidate/CandidateMeetsClient'
import { CandidateBetaGate } from '@/components/candidate/CandidateBetaGate'
import { getUpcomingMeetings, getPastMeetingsWithRecordings } from '@/app/actions/meet'
import { checkUserMeetsBetaAccess } from '@/lib/meet/beta'

export const dynamic = 'force-dynamic'

export default async function CandidateMeetsPage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'admin') {
    redirect('/admin/meets')
  }

  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  const email = authUser?.email

  const { data: candidateProfile } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url, is_beta_tester')
    .eq('id', user.id)
    .single()

  const betaAccess = checkUserMeetsBetaAccess({
    role: user.role,
    email: email,
    isBetaTester: candidateProfile?.is_beta_tester,
  })

  const upcomingMeetings = await getUpcomingMeetings()
  const pastMeetings = await getPastMeetingsWithRecordings()

  return (
    <CandidateLayout candidateName={candidateProfile?.full_name || 'Candidate'} candidateAvatarUrl={candidateProfile?.avatar_url}>
      <main className="max-w-5xl w-full mx-auto flex flex-col gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Video Meets & Sessions</h2>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
            Join video calls, team syncs, training sessions, and access recorded past meetings.
          </p>
        </div>

        {betaAccess.hasAccess ? (
          <CandidateMeetsClient
            upcomingMeetings={upcomingMeetings}
            pastMeetings={pastMeetings}
            candidateName={candidateProfile?.full_name || 'Candidate'}
            candidateId={user.id}
          />
        ) : (
          <CandidateBetaGate
            candidateName={candidateProfile?.full_name || 'Candidate'}
            candidateEmail={email}
          />
        )}
      </main>
    </CandidateLayout>
  )
}
