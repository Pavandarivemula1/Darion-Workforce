import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { canManageSecurity } from '@/lib/auth/permissions'
import { ResetRequestsClient } from './ResetRequestsClient'

export default async function AdminResetRequestsPage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  if (!canManageSecurity(user.role)) {
    redirect('/admin')
  }

  const supabase = await createClient()
  
  // Also get the admin profile name for the layout
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  // Fetch pending requests
  const { data: requests, error } = await supabase
    .from('password_reset_requests')
    .select('*')
    .order('created_at', { ascending: false })

  // Since the migration might not have been applied yet, we handle error gracefully
  const safeRequests = error ? [] : (requests || [])

  return (
    <AdminLayout 
      adminId={user.id} 
      adminName={adminProfile?.full_name || 'Admin'} 
      adminAvatarUrl={adminProfile?.avatar_url}
      adminRole={user.role}
    >
      <main className="max-w-6xl w-full mx-auto px-2 py-2 sm:p-6 flex flex-col gap-2.5 sm:gap-6">
        <div className="hidden md:block">
          <h2 className="text-xl sm:text-2xl font-bold">Password Reset Requests</h2>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
            Approve or reject candidate password reset requests
          </p>
        </div>

        
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
            Could not load requests. Have you applied the database migration? Error: {error.message}
          </div>
        )}

        <ResetRequestsClient initialRequests={safeRequests} />
      </main>
    </AdminLayout>
  )
}
