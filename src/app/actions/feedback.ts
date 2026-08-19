'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isManagementRole, isAdmin } from '@/lib/auth/permissions'

export interface SubmitFeedbackInput {
  type?: 'shift_feedback' | 'suggestion' | 'bug' | 'workplace' | 'general'
  rating?: number
  mood?: string
  tags?: string[]
  title?: string
  message: string
  attendance_id?: string | null
}

export async function submitFeedbackAction(input: SubmitFeedbackInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized. Please sign in to submit feedback.' }
  }

  if (!input.message || input.message.trim() === '') {
    return { error: 'Please enter a message for your feedback.' }
  }

  const { error } = await supabase.from('feedbacks').insert({
    user_id: user.id,
    type: input.type || 'general',
    rating: input.rating || null,
    mood: input.mood || null,
    tags: input.tags || [],
    title: input.title ? input.title.trim() : null,
    message: input.message.trim(),
    attendance_id: input.attendance_id || null,
    status: 'new',
  })

  if (error) {
    return { error: error.message || 'Failed to submit feedback.' }
  }

  revalidatePath('/candidate')
  revalidatePath('/candidate/feedback')
  revalidatePath('/admin/feedback')
  return { success: true }
}

export async function submitShiftFeedbackAction(input: {
  rating?: number
  mood?: string
  tags?: string[]
  message?: string
  attendance_id?: string | null
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized. Please sign in.' }
  }

  const note = input.message?.trim() || 'Shift completed.'

  const { error } = await supabase.from('feedbacks').insert({
    user_id: user.id,
    type: 'shift_feedback',
    rating: input.rating || null,
    mood: input.mood || null,
    tags: input.tags || [],
    title: input.mood ? `Shift Mood: ${input.mood}` : 'Shift Feedback',
    message: note,
    attendance_id: input.attendance_id || null,
    status: 'new',
  })

  if (error) {
    return { error: error.message || 'Failed to record shift feedback.' }
  }

  revalidatePath('/candidate')
  revalidatePath('/candidate/feedback')
  revalidatePath('/admin/feedback')
  return { success: true }
}

export async function updateFeedbackStatusAction(
  feedbackId: string,
  status: 'new' | 'in_review' | 'resolved' | 'dismissed',
  adminNotes?: string
) {
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
    return { error: 'Access denied. Management permissions required.' }
  }

  const updatePayload: {
    status: string
    admin_notes?: string | null
    updated_at: string
  } = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (adminNotes !== undefined) {
    updatePayload.admin_notes = adminNotes
  }

  const { error } = await supabase
    .from('feedbacks')
    .update(updatePayload)
    .eq('id', feedbackId)

  if (error) {
    return { error: error.message || 'Failed to update feedback status.' }
  }

  revalidatePath('/admin/feedback')
  revalidatePath('/candidate/feedback')
  return { success: true }
}

export async function deleteFeedbackAction(feedbackId: string) {
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
    return { error: 'Access denied. Administrator permissions required.' }
  }

  const { error } = await supabase
    .from('feedbacks')
    .delete()
    .eq('id', feedbackId)

  if (error) {
    return { error: error.message || 'Failed to delete feedback.' }
  }

  revalidatePath('/admin/feedback')
  revalidatePath('/candidate/feedback')
  return { success: true }
}
