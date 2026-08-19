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

export interface ChatParticipantInfo {
  userId: string
  fullName: string
  avatarUrl?: string
  role: string
  status?: string
  statusMessage?: string
  lastSeenAt?: string
  participantRole: 'admin' | 'moderator' | 'member'
}

export interface ChatConversationItem {
  id: string
  type: 'channel' | 'group' | 'direct'
  name: string
  slug?: string
  description?: string
  avatarUrl?: string
  isPrivate: boolean
  lastMessageAt: string
  lastMessageSnippet?: string
  lastMessageSenderName?: string
  unreadCount: number
  isPinned: boolean
  isMuted: boolean
  otherParticipant?: {
    userId: string
    fullName: string
    avatarUrl?: string
    role: string
    presenceStatus: string
    lastSeenAt?: string
  }
  participantsCount?: number
}

export interface ChatReactionGroup {
  emoji: string
  count: number
  hasReacted: boolean
  userNames: string[]
}

export interface ChatMessageItem {
  id: string
  conversationId: string
  senderId?: string
  senderName: string
  senderAvatarUrl?: string
  senderRole: string
  parentId?: string
  content: string
  messageType: 'text' | 'meet_card' | 'file' | 'system'
  fileUrl?: string
  fileName?: string
  fileSizeBytes?: number
  fileType?: string
  metadata?: any
  isEdited: boolean
  isPinned: boolean
  replyCount?: number
  reactions: ChatReactionGroup[]
  createdAt: string
  updatedAt: string
}

/**
 * Fetch all conversations (Channels + DMs + Groups) for current user
 */
