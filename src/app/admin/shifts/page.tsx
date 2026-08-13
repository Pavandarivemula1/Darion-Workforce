import { createClient, getCurrentUserFast, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminShiftsClient } from '@/components/admin/shifts/AdminShiftsClient'
import { DEFAULT_FALLBACK_SHIFT, type ShiftConfig, type ShiftWithCandidateCount } from '@/lib/utils/shift'

export default async function AdminShiftsPage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'admin') {
    redirect('/candidate')
  }

  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Fetch admin profile, all shifts, candidates, and active attendance sessions concurrently
  let [
    { data: adminProfile },
    { data: dbShifts },
    { data: candidatesData, error: candidateError },
    { data: activeSessions },
    { data: authUsersData },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url')
      .eq('id', user.id)
      .single(),
    supabase
      .from('shifts')
      .select('id, name, start_time, end_time, grace_period_mins, auto_logout_enabled, is_overnight, is_default, created_at, updated_at')
      .order('is_default', { ascending: false })
      .order('start_time', { ascending: true }),
    supabase
      .from('profiles')
      .select('id, full_name, role, hourly_rate, avatar_url, shift_id, created_at')
      .eq('role', 'candidate')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('attendance')
      .select('user_id')
      .is('logout_time', null),
    supabaseAdmin.auth.admin.listUsers(),
  ])

  // Fallback for candidate query if shift_id column is not yet present
  let candidateProfilesList: any[] = candidatesData || []
  if (candidateError || !candidatesData) {
    const { data: fallbackCandidates } = await supabase
      .from('profiles')
      .select('id, full_name, role, hourly_rate, avatar_url, created_at')
      .eq('role', 'candidate')
      .order('created_at', { ascending: false })
    candidateProfilesList = fallbackCandidates || []
  }

  // Process shifts with fallback
  let shifts: ShiftConfig[] = dbShifts || []
  if (!shifts || shifts.length === 0) {
    shifts = [
      DEFAULT_FALLBACK_SHIFT,
      {
        id: 'fallback-morning-shift',
        name: 'Morning Shift (7 AM - 3 PM)',
        start_time: '07:00:00',
        end_time: '15:00:00',
        grace_period_mins: 15,
        auto_logout_enabled: true,
        is_overnight: false,
        is_default: false,
      },
      {
        id: 'fallback-evening-shift',
        name: 'Evening Shift (2 PM - 10 PM)',
        start_time: '14:00:00',
        end_time: '22:00:00',
        grace_period_mins: 15,
        auto_logout_enabled: true,
        is_overnight: false,
        is_default: false,
      },
      {
        id: 'fallback-night-shift',
        name: 'Night Shift (10 PM - 6 AM)',
        start_time: '22:00:00',
        end_time: '06:00:00',
        grace_period_mins: 15,
        auto_logout_enabled: true,
        is_overnight: true,
        is_default: false,
      },
    ]
  }

  // Map auth emails & working status
  const emailMap = new Map<string, string>()
  if (authUsersData?.users) {
    authUsersData.users.forEach((u) => {
      if (u.email) emailMap.set(u.id, u.email)
    })
  }

  const activeUserIdSet = new Set((activeSessions || []).map((s) => s.user_id))

  const candidateUsers = candidateProfilesList.map((c: any) => ({
    id: c.id,
    full_name: c.full_name,
    email: emailMap.get(c.id) || '',
    hourly_rate: Number(c.hourly_rate || 0),
    avatar_url: c.avatar_url,
    shift_id: c.shift_id || null,
    isWorking: activeUserIdSet.has(c.id),
  }))

  // Count candidates per shift
  const defaultShiftId = shifts.find((s) => s.is_default)?.id || shifts[0]?.id

  const shiftsWithCount: ShiftWithCandidateCount[] = shifts.map((s) => {
    const isDefault = s.is_default || s.id === defaultShiftId
    const count = candidateUsers.filter((c) => {
      if (c.shift_id === s.id) return true
      if (!c.shift_id && isDefault) return true
      return false
    }).length

    return {
      ...s,
      candidate_count: count,
    }
  })

  return (
    <AdminLayout adminName={adminProfile?.full_name || 'Admin'} adminAvatarUrl={adminProfile?.avatar_url}>
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <AdminShiftsClient shifts={shiftsWithCount} candidates={candidateUsers} />
      </main>
    </AdminLayout>
  )
}
