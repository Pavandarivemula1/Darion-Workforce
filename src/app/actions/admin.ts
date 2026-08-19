'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendNotification } from '@/lib/utils/notifications'
import {
  isAdmin,
  isHR,
  isSupervisor,
  isManagementRole,
  canManagePayroll,
  canManageBranding,
  canManageSecurity,
} from '@/lib/auth/permissions'

export type AdminActionState = {
  error?: string
  success?: boolean
}

export async function createCandidateAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const supabase = await createClient()

  // 1. Verify admin/HR authorization
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

  if (!isHR(adminProfile?.role)) {
    return { error: 'Access denied. HR or Admin privileges required.' }
  }

  const email = formData.get('email') as string
  const fullName = formData.get('fullName') as string
  const password = formData.get('password') as string
  const hourlyRateStr = formData.get('hourlyRate') as string
  const hourlyRate = parseFloat(hourlyRateStr || '0')
  const shiftId = (formData.get('shiftId') as string) || null
  const role = (formData.get('role') as string) || 'candidate'

  if (!email || !fullName || !password) {
    return { error: 'All fields (Full Name, Email, Password) are required.' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' }
  }

  // Determine shift to assign (user chosen or company default)
  let assignedShiftId = shiftId && shiftId !== 'none' ? shiftId : null
  if (!assignedShiftId) {
    try {
      const { data: defaultShift } = await supabase
        .from('shifts')
        .select('id')
        .eq('is_default', true)
        .maybeSingle()
      if (defaultShift) assignedShiftId = defaultShift.id
    } catch {
      // safe fallback if shifts table is empty or migrating
    }
  }

  // 3. Create candidate user via Supabase Auth Admin Client (auto-confirms email)
  const adminClient = createAdminClient()
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: role,
      password_changed: false,
    },
  })

  if (authError) {
    return { error: authError.message || 'Failed to create candidate user.' }
  }

  if (authData.user) {
    // Explicitly insert or upsert into profiles to include hourly_rate and shift_id
    const profileData: any = {
      id: authData.user.id,
      full_name: fullName,
      role: role,
      hourly_rate: isNaN(hourlyRate) ? 0 : Math.max(0, hourlyRate),
      updated_at: new Date().toISOString(),
    }
    let { error: profileError } = await supabase.from('profiles').upsert(profileData)

    if (profileError && profileData.shift_id) {
      delete profileData.shift_id
      const retry = await supabase.from('profiles').upsert(profileData)
      profileError = retry.error
    }

    if (profileError) {
      return { error: profileError.message || 'Candidate user created, but profile update failed.' }
    }
  }

  revalidatePath('/admin/candidates')
  revalidatePath('/admin/shifts')
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

  if (!isHR(adminProfile?.role)) {
    return { error: 'Access denied. HR or Admin privileges required.' }
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

export async function updateCandidateProfileAction(
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

  if (!isManagementRole(adminProfile?.role)) {
    return { error: 'Access denied. Management privileges required.' }
  }

  const candidateId = formData.get('candidateId') as string
  const fullName = formData.get('fullName') as string
  const hourlyRateStr = formData.get('hourlyRate') as string
  const phoneNumber = formData.get('phoneNumber') as string
  const address = formData.get('address') as string
  const idNumber = formData.get('idNumber') as string
  const shiftId = formData.get('shiftId') as string | null
  const avatarFile = formData.get('avatarFile') as File | null
  const role = formData.get('role') as string | null
  
  if (!candidateId || !fullName) {
    return { error: 'Candidate ID and Full Name are required.' }
  }

  const hourlyRate = parseFloat(hourlyRateStr)
  
  let avatarUrl: string | undefined = undefined

  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${candidateId}-${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, { upsert: true })
      
    if (uploadError) {
      return { error: 'Failed to upload avatar: ' + uploadError.message }
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
      
    avatarUrl = publicUrlData.publicUrl
  }

  const updateData: any = {
    full_name: fullName,
    hourly_rate: isNaN(hourlyRate) ? 0 : Math.max(0, hourlyRate),
    phone_number: phoneNumber || null,
    address: address || null,
    id_number: idNumber || null,
    updated_at: new Date().toISOString(),
  }

  if (role && isAdmin(adminProfile?.role)) {
    updateData.role = role
    try {
      const adminClient = createAdminClient()
      await adminClient.auth.admin.updateUserById(candidateId, {
        user_metadata: { role }
      })
    } catch {
      // Continue even if auth metadata sync encounters issue
    }
  }

  if (shiftId !== null && shiftId !== undefined) {
    updateData.shift_id = shiftId === 'none' || !shiftId ? null : shiftId
  }

  if (avatarUrl !== undefined) {
    updateData.avatar_url = avatarUrl
  }

  let { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', candidateId)

  if (error && updateData.shift_id !== undefined) {
    delete updateData.shift_id
    const retry = await supabase.from('profiles').update(updateData).eq('id', candidateId)
    error = retry.error
  }

  if (error) {
    return { error: error.message || 'Failed to update profile.' }
  }

  revalidatePath('/admin/candidates')
  revalidatePath('/admin/shifts')
  revalidatePath('/admin/attendance')
  revalidatePath('/admin/timesheet')
  revalidatePath('/admin')
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

  if (!isManagementRole(adminProfile?.role)) {
    return { error: 'Access denied. Management privileges required.' }
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

  const { data: updatedData, error: updateError } = await supabase
    .from('attendance')
    .update({
      approval_status: 'approved',
      payout_amount: finalPayoutAmount,
      rejection_reason: null,
    })
    .eq('id', attendanceId)
    .select()

  if (updateError) {
    console.error('[approveShiftAction] Update Error:', updateError)
    return { error: updateError.message || 'Failed to approve shift.' }
  }

  if (!updatedData || updatedData.length === 0) {
    console.error('[approveShiftAction] RLS Blocked Update: 0 rows modified for ID:', attendanceId)
    return {
      error: 'Update blocked by Supabase Database RLS. Please run the SQL script in Supabase SQL Editor to enable Admin shift approvals.',
    }
  }

  console.log('[approveShiftAction] SUCCESS for shift:', attendanceId, 'payout:', finalPayoutAmount)

  // Dispatch real-time in-app notification to candidate
  await sendNotification({
    userId: shift.user_id,
    title: 'Shift Approved & Paid',
    message: `Your shift on ${new Date(shift.login_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} was approved (₹${finalPayoutAmount.toFixed(2)} recorded).`,
    type: 'shift_approved',
    link: '/candidate/attendance',
    metadata: { attendanceId, payoutAmount: finalPayoutAmount },
  })

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

  if (!isManagementRole(adminProfile?.role)) {
    return { error: 'Access denied. Management privileges required.' }
  }

  const attendanceId = formData.get('attendanceId') as string
  const rejectionReason = formData.get('rejectionReason') as string

  if (!attendanceId || !rejectionReason?.trim()) {
    return { error: 'Attendance ID and Rejection Reason are required.' }
  }

  const { data: updatedData, error } = await supabase
    .from('attendance')
    .update({
      approval_status: 'rejected',
      rejection_reason: rejectionReason.trim(),
      payout_amount: 0,
    })
    .eq('id', attendanceId)
    .select()

  if (error) {
    return { error: error.message || 'Failed to reject shift.' }
  }

  if (!updatedData || updatedData.length === 0) {
    console.error('[rejectShiftAction] RLS Blocked Update: 0 rows modified for ID:', attendanceId)
    return {
      error: 'Update blocked by Supabase Database RLS. Please run the SQL script in Supabase SQL Editor to enable Admin shift rejections.',
    }
  }

  const rejectedRecord = updatedData[0]
  if (rejectedRecord?.user_id) {
    await sendNotification({
      userId: rejectedRecord.user_id,
      title: 'Shift Rejected',
      message: `Your shift on ${new Date(rejectedRecord.login_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} was rejected. Reason: ${rejectionReason.trim()}`,
      type: 'shift_rejected',
      link: '/candidate/attendance',
      metadata: { attendanceId, rejectionReason: rejectionReason.trim() },
    })
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

  // Verify admin / HR
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

  if (!isHR(adminProfile?.role)) {
    return { error: 'Access denied. HR or Admin privileges required.' }
  }

  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Candidate email is required.' }
  }

  // Send password reset email via Supabase Auth
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'production' ? 'https://workforce.darion.in' : 'http://localhost:3000')
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message || 'Failed to send password reset email.' }
  }

  return { success: true }
}

