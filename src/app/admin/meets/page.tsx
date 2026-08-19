import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { canAccessAdminPortal } from '@/lib/auth/permissions'
import { AdminMeetsClient } from '@/components/admin/AdminMeetsClient'
import { getUpcomingMeetings, getPastMeetingsWithRecordings } from '@/app/actions/meet'

export const dynamic = 'force-dynamic'

export default async function AdminMeetsPage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  if (!canAccessAdminPortal(user.role)) {
    redirect('/candidate')
  }

  const supabase = await createClient()

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  const upcomingMeetings = await getUpcomingMeetings()
  const pastMeetings = await getPastMeetingsWithRecordings()

  return (
    <AdminLayout 
      adminId={user.id} 
      adminName={adminProfile?.full_name || 'Admin'} 
      adminAvatarUrl={adminProfile?.avatar_url}
      adminRole={user.role}
    >
      <main className="max-w-6xl w-full mx-auto px-2 py-2 sm:p-6 flex flex-col gap-2.5 sm:gap-6">
        <div className="hidden md:block">
          <h2 className="text-xl sm:text-2xl font-bold">Video Meets & Collaboration</h2>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
            Host live HD video meetings, share screens, moderate access, record sessions, and chat in real time.
          </p>
        </div>


        <AdminMeetsClient
          initialUpcoming={upcomingMeetings}
          initialPast={pastMeetings}
          adminName={adminProfile?.full_name || 'Admin'}
          adminId={user.id}
        />
      </main>
    </AdminLayout>
  )
}
