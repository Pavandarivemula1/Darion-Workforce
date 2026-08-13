'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type OvershiftActionState = {
  error?: string
  success?: boolean
}

export async function requestOvershiftAction(date: string, requestType: 'now' | 'later' = 'now') {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized. Please sign in.' }
  }

  // Check for existing pending or approved requests for this date
  const { data: existingRequests, error: checkError } = await supabase
    .from('overshift_requests')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('request_date', date)
    .in('status', ['pending', 'approved'])
    .limit(1)

  if (checkError) {
    return { error: 'Error checking existing requests.' }
  }

  if (existingRequests && existingRequests.length > 0) {
    return { error: `You already have a ${existingRequests[0].status} overshift request for this date.` }
  }

  const { error } = await supabase
    .from('overshift_requests')
    .insert({
      user_id: user.id,
      request_date: date,
      request_type: requestType,
    })

  if (error) {
    if (error.code === '23505') {
      return { error: 'You have already requested an overshift for this date.' }
    }
    return { error: error.message || 'Failed to request overshift.' }
  }

  revalidatePath('/candidate')
  return { success: true }
}

export async function approveOvershiftAction(
  prevState: OvershiftActionState,
  formData: FormData
): Promise<OvershiftActionState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized.' }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    return { error: 'Access denied. Admin privileges required.' }
  }

  const requestId = formData.get('requestId') as string
  if (!requestId) return { error: 'Request ID is required.' }

  const { error } = await supabase
    .from('overshift_requests')
    .update({ status: 'approved' })
    .eq('id', requestId)

  if (error) return { error: error.message || 'Failed to approve overshift.' }

  revalidatePath('/admin/attendance')
  return { success: true }
}

export async function rejectOvershiftAction(
  prevState: OvershiftActionState,
  formData: FormData
): Promise<OvershiftActionState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized.' }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    return { error: 'Access denied.' }
  }

  const requestId = formData.get('requestId') as string
  if (!requestId) return { error: 'Request ID is required.' }

  const { error } = await supabase
    .from('overshift_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId)

  if (error) return { error: error.message || 'Failed to reject overshift.' }

  revalidatePath('/admin/attendance')
  return { success: true }
}