export async function deleteCandidateAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const supabase = await createClient()

  // Verify admin authorization
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

  if (!isAdmin(adminProfile?.role)) {
    return { error: 'Access denied. Admin privileges required.' }
  }

  const candidateId = formData.get('candidateId') as string
  if (!candidateId) {
    return { error: 'Candidate ID is required.' }
  }

  // Prevent admin from deleting themselves
  if (candidateId === user.id) {
    return { error: 'You cannot delete your own admin account.' }
  }

  // Delete the user from Auth using the admin client
  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.deleteUser(candidateId)

  if (error) {
    return { error: error.message || 'Failed to delete candidate.' }
  }

  revalidatePath('/admin/candidates')
  revalidatePath('/admin/attendance')
  revalidatePath('/admin/timesheet')
  revalidatePath('/admin')
  return { success: true }
}

export async function approveMfaResetAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const supabase = await createClient()

  // Verify admin authorization
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

  if (!canManageSecurity(adminProfile?.role)) {
    return { error: 'Access denied. Admin privileges required.' }
  }

  const requestId = formData.get('requestId') as string
  const userId = formData.get('userId') as string
  const actionType = formData.get('actionType') as 'approve' | 'reject'

  if (!requestId || !userId || !actionType) {
    return { error: 'Request ID, User ID, and Action Type are required.' }
  }

  const adminClient = createAdminClient()

  if (actionType === 'approve') {
    // List all factors for the user and delete them to reset MFA
    const { data: factors, error: factorsError } = await adminClient.auth.admin.mfa.listFactors({
      userId,
    })

    if (factorsError) {
      return { error: factorsError.message || 'Failed to fetch user MFA factors.' }
    }

    if (factors?.factors) {
      for (const factor of factors.factors) {
        await adminClient.auth.admin.mfa.deleteFactor({
          userId,
          id: factor.id,
        })
      }
    }
  }

  // Update request status
  const { error: updateError } = await supabase
    .from('mfa_reset_requests')
    .update({ status: actionType === 'approve' ? 'approved' : 'rejected' })
    .eq('id', requestId)

  if (updateError) {
    return { error: updateError.message || 'Failed to update request status.' }
  }

  revalidatePath('/admin/security')
  return { success: true }
}

