'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type AdminActionState = {
  error?: string
  success?: boolean
}

export async function createCandidateAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const supabase = await createClient()

  // 1. Verify admin authorization
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

  const email = formData.get('email') as string
  const fullName = formData.get('fullName') as string
  const password = formData.get('password') as string
  const hourlyRateStr = formData.get('hourlyRate') as string
  const hourlyRate = parseFloat(hourlyRateStr || '0')

  if (!email || !fullName || !password) {
    return { error: 'All fields (Full Name, Email, Password) are required.' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' }
  }

  // 3. Create candidate user via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'candidate',
      },
    },
  })

  if (authError) {
    return { error: authError.message || 'Failed to create candidate user.' }
  }

  if (authData.user) {
    // Explicitly insert or upsert into profiles to include hourly_rate
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      full_name: fullName,
      role: 'candidate',
      hourly_rate: isNaN(hourlyRate) ? 0 : Math.max(0, hourlyRate),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      return { error: profileError.message || 'Candidate user created, but profile update failed.' }
    }
  }

  revalidatePath('/admin/candidates')
  revalidatePath('/admin')
  return { success: true }
}

export async function updateCandidateHourlyRateAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
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

  const candidateId = formData.get('candidateId') as string
  const hourlyRateStr = formData.get('hourlyRate') as string
  const hourlyRate = parseFloat(hourlyRateStr)

  if (!candidateId || isNaN(hourlyRate) || hourlyRate < 0) {
    return { error: 'Valid candidate ID and hourly rate (≥ 0) are required.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      hourly_rate: hourlyRate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', candidateId)

  if (error) {
    return { error: error.message || 'Failed to update hourly rate.' }
  }

  revalidatePath('/admin/candidates')
  revalidatePath('/admin/attendance')
  revalidatePath('/admin/timesheet')
  revalidatePath('/admin')
  revalidatePath('/candidate')
  return { success: true }
}

export async function approveShiftAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
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

  const attendanceId = formData.get('attendanceId') as string

  if (!attendanceId) {
    console.error('[approveShiftAction] Error: Attendance ID is missing from formData')
    return { error: 'Attendance ID is required.' }
  }

  // Fetch attendance shift details
  const { data: shift, error: shiftError } = await supabase
    .from('attendance')
    .select('id, user_id, login_time, logout_time, break_duration_seconds')
    .eq('id', attendanceId)
    .single()

  if (shiftError || !shift) {
    console.error('[approveShiftAction] Error fetching shift:', shiftError)
    return { error: 'Attendance shift not found.' }
  }

  if (!shift.logout_time) {
    console.error('[approveShiftAction] Error: Shift logout_time is null for shift:', shift.id)
    return { error: 'Cannot approve an active shift before candidate logs out.' }
  }

  const customPayoutStr = formData.get('payoutAmount') as string
  let finalPayoutAmount = 0

  if (customPayoutStr !== null && customPayoutStr !== undefined && customPayoutStr.trim() !== '') {
    const parsed = parseFloat(customPayoutStr)
    finalPayoutAmount = isNaN(parsed) ? 0 : Math.max(0, parsed)
  } else {
    // Fetch candidate profile for hourly rate
    const { data: candidateProfile } = await supabase
      .from('profiles')
      .select('hourly_rate')
      .eq('id', shift.user_id)
      .single()

    const hourlyRate = candidateProfile?.hourly_rate || 0
    const grossMs = Math.max(0, new Date(shift.logout_time).getTime() - new Date(shift.login_time).getTime())
    const breakMs = (shift.break_duration_seconds || 0) * 1000
    const netMs = Math.max(0, grossMs - breakMs)
    const netHours = netMs / (1000 * 60 * 60)
    finalPayoutAmount = Math.round(netHours * hourlyRate * 100) / 100
  }

  const { error: updateError } = await supabase
    .from('attendance')
    .update({
      approval_status: 'approved',
      payout_amount: finalPayoutAmount,
      rejection_reason: null,
    })
    .eq('id', attendanceId)

  if (updateError) {
    console.error('[approveShiftAction] Update Error:', updateError)
    return { error: updateError.message || 'Failed to approve shift.' }
  }

  console.log('[approveShiftAction] SUCCESS for shift:', attendanceId, 'payout:', finalPayoutAmount)
  revalidatePath('/admin/attendance')
  revalidatePath('/admin/timesheet')
  revalidatePath('/admin')
  revalidatePath('/candidate/attendance')
  revalidatePath('/candidate')
  return { success: true }
}

export async function rejectShiftAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
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

  const attendanceId = formData.get('attendanceId') as string
  const rejectionReason = formData.get('rejectionReason') as string

  if (!attendanceId || !rejectionReason?.trim()) {
    return { error: 'Attendance ID and Rejection Reason are required.' }
  }

  const { error } = await supabase
    .from('attendance')
    .update({
      approval_status: 'rejected',
      rejection_reason: rejectionReason.trim(),
      payout_amount: 0,
    })
    .eq('id', attendanceId)

  if (error) {
    return { error: error.message || 'Failed to reject shift.' }
  }

  revalidatePath('/admin/attendance')
  revalidatePath('/admin/timesheet')
  revalidatePath('/admin')
  revalidatePath('/candidate/attendance')
  revalidatePath('/candidate')
  return { success: true }
}

export async function resetCandidatePasswordAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const supabase = await createClient()

  // Verify admin
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
    return { error: 'Access denied.' }
  }

  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Candidate email is required.' }
  }

  // Send password reset email via Supabase Auth
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'http://localhost:3000' : ''}/login`,
  })

  if (error) {
    return { error: error.message || 'Failed to send password reset email.' }
  }

  return { success: true }
}
