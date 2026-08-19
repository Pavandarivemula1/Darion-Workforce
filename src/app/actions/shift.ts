'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isManagementRole } from '@/lib/auth/permissions'

export type ShiftActionState = {
  error?: string
  success?: boolean
}

/**
 * Check if the calling user is an authorized management user
 */
async function verifyAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, user: null, error: 'Unauthorized.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!isManagementRole(profile?.role)) {
    return { supabase, user: null, error: 'Access denied. Management privileges required.' }
  }

  return { supabase, user, error: null }
}

/**
 * Create a new shift template
 */
export async function createShiftAction(
  prevState: ShiftActionState,
  formData: FormData
): Promise<ShiftActionState> {
  const { supabase, error: authError } = await verifyAdmin()
  if (authError) return { error: authError }

  const name = (formData.get('name') as string)?.trim()
  const startTime = (formData.get('startTime') as string)?.trim()
  const endTime = (formData.get('endTime') as string)?.trim()
  const gracePeriodMins = parseInt((formData.get('gracePeriodMins') as string) || '15', 10)
  const autoLogoutEnabled = formData.get('autoLogoutEnabled') === 'true' || formData.get('autoLogoutEnabled') === 'on'
  const isDefault = formData.get('isDefault') === 'true' || formData.get('isDefault') === 'on'

  if (!name || !startTime || !endTime) {
    return { error: 'Shift name, start time, and end time are required.' }
  }

  // Determine if overnight based on start and end time
  const [sH, sM] = startTime.split(':').map((v) => parseInt(v || '0', 10))
  const [eH, eM] = endTime.split(':').map((v) => parseInt(v || '0', 10))
  const startMin = sH * 60 + sM
  const endMin = eH * 60 + eM
  const isOvernight = endMin <= startMin

  // If this shift is marked default, unset is_default on other shifts first
  if (isDefault) {
    await supabase.from('shifts').update({ is_default: false }).neq('id', '00000000-0000-0000-0000-000000000000')
  }

  const { error } = await supabase.from('shifts').insert({
    name,
    start_time: startTime.length === 5 ? `${startTime}:00` : startTime,
    end_time: endTime.length === 5 ? `${endTime}:00` : endTime,
    grace_period_mins: isNaN(gracePeriodMins) ? 15 : Math.max(0, gracePeriodMins),
    auto_logout_enabled: autoLogoutEnabled,
    is_overnight: isOvernight,
    is_default: isDefault,
  })

  if (error) {
    return { error: error.message || 'Failed to create shift.' }
  }

  revalidatePath('/admin/shifts')
  revalidatePath('/admin/candidates')
  revalidatePath('/candidate')
  return { success: true }
}

/**
 * Update an existing shift template
 */
export async function updateShiftAction(
  prevState: ShiftActionState,
  formData: FormData
): Promise<ShiftActionState> {
  const { supabase, error: authError } = await verifyAdmin()
  if (authError) return { error: authError }

  const shiftId = formData.get('shiftId') as string
  const name = (formData.get('name') as string)?.trim()
  const startTime = (formData.get('startTime') as string)?.trim()
  const endTime = (formData.get('endTime') as string)?.trim()
  const gracePeriodMins = parseInt((formData.get('gracePeriodMins') as string) || '15', 10)
  const autoLogoutEnabled = formData.get('autoLogoutEnabled') === 'true' || formData.get('autoLogoutEnabled') === 'on'
  const isDefault = formData.get('isDefault') === 'true' || formData.get('isDefault') === 'on'

  if (!shiftId || !name || !startTime || !endTime) {
    return { error: 'Shift ID, name, start time, and end time are required.' }
  }

  const [sH, sM] = startTime.split(':').map((v) => parseInt(v || '0', 10))
  const [eH, eM] = endTime.split(':').map((v) => parseInt(v || '0', 10))
  const startMin = sH * 60 + sM
  const endMin = eH * 60 + eM
  const isOvernight = endMin <= startMin

  if (isDefault) {
    await supabase.from('shifts').update({ is_default: false }).neq('id', shiftId)
  }

  const { error } = await supabase
    .from('shifts')
    .update({
      name,
      start_time: startTime.length === 5 ? `${startTime}:00` : startTime,
      end_time: endTime.length === 5 ? `${endTime}:00` : endTime,
      grace_period_mins: isNaN(gracePeriodMins) ? 15 : Math.max(0, gracePeriodMins),
      auto_logout_enabled: autoLogoutEnabled,
      is_overnight: isOvernight,
      is_default: isDefault,
      updated_at: new Date().toISOString(),
    })
    .eq('id', shiftId)

  if (error) {
    return { error: error.message || 'Failed to update shift.' }
  }

  revalidatePath('/admin/shifts')
  revalidatePath('/admin/candidates')
  revalidatePath('/candidate')
  return { success: true }
}

