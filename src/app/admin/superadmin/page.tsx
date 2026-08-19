import { createClient, createAdminClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { isSuperAdmin } from '@/lib/auth/permissions'
import { SuperAdminClient } from '@/components/admin/superadmin/SuperAdminClient'
import {
  getPlatformTelemetryAction,
  getSystemSettingsAction,
  getAuditLogsAction,
} from '@/app/actions/superadmin'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SuperAdmin Control Console',
  description: 'Global root platform governance, real-time database telemetry, and security audit trail.',
}

export default async function SuperAdminPage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  // Strict SuperAdmin route authorization
  if (!isSuperAdmin(user.role)) {
    redirect('/admin')
  }

  const supabase = await createClient()
  const adminClient = createAdminClient()

  // Concurrently fetch profile, telemetry, settings, audit logs, and users
  const [
    { data: adminProfile },
    telemetryRes,
    settingsRes,
    auditLogsRes,
    { data: profilesList },
    { data: authUsersList },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url')
      .eq('id', user.id)
      .single(),
    getPlatformTelemetryAction(),
    getSystemSettingsAction(),
    getAuditLogsAction({ limit: 100 }),
    adminClient
      .from('profiles')
      .select('id, full_name, role, hourly_rate, avatar_url, created_at')
      .order('created_at', { ascending: false }),
    adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])

  const emailMap = new Map<string, string>()
  if (authUsersList?.users) {
    authUsersList.users.forEach((u) => {
      if (u.email) emailMap.set(u.id, u.email)
    })
  }

  const usersWithEmail = (profilesList || []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    role: p.role || 'candidate',
    email: emailMap.get(p.id) || '',
    hourly_rate: p.hourly_rate || 0,
    avatar_url: p.avatar_url,
    created_at: p.created_at,
  }))

  return (
    <AdminLayout
      adminId={user.id}
      adminName={adminProfile?.full_name || 'Super Admin'}
      adminAvatarUrl={adminProfile?.avatar_url}
      adminRole={user.role}
    >
      <main className="max-w-7xl w-full mx-auto px-2 py-2 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-6">
        <SuperAdminClient
          initialTelemetry={telemetryRes.telemetry}
          initialSettings={settingsRes.settings || {}}
          initialLogs={auditLogsRes.logs || []}
          initialUsers={usersWithEmail}
          adminId={user.id}
          adminName={adminProfile?.full_name || 'Super Admin'}
        />
      </main>
    </AdminLayout>
  )
}
