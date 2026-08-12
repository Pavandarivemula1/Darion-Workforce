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

  // Insert attendance record
  const { error } = await supabase
    .from('attendance')
    .insert({
      user_id: user.id,
      login_time: new Date().toISOString(),
      break_duration_seconds: 0,
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

export async function startBreakAction() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized. Please sign in.' }
  }

  const { data: activeSession, error: fetchError } = await supabase
    .from('attendance')
    .select('id, break_start_time')
    .eq('user_id', user.id)
    .is('logout_time', null)
    .single()

  if (fetchError || !activeSession) {
    return { error: 'No active work session found to take a break.' }
  }

  if (activeSession.break_start_time) {
    return { error: 'You are already on break.' }
  }

  const { error: updateError } = await supabase
    .from('attendance')
    .update({
      break_start_time: new Date().toISOString(),
    })
    .eq('id', activeSession.id)

  if (updateError) {
    return { error: updateError.message || 'Failed to start break.' }
  }

  revalidatePath('/candidate')
  revalidatePath('/candidate/attendance')
  return { success: true }
}

export async function endBreakAction() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized. Please sign in.' }
  }

  const { data: activeSession, error: fetchError } = await supabase
    .from('attendance')
    .select('id, break_start_time, break_duration_seconds')
    .eq('user_id', user.id)
    .is('logout_time', null)
    .single()

  if (fetchError || !activeSession || !activeSession.break_start_time) {
    return { error: 'You are not currently on break.' }
  }

  const breakStart = new Date(activeSession.break_start_time).getTime()
  const now = new Date().getTime()
  const elapsedSec = Math.max(0, Math.floor((now - breakStart) / 1000))
  const newBreakDuration = (activeSession.break_duration_seconds || 0) + elapsedSec

  const { error: updateError } = await supabase
    .from('attendance')
    .update({
      break_start_time: null,
      break_duration_seconds: newBreakDuration,
    })
    .eq('id', activeSession.id)

  if (updateError) {
    return { error: updateError.message || 'Failed to end break.' }
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
    .select('id, login_time, break_start_time, break_duration_seconds')
    .eq('user_id', user.id)
    .is('logout_time', null)
    .single()

  if (fetchError || !activeSession) {
    return { error: 'No active work session found to end.' }
  }

  let finalBreakSeconds = activeSession.break_duration_seconds || 0

  // If candidate is ending work while currently on break, auto-accumulate final break time
  if (activeSession.break_start_time) {
    const breakStart = new Date(activeSession.break_start_time).getTime()
    const now = new Date().getTime()
    const elapsedSec = Math.max(0, Math.floor((now - breakStart) / 1000))
    finalBreakSeconds += elapsedSec
  }

  // Update active session with logout_time and final break seconds
  const { error: updateError } = await supabase
    .from('attendance')
    .update({
      logout_time: new Date().toISOString(),
      break_start_time: null,
      break_duration_seconds: finalBreakSeconds,
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