export async function adminStartWorkAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const supabase = await createClient()

  // 1. Verify management authorization
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

  if (!isManagementRole(adminProfile?.role)) {
    return { error: 'Access denied. Management privileges required.' }
  }

  const candidateId = formData.get('candidateId') as string
  const customStartTime = formData.get('startTime') as string
  const adminNotes = formData.get('adminNotes') as string

  if (!candidateId) {
    return { error: 'Candidate selection is required.' }
  }

  // Check if candidate already has an active session
  const { data: activeSession } = await supabase
    .from('attendance')
    .select('id')
    .eq('user_id', candidateId)
    .is('logout_time', null)
    .maybeSingle()

  if (activeSession) {
    return { error: 'Candidate already has an active work session in progress.' }
  }

  let loginIso: string
  if (customStartTime && customStartTime.trim() !== '') {
    const parsed = new Date(customStartTime)
    if (isNaN(parsed.getTime())) {
      return { error: 'Invalid custom start time.' }
    }
    loginIso = parsed.toISOString()
  } else {
    loginIso = new Date().toISOString()
  }

  const adminClient = createAdminClient()
  const insertPayload: any = {
    user_id: candidateId,
    login_time: loginIso,
    break_duration_seconds: 0,
    admin_notes: adminNotes?.trim() || 'Timer started by admin',
  }

  const { error: insertError } = await adminClient
    .from('attendance')
    .insert(insertPayload)

  if (insertError) {
    if (insertError.code === '23505') {
      return { error: 'Candidate already has an active work session in progress.' }
    }
    return { error: insertError.message || 'Failed to start timer for candidate.' }
  }

  // Dispatch notification to candidate
  await sendNotification({
    userId: candidateId,
    title: 'Work Timer Started by Admin',
    message: `An administrator started your work session at ${new Date(loginIso).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })}.`,
    type: 'timer_started',
    link: '/candidate',
    metadata: { loginTime: loginIso },
  })

  revalidatePath('/admin')
  revalidatePath('/admin/attendance')
  revalidatePath('/admin/timesheet')
  revalidatePath('/admin/candidates')
  revalidatePath('/candidate')
  revalidatePath('/candidate/attendance')
  return { success: true }
}

