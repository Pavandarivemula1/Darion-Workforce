import { createAdminClient } from '@/lib/supabase/server'

export type NotificationType =
  | 'shift_approved'
  | 'shift_rejected'
  | 'timer_started'
  | 'timer_stopped'
  | 'manual_shift'
  | 'auto_cutoff'
  | 'overshift_requested'
  | 'overshift_status'
  | 'leave_requested'
  | 'leave_status'
  | 'mfa_reset'
  | 'chat_message'
  | 'chat_mention'
  | 'meet_started'
  | 'calendar_event'
  | 'payroll_settled'
  | 'shift_assigned'
  | 'task_assigned'
  | 'task_completed'
  | 'feedback_received'
  | 'general'

export interface NotificationItem {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  link?: string | null
  read: boolean
  read_at?: string | null
  metadata?: Record<string, any>
  created_at: string
}

export interface SendNotificationParams {
  userId: string
  title: string
  message: string
  type?: NotificationType
  link?: string | null
  metadata?: Record<string, any>
}

export interface SendAdminBroadcastParams {
  title: string
  message: string
  type?: NotificationType
  link?: string | null
  metadata?: Record<string, any>
}

/**
 * Sends an in-app notification to a specific candidate or user.
 */
export async function sendNotification({
  userId,
  title,
  message,
  type = 'general',
  link = null,
  metadata = {},
}: SendNotificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const adminClient = createAdminClient()
    const { error } = await adminClient.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      link,
      metadata,
      read: false,
    })

    if (error) {
      console.error('[sendNotification error]:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('[sendNotification exception]:', err)
    return { success: false, error: err?.message || 'Failed to dispatch notification' }
  }
}

/**
 * Broadcasts an in-app notification to all active administrators.
 */
export async function sendAdminBroadcast({
  title,
  message,
  type = 'general',
  link = null,
  metadata = {},
}: SendAdminBroadcastParams): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const adminClient = createAdminClient()
    const { data: admins, error: fetchErr } = await adminClient
      .from('profiles')
      .select('id')
      .eq('role', 'admin')

    if (fetchErr || !admins || admins.length === 0) {
      return { success: true, count: 0 }
    }

    const payload = admins.map((admin) => ({
      user_id: admin.id,
      title,
      message,
      type,
      link,
      metadata,
      read: false,
    }))

    const { error: insertErr } = await adminClient.from('notifications').insert(payload)
    if (insertErr) {
      console.error('[sendAdminBroadcast error]:', insertErr)
      return { success: false, error: insertErr.message }
    }

    return { success: true, count: admins.length }
  } catch (err: any) {
    console.error('[sendAdminBroadcast exception]:', err)
    return { success: false, error: err?.message || 'Failed to broadcast notification' }
  }
}

/**
 * Dispatches bulk notifications to multiple users.
 */
export async function sendBulkNotification(
  notifications: SendNotificationParams[]
): Promise<{ success: boolean; count?: number; error?: string }> {
  if (!notifications || notifications.length === 0) {
    return { success: true, count: 0 }
  }

  try {
    const adminClient = createAdminClient()
    const payload = notifications.map((n) => ({
      user_id: n.userId,
      title: n.title,
      message: n.message,
      type: n.type || 'general',
      link: n.link || null,
      metadata: n.metadata || {},
      read: false,
    }))

    const { error: insertErr } = await adminClient.from('notifications').insert(payload)
    if (insertErr) {
      console.error('[sendBulkNotification error]:', insertErr)
      return { success: false, error: insertErr.message }
    }

    return { success: true, count: payload.length }
  } catch (err: any) {
    console.error('[sendBulkNotification exception]:', err)
    return { success: false, error: err?.message || 'Failed to dispatch bulk notifications' }
  }
}
