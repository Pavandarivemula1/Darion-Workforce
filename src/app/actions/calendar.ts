'use server'

import { createClient, createAdminClient, getCurrentUserFast } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendBulkNotification } from '@/lib/utils/notifications'

function getSupabase() {
  try {
    return createAdminClient()
  } catch {
    return createClient()
  }
}

function sanitizeUuid(id?: string | null): string | null {
  if (!id) return null
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id) ? id : null
}

export type CalendarEventSource = 'custom_event' | 'meeting' | 'shift' | 'leave' | 'task'

export interface UnifiedCalendarItem {
  id: string
  source: CalendarEventSource
  title: string
  description?: string
  startTime: string
  endTime: string
  isAllDay: boolean
  color: string
  badgeText: string
  iconName: string
  meetUrl?: string
  location?: string
  status?: string
  organizerName?: string
  organizerAvatarUrl?: string
  attendeesCount?: number
  canEdit: boolean
  rawId: string
  metadata?: any
}

export interface CalendarFilterOptions {
  startDate: string // YYYY-MM-DD or ISO
  endDate: string // YYYY-MM-DD or ISO
  layers?: {
    customEvents?: boolean
    meetings?: boolean
    shifts?: boolean
    leaves?: boolean
    tasks?: boolean
  }
  candidateId?: string
}

/**
 * Generates unified calendar feed combining:
 * 1. calendar_events
 * 2. meet_rooms (Video Meetings)
 * 3. shifts (Workforce roster shifts)
 * 4. leaves (Approved / Pending leaves)
 * 5. daily_tasks (Task reporting deadlines)
 */
