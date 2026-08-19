import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { canAccessAdminPortal } from '@/lib/auth/permissions'
import { PerfectCalendarWorkspace } from '@/components/calendar/PerfectCalendarWorkspace'
import { getUnifiedCalendarFeedAction } from '@/app/actions/calendar'

export const dynamic = 'force-dynamic'

export default async function AdminCalendarPage() {
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

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString().split('T')[0]

  const initialEvents = await getUnifiedCalendarFeedAction({
    startDate: startOfMonth,
    endDate: endOfMonth,
  })

  return (
    <AdminLayout
      adminId={user.id}
      adminName={adminProfile?.full_name || 'Admin'}
      adminAvatarUrl={adminProfile?.avatar_url}
      adminRole={user.role}
    >
      <PerfectCalendarWorkspace
        currentUserId={user.id}
        currentUserRole={user.role}
        initialEvents={initialEvents}
      />
    </AdminLayout>
  )
}
