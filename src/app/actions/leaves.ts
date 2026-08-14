'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

  if (profile?.role !== 'admin') {
    return { error: 'Access denied. Admin privileges required.' }
  }

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

  if (profile?.role !== 'admin') {
    return { error: 'Access denied. Admin privileges required.' }
  }

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

  if (profile?.role !== 'admin') {
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
