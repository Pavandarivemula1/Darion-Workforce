'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Hash,
  MessageSquare,
  Video,
  Send,
  Smile,
  Paperclip,
  Search,
  Plus,
  MoreVertical,
  Pin,
  MessageCircle,
  Users,
  ChevronRight,
  X,
  Phone,
  Sparkles,
  Check,
  CheckCheck,
  Download,
  FileText,
  Clock,
  Radio,
  Share2,
  Copy,
  Trash2,
  Forward,
  Pencil,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  ChatConversationItem,
  ChatMessageItem,
  getConversationsListAction,
  getConversationMessagesAction,
  sendMessageAction,
  toggleReactionAction,
  startInstantMeetInChatAction,
  markConversationAsReadAction,
  deleteMessageAction,
  editMessageAction,
} from '@/app/actions/messages'
import { initiateCallAction } from '@/app/actions/calls'
import { useBranding } from '@/components/providers/BrandingProvider'
import { ChatMeetCard } from './ChatMeetCard'
import { NewChatModal } from './NewChatModal'
import { NewChannelModal } from './NewChannelModal'
import { ForwardMessageModal } from './ForwardMessageModal'
import { soundEffects } from '@/lib/utils/soundEffects'

interface TeamsChatWorkspaceProps {
  currentUserId: string
  currentUserName: string
  currentUserRole: string
  currentUserAvatar?: string
  initialConversations: ChatConversationItem[]
  initialActiveId?: string
}

const COMMON_EMOJIS = ['👍', '❤️', '🚀', '😂', '👏', '🔥', '🎉', '👀']

