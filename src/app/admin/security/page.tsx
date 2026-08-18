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
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  // Fetch pending MFA reset requests
  const { data: rawRequests, error } = await supabase
    .from('mfa_reset_requests')
    .select('*')
    .order('created_at', { ascending: false })

  let safeRequests: any[] = []

  if (!error && rawRequests && rawRequests.length > 0) {
    const userIds = Array.from(new Set(rawRequests.map((r: any) => r.user_id).filter(Boolean)))
    
    const profileMap = new Map<string, { full_name: string; role: string }>()
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('id', userIds)
      
      if (profiles) {
        profiles.forEach((p) => {
          profileMap.set(p.id, { full_name: p.full_name, role: p.role })
        })
      }
    }

    safeRequests = rawRequests.map((req: any) => ({
      ...req,
      profiles: req.user_id ? profileMap.get(req.user_id) || null : null,
    }))
  }

  return (
    <AdminLayout adminName={adminProfile?.full_name || 'Admin'} adminAvatarUrl={adminProfile?.avatar_url}>
      <main className="max-w-6xl w-full mx-auto px-2 py-2 sm:p-6 flex flex-col gap-2.5 sm:gap-6">
        <div className="hidden md:block">
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
