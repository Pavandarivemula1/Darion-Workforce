import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card } from '@/components/ui/Card'
import { ShieldCheck, Mail, Calendar, Key } from 'lucide-react'

export default async function AdminProfilePage() {
  const supabase = await createClient()

  // Verify Admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .eq('id', user.id)
    .single()

  if (!adminProfile || adminProfile.role !== 'admin') {
    redirect('/candidate')
  }

  return (
    <AdminLayout adminName={adminProfile.full_name}>
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Admin Profile</h2>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
            System administrator details and security credentials
          </p>
        </div>

        <Card variant="elevated" className="border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-6">
          <div className="flex items-center gap-4 pb-4 border-b border-[var(--md-sys-color-outline-variant)]">
            <div className="w-14 h-14 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center font-bold text-xl">
              {adminProfile.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold">{adminProfile.full_name}</h3>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] uppercase tracking-wider mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                System Administrator
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container)] flex flex-col gap-1">
              <span className="text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email:
              </span>
              <span className="font-semibold text-sm truncate">{user.email}</span>
            </div>

            <div className="p-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container)] flex flex-col gap-1">
              <span className="text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" /> User ID:
              </span>
              <span className="font-semibold text-sm truncate">{user.id}</span>
            </div>

            <div className="p-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container)] flex flex-col gap-1">
              <span className="text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Profile Created:
              </span>
              <span className="font-semibold text-sm">
                {new Date(adminProfile.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </Card>
      </main>
    </AdminLayout>
  )
}
