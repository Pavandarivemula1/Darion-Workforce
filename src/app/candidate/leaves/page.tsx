import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CandidateLayout } from '@/components/candidate/CandidateLayout'
import { CandidateLeavesClient, LeaveRecord } from '@/components/candidate/leaves/CandidateLeavesClient'
import { LeaveBalances } from '@/components/candidate/leaves/LeaveRequestModal'

export default async function CandidateLeavesPage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'admin') {
    redirect('/admin/leaves')
  }

  const supabase = await createClient()

  // 1. Fetch Candidate Profile with Leave Quotas
  let rawProfile: any = null
  const { data: fullProfile, error: pErr } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, casual_leaves_allowed, sick_leaves_allowed, paid_leaves_allowed')
    .eq('id', user.id)
    .single()

  if (!pErr && fullProfile) {
    rawProfile = fullProfile
  } else {
    const { data: baseProfile } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', user.id)
      .single()
    rawProfile = baseProfile
  }

  // 2. Fetch Candidate Leaves History
  const { data: leavesData } = await supabase
    .from('leaves')
    .select('id, leave_type, start_date, end_date, total_days, reason, status, admin_notes, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const leaves: LeaveRecord[] = (leavesData || []).map((l: any) => ({
    id: l.id,
    leave_type: l.leave_type || 'casual',
    start_date: l.start_date,
    end_date: l.end_date,
    total_days: Number(l.total_days || 1),
    reason: l.reason || '',
    status: (l.status || 'pending') as 'pending' | 'approved' | 'rejected' | 'cancelled',
    admin_notes: l.admin_notes || null,
    created_at: l.created_at,
  }))

  // 3. Compute Utilized Balances from Approved Leaves
  let casualUsed = 0
  let sickUsed = 0
  let paidUsed = 0

  leaves.forEach((l) => {
    if (l.status === 'approved') {
      if (l.leave_type === 'casual') casualUsed += l.total_days
      else if (l.leave_type === 'sick') sickUsed += l.total_days
      else if (l.leave_type === 'paid') paidUsed += l.total_days
    }
  })

  const balances: LeaveBalances = {
    casualAllowed: rawProfile?.casual_leaves_allowed ?? 12,
    casualUsed,
    sickAllowed: rawProfile?.sick_leaves_allowed ?? 6,
    sickUsed,
    paidAllowed: rawProfile?.paid_leaves_allowed ?? 12,
    paidUsed,
  }

  return (
    <CandidateLayout
      candidateName={rawProfile?.full_name || 'Candidate'}
      candidateAvatarUrl={rawProfile?.avatar_url || undefined}
    >
      <CandidateLeavesClient leaves={leaves} balances={balances} />
    </CandidateLayout>
  )
}
