import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ResetRequestsClient } from './ResetRequestsClient'

export default async function AdminResetRequestsPage() {
  const user = await getCurrentUserFast()

  if (!user || user.role !== 'admin') {
    redirect('/candidate')
  }

  const supabase = await createClient()
  
  // Also get the admin profile name for the layout
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // Fetch pending requests
  const { data: requests, error } = await supabase
    .from('password_reset_requests')
    .select('*')
    .order('created_at', { ascending: false })

  // Since the migration might not have been applied yet, we handle error gracefully
  const safeRequests = error ? [] : (requests || [])

  return (
    <AdminLayout adminName={adminProfile?.full_name || 'Admin'}>
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        <div>
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
