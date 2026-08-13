import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { SecurityManagementClient } from './SecurityManagementClient'

export default async function AdminSecurityPage() {
  const user = await getCurrentUserFast()

  if (!user || user.role !== 'admin') {
    redirect('/candidate')
  }

  const supabase = await createClient()
  
  // Fetch the admin profile name for the layout
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // Fetch pending MFA reset requests
  const { data: requests, error } = await supabase
    .from('mfa_reset_requests')
    .select('*, profiles!mfa_reset_requests_user_id_fkey(full_name, role)')
    .order('created_at', { ascending: false })

  const safeRequests = error ? [] : (requests || [])

  return (
    <AdminLayout adminName={adminProfile?.full_name || 'Admin'}>
      <main className="max-w-6xl w-full mx-auto flex flex-col gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Security Requests</h2>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
            Manage Multi-Factor Authentication (MFA) reset requests for users who lost their authenticator app.
          </p>
        </div>
        
        {error && (
          <div className="p-4 bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] rounded-md text-sm border border-[var(--md-sys-color-error)]">
            Could not load requests. Have you applied the database migration? Error: {error.message}
          </div>
        )}

        <SecurityManagementClient initialRequests={safeRequests} />
      </main>
    </AdminLayout>
  )
}
