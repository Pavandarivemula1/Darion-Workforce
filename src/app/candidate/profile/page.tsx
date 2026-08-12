import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CandidateNav } from '@/components/candidate/CandidateNav'
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
    <div className="min-h-screen bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex flex-col">
      <CandidateNav userName={profile?.full_name || 'Candidate'} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 pb-24 sm:pb-6 flex flex-col gap-6">
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
    </div>
  )
}