export async function getConversationsListAction(): Promise<ChatConversationItem[]> {
  const user = await getCurrentUserFast()
  if (!user) return []

  const supabase = await getSupabase()

  // Default fallback channels in case database tables are being provisioned
  const defaultFallbackChannels: ChatConversationItem[] = [
    {
      id: 'default-general',
      type: 'channel',
      name: 'General',
      slug: 'general',
      description: 'Organization-wide team discussions, general updates, and casual banter.',
      isPrivate: false,
      lastMessageAt: new Date().toISOString(),
      lastMessageSnippet: 'Welcome to the team channel!',
      unreadCount: 0,
      isPinned: true,
      isMuted: false,
    },
    {
      id: 'default-announcements',
      type: 'channel',
      name: 'Announcements',
      slug: 'announcements',
      description: 'Official management announcements, policy notices, and company alerts.',
      isPrivate: false,
      lastMessageAt: new Date().toISOString(),
      lastMessageSnippet: 'Important company notices posted here.',
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
    },
    {
      id: 'default-shifts',
      type: 'channel',
      name: 'Shift Operations',
      slug: 'shift-operations',
      description: 'Live shift handovers, daily coverage, and attendance queries.',
      isPrivate: false,
      lastMessageAt: new Date().toISOString(),
      lastMessageSnippet: 'Daily shift roster & handovers.',
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
    },
    {
      id: 'default-support',
      type: 'channel',
      name: 'HR & Support',
      slug: 'hr-support',
      description: 'Help desk for leave requests, payroll questions, and HR assistance.',
      isPrivate: false,
      lastMessageAt: new Date().toISOString(),
      lastMessageSnippet: 'HR and payroll support channel.',
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
    },
  ]

  try {
    // 1. Fetch public channels and conversations where user is a participant
    const { data: userParticipations, error: partError } = await supabase
      .from('chat_participants')
      .select('conversation_id, last_read_at, is_pinned, is_muted')
      .eq('user_id', user.id)

    if (partError && partError.code === 'PGRST205') {
      return defaultFallbackChannels
    }

    const userConvIds = (userParticipations || []).map((p: any) => p.conversation_id)
    const participationMap = new Map((userParticipations || []).map((p: any) => [p.conversation_id, p]))

    // Fetch all accessible conversations
    let convQuery = supabase
      .from('chat_conversations')
      .select(`
        id,
        type,
        name,
        slug,
        description,
        avatar_url,
        is_private,
        last_message_at,
        created_at
      `)

    if (userConvIds.length > 0) {
      convQuery = convQuery.or(`is_private.eq.false,id.in.(${userConvIds.join(',')})`)
    } else {
      convQuery = convQuery.eq('is_private', false)
    }

    const { data: convData, error: convError } = await convQuery.order('last_message_at', { ascending: false })

    if (convError || !convData || convData.length === 0) {
      return defaultFallbackChannels
    }

  // 2. For each conversation, fetch latest message & unread count & other participant if DM
  const allConvIds = convData.map((c: any) => c.id)

  // Fetch all participants for these conversations to resolve DMs
  const { data: allParticipants } = await supabase
    .from('chat_participants')
    .select(`
      conversation_id,
      user_id,
      profiles (
        id,
        full_name,
        avatar_url,
        role
      )
    `)
    .in('conversation_id', allConvIds)

  // Fetch presence for users
  const { data: presenceList } = await supabase
    .from('chat_user_presence')
    .select('user_id, status, last_seen_at')

  const presenceMap = new Map((presenceList || []).map((p: any) => [p.user_id, p]))

  // Fetch last messages in bulk
  const { data: lastMessages } = await supabase
    .from('chat_messages')
    .select(`
      id,
      conversation_id,
      content,
      message_type,
      created_at,
      sender_id,
      profiles:sender_id (full_name)
    `)
    .in('conversation_id', allConvIds)
    .order('created_at', { ascending: false })

  // Map latest message per conversation
  const lastMessageMap = new Map<string, any>()
  if (lastMessages) {
    for (const msg of lastMessages) {
      if (!lastMessageMap.has(msg.conversation_id)) {
        lastMessageMap.set(msg.conversation_id, msg)
      }
    }
  }

  const results: ChatConversationItem[] = convData.map((conv: any) => {
    const partInfo = participationMap.get(conv.id)
    const lastReadAt = partInfo?.last_read_at || '1970-01-01T00:00:00.000Z'
    const lastMsg = lastMessageMap.get(conv.id)

    // Check if DM
    let otherParticipant = undefined
    let displayName = conv.name || (conv.type === 'channel' ? `#${conv.slug}` : 'Group Chat')
    let displayAvatar = conv.avatar_url

    if (conv.type === 'direct') {
      const convParticipants = (allParticipants || []).filter((p: any) => p.conversation_id === conv.id)
      const otherPart = convParticipants.find((p: any) => p.user_id !== user.id) || convParticipants[0]
      if (otherPart && otherPart.profiles) {
        const rawProf: any = otherPart.profiles
        const prof = Array.isArray(rawProf) ? rawProf[0] : rawProf
        if (prof) {
          const pres = presenceMap.get(prof.id)
          otherParticipant = {
            userId: prof.id,
            fullName: prof.full_name || 'Team Member',
            avatarUrl: prof.avatar_url,
            role: prof.role || 'candidate',
            presenceStatus: pres?.status || 'offline',
            lastSeenAt: pres?.last_seen_at,
          }
          displayName = otherParticipant.fullName
          displayAvatar = otherParticipant.avatarUrl
        }
      }
    }

    let lastSnippet = ''
    if (lastMsg) {
      if (lastMsg.message_type === 'meet_card') {
        lastSnippet = '📹 Video Meeting started'
      } else if (lastMsg.message_type === 'file') {
        lastSnippet = '📎 Shared an attachment'
      } else {
        lastSnippet = lastMsg.content
      }
    }

    return {
      id: conv.id,
      type: conv.type,
      name: displayName,
      slug: conv.slug,
      description: conv.description,
      avatarUrl: displayAvatar,
      isPrivate: conv.is_private,
      lastMessageAt: conv.last_message_at || conv.created_at,
      lastMessageSnippet: lastSnippet,
      lastMessageSenderName: (lastMsg?.profiles as any)?.full_name || '',
      unreadCount: 0, // Computed in real-time or via last_read_at
      isPinned: partInfo?.is_pinned || false,
      isMuted: partInfo?.is_muted || false,
      otherParticipant,
      participantsCount: (allParticipants || []).filter((p: any) => p.conversation_id === conv.id).length,
    }
  })

    // Sort: Pinned first, then by lastMessageAt descending
    return results.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    })
  } catch (err) {
    return defaultFallbackChannels
  }
}

/**
 * Fetch messages for a specific conversation
 */
