import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CandidateLayout } from '@/components/candidate/CandidateLayout'
import { CandidatePayrollClient } from '@/components/candidate/CandidatePayrollClient'

export default async function CandidatePayrollPage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'admin') {
    redirect('/admin/payroll')
  }

  const supabase = await createClient()

  // 1. Fetch Candidate Profile (try with banking fields, fallback to standard profile fields)
  let rawProfile: any = null
  const { data: fullProfile, error: pErr } = await supabase
    .from('profiles')
    .select('id, full_name, role, hourly_rate, created_at, avatar_url, phone_number, address, id_number, bank_name, bank_account_number, bank_ifsc, upi_id, pan_number')
    .eq('id', user.id)
    .single()

  if (!pErr && fullProfile) {
    rawProfile = fullProfile
  } else {
    const { data: baseProfile } = await supabase
      .from('profiles')
      .select('id, full_name, role, hourly_rate, created_at, avatar_url, phone_number, address, id_number')
      .eq('id', user.id)
      .single()
    rawProfile = baseProfile
  }

  // 2. Fetch Candidate Attendance (try with payment fields, fallback to standard attendance fields)
  let rawAttendance: any[] = []
  const { data: fullAttendance, error: aErr } = await supabase
    .from('attendance')
    .select('id, user_id, login_time, logout_time, break_start_time, break_duration_seconds, approval_status, rejection_reason, payout_amount, payment_status, paid_at, payment_reference, payment_method, payment_notes, created_at')
    .eq('user_id', user.id)
    .order('login_time', { ascending: false })

  if (!aErr && fullAttendance) {
    rawAttendance = fullAttendance
  } else {
    const { data: baseAttendance } = await supabase
      .from('attendance')
      .select('id, user_id, login_time, logout_time, break_start_time, break_duration_seconds, approval_status, rejection_reason, payout_amount, created_at')
      .eq('user_id', user.id)
      .order('login_time', { ascending: false })
    rawAttendance = baseAttendance || []
  }

  const safeProfile = {
    id: user.id,
    full_name: rawProfile?.full_name || 'Candidate',
    role: rawProfile?.role || 'candidate',
    hourly_rate: Number(rawProfile?.hourly_rate || 0),
    avatar_url: rawProfile?.avatar_url || null,
    phone_number: rawProfile?.phone_number || null,
    address: rawProfile?.address || null,
    id_number: rawProfile?.id_number || null,
    bank_name: rawProfile?.bank_name || null,
    bank_account_number: rawProfile?.bank_account_number || null,
    bank_ifsc: rawProfile?.bank_ifsc || null,
    upi_id: rawProfile?.upi_id || null,
    pan_number: rawProfile?.pan_number || null,
    created_at: rawProfile?.created_at,
  }

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
    <CandidateLayout candidateId={user.id} candidateName={safeProfile.full_name}>
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6">
        <CandidatePayrollClient
          candidateProfile={safeProfile}
          records={safeRecords}
        />
      </main>
    </CandidateLayout>
  )
}
