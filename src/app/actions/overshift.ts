'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendNotification, sendAdminBroadcast } from '@/lib/utils/notifications'

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

  // Fetch candidate profile name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const candidateName = profile?.full_name || 'A candidate'

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

  // Broadcast to all admins
  await sendAdminBroadcast({
    title: 'New Overshift Request',
    message: `${candidateName} requested an ${requestType === 'now' ? 'immediate' : 'upcoming'} overshift for ${date}.`,
    type: 'overshift_requested',
    link: '/admin/attendance',
    metadata: { candidateId: user.id, requestDate: date, requestType },
  })

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

  const { data: req, error: fetchErr } = await supabase
    .from('overshift_requests')
    .select('id, user_id, request_date')
    .eq('id', requestId)
    .single()

  if (fetchErr || !req) {
    return { error: 'Overshift request not found.' }
  }

  const { error } = await supabase
    .from('overshift_requests')
    .update({ status: 'approved' })
    .eq('id', requestId)

  if (error) return { error: error.message || 'Failed to approve overshift.' }

  // Notify candidate
  await sendNotification({
    userId: req.user_id,
    title: 'Overshift Approved',
    message: `Your overshift request for ${req.request_date} has been approved. You are authorized to work extra hours.`,
    type: 'overshift_status',
    link: '/candidate',
    metadata: { requestId, status: 'approved' },
  })

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

  const { data: req, error: fetchErr } = await supabase
    .from('overshift_requests')
    .select('id, user_id, request_date')
    .eq('id', requestId)
    .single()

  if (fetchErr || !req) {
    return { error: 'Overshift request not found.' }
  }

  const { error } = await supabase
    .from('overshift_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId)

  if (error) return { error: error.message || 'Failed to reject overshift.' }

  // Notify candidate
  await sendNotification({
    userId: req.user_id,
    title: 'Overshift Rejected',
    message: `Your overshift request for ${req.request_date} was rejected by an administrator.`,
    type: 'overshift_status',
    link: '/candidate',
    metadata: { requestId, status: 'rejected' },
  })

  revalidatePath('/admin/attendance')
  return { success: true }
}
