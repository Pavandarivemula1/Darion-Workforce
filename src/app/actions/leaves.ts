'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendNotification, sendAdminBroadcast } from '@/lib/utils/notifications'
import { isManagementRole, isAdmin } from '@/lib/auth/permissions'

export interface RequestLeaveInput {
  leave_type: 'casual' | 'sick' | 'paid' | 'unpaid' | 'emergency'
  start_date: string
  end_date: string
  total_days: number
  reason: string
}

export async function requestLeaveAction(input: RequestLeaveInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized. Please sign in to apply for leave.' }
  }

  if (!input.start_date || !input.end_date) {
    return { error: 'Please select start and end dates.' }
  }

  if (new Date(input.start_date) > new Date(input.end_date)) {
    return { error: 'Start date cannot be after end date.' }
  }

  if (!input.reason || input.reason.trim() === '') {
    return { error: 'Please provide a reason for your leave request.' }
  }

  if (input.total_days <= 0) {
    return { error: 'Total leave duration must be at least 1 day.' }
  }

  // Check for existing overlapping leaves (pending or approved)
  const { data: existingLeaves, error: fetchErr } = await supabase
    .from('leaves')
    .select('id, start_date, end_date, status')
    .eq('user_id', user.id)
    .in('status', ['pending', 'approved'])
    .or(`and(start_date.lte.${input.end_date},end_date.gte.${input.start_date})`)

  if (!fetchErr && existingLeaves && existingLeaves.length > 0) {
    return {
      error: `You already have an active or pending leave overlapping with this date range (${existingLeaves[0].start_date} to ${existingLeaves[0].end_date}).`,
    }
  }

  // Fetch candidate profile name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const candidateName = profile?.full_name || 'A candidate'

  const { error } = await supabase.from('leaves').insert({
    user_id: user.id,
    leave_type: input.leave_type,
    start_date: input.start_date,
    end_date: input.end_date,
    total_days: input.total_days,
    reason: input.reason.trim(),
    status: 'pending',
  })

  if (error) {
    return { error: error.message || 'Failed to submit leave request.' }
  }

  // Broadcast to all admins
  await sendAdminBroadcast({
    title: 'New Leave Request',
    message: `${candidateName} applied for ${input.leave_type.toUpperCase()} leave (${input.total_days} ${input.total_days === 1 ? 'day' : 'days'}) from ${input.start_date} to ${input.end_date}.`,
    type: 'leave_requested',
    link: '/admin/leaves',
    metadata: { candidateId: user.id, startDate: input.start_date, endDate: input.end_date, leaveType: input.leave_type },
  })

  revalidatePath('/candidate')
  revalidatePath('/candidate/leaves')
  revalidatePath('/admin/leaves')
  return { success: true }
}

export async function cancelLeaveAction(leaveId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized.' }
  }

  const { error } = await supabase
    .from('leaves')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', leaveId)
    .eq('user_id', user.id)
    .eq('status', 'pending')

  if (error) {
    return { error: error.message || 'Failed to cancel leave request.' }
  }

  revalidatePath('/candidate')
  revalidatePath('/candidate/leaves')
  revalidatePath('/admin/leaves')
  return { success: true }
}

export async function approveLeaveAction(leaveId: string, adminNotes?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!isManagementRole(profile?.role)) {
    return { error: 'Access denied. Management privileges required.' }
  }

  // Fetch leave details to notify recipient
  const { data: leaveRecord } = await supabase
    .from('leaves')
    .select('id, user_id, start_date, end_date, total_days, leave_type')
    .eq('id', leaveId)
    .single()

  const updateData: {
    status: string
    approved_by: string
    admin_notes?: string | null
    updated_at: string
  } = {
    status: 'approved',
    approved_by: user.id,
    updated_at: new Date().toISOString(),
  }

  if (adminNotes !== undefined) {
    updateData.admin_notes = adminNotes.trim() || null
  }

  const { error } = await supabase
    .from('leaves')
    .update(updateData)
    .eq('id', leaveId)

  if (error) {
    return { error: error.message || 'Failed to approve leave request.' }
  }

  if (leaveRecord?.user_id) {
    await sendNotification({
      userId: leaveRecord.user_id,
      title: 'Leave Request Approved',
      message: `Your ${leaveRecord.leave_type.toUpperCase()} leave request from ${leaveRecord.start_date} to ${leaveRecord.end_date} (${leaveRecord.total_days} days) has been approved.`,
      type: 'leave_status',
      link: '/candidate/leaves',
      metadata: { leaveId, status: 'approved' },
    })
  }

  revalidatePath('/admin/leaves')
  revalidatePath('/candidate/leaves')
  return { success: true }
}

export async function rejectLeaveAction(leaveId: string, adminNotes: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!isManagementRole(profile?.role)) {
    return { error: 'Access denied. Management privileges required.' }
  }

  // Fetch leave details to notify recipient
  const { data: leaveRecord } = await supabase
    .from('leaves')
    .select('id, user_id, start_date, end_date, total_days, leave_type')
    .eq('id', leaveId)
    .single()

  const { error } = await supabase
    .from('leaves')
    .update({
      status: 'rejected',
      admin_notes: adminNotes.trim() || 'Leave request rejected by management.',
      approved_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', leaveId)

  if (error) {
    return { error: error.message || 'Failed to reject leave request.' }
  }

  if (leaveRecord?.user_id) {
    await sendNotification({
      userId: leaveRecord.user_id,
      title: 'Leave Request Rejected',
      message: `Your ${leaveRecord.leave_type.toUpperCase()} leave request from ${leaveRecord.start_date} to ${leaveRecord.end_date} was rejected. Note: ${adminNotes.trim() || 'Contact administration.'}`,
      type: 'leave_status',
      link: '/candidate/leaves',
      metadata: { leaveId, status: 'rejected' },
    })
  }

  revalidatePath('/admin/leaves')
  revalidatePath('/candidate/leaves')
  return { success: true }
}

export async function deleteLeaveAction(leaveId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!isAdmin(profile?.role)) {
    return { error: 'Access denied. Admin privileges required.' }
  }

  const { error } = await supabase
    .from('leaves')
    .delete()
    .eq('id', leaveId)

  if (error) {
    return { error: error.message || 'Failed to delete leave record.' }
  }

  revalidatePath('/admin/leaves')
  revalidatePath('/candidate/leaves')
  return { success: true }
}
