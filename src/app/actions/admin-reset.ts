'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approvePasswordReset(requestId: string, userId: string) {
  const adminClient = createAdminClient()

  // Generate a random temporary password
  const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'

  // 1. Update the user's password using the admin api
  const { error: updateError } = await adminClient.auth.admin.updateUserById(
    userId,
    { password: tempPassword }
  )

  if (updateError) {
    return { error: 'Failed to update user password.' }
  }

  // 2. Mark the request as approved
  const { error: reqError } = await adminClient
    .from('password_reset_requests')
    .update({ status: 'approved' })
    .eq('id', requestId)

  if (reqError) {
    return { error: 'Failed to update request status.' }
  }

  revalidatePath('/admin/reset-requests')

  // Return the temporary password so the admin can see it and share it
  return { success: true, tempPassword }
}

export async function rejectPasswordReset(requestId: string) {
  const adminClient = createAdminClient()

  const { error: reqError } = await adminClient
    .from('password_reset_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId)

  if (reqError) {
    return { error: 'Failed to update request status.' }
  }

  revalidatePath('/admin/reset-requests')
  return { success: true }
}
