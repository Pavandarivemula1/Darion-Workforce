import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminMeetsClient } from '@/components/admin/AdminMeetsClient'
import { getUpcomingMeetings, getPastMeetingsWithRecordings } from '@/app/actions/meet'

export const dynamic = 'force-dynamic'

export default async function AdminMeetsPage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .eq('id', user.id)
    .single()

  if (!adminProfile || adminProfile.role !== 'admin') {
    redirect('/candidate')
  }

  const upcomingMeetings = await getUpcomingMeetings()
  const pastMeetings = await getPastMeetingsWithRecordings()

  return (
    <AdminLayout adminName={adminProfile.full_name} adminAvatarUrl={adminProfile.avatar_url}>
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Video Meets & Collaboration</h2>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
            Host live HD video meetings, share screens, moderate access, record sessions, and chat in real time.
          </p>
        </div>

        <AdminMeetsClient
          initialUpcoming={upcomingMeetings}
          initialPast={pastMeetings}
          adminName={adminProfile.full_name || 'Admin'}
          adminId={user.id}
        />
      </main>
    </AdminLayout>
  )
}
