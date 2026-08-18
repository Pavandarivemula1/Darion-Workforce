import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CandidateLayout } from '@/components/candidate/CandidateLayout'
import { Suspense } from 'react'
import { LoadingIndicator } from '@/components/ui/LoadingIndicator'
import CandidateDashboardContent from '@/components/candidate/CandidateDashboardContent'

export default async function CandidateDashboardPage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'admin') {
    redirect('/admin')
  }

  const supabase = await createClient()

  // Fetch only what's necessary for the Layout shell
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <CandidateLayout candidateId={user.id} candidateName={profile?.full_name || 'Candidate'} candidateAvatarUrl={profile?.avatar_url}>
      <main className="max-w-5xl w-full mx-auto flex flex-col gap-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Welcome back, {profile?.full_name || 'Candidate'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Track your daily attendance, shift progress, and weekly performance
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex w-full items-center justify-center p-12">
              <LoadingIndicator size="md" label="Loading attendance data..." />
            </div>
          }
        >
          <CandidateDashboardContent userId={user.id} />
        </Suspense>
      </main>
    </CandidateLayout>
  )
}
