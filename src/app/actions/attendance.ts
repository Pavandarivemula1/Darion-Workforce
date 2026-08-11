'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function startWorkAction() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized. Please sign in.' }
  }

  // Double check active session server-side
  const { data: activeSession } = await supabase
    .from('attendance')
    .select('id')
    .eq('user_id', user.id)
    .is('logout_time', null)
    .maybeSingle()

  if (activeSession) {
    return { error: 'You already have an active work session in progress.' }
  }

  // Insert attendance record (login_time defaults to PostgreSQL NOW() on server)
  const { error } = await supabase
    .from('attendance')
    .insert({
      user_id: user.id,
      login_time: new Date().toISOString(),
    })

  if (error) {
    if (error.code === '23505') {
      return { error: 'You already have an active work session in progress.' }
    }
    return { error: error.message || 'Failed to start work.' }
  }

  revalidatePath('/candidate')
  revalidatePath('/candidate/attendance')
  return { success: true }
}

export async function endWorkAction() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized. Please sign in.' }
  }

  // Find active session
  const { data: activeSession, error: fetchError } = await supabase
    .from('attendance')
    .select('id, login_time')
    .eq('user_id', user.id)
    .is('logout_time', null)
    .single()

  if (fetchError || !activeSession) {
    return { error: 'No active work session found to end.' }
  }

  // Update active session with authoritative server timestamp
  const { error: updateError } = await supabase
    .from('attendance')
    .update({
      logout_time: new Date().toISOString(),
    })
    .eq('id', activeSession.id)
    .is('logout_time', null)

  if (updateError) {
    return { error: updateError.message || 'Failed to end work.' }
  }

  revalidatePath('/candidate')
  revalidatePath('/candidate/attendance')
  return { success: true }
}
