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

  const supabase = await createClient()

  // Fetch only what's necessary for the Layout shell
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single()

  if (!adminProfile || adminProfile.role !== 'admin') {
    redirect('/candidate')
  }

  return (
    <AdminLayout adminName={adminProfile.full_name}>
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h2>
            <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
              Overview of candidate time tracking activity, working sessions, and visual analytics
            </p>
          </div>
          <Link
            href="/admin/candidates"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:shadow-[var(--md-sys-elevation-1)] transition-all cursor-pointer"
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
