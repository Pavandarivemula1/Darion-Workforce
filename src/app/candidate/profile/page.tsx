import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CandidateNav } from '@/components/candidate/CandidateNav'
import { CandidateProfileClient } from './CandidateProfileClient'

export default async function CandidateProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, hourly_rate, created_at')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex flex-col">
      <CandidateNav userName={profile?.full_name || user.email} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        <CandidateProfileClient
          profile={
            profile || {
              id: user.id,
              full_name: 'Candidate',
              role: 'candidate',
              created_at: new Date().toISOString(),
            }
          }
          email={user.email || ''}
        />
      </main>
    </div>
  )
}
