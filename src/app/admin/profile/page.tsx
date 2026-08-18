import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card } from '@/components/ui/Card'
import { ShieldCheck, Mail, Calendar, Key, Phone, MapPin, FileText } from 'lucide-react'
import { ProfileAvatarZoom } from '@/components/ui/ProfileAvatarZoom'
import { MobileAdminProfile } from '@/components/admin/profile/MobileAdminProfile'

export default async function AdminProfilePage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'admin') {
    redirect('/candidate')
  }

  const supabase = await createClient()

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at, avatar_url, phone_number, address, id_number')
    .eq('id', user.id)
    .single()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  return (
    <AdminLayout adminName={adminProfile?.full_name || 'Admin'} adminAvatarUrl={adminProfile?.avatar_url}>
      <main className="max-w-4xl w-full mx-auto px-2 py-2 sm:p-6 flex flex-col gap-2.5 sm:gap-6">
        {/* DEDICATED PURPOSE-BUILT MOBILE VIEW (< 768px) */}
        <div className="md:hidden">
          <MobileAdminProfile
            adminProfile={adminProfile}
            authUser={authUser}
            userId={user.id}
          />
        </div>

        {/* DESKTOP VIEW (>= 768px) - 100% UNTOUCHED ORIGINAL LAYOUT */}
        <div className="hidden md:flex flex-col gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Admin Profile</h2>
            <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
              System administrator details and security credentials
            </p>
          </div>

          <Card variant="elevated" className="border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-6">
            <div className="flex items-center gap-4 pb-4 border-b border-[var(--md-sys-color-outline-variant)]">
              <ProfileAvatarZoom 
                avatarUrl={adminProfile?.avatar_url} 
                altText={adminProfile?.full_name || 'Admin'} 
                fallbackInitials={adminProfile?.full_name?.charAt(0).toUpperCase() || 'A'} 
              />
              <div className="flex flex-col justify-center">
                <h3 className="text-lg font-bold leading-tight">{adminProfile?.full_name || 'Admin'}</h3>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    System Administrator
                  </span>
                  {adminProfile?.id_number && (
                    <div className="flex items-center gap-1.5 ml-1">
                      <span className="text-[var(--md-sys-color-on-surface-variant)]">•</span>
                      <a 
                        href={`/api/verify-redirect?idNumber=${adminProfile.id_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono font-medium text-[var(--md-sys-color-primary)] hover:underline flex items-center gap-1"
                        title="Verify ID Card"
                      >
                        {adminProfile.id_number}
                        <ShieldCheck className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container)] flex flex-col gap-1">
                <span className="text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email:
                </span>
                <span className="font-semibold text-sm truncate">{authUser?.email || 'Not provided'}</span>
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
                  {adminProfile?.created_at
                    ? new Date(adminProfile.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
              </div>

              <div className="p-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container)] flex flex-col gap-1">
                <span className="text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone Number:
                </span>
                <span className="font-semibold text-sm">{adminProfile?.phone_number || 'Not provided'}</span>
              </div>

              <div className="p-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container)] flex flex-col gap-1">
                <span className="text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Address:
                </span>
                <span className="font-semibold text-sm">{adminProfile?.address || 'Not provided'}</span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </AdminLayout>
  )
}
