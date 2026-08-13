import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CandidateNav } from '@/components/candidate/CandidateNav'
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
    .select('id, full_name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex flex-col">
      <CandidateNav userName={profile?.full_name || 'Candidate'} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 pb-24 sm:pb-6 flex flex-col gap-8">
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
    </div>
  )
}