export async function adminEndWorkAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const supabase = await createClient()

  // 1. Verify management authorization
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

  if (!isManagementRole(adminProfile?.role)) {
    return { error: 'Access denied. Management privileges required.' }
  }

  const attendanceId = formData.get('attendanceId') as string
  const customStopTime = formData.get('stopTime') as string
  const breakMinutesStr = formData.get('breakDurationMinutes') as string
  const customPayoutStr = formData.get('payoutAmount') as string
  const approvalStatus = (formData.get('approvalStatus') as string) || 'approved'
  const adminNotes = formData.get('adminNotes') as string

  if (!attendanceId) {
    return { error: 'Attendance ID is required.' }
  }

  // Fetch active session
  const { data: session, error: fetchError } = await supabase
    .from('attendance')
    .select('id, user_id, login_time, break_start_time, break_duration_seconds')
    .eq('id', attendanceId)
    .single()

  if (fetchError || !session) {
    return { error: 'Attendance session not found.' }
  }

  let logoutDate: Date
  if (customStopTime && customStopTime.trim() !== '') {
    logoutDate = new Date(customStopTime)
    if (isNaN(logoutDate.getTime())) {
      return { error: 'Invalid custom stop time.' }
    }
  } else {
    logoutDate = new Date()
  }

  const loginDate = new Date(session.login_time)
  if (logoutDate.getTime() < loginDate.getTime()) {
    return { error: 'Stop time cannot be earlier than start time.' }
  }

  // Calculate Break Duration
  let finalBreakSeconds = session.break_duration_seconds || 0
  if (breakMinutesStr !== null && breakMinutesStr !== undefined && breakMinutesStr.trim() !== '') {
    const mins = parseInt(breakMinutesStr, 10)
    if (!isNaN(mins) && mins >= 0) {
      finalBreakSeconds = mins * 60
    }
  } else if (session.break_start_time) {
    const breakStart = new Date(session.break_start_time).getTime()
    const elapsedSec = Math.max(0, Math.floor((logoutDate.getTime() - breakStart) / 1000))
    finalBreakSeconds += elapsedSec
  }

  // Fetch Candidate Hourly Rate
  const { data: candidateProfile } = await supabase
    .from('profiles')
    .select('hourly_rate')
    .eq('id', session.user_id)
    .single()

  const hourlyRate = Number(candidateProfile?.hourly_rate || 0)
  const grossMs = Math.max(0, logoutDate.getTime() - loginDate.getTime())
  const netMs = Math.max(0, grossMs - finalBreakSeconds * 1000)
  const netHours = netMs / (1000 * 60 * 60)

  let finalPayout: number
  if (customPayoutStr !== null && customPayoutStr !== undefined && customPayoutStr.trim() !== '') {
    const parsed = parseFloat(customPayoutStr)
    finalPayout = isNaN(parsed) ? 0 : Math.max(0, parsed)
  } else {
    finalPayout = Math.round(netHours * hourlyRate * 100) / 100
  }

  const adminClient = createAdminClient()
  const updatePayload: any = {
    logout_time: logoutDate.toISOString(),
    break_start_time: null,
    break_duration_seconds: finalBreakSeconds,
    payout_amount: finalPayout,
    approval_status: approvalStatus === 'pending' ? 'pending' : 'approved',
    payment_status: 'unpaid',
    admin_notes: adminNotes?.trim() || 'Timer stopped by admin',
  }

  const { error: updateError } = await adminClient
    .from('attendance')
    .update(updatePayload)
    .eq('id', attendanceId)

  if (updateError) {
    return { error: updateError.message || 'Failed to stop candidate timer.' }
  }

  // Dispatch notification to candidate
  await sendNotification({
    userId: session.user_id,
    title: 'Shift Ended by Admin',
    message: `Your shift was recorded by an admin: ${netHours.toFixed(2)} hrs (Payout: ₹${finalPayout.toFixed(2)}).`,
    type: 'timer_stopped',
    link: '/candidate/attendance',
    metadata: { attendanceId, logoutTime: logoutDate.toISOString(), payoutAmount: finalPayout },
  })

  revalidatePath('/admin')
  revalidatePath('/admin/attendance')
  revalidatePath('/admin/timesheet')
  revalidatePath('/admin/candidates')
  revalidatePath('/admin/payroll')
  revalidatePath('/candidate')
  revalidatePath('/candidate/attendance')
  revalidatePath('/candidate/payroll')
  return { success: true }
}

