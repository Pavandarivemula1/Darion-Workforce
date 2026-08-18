import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminPayrollClient } from '@/components/admin/payroll/AdminPayrollClient'

export interface PageProps {
  searchParams: Promise<{
    filter?: string
    startDate?: string
    endDate?: string
  }>
}

export default async function AdminPayrollPage({ searchParams }: PageProps) {
  const params = await searchParams
  const filter = params.filter || 'this_week'

  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'admin') {
    redirect('/candidate')
  }

  const supabase = await createClient()

  // 1. Fetch Admin Profile
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .eq('id', user.id)
    .single()

  // 2. Fetch Candidates (try with banking fields, fallback to standard profile fields)
  let rawCandidates: any[] = []
  const { data: fullCandidates, error: cErr } = await supabase
    .from('profiles')
    .select('id, full_name, role, hourly_rate, avatar_url, phone_number, address, id_number, bank_name, bank_account_number, bank_ifsc, upi_id, pan_number, created_at')
    .eq('role', 'candidate')
    .order('full_name', { ascending: true })

  if (!cErr && fullCandidates) {
    rawCandidates = fullCandidates
  } else {
    const { data: baseCandidates } = await supabase
      .from('profiles')
      .select('id, full_name, role, hourly_rate, avatar_url, phone_number, address, id_number, created_at')
      .eq('role', 'candidate')
      .order('full_name', { ascending: true })
    rawCandidates = baseCandidates || []
  }

  // 3. Fetch Attendance (try with payment fields, fallback to standard attendance fields)
  let rawAttendance: any[] = []
  const { data: fullAttendance, error: aErr } = await supabase
    .from('attendance')
    .select('id, user_id, login_time, logout_time, break_start_time, break_duration_seconds, approval_status, rejection_reason, payout_amount, payment_status, paid_at, payment_reference, payment_method, payment_notes, created_at')
    .order('login_time', { ascending: false })

  if (!aErr && fullAttendance) {
    rawAttendance = fullAttendance
  } else {
    const { data: baseAttendance } = await supabase
      .from('attendance')
      .select('id, user_id, login_time, logout_time, break_start_time, break_duration_seconds, approval_status, rejection_reason, payout_amount, created_at')
      .order('login_time', { ascending: false })
    rawAttendance = baseAttendance || []
  }

  const safeCandidates = rawCandidates.map((c: any) => ({
    id: c.id,
    full_name: c.full_name,
    role: c.role,
    hourly_rate: Number(c.hourly_rate || 0),
    avatar_url: c.avatar_url || null,
    phone_number: c.phone_number || null,
    address: c.address || null,
    id_number: c.id_number || null,
    bank_name: c.bank_name || null,
    bank_account_number: c.bank_account_number || null,
    bank_ifsc: c.bank_ifsc || null,
    upi_id: c.upi_id || null,
    pan_number: c.pan_number || null,
    created_at: c.created_at,
  }))

  const safeRecords = rawAttendance.map((r: any) => ({
    id: r.id,
    user_id: r.user_id,
    login_time: r.login_time,
    logout_time: r.logout_time,
    break_start_time: r.break_start_time || null,
    break_duration_seconds: r.break_duration_seconds || 0,
    approval_status: (r.approval_status || 'pending') as 'pending' | 'approved' | 'rejected',
    rejection_reason: r.rejection_reason || null,
    payout_amount: typeof r.payout_amount === 'number' ? r.payout_amount : null,
    payment_status: (r.payment_status || 'unpaid') as 'unpaid' | 'paid' | 'processing' | 'on_hold',
    paid_at: r.paid_at || null,
    payment_reference: r.payment_reference || null,
    payment_method: r.payment_method || null,
    payment_notes: r.payment_notes || null,
    created_at: r.created_at,
  }))

  return (
    <AdminLayout adminId={user.id} adminName={adminProfile?.full_name || 'Admin'} adminAvatarUrl={adminProfile?.avatar_url}>
      <main className="max-w-6xl w-full mx-auto px-2 py-2 sm:p-6">
        <AdminPayrollClient
          candidates={safeCandidates}
          records={safeRecords}
          initialFilter={filter}
        />
      </main>
    </AdminLayout>
  )

}
