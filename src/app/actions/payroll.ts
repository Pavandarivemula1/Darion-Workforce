'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type PayrollActionState = {
  error?: string
  success?: boolean
  message?: string
}

/**
 * Settle all (or specific) approved unpaid shifts for a candidate
 */
export async function settleCandidatePayrollAction(
  prevState: PayrollActionState,
  formData: FormData
): Promise<PayrollActionState> {
  const supabase = await createClient()

  // 1. Verify admin authorization
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized. Please log in.' }
  }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    return { error: 'Access denied. Admin privileges required.' }
  }

  const candidateId = formData.get('candidateId') as string
  const shiftIdsJson = formData.get('shiftIds') as string
  const periodStart = (formData.get('periodStart') as string) || null
  const periodEnd = (formData.get('periodEnd') as string) || null
  const bonusStr = (formData.get('bonusAmount') as string) || '0'
  const deductionStr = (formData.get('deductionAmount') as string) || '0'
  const paymentMethod = (formData.get('paymentMethod') as string) || 'Bank Transfer'
  const paymentReference = (formData.get('paymentReference') as string) || ''
  const notes = (formData.get('paymentNotes') as string) || ''

  if (!candidateId) {
    return { error: 'Candidate ID is required.' }
  }

  const bonusAmount = Math.max(0, parseFloat(bonusStr) || 0)
  const deductionAmount = Math.max(0, parseFloat(deductionStr) || 0)

  let shiftIds: string[] = []
  if (shiftIdsJson) {
    try {
      shiftIds = JSON.parse(shiftIdsJson)
    } catch {
      shiftIds = []
    }
  }

  // 2. Query target attendance records
  let query = supabase
    .from('attendance')
    .select('id, user_id, login_time, logout_time, break_duration_seconds, payout_amount, approval_status, payment_status')
    .eq('user_id', candidateId)
    .eq('approval_status', 'approved')

  if (shiftIds.length > 0) {
    query = query.in('id', shiftIds)
  } else {
    // Settle all unpaid/processing shifts
    query = query.or('payment_status.eq.unpaid,payment_status.is.null')
  }

  const { data: targetShifts, error: fetchError } = await query

  if (fetchError) {
    return { error: fetchError.message || 'Failed to fetch candidate shift records.' }
  }

  if (!targetShifts || targetShifts.length === 0) {
    return { error: 'No approved unpaid shifts found for this candidate.' }
  }

  // 3. Compute totals
  let totalBaseAmount = 0
  let totalMs = 0

  targetShifts.forEach((s) => {
    totalBaseAmount += Number(s.payout_amount || 0)
    if (s.login_time && s.logout_time) {
      const gross = Math.max(0, new Date(s.logout_time).getTime() - new Date(s.login_time).getTime())
      const breakMs = (s.break_duration_seconds || 0) * 1000
      totalMs += Math.max(0, gross - breakMs)
    }
  })

  const totalHours = Math.round((totalMs / (1000 * 60 * 60)) * 100) / 100
  const netPaid = Math.round((totalBaseAmount + bonusAmount - deductionAmount) * 100) / 100
  const nowIso = new Date().toISOString()
  const targetIds = targetShifts.map((s) => s.id)

  // 4. Update attendance records using Admin Client for guaranteed bypass if RLS restricts
  const adminClient = createAdminClient()

  const { error: updateError } = await adminClient
    .from('attendance')
    .update({
      payment_status: 'paid',
      paid_at: nowIso,
      payment_reference: paymentReference || null,
      payment_method: paymentMethod,
      payment_notes: notes || null,
    })
    .in('id', targetIds)

  if (updateError) {
    console.error('[settleCandidatePayrollAction] Error updating attendance:', updateError)
    return { error: updateError.message || 'Failed to mark shifts as paid.' }
  }

  // 5. Insert settlement record into payroll_settlements
  const { error: settlementError } = await adminClient
    .from('payroll_settlements')
    .insert({
      user_id: candidateId,
      period_start: periodStart,
      period_end: periodEnd,
      shift_count: targetShifts.length,
      total_hours: totalHours,
      base_amount: totalBaseAmount,
      bonus_amount: bonusAmount,
      deduction_amount: deductionAmount,
      net_paid: netPaid,
      payment_method: paymentMethod,
      payment_reference: paymentReference || null,
      notes: notes || null,
      settled_by: user.id,
      settled_at: nowIso,
    })

  if (settlementError) {
    console.warn('[settleCandidatePayrollAction] Warning inserting settlement record:', settlementError)
    // Even if settlement record table doesn't exist yet, the shifts are marked paid
  }

  revalidatePath('/admin/payroll')
  revalidatePath('/admin/attendance')
  revalidatePath('/admin/timesheet')
  revalidatePath('/admin')
  revalidatePath('/candidate/payroll')
  revalidatePath('/candidate/attendance')
  revalidatePath('/candidate')

  return { success: true, message: `Successfully settled ${targetShifts.length} shifts for total net ${netPaid.toFixed(2)}.` }
}

/**
 * Batch settle multiple candidates in a single transaction run
 */