export const TeamsChatWorkspace: React.FC<TeamsChatWorkspaceProps> = ({
  currentUserId,
  currentUserName,
  currentUserRole,
  currentUserAvatar,
  initialConversations,
  initialActiveId,
}) => {
  const branding = useBranding()
  const [conversations, setConversations] = useState<ChatConversationItem[]>(initialConversations)
  const [activeConvId, setActiveConvId] = useState<string>(
    initialActiveId || (initialConversations.length > 0 ? initialConversations[0].id : '')
  )
  const [messages, setMessages] = useState<ChatMessageItem[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [startingMeet, setStartingMeet] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

  // Search & Modals
  const [convSearch, setConvSearch] = useState('')
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [isNewChannelOpen, setIsNewChannelOpen] = useState(false)
  const [activeThreadParent, setActiveThreadParent] = useState<ChatMessageItem | null>(null)
  const [threadMessages, setThreadMessages] = useState<ChatMessageItem[]>([])
  const [threadInputText, setThreadInputText] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [forwardingMessage, setForwardingMessage] = useState<ChatMessageItem | null>(null)
  const [isForwardOpen, setIsForwardOpen] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const threadEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeConv = conversations.find((c) => c.id === activeConvId)

  // Load messages whenever active conversation changes
  useEffect(() => {
    if (!activeConvId) return
    let isMounted = true
    setLoadingMessages(true)

    // Optimistically zero out unreadCount on active conversation
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConvId ? { ...c, unreadCount: 0 } : c))
    )

    getConversationMessagesAction(activeConvId)
      .then((msgs) => {
        if (isMounted) {
          setMessages(msgs)
          setLoadingMessages(false)
          markConversationAsReadAction(activeConvId).then(() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('unread-messages-count-updated'))
            }
          })
        }
      })
      .catch((err) => {
        console.error('Failed to load messages:', err)
        if (isMounted) setLoadingMessages(false)
      })

    return () => {
      isMounted = false
    }
  }, [activeConvId])

  // Scroll to bottom of message list on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Real-time Supabase Subscription for Messages & Reactions
  useEffect(() => {
    if (!activeConvId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`chat-room-${activeConvId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${activeConvId}`,
        },
        async (payload) => {
          // If received from another user, play incoming chime on insert
          if (payload.eventType === 'INSERT' && payload.new && (payload.new as any).sender_id !== currentUserId) {
            soundEffects.playNotificationSound()
          }

          // Refresh messages
          const freshMessages = await getConversationMessagesAction(activeConvId)
          setMessages(freshMessages)

          if (activeThreadParent) {
            const threadMsgs = await getConversationMessagesAction(activeConvId, activeThreadParent.id)
            setThreadMessages(threadMsgs)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_reactions',
        },
        async () => {
          const freshMessages = await getConversationMessagesAction(activeConvId)
          setMessages(freshMessages)
        }
      )
      .subscribe()

    // Also listen to broadcast call events to update call cards immediately
    const callBroadcastChannel = supabase
      .channel(`chat-calls-${activeConvId}`)
      .on('broadcast', { event: 'call_declined' }, async () => {
        const freshMessages = await getConversationMessagesAction(activeConvId)
        setMessages(freshMessages)
      })
      .on('broadcast', { event: 'call_cancelled' }, async () => {
        const freshMessages = await getConversationMessagesAction(activeConvId)
        setMessages(freshMessages)
      })
      .on('broadcast', { event: 'call_accepted' }, async () => {
        const freshMessages = await getConversationMessagesAction(activeConvId)
        setMessages(freshMessages)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(callBroadcastChannel)
    }
  }, [activeConvId, activeThreadParent, currentUserId])

  // Real-time Conversation List unread count listener
  useEffect(() => {
    const supabase = createClient()
    const globalChannel = supabase
      .channel('chat-global-sidebar-unread')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        async (payload) => {
          const newMsg = payload.new as any
          if (newMsg && newMsg.conversation_id !== activeConvId && newMsg.sender_id !== currentUserId) {
            const freshConvs = await getConversationsListAction()
            setConversations(freshConvs)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(globalChannel)
    }
  }, [activeConvId, currentUserId])

  // Load thread replies when parent is selected
  useEffect(() => {
    if (!activeThreadParent || !activeConvId) return
    getConversationMessagesAction(activeConvId, activeThreadParent.id).then((tMsgs) => {
      setThreadMessages(tMsgs)
    })
  }, [activeThreadParent, activeConvId])

  // Send Main Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputText.trim() || !activeConvId || sending) return

    const content = inputText.trim()
    setInputText('')
    soundEffects.playMessageSentSound()
    setSending(true)

    try {
      await sendMessageAction({
        conversationId: activeConvId,
        content,
        messageType: 'text',
      })
      // Refresh messages list
      const fresh = await getConversationMessagesAction(activeConvId)
      setMessages(fresh)
    } catch (err: any) {
      console.error('Failed to send message:', err)
      alert(err.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  // Send Thread Reply
  const handleSendThreadReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!threadInputText.trim() || !activeConvId || !activeThreadParent) return

    const content = threadInputText.trim()
    setThreadInputText('')
    soundEffects.playMessageSentSound()

    try {
      await sendMessageAction({
        conversationId: activeConvId,
        content,
        parentId: activeThreadParent.id,
      })
      const threadMsgs = await getConversationMessagesAction(activeConvId, activeThreadParent.id)
      setThreadMessages(threadMsgs)
      const fresh = await getConversationMessagesAction(activeConvId)
      setMessages(fresh)
    } catch (err: any) {
      console.error('Failed to send reply:', err)
    }
  }

  // Toggle Reaction
  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await toggleReactionAction(messageId, emoji)
      const fresh = await getConversationMessagesAction(activeConvId)
      setMessages(fresh)
    } catch (err) {
      console.error('Failed to toggle reaction:', err)
    }
  }

  // Delete Message Handler
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) return
    setMessages((prev) => prev.filter((m) => m.id !== messageId))
    setThreadMessages((prev) => prev.filter((m) => m.id !== messageId))
    try {
      const res = await deleteMessageAction(messageId)
      if (!res.success) {
        alert(res.error || 'Failed to delete message')
        const fresh = await getConversationMessagesAction(activeConvId)
        setMessages(fresh)
      }
    } catch (err) {
      console.error('Failed to delete message:', err)
    }
  }

  // Edit Message Handlers
  const handleStartEdit = (msg: ChatMessageItem) => {
    setEditingMessageId(msg.id)
    setEditText(msg.content)
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditText('')
  }

  const handleSaveEdit = async (messageId: string) => {
    if (!editText.trim()) return
    const newText = editText.trim()

    // Optimistic update
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, content: newText, isEdited: true, updatedAt: new Date().toISOString() }
          : m
      )
    )
    setThreadMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, content: newText, isEdited: true, updatedAt: new Date().toISOString() }
          : m
      )
    )
    setEditingMessageId(null)
    setEditText('')

    try {
      const res = await editMessageAction(messageId, newText)
      if (!res.success) {
        alert(res.error || 'Failed to save edited message')
        const fresh = await getConversationMessagesAction(activeConvId)
        setMessages(fresh)
      }
    } catch (err: any) {
      console.error('Failed to edit message:', err)
    }
  }

  // Forward Message Handler
  const handleOpenForward = (msg: ChatMessageItem) => {
    setForwardingMessage(msg)
    setIsForwardOpen(true)
  }

  // Start Realtime Outgoing Ringing Call
  const handleStartCall = async (callType: 'video' | 'audio' = 'video') => {
    if (!activeConvId || startingMeet) return
    try {
      setStartingMeet(true)
      const targetUserId = activeConv?.type === 'direct' ? activeConv.otherParticipant?.userId : undefined
      const res = await initiateCallAction({
        conversationId: activeConvId,
        targetUserId,
        callType,
        title: `${callType === 'video' ? 'Live Video' : 'Voice'} Call with ${activeConv?.name || 'Teammate'}`,
      })

      if (!res.success || !res.callPayload) {
        throw new Error(res.error || 'Failed to initiate call')
      }

      // Dispatch outgoing ringing screen locally
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('start-outgoing-call', { detail: res.callPayload })
        )
      }

      // Broadcast to all clients in real-time
      const supabase = createClient()
      const callChannel = supabase.channel('global-call-signaling')
      callChannel.send({
        type: 'broadcast',
        event: 'incoming_call',
        payload: res.callPayload,
      })

      const fresh = await getConversationMessagesAction(activeConvId)
      setMessages(fresh)
    } catch (err: any) {
      alert(err.message || 'Failed to start call')
    } finally {
      setStartingMeet(false)
    }
  }

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeConvId) return

    try {
      setSending(true)
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `chat-files/${activeConvId}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file)

      let fileUrl = ''
      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage.from('chat-attachments').getPublicUrl(filePath)
        fileUrl = publicUrlData.publicUrl
      } else {
        // Fallback to data URL or dummy if bucket not configured
        fileUrl = URL.createObjectURL(file)
      }

      await sendMessageAction({
        conversationId: activeConvId,
        content: `Shared file: ${file.name}`,
        messageType: 'file',
        fileUrl,
        fileName: file.name,
        fileSizeBytes: file.size,
        fileType: file.type,
      })
      soundEffects.playMessageSentSound()

      const fresh = await getConversationMessagesAction(activeConvId)
      setMessages(fresh)
    } catch (err: any) {
      alert(err.message || 'Failed to upload attachment')
    } finally {
      setSending(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const filteredChannels = conversations.filter(
    (c) => c.type === 'channel' && c.name.toLowerCase().includes(convSearch.toLowerCase())
  )
  const filteredDMs = conversations.filter(
    (c) => c.type === 'direct' && c.name.toLowerCase().includes(convSearch.toLowerCase())
  )

  const formatMessageTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatMessageDateGroup = (isoString: string) => {
    const date = new Date(isoString)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    })
  }

  const handleCopyMessage = (msgId: string, text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedMessageId(msgId)
    setTimeout(() => setCopiedMessageId(null), 2000)
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return 'text-purple-600 dark:text-purple-400'
      case 'admin':
        return 'text-sky-600 dark:text-sky-400'
      case 'hr_manager':
        return 'text-emerald-600 dark:text-emerald-400'
      case 'supervisor':
        return 'text-amber-600 dark:text-amber-400'
      default:
        return 'text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-300'
    }
  }

  return (
    <div className="flex h-full w-full rounded-none overflow-hidden border-0 bg-[var(--md-sys-color-surface)] dark:bg-[#070a12] text-[var(--md-sys-color-on-surface)] dark:text-slate-100 relative font-sans">
      {/* 1. LEFT SIDEBAR: Channels & Direct Messages */}
      <aside
        className={`w-full md:w-72 flex-shrink-0 flex flex-col border-r border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]/70 bg-[var(--md-sys-color-surface)] dark:bg-[#0c111d] transition-all z-20 ${
          showMobileSidebar ? 'absolute inset-0 md:relative' : 'hidden md:flex'
        }`}
      >
        {/* Sleek Top Search & Action Bar (Clean, no redundant titles) */}
        <div className="p-2.5 border-b border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]/70 flex items-center gap-2 bg-[var(--md-sys-color-surface)] dark:bg-[#0c111d]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500" />
            <input
              type="text"
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-[var(--md-sys-color-surface-container-high)] dark:bg-[#141b2b] border border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] text-xs text-[var(--md-sys-color-on-surface)] dark:text-slate-200 placeholder-[var(--md-sys-color-on-surface-variant)] dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--md-sys-color-primary)] transition-all"
            />
          </div>

          <button
            onClick={() => setIsNewChatOpen(true)}
            title="New Direct Message"
            className="p-1.5 rounded-xl text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
          {showMobileSidebar && (
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="md:hidden p-1.5 rounded-xl text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 hover:text-white shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Conversation Trees */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Channels Section */}
          <div>
            <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 uppercase tracking-wider">
              <span>Channels</span>
              <button
                onClick={() => setIsNewChannelOpen(true)}
                className="hover:text-[var(--md-sys-color-primary)] transition-colors"
                title="Create Channel"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-0.5 mt-1">
              {filteredChannels.map((c) => {
                const isActive = c.id === activeConvId
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveConvId(c.id)
                      setShowMobileSidebar(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold shadow-xs'
                        : 'text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] font-medium dark:text-slate-300 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Hash className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500'}`} />
                      <span className="text-xs truncate">{c.name}</span>
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-black text-[10px] shadow-sm">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Direct Messages Section */}
          <div>
            <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 uppercase tracking-wider">
              <span>Direct Messages</span>
              <button
                onClick={() => setIsNewChatOpen(true)}
                className="hover:text-[var(--md-sys-color-primary)] transition-colors"
                title="New Direct Message"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-0.5 mt-1">
              {filteredDMs.length === 0 ? (
                <div className="px-3 py-2 text-[11px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500 italic">
                  No direct messages yet
                </div>
              ) : (
                filteredDMs.map((c) => {
                  const isActive = c.id === activeConvId
                  const presence = c.otherParticipant?.presenceStatus || 'offline'
                  const statusDot =
                    presence === 'online'
                      ? 'bg-emerald-500 ring-2 ring-emerald-500/30'
                      : presence === 'in_meeting'
                      ? 'bg-rose-500 ring-2 ring-rose-500/40 animate-pulse'
                      : presence === 'busy'
                      ? 'bg-amber-500'
                      : 'bg-slate-400 dark:bg-slate-500'

                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveConvId(c.id)
                        setShowMobileSidebar(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                        isActive
                          ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold shadow-xs'
                          : 'text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] font-medium dark:text-slate-300 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="relative flex-shrink-0">
                          {c.avatarUrl ? (
                            <img src={c.avatarUrl} alt={c.name} className="w-6 h-6 rounded-full object-cover border border-[var(--md-sys-color-outline-variant)] dark:border-slate-700" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-[10px] font-bold border border-[var(--md-sys-color-outline-variant)] dark:border-slate-700">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[var(--md-sys-color-surface)] dark:border-[#0c111d] ${statusDot}`} />
                        </div>
                        <span className="text-xs truncate">{c.name}</span>
                      </div>
                      {c.unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-black text-[10px] shadow-sm">
                          {c.unreadCount}
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN ACTIVE CHAT STREAM */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--md-sys-color-surface-container-lowest)] dark:bg-[#070a12] relative">
        {/* Chat Top Header */}
        <header className="px-4 py-3 border-b border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]/70 bg-[var(--md-sys-color-surface)]/90 dark:bg-[#0c111d]/90 backdrop-blur-md flex items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-3 truncate">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="md:hidden p-1.5 rounded-lg text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 truncate">
              {activeConv?.type === 'channel' ? (
                <div className="w-8 h-8 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center flex-shrink-0 border border-[var(--md-sys-color-outline-variant)]">
                  <Hash className="w-4 h-4" />
                </div>
              ) : (
                <div className="relative flex-shrink-0">
                  {activeConv?.avatarUrl ? (
                    <img src={activeConv.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-[var(--md-sys-color-outline-variant)] dark:border-slate-700" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-outline-variant)] flex items-center justify-center font-bold text-xs">
                      {activeConv?.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              )}
              <div className="truncate">
                <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)] dark:text-white flex items-center gap-2 truncate">
                  <span>{activeConv?.name || 'Select Conversation'}</span>
                </h3>
                <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 truncate">
                  {activeConv?.description || (activeConv?.type === 'channel' ? 'Public Team Channel' : 'Direct Conversation')}
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStartCall('audio')}
              disabled={startingMeet}
              title="Start Voice Call"
              className="p-2 rounded-xl border border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] transition-all shadow-2xs active:scale-95 disabled:opacity-50"
            >
              <Phone className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
            </button>

            <button
              onClick={() => handleStartCall('video')}
              disabled={startingMeet}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] font-semibold text-xs tracking-wide transition-all shadow-2xs active:scale-95 disabled:opacity-50"
            >
              <Video className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Video Call</span>
            </button>
          </div>
        </header>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-1">
          {loadingMessages ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400">
              <div className="w-6 h-6 border-2 border-[var(--md-sys-color-primary)] border-t-transparent rounded-full animate-spin" />
              <span>Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 gap-2">
              <div className="w-12 h-12 rounded-2xl bg-[var(--md-sys-color-primary-container)] border border-[var(--md-sys-color-outline-variant)] flex items-center justify-center text-[var(--md-sys-color-primary)] shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[var(--md-sys-color-on-surface)] dark:text-white">
                Welcome to #{activeConv?.name || 'Chat'}!
              </h4>
              <p className="text-xs max-w-sm text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400">
                This is the start of your real-time conversation. Send a message, share files, or start a video call.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.senderId === currentUserId
              const isSystem = msg.messageType === 'system'

              const prevMsg = idx > 0 ? messages[idx - 1] : null
              const isSameDateAsPrev = prevMsg
                ? formatMessageDateGroup(msg.createdAt) === formatMessageDateGroup(prevMsg.createdAt)
                : false

              const isConsecutive = Boolean(
                prevMsg &&
                prevMsg.senderId === msg.senderId &&
                prevMsg.messageType !== 'system' &&
                msg.messageType !== 'system' &&
                isSameDateAsPrev &&
                (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 5 * 60 * 1000)
              )

              return (
                <React.Fragment key={msg.id}>
                  {/* Sticky Date Divider */}
                  {!isSameDateAsPrev && (
                    <div className="flex items-center my-4 gap-3">
                      <div className="h-px bg-[var(--md-sys-color-outline-variant)]/60 dark:bg-[#1e293b] flex-1" />
                      <span className="text-[10px] font-bold tracking-wider text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 uppercase px-3 py-0.5 bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] border border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] rounded-full shadow-xs">
                        {formatMessageDateGroup(msg.createdAt)}
                      </span>
                      <div className="h-px bg-[var(--md-sys-color-outline-variant)]/60 dark:bg-[#1e293b] flex-1" />
                    </div>
                  )}

                  {/* System Message */}
                  {isSystem ? (
                    <div className="flex items-center justify-center my-2">
                      <span className="px-3 py-1 rounded-full text-[11px] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] dark:bg-[#141b2b] dark:text-slate-400 border border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] shadow-xs">
                        {msg.senderName} {msg.content}
                      </span>
                    </div>
                  ) : (
                    /* User Message Row */
                    <div
                      className={`flex items-start gap-2.5 group/msg relative transition-all ${
                        isMe ? 'flex-row-reverse' : 'flex-row'
                      } ${isConsecutive ? 'mt-0.5' : 'mt-3.5'}`}
                    >
                      {/* Avatar Column */}
                      <div className="w-8 flex-shrink-0 flex items-start justify-center">
                        {!isConsecutive ? (
                          msg.senderAvatarUrl ? (
                            <img
                              src={msg.senderAvatarUrl}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-[var(--md-sys-color-outline-variant)] dark:border-slate-700 shadow-xs"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-xs font-bold border border-[var(--md-sys-color-outline-variant)] dark:border-slate-700 shadow-xs">
                              {msg.senderName.charAt(0).toUpperCase()}
                            </div>
                          )
                        ) : (
                          /* Hover timestamp on collapsed avatar gutter */
                          <span className="text-[9px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500 opacity-0 group-hover/msg:opacity-100 transition-opacity select-none pt-1">
                            {formatMessageTime(msg.createdAt)}
                          </span>
                        )}
                      </div>

                      {/* Message Bubble Container */}
                      <div className={`max-w-[76%] md:max-w-[65%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {/* Header info (Only for first message in group) */}
                        {!isConsecutive && (
                          <div className={`flex items-center gap-1.5 mb-1 px-1 text-[11px] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className={`font-bold ${getRoleColor(msg.senderRole)}`}>
                              {isMe ? 'You' : msg.senderName}
                            </span>
                            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500">
                              {formatMessageTime(msg.createdAt)}
                            </span>
                          </div>
                        )}

                        {/* Content Box */}
                        <div
                          className={`relative transition-all select-text ${
                            msg.messageType === 'meet_card'
                              ? 'p-0 bg-transparent border-0 shadow-none'
                              : isMe
                              ? 'px-3.5 py-2 text-[13px] leading-[1.55] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-normal rounded-2xl rounded-tr-xs shadow-md border border-[var(--md-sys-color-primary)]/40'
                              : 'px-3.5 py-2 text-[13px] leading-[1.55] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] dark:bg-[#151d2c] dark:text-slate-100 dark:border-[#222e44] rounded-2xl rounded-tl-xs shadow-xs font-normal'
                          }`}
                        >
                          {/* Live Meet Card / Missed Call Card */}
                          {msg.messageType === 'meet_card' && <ChatMeetCard metadata={msg.metadata} />}

                          {/* File Card */}
                          {msg.messageType === 'file' && (
                            <div className="my-1 p-2.5 rounded-xl bg-black/5 dark:bg-black/20 border border-[var(--md-sys-color-outline-variant)] dark:border-white/10 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 truncate">
                                <FileText className="w-4 h-4 flex-shrink-0 text-[var(--md-sys-color-primary)]" />
                                <span className="font-semibold truncate text-[var(--md-sys-color-on-surface)] dark:text-slate-100">{msg.fileName || 'Attachment'}</span>
                              </div>
                              {msg.fileUrl && (
                                <a
                                  href={msg.fileUrl}
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg bg-[var(--md-sys-color-surface-container)] dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors text-[var(--md-sys-color-on-surface)] dark:text-white"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          )}

                          {/* Regular Text & Inline Edit Mode */}
                          {editingMessageId === msg.id ? (
                            <div className="w-full min-w-[240px] max-w-md py-1">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSaveEdit(msg.id)
                                  } else if (e.key === 'Escape') {
                                    e.preventDefault()
                                    handleCancelEdit()
                                  }
                                }}
                                autoFocus
                                rows={2}
                                className="w-full p-2 text-xs rounded-xl bg-black/10 dark:bg-black/40 border border-white/20 text-inherit placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-white resize-none"
                              />
                              <div className="flex items-center justify-end gap-1.5 mt-1.5 text-[11px]">
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="px-2.5 py-1 rounded-lg bg-black/20 hover:bg-black/30 text-inherit font-semibold transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(msg.id)}
                                  className="px-3 py-1 rounded-lg bg-white text-blue-600 font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            msg.content &&
                            msg.messageType !== 'meet_card' && (
                              <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                            )
                          )}

                          {/* Inline Time & Read Status for Sent text messages */}
                          {isMe && msg.messageType !== 'meet_card' && (
                            <div className="flex items-center justify-end gap-1 mt-1 -mb-0.5 text-[9.5px] opacity-75 select-none">
                              {(msg.isEdited || msg.metadata?.isEdited) && (
                                <span className="text-[9px] opacity-70 italic font-medium mr-0.5">(edited)</span>
                              )}
                              <span>{formatMessageTime(msg.createdAt)}</span>
                              <CheckCheck className="w-3 h-3 text-white/90" />
                            </div>
                          )}

                          {/* Inline Time for Sent meet cards */}
                          {isMe && msg.messageType === 'meet_card' && (
                            <div className="flex items-center justify-end gap-1 mt-1 text-[9.5px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 select-none">
                              <span>{formatMessageTime(msg.createdAt)}</span>
                              <CheckCheck className="w-3 h-3 text-[var(--md-sys-color-primary)]" />
                            </div>
                          )}

                          {/* Inline Time & Edited Status for Received text messages */}
                          {!isMe && msg.messageType !== 'meet_card' && (msg.isEdited || msg.metadata?.isEdited) && (
                            <div className="flex items-center gap-1 mt-1 -mb-0.5 text-[9.5px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500 italic select-none">
                              <span>(edited)</span>
                            </div>
                          )}

                          {/* Quick Action Floating Toolbar */}
                          <div
                            className={`absolute -top-4 ${
                              isMe ? 'right-0' : 'left-0'
                            } opacity-0 group-hover/msg:opacity-100 pointer-events-none group-hover/msg:pointer-events-auto transition-all duration-150 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container)] dark:bg-[#1a2336] border border-[var(--md-sys-color-outline-variant)] dark:border-slate-700 shadow-xl text-xs z-30 whitespace-nowrap`}
                          >
                            {COMMON_EMOJIS.slice(0, 3).map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(msg.id, emoji)}
                                className="p-1 hover:scale-125 transition-transform"
                                title={`React ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                            <div className="w-px h-3 bg-[var(--md-sys-color-outline-variant)] dark:bg-slate-700 mx-0.5" />
                            <button
                              onClick={() => setActiveThreadParent(msg)}
                              title="Reply in thread"
                              className="p-1 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                            {isMe && msg.messageType === 'text' && (
                              <button
                                onClick={() => handleStartEdit(msg)}
                                title="Edit message"
                                className="p-1 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenForward(msg)}
                              title="Forward message"
                              className="p-1 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-colors"
                            >
                              <Forward className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.content || '')}
                              title="Copy text"
                              className="p-1 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-colors"
                            >
                              {copiedMessageId === msg.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            {(isMe || currentUserRole === 'admin' || currentUserRole === 'superadmin') && (
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                title="Delete message"
                                className="p-1 text-[var(--md-sys-color-on-surface-variant)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Reactions List */}
                        {msg.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5 px-1">
                            {msg.reactions.map((r) => (
                              <button
                                key={r.emoji}
                                onClick={() => handleReaction(msg.id, r.emoji)}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-all ${
                                  r.hasReacted
                                    ? 'bg-[var(--md-sys-color-primary-container)] border-[var(--md-sys-color-primary)]/40 text-[var(--md-sys-color-on-primary-container)]'
                                    : 'bg-[var(--md-sys-color-surface-container)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] dark:bg-[#141b2b] dark:border-[#24324c] dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600'
                                }`}
                              >
                                <span>{r.emoji}</span>
                                <span>{r.count}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Thread Replies Indicator */}
                        {(msg.replyCount || 0) > 0 && (
                          <button
                            onClick={() => setActiveThreadParent(msg)}
                            className="mt-1 px-1 flex items-center gap-1.5 text-[11px] font-bold text-[var(--md-sys-color-primary)] hover:underline"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>
                              {msg.replyCount} {msg.replyCount === 1 ? 'reply' : 'replies'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Composer */}
        <div className="p-3 border-t border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]/70 bg-[var(--md-sys-color-surface)] dark:bg-[#0c111d]">
          <form onSubmit={handleSendMessage} className="relative flex flex-col gap-1.5">
            <div className="relative rounded-2xl bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] border border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] focus-within:border-[var(--md-sys-color-primary)] focus-within:ring-2 focus-within:ring-[var(--md-sys-color-primary)]/20 transition-all p-3 shadow-xs">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder={`Message #${activeConv?.name || 'chat'}...`}
                rows={2}
                className="w-full bg-transparent text-[13px] text-[var(--md-sys-color-on-surface)] dark:text-slate-100 placeholder-[var(--md-sys-color-on-surface-variant)] dark:placeholder-slate-500 focus:outline-none resize-none px-1 font-normal leading-relaxed"
              />

              {/* Composer Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--md-sys-color-outline-variant)]/60 dark:border-[#1e293b]/80">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach File"
                    className="p-1.5 rounded-lg text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)] dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    title="Insert Emoji"
                    className="p-1.5 rounded-lg text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)] dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200 transition-colors"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartCall('video')}
                    title="Start Live Video Call"
                    className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 transition-colors"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-[10px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500 select-none">
                    Enter ↵ to send
                  </span>
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold text-xs hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all shadow-md shadow-[var(--md-sys-color-primary)]/20"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Emoji Picker Strip */}
            {showEmojiPicker && (
              <div className="flex items-center gap-1 p-2 rounded-xl bg-[var(--md-sys-color-surface-container)] dark:bg-[#1e293b] border border-[var(--md-sys-color-outline-variant)] dark:border-slate-700 shadow-xl animate-in fade-in zoom-in-95">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setInputText((prev) => prev + emoji)
                      setShowEmojiPicker(false)
                    }}
                    className="p-1 text-sm hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>
      </main>

      {/* 3. RIGHT COLLAPSIBLE THREAD SIDEBAR */}
      {activeThreadParent && (
        <aside className="w-80 flex-shrink-0 border-l border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]/70 bg-[var(--md-sys-color-surface)] dark:bg-[#0c111d] flex flex-col z-20 animate-in slide-in-from-right-10 duration-200">
          <div className="p-3.5 border-b border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]/70 flex items-center justify-between bg-[var(--md-sys-color-surface-container)] dark:bg-[#0e1424]">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
              <h3 className="text-xs font-bold text-[var(--md-sys-color-on-surface)] dark:text-white">Thread Discussion</h3>
            </div>
            <button
              onClick={() => setActiveThreadParent(null)}
              className="p-1 rounded-lg text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Parent Message Header */}
          <div className="p-3 border-b border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]/70 bg-[var(--md-sys-color-surface-container-high)] dark:bg-[#141b2b]">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-bold text-xs ${getRoleColor(activeThreadParent.senderRole)}`}>
                {activeThreadParent.senderName}
              </span>
              <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500">
                {formatMessageTime(activeThreadParent.createdAt)}
              </span>
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface)] dark:text-slate-200">{activeThreadParent.content}</p>
          </div>

          {/* Thread Replies List */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3 bg-[var(--md-sys-color-surface-container-lowest)] dark:bg-[#070a12]">
            {threadMessages.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500 italic">
                No replies yet. Be the first to reply!
              </div>
            ) : (
              threadMessages.map((tMsg) => (
                <div key={tMsg.id} className="p-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-high)] dark:bg-[#151d2c] border border-[var(--md-sys-color-outline-variant)] dark:border-[#222e44]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`font-semibold text-xs ${getRoleColor(tMsg.senderRole)}`}>
                      {tMsg.senderName}
                    </span>
                    <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500">
                      {formatMessageTime(tMsg.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--md-sys-color-on-surface)] dark:text-slate-200 whitespace-pre-wrap">{tMsg.content}</p>
                </div>
              ))
            )}
            <div ref={threadEndRef} />
          </div>

          {/* Thread Reply Composer */}
          <div className="p-3 border-t border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]/70 bg-[var(--md-sys-color-surface)] dark:bg-[#0c111d]">
            <form onSubmit={handleSendThreadReply} className="flex gap-2">
              <input
                type="text"
                value={threadInputText}
                onChange={(e) => setThreadInputText(e.target.value)}
                placeholder="Reply in thread..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--md-sys-color-surface-container-high)] dark:bg-[#141b2b] border border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] text-xs text-[var(--md-sys-color-on-surface)] dark:text-slate-100 placeholder-[var(--md-sys-color-on-surface-variant)] dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--md-sys-color-primary)]"
              />
              <button
                type="submit"
                disabled={!threadInputText.trim()}
                className="p-2 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90 disabled:opacity-40 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </aside>
      )}

      {/* Modals */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onSelectConversation={async (convId) => {
          const fresh = await getConversationsListAction()
          setConversations(fresh)
          setActiveConvId(convId)
        }}
      />

      <NewChannelModal
        isOpen={isNewChannelOpen}
        onClose={() => setIsNewChannelOpen(false)}
        onChannelCreated={async (convId) => {
          const fresh = await getConversationsListAction()
          setConversations(fresh)
          setActiveConvId(convId)
        }}
      />

      <ForwardMessageModal
        isOpen={isForwardOpen}
        onClose={() => {
          setIsForwardOpen(false)
          setForwardingMessage(null)
        }}
        message={forwardingMessage}
        conversations={conversations}
        onForwarded={async () => {
          const fresh = await getConversationMessagesAction(activeConvId)
          setMessages(fresh)
        }}
      />
    </div>
  )
}
