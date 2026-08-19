import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { canManageBranding } from '@/lib/auth/permissions'
import { BrandingStudioClient } from '@/components/admin/settings/BrandingStudioClient'
import { getTenantBranding } from '@/lib/branding/getBranding'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Branding & White-Label Studio',
  description: 'Enterprise customization of organization logos, MD3 colors, payslips, and custom domains.',
}

export default async function AdminBrandingPage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  if (!canManageBranding(user.role)) {
    redirect('/admin')
  }

  const supabase = await createClient()

  // Fetch admin profile safely
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  const branding = await getTenantBranding()

  return (
    <AdminLayout
      adminId={user.id}
      adminName={profile?.full_name || 'System Admin'}
      adminAvatarUrl={profile?.avatar_url}
      adminRole={user.role}
    >
      <BrandingStudioClient initialBranding={branding} />
    </AdminLayout>
  )
}