export async function adminCreateManualShiftAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const supabase = await createClient()

  // 1. Verify management authorization
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

  if (!isManagementRole(adminProfile?.role)) {
    return { error: 'Access denied. Management privileges required.' }
  }

  const candidateId = formData.get('candidateId') as string
  const loginTimeStr = formData.get('loginTime') as string
  const logoutTimeStr = formData.get('logoutTime') as string
  const breakMinutesStr = formData.get('breakDurationMinutes') as string
  const customPayoutStr = formData.get('payoutAmount') as string
  const approvalStatus = (formData.get('approvalStatus') as string) || 'approved'
  const adminNotes = formData.get('adminNotes') as string

  if (!candidateId || !loginTimeStr || !logoutTimeStr) {
    return { error: 'Candidate, Start Time, and End Time are required.' }
  }

  const loginDate = new Date(loginTimeStr)
  const logoutDate = new Date(logoutTimeStr)

  if (isNaN(loginDate.getTime()) || isNaN(logoutDate.getTime())) {
    return { error: 'Invalid start or end date/time.' }
  }

  if (logoutDate.getTime() <= loginDate.getTime()) {
    return { error: 'End time must be after start time.' }
  }

  const breakMins = parseInt(breakMinutesStr || '0', 10)
  const breakSeconds = isNaN(breakMins) || breakMins < 0 ? 0 : breakMins * 60
  const grossMs = logoutDate.getTime() - loginDate.getTime()

  if (breakSeconds * 1000 >= grossMs) {
    return { error: 'Break duration cannot exceed or equal the total shift duration.' }
  }

  // Fetch Candidate Hourly Rate
  const { data: candidateProfile } = await supabase
    .from('profiles')
    .select('hourly_rate')
    .eq('id', candidateId)
    .single()

  const hourlyRate = Number(candidateProfile?.hourly_rate || 0)
  const netMs = grossMs - breakSeconds * 1000
  const netHours = netMs / (1000 * 60 * 60)

  let finalPayout: number
  if (customPayoutStr !== null && customPayoutStr !== undefined && customPayoutStr.trim() !== '') {
    const parsed = parseFloat(customPayoutStr)
    finalPayout = isNaN(parsed) ? 0 : Math.max(0, parsed)
  } else {
    finalPayout = Math.round(netHours * hourlyRate * 100) / 100
  }

  const adminClient = createAdminClient()
  const insertPayload: any = {
    user_id: candidateId,
    login_time: loginDate.toISOString(),
    logout_time: logoutDate.toISOString(),
    break_start_time: null,
    break_duration_seconds: breakSeconds,
    payout_amount: finalPayout,
    approval_status: approvalStatus === 'pending' ? 'pending' : 'approved',
    payment_status: 'unpaid',
    admin_notes: adminNotes?.trim() || 'Manual shift logged by admin',
  }

  const { error: insertError } = await adminClient
    .from('attendance')
    .insert(insertPayload)

  if (insertError) {
    return { error: insertError.message || 'Failed to create manual shift record.' }
  }

  // Dispatch notification to candidate
  await sendNotification({
    userId: candidateId,
    title: 'Manual Shift Logged by Admin',
    message: `A shift of ${netHours.toFixed(2)} hrs on ${loginDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} was added by an admin (Payout: ₹${finalPayout.toFixed(2)}).`,
    type: 'manual_shift',
    link: '/candidate/attendance',
    metadata: { loginTime: loginDate.toISOString(), payoutAmount: finalPayout },
  })

  revalidatePath('/admin')
  revalidatePath('/admin/attendance')
  revalidatePath('/admin/timesheet')
  revalidatePath('/admin/candidates')
  revalidatePath('/admin/payroll')
  revalidatePath('/candidate')
  revalidatePath('/candidate/attendance')
  revalidatePath('/candidate/payroll')
  return { success: true }
}

