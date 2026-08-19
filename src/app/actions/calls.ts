'use server'

import { createClient, getCurrentUserFast } from '@/lib/supabase/server'
import { sendNotification, sendBulkNotification } from '@/lib/utils/notifications'
import { revalidatePath } from 'next/cache'

async function getSupabase() {
  return await createClient()
}

export interface CallSessionPayload {
  callId: string
  roomCode: string
  callerId: string
  callerName: string
  callerAvatar?: string
  callerRole?: string
  conversationId: string
  conversationName?: string
  callType: 'video' | 'audio'
  meetUrl: string
  startedAt: string
}

/**
 * Initiate an enterprise video or audio call with ringing signaling
 */
export async function initiateCallAction(params: {
  conversationId: string
  targetUserId?: string
  callType?: 'video' | 'audio'
  title?: string
}): Promise<{
  success: boolean
  callPayload?: CallSessionPayload
  error?: string
}> {
  try {
    const user = await getCurrentUserFast()
    if (!user) throw new Error('Unauthorized')

    const supabase = await getSupabase()
    const callType = params.callType || 'video'

    // 1. Fetch caller profile details
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, role')
      .eq('id', user.id)
      .single()

    const callerName = profile?.full_name || 'Team Member'
    const callerAvatar = profile?.avatar_url || ''
    const callerRole = profile?.role || 'member'

    // 2. Generate room code and create meet room in meet_rooms table
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const roomCode = `dar-${callType}-${randomSuffix}`
    const callTitle = params.title || `Call with ${callerName}`

    const { data: room, error: roomError } = await supabase
      .from('meet_rooms')
      .insert({
        title: callTitle,
        room_code: roomCode,
        host_id: user.id,
        status: 'active',
        started_at: new Date().toISOString(),
        waiting_room_enabled: false,
        allow_screen_share: true,
        allow_chat: true,
        allow_unmute: true,
      })
      .select()
      .single()

    if (roomError || !room) {
      console.error('Error creating call room:', roomError)
      throw new Error('Failed to create call room')
    }

    let effectiveConvId = params.conversationId
    let conversationName = 'Direct Chat'

    if (effectiveConvId.startsWith('default-')) {
      const slug = effectiveConvId.replace('default-', '')
      const { data: existingChannel } = await supabase
        .from('chat_conversations')
        .select('id, name')
        .eq('slug', slug)
        .maybeSingle()
      if (existingChannel) {
        effectiveConvId = existingChannel.id
        conversationName = existingChannel.name
      }
    } else {
      const { data: convData } = await supabase
        .from('chat_conversations')
        .select('name')
        .eq('id', effectiveConvId)
        .maybeSingle()
      if (convData?.name) conversationName = convData.name
    }

    // 3. Insert interactive call card into conversation message feed
    await supabase.from('chat_messages').insert({
      conversation_id: effectiveConvId,
      sender_id: user.id,
      message_type: 'meet_card',
      content: `started an incoming ${callType} call: "${callTitle}"`,
      metadata: {
        roomId: room.id,
        roomCode: room.room_code,
        title: callTitle,
        hostName: callerName,
        callType,
        startedAt: room.started_at,
        meetUrl: `/meet/${room.room_code}`,
      },
    })

    const callPayload: CallSessionPayload = {
      callId: room.id,
      roomCode: room.room_code,
      callerId: user.id,
      callerName,
      callerAvatar,
      callerRole,
      conversationId: effectiveConvId,
      conversationName,
      callType,
      meetUrl: `/meet/${room.room_code}`,
      startedAt: room.started_at,
    }

    // 4. Resolve recipient users to send ringing notification
    let recipientIds: string[] = []
    if (params.targetUserId && params.targetUserId !== user.id) {
      recipientIds = [params.targetUserId]
    } else {
      const { data: participants } = await supabase
        .from('chat_participants')
        .select('user_id')
        .eq('conversation_id', effectiveConvId)
        .neq('user_id', user.id)

      if (participants && participants.length > 0) {
        recipientIds = participants.map((p) => p.user_id)
      }
    }

    if (recipientIds.length > 0) {
      const notifications = recipientIds.map((uid) => ({
        userId: uid,
        type: 'meet_started' as const,
        title: `📞 Incoming ${callType.toUpperCase()} Call: ${callerName}`,
        message: `${callerName} is calling you for "${callTitle}". Click to answer.`,
        link: `/meet/${room.room_code}`,
      }))
      await sendBulkNotification(notifications)
    }

    revalidatePath('/admin/messages')
    revalidatePath('/candidate/messages')

    return { success: true, callPayload }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to start call' }
  }
}

/**
 * Respond to an incoming ringing call (accept, decline, missed)
 */
export async function respondToCallAction(params: {
  roomCode: string
  callerId: string
  response: 'accept' | 'decline' | 'missed'
}): Promise<{ success: boolean; meetUrl?: string; error?: string }> {
  try {
    const user = await getCurrentUserFast()
    if (!user) throw new Error('Unauthorized')

    const supabase = await getSupabase()

    if (params.response === 'accept') {
      return { success: true, meetUrl: `/meet/${params.roomCode}` }
    }

    if (params.response === 'decline' && params.callerId) {
      // Send quick notification to caller that call was declined
      await sendNotification({
        userId: params.callerId,
        type: 'chat_message',
        title: 'Call Declined',
        message: 'The recipient is currently unavailable.',
      })
      return { success: true }
    }

    if (params.response === 'missed') {
      let callerName = 'a teammate'
      if (params.callerId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', params.callerId)
          .single()
        if (profile?.full_name) callerName = profile.full_name
      }

      await sendNotification({
        userId: user.id,
        type: 'chat_message',
        title: 'Missed Call',
        message: `You missed a call from ${callerName}.`,
      })
      return { success: true }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
