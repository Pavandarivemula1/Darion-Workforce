import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { canAccessAdminPortal } from '@/lib/auth/permissions'
import { TeamsChatWorkspace } from '@/components/chat/TeamsChatWorkspace'
import { getConversationsListAction } from '@/app/actions/messages'

export const dynamic = 'force-dynamic'

export default async function AdminMessagesPage() {
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

  const conversations = await getConversationsListAction()

  return (
    <AdminLayout
      adminId={user.id}
      adminName={adminProfile?.full_name || 'Admin'}
      adminAvatarUrl={adminProfile?.avatar_url}
      adminRole={user.role}
    >
      <TeamsChatWorkspace
        currentUserId={user.id}
        currentUserName={adminProfile?.full_name || 'Admin'}
        currentUserRole={user.role}
        currentUserAvatar={adminProfile?.avatar_url}
        initialConversations={conversations}
      />
    </AdminLayout>
  )
}