export async function adminUpdateAttendanceAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const supabase = await createClient()

  // 1. Verify management authorization
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

  if (!isManagementRole(adminProfile?.role)) {
    return { error: 'Access denied. Management privileges required.' }
  }

  const attendanceId = formData.get('attendanceId') as string
  const loginTimeStr = formData.get('loginTime') as string
  const logoutTimeStr = formData.get('logoutTime') as string
  const breakMinutesStr = formData.get('breakDurationMinutes') as string
  const customPayoutStr = formData.get('payoutAmount') as string
  const approvalStatus = formData.get('approvalStatus') as string
  const adminNotes = formData.get('adminNotes') as string

  if (!attendanceId) {
    return { error: 'Attendance ID is required.' }
  }

  const { data: currentRecord, error: fetchErr } = await supabase
    .from('attendance')
    .select('id, user_id, login_time, logout_time, break_duration_seconds, payout_amount')
    .eq('id', attendanceId)
    .single()

  if (fetchErr || !currentRecord) {
    return { error: 'Attendance record not found.' }
  }

  const loginDate = loginTimeStr ? new Date(loginTimeStr) : new Date(currentRecord.login_time)
  let logoutDate: Date | null = null
  if (logoutTimeStr && logoutTimeStr.trim() !== '') {
    logoutDate = new Date(logoutTimeStr)
  } else if (currentRecord.logout_time) {
    logoutDate = new Date(currentRecord.logout_time)
  }

  if (isNaN(loginDate.getTime())) {
    return { error: 'Invalid start time format.' }
  }

  if (logoutDate && isNaN(logoutDate.getTime())) {
    return { error: 'Invalid end time format.' }
  }

  if (logoutDate && logoutDate.getTime() <= loginDate.getTime()) {
    return { error: 'End time must be after start time.' }
  }

  let breakSeconds = currentRecord.break_duration_seconds || 0
  if (breakMinutesStr !== null && breakMinutesStr !== undefined && breakMinutesStr.trim() !== '') {
    const mins = parseInt(breakMinutesStr, 10)
    if (!isNaN(mins) && mins >= 0) {
      breakSeconds = mins * 60
    }
  }

  if (logoutDate && breakSeconds * 1000 >= (logoutDate.getTime() - loginDate.getTime())) {
    return { error: 'Break duration cannot exceed total shift duration.' }
  }

  // Calculate Payout
  let finalPayout = currentRecord.payout_amount || 0
  if (customPayoutStr !== null && customPayoutStr !== undefined && customPayoutStr.trim() !== '') {
    const parsed = parseFloat(customPayoutStr)
    finalPayout = isNaN(parsed) ? 0 : Math.max(0, parsed)
  } else if (logoutDate) {
    // Auto recalculate from profile hourly rate
    const { data: candidateProfile } = await supabase
      .from('profiles')
      .select('hourly_rate')
      .eq('id', currentRecord.user_id)
      .single()

    const hourlyRate = Number(candidateProfile?.hourly_rate || 0)
    const grossMs = logoutDate.getTime() - loginDate.getTime()
    const netMs = Math.max(0, grossMs - breakSeconds * 1000)
    const netHours = netMs / (1000 * 60 * 60)
    finalPayout = Math.round(netHours * hourlyRate * 100) / 100
  }

  const adminClient = createAdminClient()
  const updatePayload: any = {
    login_time: loginDate.toISOString(),
    logout_time: logoutDate ? logoutDate.toISOString() : null,
    break_duration_seconds: breakSeconds,
    payout_amount: finalPayout,
    updated_at: new Date().toISOString(),
  }

  if (approvalStatus) {
    updatePayload.approval_status = approvalStatus
  }

  if (adminNotes !== undefined) {
    updatePayload.admin_notes = adminNotes?.trim() || null
  }

  const { error: updateError } = await adminClient
    .from('attendance')
    .update(updatePayload)
    .eq('id', attendanceId)

  if (updateError) {
    return { error: updateError.message || 'Failed to update attendance record.' }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/attendance')
  revalidatePath('/admin/timesheet')
  revalidatePath('/admin/candidates')
  revalidatePath('/admin/payroll')
  revalidatePath('/candidate')
  revalidatePath('/candidate/attendance')
  revalidatePath('/candidate/payroll')
  return { success: true }
}

