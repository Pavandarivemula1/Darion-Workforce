import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CandidateLayout } from '@/components/candidate/CandidateLayout'
import { CandidateProfileClient } from './CandidateProfileClient'

export default async function CandidateProfilePage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'admin') {
    redirect('/admin')
  }

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, hourly_rate, created_at')
    .eq('id', user.id)
    .single()

  return (
    <CandidateLayout candidateName={profile?.full_name || 'Candidate'}>
      <main className="max-w-5xl w-full mx-auto flex flex-col gap-6">
        <CandidateProfileClient
          profile={
            profile || {
              id: user.id,
              full_name: 'Candidate',
              role: 'candidate',
              created_at: new Date().toISOString(),
            }
          }
          email=""
        />
      </main>
    </CandidateLayout>
  )
}