export async function getUnifiedCalendarFeedAction(
  options: CalendarFilterOptions
): Promise<UnifiedCalendarItem[]> {
  const user = await getCurrentUserFast()
  if (!user) return []

  const supabase = await getSupabase()
  const items: UnifiedCalendarItem[] = []

  const startIso = new Date(options.startDate).toISOString()
  const endIso = new Date(options.endDate).toISOString()
  const startDateStr = options.startDate.split('T')[0]
  const endDateStr = options.endDate.split('T')[0]

  const layers = {
    customEvents: options.layers?.customEvents ?? true,
    meetings: options.layers?.meetings ?? true,
    shifts: options.layers?.shifts ?? true,
    leaves: options.layers?.leaves ?? true,
    tasks: options.layers?.tasks ?? true,
  }

  const targetUserId = options.candidateId ? sanitizeUuid(options.candidateId) : (user.role === 'candidate' ? user.id : null)

  // 1. Fetch Custom Calendar Events
  if (layers.customEvents) {
    try {
      let q = supabase
        .from('calendar_events')
        .select(`
          id,
          title,
          description,
          event_type,
          start_time,
          end_time,
          is_all_day,
          location,
          meet_url,
          color_tag,
          organizer_id,
          visibility,
          department,
          profiles:organizer_id (
            id,
            full_name,
            avatar_url
          ),
          calendar_event_attendees (
            user_id,
            status
          )
        `)
        .gte('end_time', startIso)
        .lte('start_time', endIso)

      const { data: events, error } = await q

      if (!error && events) {
        for (const evt of events) {
          const org = evt.profiles as any
          const color = evt.color_tag || '#3B82F6'
          const canEdit = user.role === 'admin' || user.role === 'super_admin' || evt.organizer_id === user.id

          items.push({
            id: `evt-${evt.id}`,
            source: 'custom_event',
            title: evt.title,
            description: evt.description,
            startTime: evt.start_time,
            endTime: evt.end_time,
            isAllDay: evt.is_all_day,
            color,
            badgeText: evt.event_type ? evt.event_type.replace('_', ' ').toUpperCase() : 'EVENT',
            iconName: evt.event_type === 'training' ? 'GraduationCap' : 'Calendar',
            meetUrl: evt.meet_url,
            location: evt.location,
            organizerName: org?.full_name || 'Organizer',
            organizerAvatarUrl: org?.avatar_url,
            attendeesCount: evt.calendar_event_attendees?.length || 0,
            canEdit,
            rawId: evt.id,
            metadata: { eventType: evt.event_type, department: evt.department },
          })
        }
      }
    } catch (err) {
      console.error('Error fetching calendar_events:', err)
    }
  }

  // 2. Fetch Video Meetings (meet_rooms)
  if (layers.meetings) {
    try {
      const { data: rooms, error } = await supabase
        .from('meet_rooms')
        .select(`
          id,
          room_code,
          title,
          description,
          host_name,
          host_id,
          status,
          scheduled_start_at,
          scheduled_end_at,
          started_at,
          ended_at
        `)
        .or(`scheduled_start_at.gte.${startIso},started_at.gte.${startIso}`)
        .order('started_at', { ascending: true })

      if (!error && rooms) {
        for (const r of rooms) {
          const startTime = r.scheduled_start_at || r.started_at || startIso
          const endTime = r.scheduled_end_at || r.ended_at || new Date(new Date(startTime).getTime() + 45 * 60000).toISOString()
          const isHost = r.host_id === user.id || user.role === 'admin' || user.role === 'super_admin'

          items.push({
            id: `meet-${r.id}`,
            source: 'meeting',
            title: r.title || `Meeting ${r.room_code}`,
            description: r.description || `Host: ${r.host_name}`,
            startTime,
            endTime,
            isAllDay: false,
            color: '#10B981', // Emerald green
            badgeText: r.status === 'active' ? 'LIVE NOW' : 'MEETING',
            iconName: 'Video',
            meetUrl: `/meet/${r.room_code}`,
            location: `Room: ${r.room_code}`,
            status: r.status,
            organizerName: r.host_name,
            canEdit: isHost,
            rawId: r.id,
            metadata: { roomCode: r.room_code },
          })
        }
      }
    } catch (err) {
      console.error('Error fetching meet_rooms:', err)
    }
  }

  // 3. Fetch Shifts & Scheduled Roster Hours
  if (layers.shifts) {
    try {
      // Get profile shift assignment
      let profileQuery = supabase.from('profiles').select('id, full_name, shift_id, shifts(*)').eq('is_active', true)
      if (targetUserId) {
        profileQuery = profileQuery.eq('id', targetUserId)
      }
      const { data: userProfiles } = await profileQuery

      if (userProfiles) {
        // Build daily recurring shift instances across the requested date window
        const startDay = new Date(startDateStr)
        const endDay = new Date(endDateStr)

        for (const prof of userProfiles) {
          const shift = prof.shifts as any
          if (!shift || !shift.start_time || !shift.end_time) continue

          const cur = new Date(startDay)
          while (cur <= endDay) {
            // Skip weekends if standard Mon-Fri or generate standard shift block
            const dateStr = cur.toISOString().split('T')[0]
            const shiftStartIso = `${dateStr}T${shift.start_time}+00:00`
            const shiftEndIso = `${dateStr}T${shift.end_time}+00:00`

            items.push({
              id: `shift-${prof.id}-${dateStr}`,
              source: 'shift',
              title: `${shift.name || 'Shift'}${targetUserId ? '' : ` (${prof.full_name})`}`,
              description: `Hours: ${shift.start_time} - ${shift.end_time} (Grace: ${shift.grace_period_mins || 15}m)`,
              startTime: shiftStartIso,
              endTime: shiftEndIso,
              isAllDay: false,
              color: '#6366F1', // Indigo
              badgeText: 'SHIFT',
              iconName: 'Clock',
              organizerName: prof.full_name,
              canEdit: user.role === 'admin' || user.role === 'super_admin' || user.role === 'supervisor',
              rawId: shift.id,
              metadata: { candidateId: prof.id, candidateName: prof.full_name, shiftName: shift.name },
            })

            cur.setDate(cur.getDate() + 1)
          }
        }
      }
    } catch (err) {
      console.error('Error generating shift instances:', err)
    }
  }

  // 4. Fetch Approved Leaves & Holidays
  if (layers.leaves) {
    try {
      let leaveQ = supabase
        .from('leaves')
        .select(`
          id,
          user_id,
          leave_type,
          start_date,
          end_date,
          total_days,
          reason,
          status,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .or('status.eq.approved,status.eq.pending')
        .lte('start_date', endDateStr)
        .gte('end_date', startDateStr)

      if (targetUserId) {
        leaveQ = leaveQ.eq('user_id', targetUserId)
      }

      const { data: leaves, error } = await leaveQ

      if (!error && leaves) {
        for (const lv of leaves) {
          const cand = lv.profiles as any
          const isPending = lv.status === 'pending'
          const color = isPending ? '#F59E0B' : '#EF4444' // Amber if pending, Rose/Red if approved time off

          items.push({
            id: `leave-${lv.id}`,
            source: 'leave',
            title: `${lv.leave_type.toUpperCase()} LEAVE${targetUserId ? '' : ` - ${cand?.full_name || 'Staff'}`}`,
            description: `Reason: ${lv.reason} (${lv.total_days} days)`,
            startTime: `${lv.start_date}T00:00:00Z`,
            endTime: `${lv.end_date}T23:59:59Z`,
            isAllDay: true,
            color,
            badgeText: isPending ? 'LEAVE PENDING' : 'TIME OFF',
            iconName: 'Palmtree',
            organizerName: cand?.full_name,
            organizerAvatarUrl: cand?.avatar_url,
            status: lv.status,
            canEdit: user.role === 'admin' || user.role === 'super_admin' || user.role === 'hr_manager',
            rawId: lv.id,
            metadata: { leaveType: lv.leave_type, totalDays: lv.total_days },
          })
        }
      }
    } catch (err) {
      console.error('Error fetching leaves:', err)
    }
  }

  // 5. Fetch Daily Tasks & Deadlines
  if (layers.tasks) {
    try {
      let taskQ = supabase
        .from('daily_tasks')
        .select(`
          id,
          user_id,
          task_date,
          title,
          project_name,
          status,
          priority,
          hours_spent,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .gte('task_date', startDateStr)
        .lte('task_date', endDateStr)

      if (targetUserId) {
        taskQ = taskQ.eq('user_id', targetUserId)
      }

      const { data: tasks, error } = await taskQ

      if (!error && tasks) {
        for (const t of tasks) {
          const cand = t.profiles as any
          items.push({
            id: `task-${t.id}`,
            source: 'task',
            title: `Task: ${t.title}${targetUserId ? '' : ` (${cand?.full_name || 'Staff'})`}`,
            description: `Project: ${t.project_name} | Priority: ${t.priority} | Status: ${t.status}`,
            startTime: `${t.task_date}T17:00:00Z`,
            endTime: `${t.task_date}T18:00:00Z`,
            isAllDay: false,
            color: '#8B5CF6', // Purple
            badgeText: `TASK: ${t.status.toUpperCase()}`,
            iconName: 'CheckSquare',
            organizerName: cand?.full_name,
            organizerAvatarUrl: cand?.avatar_url,
            status: t.status,
            canEdit: user.id === t.user_id || user.role === 'admin' || user.role === 'super_admin',
            rawId: t.id,
            metadata: { priority: t.priority, projectName: t.project_name, hoursSpent: t.hours_spent },
          })
        }
      }
    } catch (err) {
      console.error('Error fetching daily tasks:', err)
    }
  }

  // Sort chronologically
  return items.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
}

/**
 * Create a new custom calendar event, with optional auto-generated video meet room
 */
export async function createCalendarEventAction(payload: {
  title: string
  description?: string
  eventType?: string
  startTime: string
  endTime: string
  isAllDay?: boolean
  location?: string
  colorTag?: string
  visibility?: 'public' | 'team' | 'private'
  department?: string
  autoCreateMeetRoom?: boolean
  attendeeIds?: string[]
}) {
  const user = await getCurrentUserFast()
  if (!user) throw new Error('Unauthorized')

  const supabase = await getSupabase()

  let meetRoomId = null
  let meetUrl = null

  // If user requested video meet integration, generate room
  if (payload.autoCreateMeetRoom) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const code = `${Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}-${Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}-${Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`

    const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

    const { data: room, error: roomErr } = await supabase
      .from('meet_rooms')
      .insert({
        room_code: code,
        title: payload.title,
        description: payload.description,
        host_name: prof?.full_name || 'Host',
        host_id: user.id,
        status: 'scheduled',
        scheduled_start_at: payload.startTime,
        scheduled_end_at: payload.endTime,
      })
      .select()
      .single()

    if (!roomErr && room) {
      meetRoomId = room.id
      meetUrl = `/meet/${room.room_code}`
    }
  }

  const { data: event, error } = await supabase
    .from('calendar_events')
    .insert({
      title: payload.title,
      description: payload.description || '',
      event_type: payload.eventType || 'company_event',
      start_time: payload.startTime,
      end_time: payload.endTime,
      is_all_day: payload.isAllDay || false,
      location: payload.location || (meetUrl ? `Online Meet: ${meetUrl}` : ''),
      meet_room_id: meetRoomId,
      meet_url: meetUrl,
      color_tag: payload.colorTag || '#3B82F6',
      visibility: payload.visibility || 'public',
      department: payload.department || null,
      organizer_id: user.id,
    })
    .select()
    .single()

  if (error || !event) {
    console.error('Error creating calendar event:', error)
    throw new Error(error?.message || 'Failed to create calendar event')
  }

  // Add attendees if specified
  if (payload.attendeeIds && payload.attendeeIds.length > 0) {
    const attendees = payload.attendeeIds.map((userId) => ({
      event_id: event.id,
      user_id: userId,
      status: 'pending',
    }))

    await supabase.from('calendar_event_attendees').insert(attendees)

    // Dispatch calendar_event push notification to attendees
    try {
      const invitees = payload.attendeeIds.filter((id) => id !== user.id)
      if (invitees.length > 0) {
        const notifs = invitees.map((attendeeId) => ({
          userId: attendeeId,
          title: `📅 Event Invitation: ${payload.title}`,
          message: `${new Date(payload.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • ${payload.location || 'Calendar Event'}`,
          type: 'calendar_event' as const,
          link: `/admin/calendar?event=${event.id}`,
          metadata: {
            eventId: event.id,
            startTime: payload.startTime,
            endTime: payload.endTime,
          },
        }))
        await sendBulkNotification(notifs)
      }
    } catch (notifErr) {
      console.error('Error dispatching calendar event notifications:', notifErr)
    }
  }

  revalidatePath('/admin/calendar')
  revalidatePath('/candidate/calendar')

  return event
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEventAction(
  id: string,
  payload: Partial<{
    title: string
    description: string
    eventType: string
    startTime: string
    endTime: string
    isAllDay: boolean
    location: string
    colorTag: string
  }>
) {
  const user = await getCurrentUserFast()
  if (!user) throw new Error('Unauthorized')

  const supabase = await getSupabase()

  const { data, error } = await supabase
    .from('calendar_events')
    .update({
      title: payload.title,
      description: payload.description,
      event_type: payload.eventType,
      start_time: payload.startTime,
      end_time: payload.endTime,
      is_all_day: payload.isAllDay,
      location: payload.location,
      color_tag: payload.colorTag,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to update calendar event')
  }

  revalidatePath('/admin/calendar')
  revalidatePath('/candidate/calendar')

  return data
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEventAction(id: string) {
  const user = await getCurrentUserFast()
  if (!user) throw new Error('Unauthorized')

  const supabase = await getSupabase()

  const { error } = await supabase.from('calendar_events').delete().eq('id', id)
  if (error) {
    throw new Error(error.message || 'Failed to delete event')
  }

  revalidatePath('/admin/calendar')
  revalidatePath('/candidate/calendar')

  return { success: true }
}

/**
 * Generate standard RFC 5545 iCalendar (.ics) string for syncing
 */
export async function exportICSFeedAction(startDate: string, endDate: string): Promise<string> {
  const feed = await getUnifiedCalendarFeedAction({ startDate, endDate })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  let icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Darion Workforce//Enterprise Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Darion Workforce Calendar',
    'X-WR-TIMEZONE:UTC',
  ]

  for (const item of feed) {
    icsLines.push('BEGIN:VEVENT')
    icsLines.push(`UID:${item.id}@darion-workforce.com`)
    icsLines.push(`DTSTAMP:${formatDate(new Date().toISOString())}`)
    icsLines.push(`DTSTART:${formatDate(item.startTime)}`)
    icsLines.push(`DTEND:${formatDate(item.endTime)}`)
    icsLines.push(`SUMMARY:${item.title.replace(/[,;]/g, ' ')}`)
    if (item.description) {
      icsLines.push(`DESCRIPTION:${item.description.replace(/(\r\n|\n|\r)/gm, '\\n')}`)
    }
    if (item.location || item.meetUrl) {
      icsLines.push(`LOCATION:${item.location || item.meetUrl}`)
    }
    icsLines.push('END:VEVENT')
  }

  icsLines.push('END:VCALENDAR')
  return icsLines.join('\r\n')
}
