import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import { Suspense } from 'react'
import { LoadingIndicator } from '@/components/ui/LoadingIndicator'
import AdminDashboardContent from '@/components/admin/AdminDashboardContent'

export default async function AdminDashboardPage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'admin') {
    redirect('/candidate')
  }

  const supabase = await createClient()

  // Fetch only what's necessary for the Layout shell
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <AdminLayout adminId={user.id} adminName={adminProfile?.full_name || 'System Admin'} adminAvatarUrl={adminProfile?.avatar_url}>
      <main className="max-w-6xl w-full mx-auto px-2 py-2 sm:p-6 flex flex-col gap-2.5 sm:gap-6">
        {/* Desktop Header Title (>= 768px) */}
        <div className="hidden md:flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h2>
            <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
              Overview of candidate time tracking activity, working sessions, and visual analytics
            </p>
          </div>
          <Link
            href="/admin/candidates"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Manage Candidates</span>
          </Link>
        </div>


        {/* Dashboard Content Streaming */}
        <Suspense
          fallback={
            <div className="flex w-full items-center justify-center p-12">
              <LoadingIndicator size="md" label="Loading metrics and charts..." />
            </div>
          }
        >
          <AdminDashboardContent />
        </Suspense>
      </main>
    </AdminLayout>
  )
}
