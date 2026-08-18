'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getKolkataDateKey } from '@/lib/utils/timesheet'

export interface CreateTaskInput {
  task_date?: string // YYYY-MM-DD
  title: string
  description?: string
  project_name?: string
  status?: 'completed' | 'in_progress' | 'blocked'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  hours_spent?: number
  proof_url?: string
  blocker_description?: string
  attendance_id?: string | null
}

export interface UpdateTaskInput {
  task_date?: string
  title?: string
  description?: string
  project_name?: string
  status?: 'completed' | 'in_progress' | 'blocked'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  hours_spent?: number
  proof_url?: string
  blocker_description?: string
  attendance_id?: string | null
}

/**
 * Creates a single task report entry
 */
export async function createTaskAction(input: CreateTaskInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized. Please sign in.' }
  }

  if (!input.title || input.title.trim() === '') {
    return { error: 'Task title is required.' }
  }

  const todayKolkata = getKolkataDateKey(new Date().toISOString())
  const taskDate = input.task_date || todayKolkata

  // If status is 'blocked' but no blocker description provided, set default or validate
  const blockerDesc =
    input.status === 'blocked' ? input.blocker_description?.trim() || 'Blocked / Needs assistance' : null

  const { data: insertedTask, error } = await supabase
    .from('daily_tasks')
    .insert({
      user_id: user.id,
      task_date: taskDate,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      project_name: input.project_name?.trim() || 'General',
      status: input.status || 'completed',
      priority: input.priority || 'medium',
      hours_spent: Math.max(0, Number(input.hours_spent || 0)),
      proof_url: input.proof_url?.trim() || null,
      blocker_description: blockerDesc,
      attendance_id: input.attendance_id || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message || 'Failed to create daily task.' }
  }

  revalidatePath('/candidate')
  revalidatePath('/candidate/tasks')
  revalidatePath('/admin')
  revalidatePath('/admin/tasks')

  return { success: true, task: insertedTask }
}

/**
 * Updates an existing task
 */
export async function updateTaskAction(taskId: string, input: UpdateTaskInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized. Please sign in.' }
  }

  // Verify ownership or admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const { data: existingTask, error: fetchErr } = await supabase
    .from('daily_tasks')
    .select('user_id')
    .eq('id', taskId)
    .single()

  if (fetchErr || !existingTask) {
    return { error: 'Task not found.' }
  }

  if (!isAdmin && existingTask.user_id !== user.id) {
    return { error: 'You do not have permission to edit this task.' }
  }

  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }

  if (input.title !== undefined) updatePayload.title = input.title.trim()
  if (input.description !== undefined) updatePayload.description = input.description?.trim() || null
  if (input.project_name !== undefined) updatePayload.project_name = input.project_name?.trim() || 'General'
  if (input.status !== undefined) {
    updatePayload.status = input.status
    if (input.status !== 'blocked') {
      updatePayload.blocker_description = null
    }
  }
  if (input.priority !== undefined) updatePayload.priority = input.priority
  if (input.hours_spent !== undefined) updatePayload.hours_spent = Math.max(0, Number(input.hours_spent || 0))
  if (input.proof_url !== undefined) updatePayload.proof_url = input.proof_url?.trim() || null
  if (input.blocker_description !== undefined && input.status === 'blocked') {
    updatePayload.blocker_description = input.blocker_description?.trim() || null
  }
  if (input.task_date !== undefined) updatePayload.task_date = input.task_date
  if (input.attendance_id !== undefined) updatePayload.attendance_id = input.attendance_id

  const { error } = await supabase
    .from('daily_tasks')
    .update(updatePayload)
    .eq('id', taskId)

  if (error) {
    return { error: error.message || 'Failed to update task.' }
  }

  revalidatePath('/candidate')
  revalidatePath('/candidate/tasks')
  revalidatePath('/admin')
  revalidatePath('/admin/tasks')

  return { success: true }
}

/**
 * Quick status update action
 */
export async function updateTaskStatusAction(
  taskId: string,
  status: 'completed' | 'in_progress' | 'blocked',
  blockerDescription?: string
) {
  return updateTaskAction(taskId, {
    status,
    blocker_description: status === 'blocked' ? blockerDescription || 'Blocked' : undefined,
  })
}

/**
 * Deletes a task
 */
export async function deleteTaskAction(taskId: string) {
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

  const isAdmin = profile?.role === 'admin'

  const { data: existingTask, error: fetchErr } = await supabase
    .from('daily_tasks')
    .select('user_id')
    .eq('id', taskId)
    .single()

  if (fetchErr || !existingTask) {
    return { error: 'Task not found.' }
  }

  if (!isAdmin && existingTask.user_id !== user.id) {
    return { error: 'Permission denied.' }
  }

  const { error } = await supabase
    .from('daily_tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    return { error: error.message || 'Failed to delete task.' }
  }

  revalidatePath('/candidate')
  revalidatePath('/candidate/tasks')
  revalidatePath('/admin')
  revalidatePath('/admin/tasks')

  return { success: true }
}

/**
 * Admin: Adds manager review / feedback note to candidate task
 */
export async function submitAdminTaskFeedbackAction(taskId: string, feedback: string) {
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
    return { error: 'Access denied. Admin role required.' }
  }

  const { error } = await supabase
    .from('daily_tasks')
    .update({
      admin_feedback: feedback.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)

  if (error) {
    return { error: error.message || 'Failed to save admin feedback.' }
  }

  revalidatePath('/admin/tasks')
  revalidatePath('/candidate/tasks')

  return { success: true }
}