export async function batchSettlePayrollAction(
  prevState: PayrollActionState,
  formData: FormData
): Promise<PayrollActionState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized. Please log in.' }
  }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    return { error: 'Access denied. Admin privileges required.' }
  }

  const candidateIdsJson = formData.get('candidateIds') as string
  const paymentMethod = (formData.get('paymentMethod') as string) || 'Bank Transfer'
  const paymentReference = (formData.get('paymentReference') as string) || `BATCH-${Date.now()}`
  const notes = (formData.get('paymentNotes') as string) || 'Batch Payroll Run'

  let candidateIds: string[] = []
  if (candidateIdsJson) {
    try {
      candidateIds = JSON.parse(candidateIdsJson)
    } catch {
      candidateIds = []
    }
  }

  if (candidateIds.length === 0) {
    return { error: 'No candidates selected for batch settlement.' }
  }

  const adminClient = createAdminClient()

  // 1. Fetch all approved unpaid shifts for these candidates
  const { data: shifts, error: fetchError } = await adminClient
    .from('attendance')
    .select('id, user_id, login_time, logout_time, break_duration_seconds, payout_amount')
    .in('user_id', candidateIds)
    .eq('approval_status', 'approved')
    .or('payment_status.eq.unpaid,payment_status.is.null')

  if (fetchError) {
    return { error: fetchError.message || 'Failed to fetch shifts for batch payout.' }
  }

  if (!shifts || shifts.length === 0) {
    return { error: 'No approved unpaid shifts found for selected candidates.' }
  }

  const nowIso = new Date().toISOString()
  const shiftIds = shifts.map((s) => s.id)

  // 2. Mark all shifts as paid
  const { error: updateError } = await adminClient
    .from('attendance')
    .update({
      payment_status: 'paid',
      paid_at: nowIso,
      payment_reference: paymentReference,
      payment_method: paymentMethod,
      payment_notes: notes,
    })
    .in('id', shiftIds)

  if (updateError) {
    return { error: updateError.message || 'Failed to update shifts to paid.' }
  }

  // 3. Create candidate-wise settlement records
  const groupedByCandidate: Record<string, typeof shifts> = {}
  shifts.forEach((s) => {
    if (!groupedByCandidate[s.user_id]) groupedByCandidate[s.user_id] = []
    groupedByCandidate[s.user_id].push(s)
  })

  const settlementInserts = Object.entries(groupedByCandidate).map(([candId, cShifts]) => {
    let cBase = 0
    let cMs = 0
    cShifts.forEach((s) => {
      cBase += Number(s.payout_amount || 0)
      if (s.login_time && s.logout_time) {
        const gross = Math.max(0, new Date(s.logout_time).getTime() - new Date(s.login_time).getTime())
        const breakMs = (s.break_duration_seconds || 0) * 1000
        cMs += Math.max(0, gross - breakMs)
      }
    })
    const hours = Math.round((cMs / (1000 * 60 * 60)) * 100) / 100

    return {
      user_id: candId,
      shift_count: cShifts.length,
      total_hours: hours,
      base_amount: cBase,
      bonus_amount: 0,
      deduction_amount: 0,
      net_paid: cBase,
      payment_method: paymentMethod,
      payment_reference: paymentReference,
      notes: `Batch settlement: ${cShifts.length} shifts`,
      settled_by: user.id,
      settled_at: nowIso,
    }
  })

  await adminClient.from('payroll_settlements').insert(settlementInserts)

  revalidatePath('/admin/payroll')
  revalidatePath('/admin/attendance')
  revalidatePath('/admin/timesheet')
  revalidatePath('/admin')
  revalidatePath('/candidate/payroll')

  return {
    success: true,
    message: `Batch payout successful: ${shifts.length} shifts settled across ${Object.keys(groupedByCandidate).length} candidates.`,
  }
}

/**
 * Toggle or update individual shift payment status
 */
export async function markShiftPaymentStatusAction(
  prevState: PayrollActionState,
  formData: FormData
): Promise<PayrollActionState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized.' }
  }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    return { error: 'Access denied. Admin privileges required.' }
  }

  const shiftId = formData.get('shiftId') as string
  const paymentStatus = (formData.get('paymentStatus') as string) || 'unpaid'
  const paymentReference = (formData.get('paymentReference') as string) || null
  const paymentMethod = (formData.get('paymentMethod') as string) || null

  if (!shiftId) {
    return { error: 'Shift ID is required.' }
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('attendance')
    .update({
      payment_status: paymentStatus,
      paid_at: paymentStatus === 'paid' ? new Date().toISOString() : null,
      payment_reference: paymentReference,
      payment_method: paymentMethod,
    })
    .eq('id', shiftId)

  if (error) {
    return { error: error.message || 'Failed to update shift payment status.' }
  }

  revalidatePath('/admin/payroll')
  revalidatePath('/admin/attendance')
  revalidatePath('/candidate/payroll')
  return { success: true }
}

/**
 * Update candidate bank / UPI payout credentials
 */
export async function updateCandidateBankDetailsAction(
  prevState: PayrollActionState,
  formData: FormData
): Promise<PayrollActionState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized. Please log in.' }
  }

  const candidateId = formData.get('candidateId') as string
  const bankName = (formData.get('bankName') as string) || null
  const bankAccountNumber = (formData.get('bankAccountNumber') as string) || null
  const bankIfsc = (formData.get('bankIfsc') as string) || null
  const upiId = (formData.get('upiId') as string) || null
  const panNumber = (formData.get('panNumber') as string) || null

  if (!candidateId) {
    return { error: 'Candidate ID is required.' }
  }

  // Verify permission: admin or the user themselves
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = currentProfile?.role === 'admin'
  const isSelf = user.id === candidateId

  if (!isAdmin && !isSelf) {
    return { error: 'Access denied.' }
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('profiles')
    .update({
      bank_name: bankName?.trim() || null,
      bank_account_number: bankAccountNumber?.trim() || null,
      bank_ifsc: bankIfsc?.trim().toUpperCase() || null,
      upi_id: upiId?.trim() || null,
      pan_number: panNumber?.trim().toUpperCase() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', candidateId)

  if (error) {
    return { error: error.message || 'Failed to update banking details.' }
  }

  revalidatePath('/admin/payroll')
  revalidatePath('/admin/candidates')
  revalidatePath('/candidate/profile')
  revalidatePath('/candidate/payroll')

  return { success: true, message: 'Banking and payment details updated successfully.' }
}