export async function getConversationMessagesAction(
  conversationId: string,
  parentId?: string
): Promise<ChatMessageItem[]> {
  const user = await getCurrentUserFast()
  if (!user) return []

  // If fallback channel or invalid UUID, return empty
  if (conversationId.startsWith('default-') || !sanitizeUuid(conversationId)) {
    return []
  }

  try {
    const supabase = await getSupabase()

    let query = supabase
      .from('chat_messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        parent_id,
        content,
        message_type,
        file_url,
        file_name,
        file_size_bytes,
        file_type,
        metadata,
        is_edited,
        is_pinned,
        created_at,
        updated_at,
        profiles:sender_id (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (parentId) {
      query = query.eq('parent_id', parentId)
    } else {
      query = query.is('parent_id', null)
    }

    const { data: messages, error } = await query

    if (error || !messages) {
      return []
    }

  // Fetch reactions for these messages
  const messageIds = messages.map((m: any) => m.id)
  let reactionsMap = new Map<string, any[]>()

  if (messageIds.length > 0) {
    const { data: reactions } = await supabase
      .from('chat_reactions')
      .select(`
        id,
        message_id,
        user_id,
        emoji,
        profiles:user_id (full_name)
      `)
      .in('message_id', messageIds)

    if (reactions) {
      for (const r of reactions) {
        if (!reactionsMap.has(r.message_id)) {
          reactionsMap.set(r.message_id, [])
        }
        reactionsMap.get(r.message_id)!.push(r)
      }
    }
  }

  // Also fetch thread reply counts if parent_id is null
  let replyCountMap = new Map<string, number>()
  if (!parentId && messageIds.length > 0) {
    const { data: replies } = await supabase
      .from('chat_messages')
      .select('parent_id')
      .in('parent_id', messageIds)
      .is('deleted_at', null)

    if (replies) {
      for (const rep of replies) {
        if (rep.parent_id) {
          replyCountMap.set(rep.parent_id, (replyCountMap.get(rep.parent_id) || 0) + 1)
        }
      }
    }
  }

  return messages.map((m: any) => {
    const rawReactions = reactionsMap.get(m.id) || []
    const emojiMap = new Map<string, { count: number; hasReacted: boolean; userNames: string[] }>()

    for (const r of rawReactions) {
      if (!emojiMap.has(r.emoji)) {
        emojiMap.set(r.emoji, { count: 0, hasReacted: false, userNames: [] })
      }
      const item = emojiMap.get(r.emoji)!
      item.count += 1
      if (r.user_id === user.id) item.hasReacted = true
      const name = (r.profiles as any)?.full_name || 'User'
      item.userNames.push(name)
    }

    const reactions: ChatReactionGroup[] = Array.from(emojiMap.entries()).map(([emoji, val]) => ({
      emoji,
      count: val.count,
      hasReacted: val.hasReacted,
      userNames: val.userNames,
    }))

    const sender = m.profiles as any
    return {
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      senderName: sender?.full_name || 'System User',
      senderAvatarUrl: sender?.avatar_url,
      senderRole: sender?.role || 'candidate',
      parentId: m.parent_id,
      content: m.content,
      messageType: m.message_type,
      fileUrl: m.file_url,
      fileName: m.file_name,
      fileSizeBytes: m.file_size_bytes,
      fileType: m.file_type,
      metadata: m.metadata,
      isEdited: m.is_edited,
      isPinned: m.is_pinned,
      replyCount: replyCountMap.get(m.id) || 0,
      reactions,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    }
  })
  } catch (err) {
    return []
  }
}

/**
 * Send a message (text, meet card, attachment, or threaded reply)
 */
export async function sendMessageAction(payload: {
  conversationId: string
  content: string
  messageType?: 'text' | 'meet_card' | 'file' | 'system'
  parentId?: string
  fileUrl?: string
  fileName?: string
  fileSizeBytes?: number
  fileType?: string
  metadata?: any
}) {
  const user = await getCurrentUserFast()
  if (!user) throw new Error('Unauthorized')

  const supabase = await getSupabase()

  let effectiveConvId = payload.conversationId

  // Auto-resolve fallback channels e.g. default-general to real database channel
  if (effectiveConvId.startsWith('default-')) {
    const slug = effectiveConvId.replace('default-', '')
    const { data: existingChannel } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existingChannel) {
      effectiveConvId = existingChannel.id
    } else {
      const channelNames: Record<string, string> = {
        general: 'General',
        announcements: 'Announcements',
        'shift-operations': 'Shift Operations',
        'hr-support': 'HR & Support',
      }
      const { data: createdChannel } = await supabase
        .from('chat_conversations')
        .insert({
          type: 'channel',
          name: channelNames[slug] || slug,
          slug,
          is_private: false,
          created_by: user.id,
        })
        .select('id')
        .maybeSingle()

      if (createdChannel) {
        effectiveConvId = createdChannel.id
      }
    }
  }

  // Ensure current user is in participants
  await supabase
    .from('chat_participants')
    .upsert(
      {
        conversation_id: effectiveConvId,
        user_id: user.id,
        last_read_at: new Date().toISOString(),
      },
      { onConflict: 'conversation_id,user_id' }
    )

  const { data: newMsg, error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: effectiveConvId,
      sender_id: user.id,
      parent_id: payload.parentId || null,
      content: payload.content || (payload.messageType === 'file' ? `Uploaded ${payload.fileName}` : ''),
      message_type: payload.messageType || 'text',
      file_url: payload.fileUrl,
      file_name: payload.fileName,
      file_size_bytes: payload.fileSizeBytes,
      file_type: payload.fileType,
      metadata: payload.metadata || {},
    })
    .select(`
      id,
      conversation_id,
      sender_id,
      parent_id,
      content,
      message_type,
      file_url,
      file_name,
      file_size_bytes,
      file_type,
      metadata,
      is_edited,
      is_pinned,
      created_at,
      updated_at,
      profiles:sender_id (
        id,
        full_name,
        avatar_url,
        role
      )
    `)
    .single()

  if (error) {
    console.error('Error sending message:', error)
    throw new Error(error.message || 'Failed to send message')
  }

  // Update conversation last_message_at
  await supabase
    .from('chat_conversations')
    .update({
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', payload.conversationId)

  // Dispatch push notifications to other participants
  try {
    const { data: participants } = await supabase
      .from('chat_participants')
      .select('user_id')
      .eq('conversation_id', effectiveConvId)
      .neq('user_id', user.id)

    if (participants && participants.length > 0) {
      const senderName = (newMsg as any)?.profiles?.full_name || 'Team Member'
      let previewText = payload.content || 'Sent a message'
      if (payload.messageType === 'file') {
        previewText = `📎 Sent file: ${payload.fileName || 'Attachment'}`
      } else if (payload.messageType === 'meet_card') {
        previewText = `📹 Started a live video meeting`
      }

      const notifs = participants.map((p: any) => ({
        userId: p.user_id,
        title: `Message from ${senderName}`,
        message: previewText.slice(0, 100),
        type: 'chat_message' as const,
        link: `/admin/messages?c=${effectiveConvId}`,
        metadata: {
          conversationId: effectiveConvId,
          messageId: newMsg.id,
          senderId: user.id,
        },
      }))

      await sendBulkNotification(notifs)
    }
  } catch (notifErr) {
    console.error('Error dispatching chat notifications:', notifErr)
  }

  // Revalidate paths
  revalidatePath('/admin/messages')
  revalidatePath('/candidate/messages')

  return newMsg
}

/**
 * Toggle an emoji reaction on a message
 */
export async function toggleReactionAction(messageId: string, emoji: string) {
  const user = await getCurrentUserFast()
  if (!user) throw new Error('Unauthorized')

  const supabase = await getSupabase()

  const { data: existing } = await supabase
    .from('chat_reactions')
    .select('id')
    .eq('message_id', messageId)
    .eq('user_id', user.id)
    .eq('emoji', emoji)
    .maybeSingle()

  if (existing) {
    await supabase.from('chat_reactions').delete().eq('id', existing.id)
    return { status: 'removed' }
  } else {
    await supabase.from('chat_reactions').insert({
      message_id: messageId,
      user_id: user.id,
      emoji,
    })
    return { status: 'added' }
  }
}

/**
 * Edit an existing message content
 */
export async function editMessageAction(
  messageId: string,
  newContent: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUserFast()
  if (!user) throw new Error('Unauthorized')

  if (!newContent.trim()) {
    return { success: false, error: 'Message content cannot be empty' }
  }

  const supabase = await getSupabase()

  // 1. Check ownership
  const { data: msg, error: fetchErr } = await supabase
    .from('chat_messages')
    .select('id, sender_id, conversation_id, metadata')
    .eq('id', messageId)
    .single()

  if (fetchErr || !msg) {
    return { success: false, error: 'Message not found' }
  }

  if (msg.sender_id !== user.id) {
    return { success: false, error: 'Permission denied: You can only edit your own messages' }
  }

  // 2. Update content and mark is_edited = true
  const updatedMetadata = {
    ...(msg.metadata || {}),
    isEdited: true,
    editedAt: new Date().toISOString(),
  }

  const { error: updateErr } = await supabase
    .from('chat_messages')
    .update({
      content: newContent.trim(),
      is_edited: true,
      updated_at: new Date().toISOString(),
      metadata: updatedMetadata,
    })
    .eq('id', messageId)

  if (updateErr) {
    // If is_edited column is missing in schema, update without is_edited column
    const { error: fallbackErr } = await supabase
      .from('chat_messages')
      .update({
        content: newContent.trim(),
        updated_at: new Date().toISOString(),
        metadata: updatedMetadata,
      })
      .eq('id', messageId)

    if (fallbackErr) {
      return { success: false, error: fallbackErr.message }
    }
  }

  revalidatePath('/admin/messages')
  revalidatePath('/candidate/messages')

  return { success: true }
}

/**
 * Delete a message (soft delete with deleted_at timestamp)
 */
export async function deleteMessageAction(messageId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUserFast()
  if (!user) throw new Error('Unauthorized')

  const supabase = await getSupabase()

  // 1. Fetch message to check ownership or admin role
  const { data: msg, error: fetchErr } = await supabase
    .from('chat_messages')
    .select('id, sender_id, conversation_id')
    .eq('id', messageId)
    .single()

  if (fetchErr || !msg) {
    return { success: false, error: 'Message not found' }
  }

  // 2. Fetch user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAuthor = msg.sender_id === user.id
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin' || profile?.role === 'manager'

  if (!isAuthor && !isAdmin) {
    return { success: false, error: 'Permission denied: You can only delete your own messages' }
  }

  // 3. Mark deleted_at
  const { error: delErr } = await supabase
    .from('chat_messages')
    .update({
      deleted_at: new Date().toISOString(),
      content: '[This message was deleted]',
    })
    .eq('id', messageId)

  if (delErr) {
    return { success: false, error: delErr.message }
  }

  revalidatePath('/admin/messages')
  revalidatePath('/candidate/messages')

  return { success: true }
}

/**
 * Forward an existing message to one or more target conversations
 */
export async function forwardMessageAction(payload: {
  messageId: string
  targetConversationIds: string[]
  additionalComment?: string
}): Promise<{ success: boolean; count: number; error?: string }> {
  const user = await getCurrentUserFast()
  if (!user) throw new Error('Unauthorized')

  if (!payload.targetConversationIds || payload.targetConversationIds.length === 0) {
    return { success: false, count: 0, error: 'Please select at least one conversation' }
  }

  const supabase = await getSupabase()

  // 1. Fetch source message
  const { data: sourceMsg, error: fetchErr } = await supabase
    .from('chat_messages')
    .select(`
      id,
      content,
      message_type,
      file_url,
      file_name,
      file_size_bytes,
      file_type,
      metadata,
      profiles:sender_id (full_name)
    `)
    .eq('id', payload.messageId)
    .single()

  if (fetchErr || !sourceMsg) {
    return { success: false, count: 0, error: 'Source message not found' }
  }

  const originalSenderName = (sourceMsg.profiles as any)?.full_name || 'Team Member'
  let forwardCount = 0

  for (const convId of payload.targetConversationIds) {
    let effectiveConvId = convId

    // Handle fallback default channels if needed
    if (effectiveConvId.startsWith('default-')) {
      const slug = effectiveConvId.replace('default-', '')
      const { data: existingChannel } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()
      if (existingChannel) effectiveConvId = existingChannel.id
    }

    const forwardedMetadata = {
      ...(sourceMsg.metadata || {}),
      isForwarded: true,
      originalSenderName,
      originalMessageId: sourceMsg.id,
      forwardedAt: new Date().toISOString(),
    }

    const { data: newMsg, error: insErr } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: effectiveConvId,
        sender_id: user.id,
        content: payload.additionalComment
          ? `${payload.additionalComment}\n\n↳ Forwarded from ${originalSenderName}:\n${sourceMsg.content || ''}`
          : (sourceMsg.content || ''),
        message_type: sourceMsg.message_type || 'text',
        file_url: sourceMsg.file_url,
        file_name: sourceMsg.file_name,
        file_size_bytes: sourceMsg.file_size_bytes,
        file_type: sourceMsg.file_type,
        metadata: forwardedMetadata,
      })
      .select('id')
      .single()

    if (!insErr && newMsg) {
      forwardCount++
      // Update conversation last_message_at
      await supabase
        .from('chat_conversations')
        .update({
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', effectiveConvId)
    }
  }

  revalidatePath('/admin/messages')
  revalidatePath('/candidate/messages')

  return { success: true, count: forwardCount }
}

/**
 * Initiate a 1:1 Direct Message with another user
 */
export async function createDirectMessageAction(targetUserId: string): Promise<string> {
  const user = await getCurrentUserFast()
  if (!user) throw new Error('Unauthorized')
  if (user.id === targetUserId) throw new Error('Cannot start direct message with yourself')

  const supabase = await getSupabase()

  // 1. Check if a DM already exists between these 2 users
  const { data: myConvs } = await supabase
    .from('chat_participants')
    .select('conversation_id')
    .eq('user_id', user.id)

  if (myConvs && myConvs.length > 0) {
    const convIds = myConvs.map((c: any) => c.conversation_id)

    const { data: sharedConvs } = await supabase
      .from('chat_participants')
      .select('conversation_id, chat_conversations!inner(type)')
      .eq('user_id', targetUserId)
      .in('conversation_id', convIds)
      .eq('chat_conversations.type', 'direct')
      .limit(1)

    if (sharedConvs && sharedConvs.length > 0) {
      return sharedConvs[0].conversation_id
    }
  }

  // 2. If not found, create new direct conversation
  const { data: newConv, error: convError } = await supabase
    .from('chat_conversations')
    .insert({
      type: 'direct',
      is_private: true,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (convError || !newConv) {
    throw new Error('Failed to initiate direct message')
  }

  // 3. Add both participants
  await supabase.from('chat_participants').insert([
    { conversation_id: newConv.id, user_id: user.id, role: 'member' },
    { conversation_id: newConv.id, user_id: targetUserId, role: 'member' },
  ])

  revalidatePath('/admin/messages')
  revalidatePath('/candidate/messages')

  return newConv.id
}

/**
 * Create a new team channel
 */
export async function createChannelAction(data: {
  name: string
  description?: string
  isPrivate?: boolean
  initialMemberIds?: string[]
}): Promise<string> {
  const user = await getCurrentUserFast()
  if (!user) throw new Error('Unauthorized')

  const supabase = await getSupabase()

  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const { data: newConv, error } = await supabase
    .from('chat_conversations')
    .insert({
      type: 'channel',
      name: data.name,
      slug,
      description: data.description || '',
      is_private: data.isPrivate || false,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error || !newConv) {
    console.error('Error creating channel:', error)
    throw new Error(error?.message || 'Failed to create channel')
  }

  // Add creator as channel admin
  const participants = [{ conversation_id: newConv.id, user_id: user.id, role: 'admin' }]

  if (data.initialMemberIds && data.initialMemberIds.length > 0) {
    for (const memId of data.initialMemberIds) {
      if (memId !== user.id) {
        participants.push({ conversation_id: newConv.id, user_id: memId, role: 'member' })
      }
    }
  }

  await supabase.from('chat_participants').insert(participants)

  // Post system welcome message
  await supabase.from('chat_messages').insert({
    conversation_id: newConv.id,
    sender_id: user.id,
    message_type: 'system',
    content: `created the channel #${data.name}`,
  })

  revalidatePath('/admin/messages')
  revalidatePath('/candidate/messages')

  return newConv.id
}

/**
 * Start instant video meet inside a chat thread
 */
export async function startInstantMeetInChatAction(conversationId: string, title?: string) {
  const user = await getCurrentUserFast()
  if (!user) throw new Error('Unauthorized')

  const supabase = await getSupabase()

  // Generate random room code
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  const part3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  const roomCode = `${part1}-${part2}-${part3}`

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const hostName = userProfile?.full_name || 'Host'
  const meetTitle = title || 'Live Team Huddle'

  // 1. Create meet_rooms record
  const { data: room, error: roomError } = await supabase
    .from('meet_rooms')
    .insert({
      room_code: roomCode,
      title: meetTitle,
      host_name: hostName,
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
    console.error('Error creating chat meet room:', roomError)
    throw new Error('Failed to create video meeting')
  }

  let effectiveConvId = conversationId
  if (effectiveConvId.startsWith('default-')) {
    const slug = effectiveConvId.replace('default-', '')
    const { data: existingChannel } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existingChannel) {
      effectiveConvId = existingChannel.id
    } else {
      const channelNames: Record<string, string> = {
        general: 'General',
        announcements: 'Announcements',
        'shift-operations': 'Shift Operations',
        'hr-support': 'HR & Support',
      }
      const { data: createdChannel } = await supabase
        .from('chat_conversations')
        .insert({
          type: 'channel',
          name: channelNames[slug] || slug,
          slug,
          is_private: false,
          created_by: user.id,
        })
        .select('id')
        .maybeSingle()

      if (createdChannel) {
        effectiveConvId = createdChannel.id
      }
    }
  }

  // 2. Post interactive meet card into chat
  const { data: msg } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: effectiveConvId,
      sender_id: user.id,
      message_type: 'meet_card',
      content: `started a live video meeting: "${meetTitle}"`,
      metadata: {
        roomId: room.id,
        roomCode: room.room_code,
        title: meetTitle,
        hostName,
        startedAt: room.started_at,
        meetUrl: `/meet/${room.room_code}`,
      },
    })
    .select()
    .single()

  // Dispatch meet_started push notifications
  try {
    const { data: participants } = await supabase
      .from('chat_participants')
      .select('user_id')
      .eq('conversation_id', effectiveConvId)
      .neq('user_id', user.id)

    if (participants && participants.length > 0) {
      const notifs = participants.map((p: any) => ({
        userId: p.user_id,
        title: `📹 Live Call from ${hostName}`,
        message: `Joined room #${room.room_code}: "${meetTitle}"`,
        type: 'meet_started' as const,
        link: `/meet/${room.room_code}`,
        metadata: {
          roomCode: room.room_code,
          hostName,
          title: meetTitle,
        },
      }))
      await sendBulkNotification(notifs)
    }
  } catch (err) {
    console.error('Error dispatching meet notifications:', err)
  }

  revalidatePath('/admin/messages')
  revalidatePath('/candidate/messages')

  return {
    roomId: room.id,
    roomCode: room.room_code,
    meetUrl: `/meet/${room.room_code}`,
    messageId: msg?.id,
  }
}

/**
 * Fetch active users directory for starting new DMs or tagging
 */
export async function getUserDirectoryAction(query = ''): Promise<ChatParticipantInfo[]> {
  const user = await getCurrentUserFast()
  if (!user) return []

  const supabase = await getSupabase()

  let q = supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      avatar_url,
      role
    `)
    .neq('id', user.id)
    .order('full_name', { ascending: true })
    .limit(50)

  if (query.trim()) {
    q = q.ilike('full_name', `%${query.trim()}%`)
  }

  const { data: profiles, error } = await q
  if (error || !profiles) return []

  // Fetch presence
  const userIds = profiles.map((p: any) => p.id)
  const { data: presence } = await supabase
    .from('chat_user_presence')
    .select('user_id, status, status_message, last_seen_at')
    .in('user_id', userIds)

  const presenceMap = new Map((presence || []).map((p: any) => [p.user_id, p]))

  return profiles.map((p: any) => {
    const pres = presenceMap.get(p.id)
    return {
      userId: p.id,
      fullName: p.full_name || 'Team Member',
      avatarUrl: p.avatar_url,
      role: p.role || 'candidate',
      status: pres?.status || 'offline',
      statusMessage: pres?.status_message,
      lastSeenAt: pres?.last_seen_at,
      participantRole: 'member',
    }
  })
}

/**
 * Mark a conversation as read
 */
export async function markConversationAsReadAction(conversationId: string) {
  const user = await getCurrentUserFast()
  if (!user) return

  const supabase = await getSupabase()

  await supabase
    .from('chat_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
}

/**
 * Update user presence status
 */
export async function setUserPresenceAction(status: 'online' | 'in_meeting' | 'busy' | 'away' | 'dnd' | 'offline', statusMessage?: string) {
  const user = await getCurrentUserFast()
  if (!user) return

  const supabase = await getSupabase()

  await supabase
    .from('chat_user_presence')
    .upsert({
      user_id: user.id,
      status,
      status_message: statusMessage || null,
      last_seen_at: new Date().toISOString(),
    })
}