export async function adminDeleteAttendanceAction(
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

  if (!isAdmin(adminProfile?.role)) {
    return { error: 'Access denied. Admin privileges required.' }
  }

  const attendanceId = formData.get('attendanceId') as string
  if (!attendanceId) {
    return { error: 'Attendance ID is required.' }
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('attendance')
    .delete()
    .eq('id', attendanceId)

  if (error) {
    return { error: error.message || 'Failed to delete attendance record.' }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/attendance')
  revalidatePath('/admin/timesheet')
  revalidatePath('/admin/candidates')
  revalidatePath('/admin/payroll')
  revalidatePath('/candidate')
  revalidatePath('/candidate/attendance')
  revalidatePath('/candidate/payroll')
  return { success: true }
}

export async function adminAutoCutoffSessionAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const supabase = await createClient()

  // 1. Verify management authorization
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

  if (!isManagementRole(adminProfile?.role)) {
    return { error: 'Access denied. Management privileges required.' }
  }

  const attendanceId = formData.get('attendanceId') as string
  if (!attendanceId) {
    return { error: 'Attendance ID is required.' }
  }

  // Fetch session & profile
  const { data: session, error: fetchErr } = await supabase
    .from('attendance')
    .select('id, user_id, login_time, break_start_time, break_duration_seconds, profiles(hourly_rate, shift_id)')
    .eq('id', attendanceId)
    .single()

  if (fetchErr || !session) {
    return { error: 'Attendance session not found.' }
  }

  const profileObj: any = Array.isArray(session.profiles) ? session.profiles[0] : session.profiles
  const hourlyRate = Number(profileObj?.hourly_rate || 0)
  const shiftId = profileObj?.shift_id

  // Fetch Shift Configuration if assigned
  let shiftConfig = null
  if (shiftId) {
    const { data: sData } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', shiftId)
      .maybeSingle()
    if (sData) shiftConfig = sData
  }

  const loginDate = new Date(session.login_time)
  let cutoffDate = new Date(loginDate.getTime() + 8 * 60 * 60 * 1000) // Default 8 hours cap

  if (shiftConfig) {
    const [eH, eM, eS] = (shiftConfig.end_time || '17:00:00').split(':').map((v: string) => parseInt(v || '0', 10))
    const calculatedEnd = new Date(loginDate)
    calculatedEnd.setHours(eH, eM, eS, 0)
    if (calculatedEnd.getTime() <= loginDate.getTime()) {
      calculatedEnd.setDate(calculatedEnd.getDate() + 1)
    }
    cutoffDate = calculatedEnd
  }

  // Ensure cutoff does not exceed current time
  const now = new Date()
  if (cutoffDate.getTime() > now.getTime()) {
    cutoffDate = now
  }

  let finalBreakSeconds = session.break_duration_seconds || 0
  if (session.break_start_time) {
    const bStart = new Date(session.break_start_time).getTime()
    finalBreakSeconds += Math.max(0, Math.floor((cutoffDate.getTime() - bStart) / 1000))
  }

  const grossMs = Math.max(0, cutoffDate.getTime() - loginDate.getTime())
  const netMs = Math.max(0, grossMs - finalBreakSeconds * 1000)
  const netHours = netMs / (1000 * 60 * 60)
  const finalPayout = Math.round(netHours * hourlyRate * 100) / 100

  const adminClient = createAdminClient()
  const { error: updateErr } = await adminClient
    .from('attendance')
    .update({
      logout_time: cutoffDate.toISOString(),
      break_start_time: null,
      break_duration_seconds: finalBreakSeconds,
      payout_amount: finalPayout,
      approval_status: 'pending',
      is_auto_cutoff: true,
      admin_notes: 'Auto-cutoff executed by admin (session exceeded max shift duration)',
      updated_at: new Date().toISOString(),
    })
    .eq('id', attendanceId)

  if (updateErr) {
    return { error: updateErr.message || 'Failed to auto-cutoff session.' }
  }

  // Dispatch notification to candidate
  await sendNotification({
    userId: session.user_id,
    title: 'Shift Auto-Cutoff Executed',
    message: `Your shift was automatically closed after exceeding maximum duration. Capped payout: ₹${finalPayout.toFixed(2)}.`,
    type: 'auto_cutoff',
    link: '/candidate/attendance',
    metadata: { attendanceId, logoutTime: cutoffDate.toISOString(), payoutAmount: finalPayout },
  })

  revalidatePath('/admin')
  revalidatePath('/admin/attendance')
  revalidatePath('/admin/timesheet')
  revalidatePath('/admin/candidates')
  revalidatePath('/admin/payroll')
  revalidatePath('/candidate')
  revalidatePath('/candidate/attendance')
  revalidatePath('/candidate/payroll')
  return { success: true }
}

export async function adminResolveAllStaleSessionsAction(
  prevState?: AdminActionState,
  formData?: FormData
): Promise<AdminActionState> {
  const supabase = await createClient()

  // 1. Verify management authorization
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

  if (!isManagementRole(adminProfile?.role)) {
    return { error: 'Access denied. Management privileges required.' }
  }

  // 2. Fetch all active sessions
  const { data: activeSessions, error: fetchErr } = await supabase
    .from('attendance')
    .select('id, user_id, login_time, break_start_time, break_duration_seconds, profiles(hourly_rate, shift_id)')
    .is('logout_time', null)

  if (fetchErr) {
    return { error: fetchErr.message || 'Failed to fetch active sessions.' }
  }

  if (!activeSessions || activeSessions.length === 0) {
    return { success: true }
  }

  const now = new Date()
  const thresholdMs = 12 * 60 * 60 * 1000 // 12 hours
  const adminClient = createAdminClient()

  let resolvedCount = 0

  for (const session of activeSessions) {
    const loginDate = new Date(session.login_time)
    const elapsedMs = now.getTime() - loginDate.getTime()

    // If running for >= 12 hours, auto-cutoff
    if (elapsedMs >= thresholdMs) {
      const profileObj: any = Array.isArray(session.profiles) ? session.profiles[0] : session.profiles
      const hourlyRate = Number(profileObj?.hourly_rate || 0)
      const cutoffDate = new Date(loginDate.getTime() + 8 * 60 * 60 * 1000) // cap to 8 hours
      let breakSecs = session.break_duration_seconds || 0
      if (session.break_start_time) {
        const bStart = new Date(session.break_start_time).getTime()
        breakSecs += Math.max(0, Math.floor((cutoffDate.getTime() - bStart) / 1000))
      }

      const grossMs = Math.max(0, cutoffDate.getTime() - loginDate.getTime())
      const netMs = Math.max(0, grossMs - breakSecs * 1000)
      const netHours = netMs / (1000 * 60 * 60)
      const finalPayout = Math.round(netHours * hourlyRate * 100) / 100

      await adminClient
        .from('attendance')
        .update({
          logout_time: cutoffDate.toISOString(),
          break_start_time: null,
          break_duration_seconds: breakSecs,
          payout_amount: finalPayout,
          approval_status: 'pending',
          is_auto_cutoff: true,
          admin_notes: 'Batch auto-cutoff executed: session exceeded 12h threshold',
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id)

      resolvedCount++
    }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/attendance')
  revalidatePath('/admin/timesheet')
  revalidatePath('/admin/candidates')
  revalidatePath('/admin/payroll')
  revalidatePath('/candidate')
  revalidatePath('/candidate/attendance')
  revalidatePath('/candidate/payroll')
  return { success: true }
}


