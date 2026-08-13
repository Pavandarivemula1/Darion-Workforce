import { LoadingIndicator } from '@/components/ui/LoadingIndicator'
import { AdminLayout } from '@/components/admin/AdminLayout'

export default function AdminLoading() {
  return (
    <AdminLayout>
      <div className="flex h-[60vh] w-full items-center justify-center">
        <LoadingIndicator size="lg" label="Loading Admin Dashboard..." />
      </div>
    </AdminLayout>
  )
}