/**
 * Delete a shift template (with safety checks)
 */
export async function deleteShiftAction(
  prevState: ShiftActionState,
  formData: FormData
): Promise<ShiftActionState> {
  const { supabase, error: authError } = await verifyAdmin()
  if (authError) return { error: authError }

  const shiftId = formData.get('shiftId') as string
  if (!shiftId) return { error: 'Shift ID is required.' }

  // Check if shift is default
  const { data: targetShift } = await supabase
    .from('shifts')
    .select('id, is_default, name')
    .eq('id', shiftId)
    .single()

  if (targetShift?.is_default) {
    return { error: 'Cannot delete the system default shift. Designate another shift as default first.' }
  }

  // Find system default shift to reassign any candidates currently assigned to the shift being deleted
  const { data: defaultShift } = await supabase
    .from('shifts')
    .select('id')
    .eq('is_default', true)
    .maybeSingle()

  if (defaultShift) {
    await supabase
      .from('profiles')
      .update({ shift_id: defaultShift.id })
      .eq('shift_id', shiftId)
  } else {
    await supabase
      .from('profiles')
      .update({ shift_id: null })
      .eq('shift_id', shiftId)
  }

  const { error } = await supabase.from('shifts').delete().eq('id', shiftId)

  if (error) {
    return { error: error.message || 'Failed to delete shift.' }
  }

  revalidatePath('/admin/shifts')
  revalidatePath('/admin/candidates')
  revalidatePath('/candidate')
  return { success: true }
}

/**
 * Set a shift as the system default
 */
export async function setDefaultShiftAction(
  prevState: ShiftActionState,
  formData: FormData
): Promise<ShiftActionState> {
  const { supabase, error: authError } = await verifyAdmin()
  if (authError) return { error: authError }

  const shiftId = formData.get('shiftId') as string
  if (!shiftId) return { error: 'Shift ID is required.' }

  // 1. Unset all
  await supabase.from('shifts').update({ is_default: false }).neq('id', '00000000-0000-0000-0000-000000000000')

  // 2. Set target
  const { error } = await supabase
    .from('shifts')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', shiftId)

  if (error) {
    return { error: error.message || 'Failed to set default shift.' }
  }

  revalidatePath('/admin/shifts')
  revalidatePath('/admin/candidates')
  revalidatePath('/candidate')
  return { success: true }
}

/**
 * Assign a candidate to a specific shift
 */
export async function assignCandidateShiftAction(
  prevState: ShiftActionState,
  formData: FormData
): Promise<ShiftActionState> {
  const { supabase, error: authError } = await verifyAdmin()
  if (authError) return { error: authError }

  const candidateId = formData.get('candidateId') as string
  const shiftId = (formData.get('shiftId') as string) || null

  if (!candidateId) return { error: 'Candidate ID is required.' }

  const { error } = await supabase
    .from('profiles')
    .update({
      shift_id: shiftId === 'none' ? null : shiftId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', candidateId)

  if (error) {
    return { error: error.message || 'Failed to assign candidate shift.' }
  }

  revalidatePath('/admin/shifts')
  revalidatePath('/admin/candidates')
  revalidatePath('/candidate')
  return { success: true }
}
