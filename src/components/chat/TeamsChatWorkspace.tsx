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
  ChevronLeft,
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
  Reply,
  SmilePlus,
  Mic,
  MicOff,
  Maximize2,
  Image as ImageIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  ChatConversationItem,
  ChatMessageItem,
  getConversationsListAction,
  getConversationMessagesAction,
  sendMessageAction,
  uploadChatAttachmentAction,
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
import { EmojiAndGifPicker } from './EmojiAndGifPicker'
import { ImagePreviewModal } from './ImagePreviewModal'
import { VoiceNotePlayer } from './VoiceNotePlayer'
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
  const [replyingTo, setReplyingTo] = useState<ChatMessageItem | null>(null)
  const [reactingMessageId, setReactingMessageId] = useState<string | null>(null)
  const [mobileActionMessage, setMobileActionMessage] = useState<ChatMessageItem | null>(null)

  // Image Lightbox Preview State
  const [previewImage, setPreviewImage] = useState<{
    url: string
    fileName?: string
    fileSize?: number
  } | null>(null)

  // Voice Note Recording State
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false)
  const [recordingDuration, setRecordingDuration] = useState<number>(0)
  const [recordingWaveformLevels, setRecordingWaveformLevels] = useState<number[]>([0.3, 0.5, 0.2, 0.7, 0.4, 0.6, 0.3, 0.5])

  // Touch Gestures State
  const [swipingMessageId, setSwipingMessageId] = useState<string | null>(null)
  const [swipeOffset, setSwipeOffset] = useState<number>(0)
  const [heartBursts, setHeartBursts] = useState<Array<{ id: string; msgId: string; x: number; y: number }>>([])
  const [actionSheetPullOffset, setActionSheetPullOffset] = useState<number>(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const threadEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mainInputRef = useRef<HTMLTextAreaElement>(null)

  const touchStartPos = useRef<{ x: number; y: number; time: number } | null>(null)
  const isHorizontalSwipe = useRef<boolean>(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const lastTapRef = useRef<{ time: number; msgId: string } | null>(null)
  const hasTriggeredHaptic = useRef<boolean>(false)
  const actionSheetTouchStartRef = useRef<number | null>(null)

  // Audio Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const waveformSamplesRef = useRef<number[]>([])

  const activeConv = conversations.find((c) => c.id === activeConvId)

  // Action Sheet Pull Down Handlers
  const handleActionSheetTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      actionSheetTouchStartRef.current = e.touches[0].clientY
    }
  }

  const handleActionSheetTouchMove = (e: React.TouchEvent) => {
    if (actionSheetTouchStartRef.current !== null && e.touches.length === 1) {
      const deltaY = e.touches[0].clientY - actionSheetTouchStartRef.current
      if (deltaY > 0) {
        setActionSheetPullOffset(deltaY)
      }
    }
  }

  const handleActionSheetTouchEnd = () => {
    if (actionSheetPullOffset > 60) {
      setMobileActionMessage(null)
    }
    setActionSheetPullOffset(0)
    actionSheetTouchStartRef.current = null
  }

  // Voice Note Recording Handlers
  const handleStartVoiceRecording = async () => {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        alert('Microphone access is not supported by your browser')
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStreamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/webm'

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []
      waveformSamplesRef.current = []

      // Audio analysis for live animated visualizer
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
        audioContextRef.current = audioCtx
        const source = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 64
        source.connect(analyser)
        analyserRef.current = analyser

        const dataArray = new Uint8Array(analyser.frequencyBinCount)

        const updateWaveform = () => {
          if (!analyserRef.current) return
          analyserRef.current.getByteFrequencyData(dataArray)
          
          let sum = 0
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i]
          }
          const avg = sum / dataArray.length / 255
          const normalized = Math.max(0.15, Math.min(1.0, avg * 2.2))

          waveformSamplesRef.current.push(normalized)
          if (waveformSamplesRef.current.length > 32) {
            waveformSamplesRef.current.shift()
          }

          setRecordingWaveformLevels((prev) => {
            return [...prev.slice(1), normalized]
          })

          animationFrameRef.current = requestAnimationFrame(updateWaveform)
        }

        animationFrameRef.current = requestAnimationFrame(updateWaveform)
      } catch (err) {
        console.warn('Audio analyser skipped:', err)
      }

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      recorder.start(100)
      setIsRecordingVoice(true)
      setRecordingDuration(0)

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (err: any) {
      alert(err.message || 'Microphone access was denied')
    }
  }

  const handleStopVoiceRecording = async (shouldSend: boolean) => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }

    const stream = audioStreamRef.current
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      audioStreamRef.current = null
    }

    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }

    const duration = recordingDuration
    const recordedWaveform = [...waveformSamplesRef.current]

    setIsRecordingVoice(false)
    setRecordingDuration(0)

    if (shouldSend && activeConvId) {
      setTimeout(async () => {
        try {
          setSending(true)
          const chunks = audioChunksRef.current
          if (!chunks.length) return

          const mimeType = recorder?.mimeType || 'audio/webm'
          const audioBlob = new Blob(chunks, { type: mimeType })
          const fileName = `voice-${Date.now()}.webm`
          const audioFile = new File([audioBlob], fileName, { type: mimeType })

          const formData = new FormData()
          formData.append('file', audioFile)
          formData.append('conversationId', activeConvId)

          const uploadRes = await uploadChatAttachmentAction(formData)
          if (!uploadRes.success || !uploadRes.url) {
            throw new Error(uploadRes.error || 'Failed to upload voice note')
          }
          const fileUrl = uploadRes.url

          await sendMessageAction({
            conversationId: activeConvId,
            content: `🎤 Voice note (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`,
            messageType: 'file',
            fileUrl,
            fileName: 'Voice Note',
            fileSizeBytes: audioBlob.size,
            fileType: mimeType,
            metadata: {
              isVoiceNote: true,
              duration,
              waveform: recordedWaveform.length >= 10 ? recordedWaveform : undefined,
              replyTo: replyingTo
                ? {
                    messageId: replyingTo.id,
                    senderName: replyingTo.senderName,
                    content: replyingTo.content,
                    messageType: replyingTo.messageType,
                  }
                : undefined,
            },
          })
          setReplyingTo(null)
          soundEffects.playMessageSentSound()

          const fresh = await getConversationMessagesAction(activeConvId)
          setMessages(fresh)
        } catch (err: any) {
          alert(err.message || 'Failed to send voice note')
        } finally {
          setSending(false)
          audioChunksRef.current = []
        }
      }, 250)
    } else {
      audioChunksRef.current = []
    }
  }

  // Touch Gestures Handlers
  const handleTouchStart = (msg: ChatMessageItem, e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    const touch = e.touches[0]
    touchStartPos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
    isHorizontalSwipe.current = false
    hasTriggeredHaptic.current = false

    // Long press timer (420ms) for action sheet
    longPressTimer.current = setTimeout(() => {
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(25)
        }
      } catch {}
      setMobileActionMessage(msg)
      touchStartPos.current = null
    }, 420)
  }

  const handleTouchMove = (msg: ChatMessageItem, isMe: boolean, e: React.TouchEvent) => {
    if (!touchStartPos.current || e.touches.length !== 1) return
    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartPos.current.x
    const deltaY = touch.clientY - touchStartPos.current.y

    // Cancel long press if finger moved
    if (Math.hypot(deltaX, deltaY) > 8 && longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    // Determine swipe direction
    if (!isHorizontalSwipe.current) {
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
        // Vertical scroll -> cancel swipe
        touchStartPos.current = null
        setSwipingMessageId(null)
        setSwipeOffset(0)
        return
      } else if (Math.abs(deltaX) > 8) {
        isHorizontalSwipe.current = true
      }
    }

    if (isHorizontalSwipe.current) {
      // Calculate responsive swipe offset
      // If received (left-aligned): swipe right (+deltaX)
      // If sent (right-aligned): swipe left (-deltaX)
      let offset = 0
      if (!isMe && deltaX > 0) {
        offset = Math.min(deltaX * 0.45, 60)
      } else if (isMe && deltaX < 0) {
        offset = Math.max(deltaX * 0.45, -60)
      }

      setSwipingMessageId(msg.id)
      setSwipeOffset(offset)

      // Haptic tick on threshold reached
      if (Math.abs(offset) >= 40 && !hasTriggeredHaptic.current) {
        hasTriggeredHaptic.current = true
        try {
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(12)
          }
        } catch {}
      }
    }
  }

  const handleTouchEnd = (msg: ChatMessageItem, isMe: boolean, e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    const currentOffset = swipingMessageId === msg.id ? swipeOffset : 0
    const passedThreshold = Math.abs(currentOffset) >= 40

    if (passedThreshold) {
      // Trigger Quote Reply
      setReplyingTo(msg)
      mainInputRef.current?.focus()
    } else if (touchStartPos.current) {
      // Check for Double-Tap Heart Reaction
      const now = Date.now()
      const touchDuration = now - touchStartPos.current.time
      if (touchDuration < 280) {
        if (
          lastTapRef.current &&
          now - lastTapRef.current.time < 320 &&
          lastTapRef.current.msgId === msg.id
        ) {
          // Double Tap Triggered!
          handleReaction(msg.id, '❤️')
          try {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([10, 30, 15])
            }
          } catch {}

          // Add floating heart particle burst
          const burstId = `burst-${Date.now()}`
          const touchX = touchStartPos.current?.x || (typeof window !== 'undefined' ? window.innerWidth / 2 : 100)
          const touchY = touchStartPos.current?.y || 200
          setHeartBursts((prev) => [
            ...prev,
            { id: burstId, msgId: msg.id, x: touchX, y: touchY },
          ])
          setTimeout(() => {
            setHeartBursts((prev) => prev.filter((b) => b.id !== burstId))
          }, 800)

          lastTapRef.current = null
        } else {
          lastTapRef.current = { time: now, msgId: msg.id }
        }
      }
    }

    // Reset touch and swipe
    touchStartPos.current = null
    setSwipingMessageId(null)
    setSwipeOffset(0)
    isHorizontalSwipe.current = false
    hasTriggeredHaptic.current = false
  }

  // Scroll to original message when quoted reply bubble is clicked
  const scrollToMessage = (targetId: string) => {
    if (!targetId) return
    const el = document.getElementById(`chat-msg-${targetId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ring-2', 'ring-[var(--md-sys-color-primary)]', 'rounded-2xl', 'transition-all', 'duration-300')
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-[var(--md-sys-color-primary)]', 'rounded-2xl')
      }, 2000)
    }
  }

  // Close message reaction picker on outside click or Escape
  useEffect(() => {
    const handleGlobalClick = () => setReactingMessageId(null)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setReactingMessageId(null)
    }
    window.addEventListener('click', handleGlobalClick)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('click', handleGlobalClick)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

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
    const replyMeta = replyingTo
      ? {
          replyTo: {
            messageId: replyingTo.id,
            senderName: replyingTo.senderName,
            content:
              replyingTo.messageType === 'file'
                ? `📎 ${replyingTo.fileName || 'Attachment'}`
                : replyingTo.messageType === 'meet_card'
                ? '📹 Video Meeting'
                : replyingTo.content,
            messageType: replyingTo.messageType,
          },
        }
      : undefined

    setInputText('')
    setReplyingTo(null)
    soundEffects.playMessageSentSound()
    setSending(true)

    try {
      await sendMessageAction({
        conversationId: activeConvId,
        content,
        messageType: 'text',
        metadata: replyMeta,
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

  // Handle Select Emoji from Picker
  const handleSelectEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji)
    setShowEmojiPicker(false)
    mainInputRef.current?.focus()
  }

  // Handle Select & Send GIF from Picker
  const handleSelectGif = async (gifUrl: string, title: string) => {
    if (!activeConvId) return
    setShowEmojiPicker(false)
    soundEffects.playMessageSentSound()

    const replyMeta = replyingTo
      ? {
          replyTo: {
            messageId: replyingTo.id,
            senderName: replyingTo.senderName,
            content:
              replyingTo.messageType === 'file'
                ? `📎 ${replyingTo.fileName || 'Attachment'}`
                : replyingTo.messageType === 'meet_card'
                ? '📹 Video Meeting'
                : replyingTo.content,
            messageType: replyingTo.messageType,
          },
          isGif: true,
        }
      : { isGif: true }

    setReplyingTo(null)

    try {
      await sendMessageAction({
        conversationId: activeConvId,
        content: title,
        messageType: 'file',
        fileUrl: gifUrl,
        fileName: `${title}.gif`,
        fileType: 'image/gif',
        metadata: replyMeta,
      })
      const fresh = await getConversationMessagesAction(activeConvId)
      setMessages(fresh)
    } catch (err: any) {
      console.error('Failed to send GIF:', err)
      alert(err.message || 'Failed to send GIF')
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
      const formData = new FormData()
      formData.append('file', file)
      formData.append('conversationId', activeConvId)

      const uploadRes = await uploadChatAttachmentAction(formData)
      if (!uploadRes.success || !uploadRes.url) {
        throw new Error(uploadRes.error || 'Failed to upload attachment')
      }

      await sendMessageAction({
        conversationId: activeConvId,
        content: `Shared file: ${file.name}`,
        messageType: 'file',
        fileUrl: uploadRes.url,
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
      <main className="flex-1 flex flex-col min-w-0 h-full max-h-full overflow-hidden bg-[var(--md-sys-color-surface-container-lowest)] dark:bg-[#070a12] relative">
        {/* Chat Top Header (Pinned & Fixed) */}
        <header className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]/70 bg-[var(--md-sys-color-surface)]/95 dark:bg-[#0c111d]/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2 sm:gap-3 truncate">
            {/* Ruled Mobile Back Button */}
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="md:hidden flex items-center gap-0.5 px-2 py-1.5 -ml-2 rounded-xl text-[var(--md-sys-color-primary)] font-bold text-xs hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all shrink-0 cursor-pointer"
              title="Back to conversations"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-[11px] font-bold">Chats</span>
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

        {/* Messages Feed (THE ONLY SCROLLABLE ELEMENT) */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3.5 sm:px-5 md:px-6 py-3 sm:py-4 space-y-1 overscroll-contain">
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

              const isGif =
                msg.messageType === 'file' &&
                (msg.fileType === 'image/gif' ||
                  msg.fileUrl?.includes('.gif') ||
                  msg.fileUrl?.includes('giphy.gif') ||
                  msg.metadata?.isGif)

              const isAudio =
                msg.messageType === 'file' &&
                (msg.fileType?.startsWith('audio/') ||
                  msg.metadata?.isVoiceNote ||
                  Boolean(msg.fileUrl?.match(/\.(webm|mp3|m4a|wav|ogg|aac)($|\?)/i)))

              const isImage =
                msg.messageType === 'file' &&
                !isGif &&
                (Boolean(msg.fileType?.startsWith('image/')) ||
                  Boolean(msg.fileName?.match(/\.(jpeg|jpg|png|webp|svg|gif|bmp|heic|avif)($|\?)/i)) ||
                  Boolean(msg.fileUrl?.match(/\.(jpeg|jpg|png|webp|svg|gif|bmp|heic|avif)($|\?)/i)) ||
                  Boolean(msg.metadata?.isImage))

              return (
                <React.Fragment key={msg.id}>
                  {/* Sticky Date Divider */}
                  {!isSameDateAsPrev && (
                    <div className="flex items-center my-3 sm:my-4 gap-3">
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
                    /* User Message Row with Touch Gestures */
                    <div
                      id={`chat-msg-${msg.id}`}
                      onTouchStart={(e) => handleTouchStart(msg, e)}
                      onTouchMove={(e) => handleTouchMove(msg, isMe, e)}
                      onTouchEnd={(e) => handleTouchEnd(msg, isMe, e)}
                      onTouchCancel={(e) => handleTouchEnd(msg, isMe, e)}
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.innerWidth < 768) {
                          setMobileActionMessage(msg)
                        }
                      }}
                      style={{
                        transform: swipingMessageId === msg.id ? `translateX(${swipeOffset}px)` : 'translateX(0px)',
                        transition: swipingMessageId === msg.id ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)',
                      }}
                      className={`flex items-start gap-1.5 md:gap-2.5 group/msg relative transition-all cursor-pointer md:cursor-default ${
                        isMe
                          ? 'flex-row-reverse pl-6 sm:pl-10 md:pl-0 pr-0.5 sm:pr-0'
                          : 'flex-row pr-6 sm:pr-10 md:pr-0 pl-1.5 sm:pl-0'
                      } ${isConsecutive ? 'mt-0.5' : 'mt-2.5 sm:mt-3.5'}`}
                    >
                      {/* Swipe-to-Reply Spring Indicator */}
                      {swipingMessageId === msg.id && Math.abs(swipeOffset) > 4 && (
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10 ${
                            isMe ? 'right-full mr-2' : 'left-full ml-2'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-75 ${
                              Math.abs(swipeOffset) >= 40
                                ? 'bg-[var(--md-sys-color-primary)] text-white scale-110'
                                : 'bg-[var(--md-sys-color-surface-container-high)] dark:bg-slate-800 text-[var(--md-sys-color-primary)] scale-90 opacity-80'
                            }`}
                          >
                            <Reply className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                        </div>
                      )}

                      {/* Avatar Column (Hidden on mobile for ultra-compact screen real estate, visible on md+) */}
                      <div className="hidden md:flex w-8 flex-shrink-0 items-start justify-center">
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
                      <div className={`max-w-[88%] sm:max-w-[78%] md:max-w-[65%] min-w-0 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {/* Header info (Only for first message in group) */}
                        {!isConsecutive && (
                          <div className={`flex items-center gap-1.5 mb-1 px-1.5 text-[10.5px] sm:text-[11px] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className={`font-bold ${getRoleColor(msg.senderRole)}`}>
                              {isMe ? 'You' : msg.senderName}
                            </span>
                            <span className="text-[9.5px] sm:text-[10px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500">
                              {formatMessageTime(msg.createdAt)}
                            </span>
                          </div>
                        )}

                        {/* Content Box */}
                        <div
                          className={`relative transition-all select-text max-w-full min-w-0 ${
                            msg.messageType === 'meet_card' || isGif || isImage || isAudio
                              ? 'p-0 bg-transparent border-0 shadow-none'
                              : isMe
                              ? 'px-3.5 sm:px-4 py-2 sm:py-2.5 text-[13px] sm:text-[13.5px] leading-relaxed bg-[var(--md-sys-color-primary)] text-white font-normal rounded-2xl rounded-tr-xs shadow-xs border border-transparent'
                              : 'px-3.5 sm:px-4 py-2 sm:py-2.5 text-[13px] sm:text-[13.5px] leading-relaxed bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] dark:bg-[#131c2e] dark:text-slate-100 dark:border-[#202d46] rounded-2xl rounded-tl-xs shadow-2xs font-normal'
                          }`}
                        >
                          {/* In-Chat Quoted Tagging / Reply Bubble */}
                          {(msg.replyTo || msg.metadata?.replyTo) && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation()
                                scrollToMessage((msg.replyTo || msg.metadata?.replyTo).messageId)
                              }}
                              className={`mb-2 p-2 sm:p-2.5 rounded-xl border-l-[3.5px] cursor-pointer transition-all active:scale-[0.98] text-left select-none shadow-2xs max-w-full min-w-0 overflow-hidden ${
                                isMe
                                  ? 'bg-black/20 dark:bg-black/40 border-white/90 hover:bg-black/30 text-white'
                                  : 'bg-black/5 dark:bg-slate-800/80 border-[var(--md-sys-color-primary)] hover:bg-black/10 dark:hover:bg-slate-800 text-[var(--md-sys-color-on-surface)] dark:text-slate-200'
                              }`}
                            >
                              <div className={`flex items-center gap-1 text-[11px] font-bold truncate ${isMe ? 'text-white/90' : 'text-[var(--md-sys-color-primary)]'}`}>
                                <Reply className="w-3 h-3 shrink-0" />
                                <span className="truncate">{(msg.replyTo || msg.metadata?.replyTo).senderName}</span>
                              </div>
                              <p className="text-[11px] opacity-80 truncate mt-0.5 line-clamp-1">
                                {(msg.replyTo || msg.metadata?.replyTo).content}
                              </p>
                            </div>
                          )}

                          {/* Live Meet Card / Missed Call Card */}
                          {msg.messageType === 'meet_card' && <ChatMeetCard metadata={msg.metadata} />}

                          {/* Pure Animated GIF Card (Click to preview fullscreen) */}
                          {isGif && msg.fileUrl && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation()
                                setPreviewImage({
                                  url: msg.fileUrl!,
                                  fileName: msg.fileName || 'GIF Animation',
                                  fileSize: msg.fileSizeBytes,
                                })
                              }}
                              className="relative group/gif overflow-hidden rounded-2xl shadow-md max-w-full sm:max-w-[280px] my-0.5 cursor-pointer"
                              title="Click to view full size"
                            >
                              <img
                                src={msg.fileUrl}
                                alt="GIF"
                                loading="lazy"
                                className="w-full max-h-[240px] object-cover rounded-2xl group-hover:scale-[1.02] transition-transform duration-200"
                              />
                            </div>
                          )}

                          {/* Rich Image Card (Click to open full Image Lightbox Preview) */}
                          {!isGif && isImage && msg.fileUrl && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation()
                                setPreviewImage({
                                  url: msg.fileUrl!,
                                  fileName: msg.fileName || 'Image Attachment',
                                  fileSize: msg.fileSizeBytes,
                                })
                              }}
                              className="relative group/img overflow-hidden rounded-2xl shadow-sm border border-[var(--md-sys-color-outline-variant)]/60 dark:border-white/10 max-w-full sm:max-w-[320px] my-1 cursor-pointer bg-black/5 dark:bg-black/20"
                              title="Click to open image preview"
                            >
                              <img
                                src={msg.fileUrl}
                                alt={msg.fileName || 'Image'}
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.currentTarget
                                  target.style.display = 'none'
                                  const fallback = target.parentElement?.querySelector('.img-fallback')
                                  if (fallback) fallback.classList.remove('hidden')
                                }}
                                className="w-full max-h-[260px] object-cover rounded-2xl group-hover:scale-[1.02] transition-transform duration-200"
                              />
                              <div className="img-fallback hidden p-4 flex flex-col items-center justify-center gap-2 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
                                <ImageIcon className="w-8 h-8 opacity-60 text-[var(--md-sys-color-primary)]" />
                                <span className="truncate max-w-[200px] font-semibold">{msg.fileName || 'Image Attachment'}</span>
                                <span className="text-[10.5px] font-bold text-[var(--md-sys-color-primary)] underline">Click to view image</span>
                              </div>
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                                <span className="px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                                  <Maximize2 className="w-3.5 h-3.5" />
                                  <span>Preview</span>
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Inbuilt Voice Notes / Audio Player */}
                          {!isGif && isAudio && msg.fileUrl && (
                            <VoiceNotePlayer
                              audioUrl={msg.fileUrl}
                              fileName={msg.fileName || 'Voice Note'}
                              durationSec={msg.metadata?.duration}
                              waveform={msg.metadata?.waveform}
                              isMe={isMe}
                            />
                          )}

                          {/* Regular File Attachment Card */}
                          {msg.messageType === 'file' && !isGif && !isImage && !isAudio && (
                            <div className={`my-1 p-2.5 sm:p-3 rounded-2xl border flex items-center justify-between gap-2 sm:gap-3 shadow-2xs max-w-full min-w-0 overflow-hidden ${
                              isMe
                                ? 'bg-black/20 dark:bg-black/40 border-white/20 text-white'
                                : 'bg-black/5 dark:bg-[#192338] border-[var(--md-sys-color-outline-variant)] dark:border-[#283652] text-[var(--md-sys-color-on-surface)] dark:text-slate-100'
                            }`}>
                              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 overflow-hidden">
                                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                                  isMe ? 'bg-white/20 text-white' : 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)]'
                                }`}>
                                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="min-w-0 flex-1 overflow-hidden">
                                  <span className="font-bold text-xs truncate block max-w-full">{msg.fileName || 'Attachment Document'}</span>
                                  <span className="text-[10px] block opacity-80 uppercase font-medium mt-0.5 truncate">
                                    {msg.fileType ? msg.fileType.split('/')[1] || 'File' : 'File'}
                                  </span>
                                </div>
                              </div>
                              {msg.fileUrl && (
                                <a
                                  href={msg.fileUrl}
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`p-1.5 sm:p-2 rounded-xl transition-all active:scale-95 shadow-2xs shrink-0 cursor-pointer ${
                                    isMe
                                      ? 'bg-white/20 hover:bg-white/30 text-white'
                                      : 'bg-[var(--md-sys-color-surface-container)] dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[var(--md-sys-color-on-surface)] dark:text-white'
                                  }`}
                                  title="Download file"
                                >
                                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </a>
                              )}
                            </div>
                          )}

                          {/* Regular Text & Inline Edit Mode */}
                          {editingMessageId === msg.id ? (
                            <div className="w-full min-w-0 max-w-md py-1">
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
                            msg.messageType !== 'meet_card' &&
                            !isGif &&
                            !isImage &&
                            !isAudio && (
                              <div className="whitespace-pre-wrap break-words [word-break:break-word] overflow-hidden max-w-full">{msg.content}</div>
                            )
                          )}

                          {/* Inline Time & Read Status for Sent text & file messages */}
                          {isMe && msg.messageType !== 'meet_card' && !isGif && (
                            <div className="flex items-center justify-end gap-1.5 mt-1 -mb-0.5 select-none">
                              {(msg.isEdited || msg.metadata?.isEdited) && (
                                <span className="text-[9px] opacity-70 italic font-medium mr-0.5">(edited)</span>
                              )}
                              <span className="text-[9.5px] opacity-75">{formatMessageTime(msg.createdAt)}</span>
                              
                              {/* Prominent Seen vs Delivered Status Indicator */}
                              {msg.status === 'seen' ? (
                                <span
                                  className="inline-flex items-center gap-0.5 text-sky-100 font-bold text-[9px] tracking-tight bg-sky-400/25 px-1.5 py-0.5 rounded-full border border-sky-300/30 shadow-2xs"
                                  title={
                                    msg.readBy && msg.readBy.length > 0
                                      ? `Seen by ${msg.readBy.map((u) => u.fullName).join(', ')}`
                                      : 'Seen'
                                  }
                                >
                                  <CheckCheck className="w-3 h-3 text-sky-200 stroke-[2.5]" />
                                  <span>Seen</span>
                                </span>
                              ) : msg.status === 'delivered' ? (
                                <span
                                  className="inline-flex items-center gap-0.5 text-white/80 font-medium text-[9px] tracking-tight bg-black/10 px-1.5 py-0.5 rounded-full"
                                  title="Delivered to recipient"
                                >
                                  <CheckCheck className="w-3 h-3 text-white/80" />
                                  <span>Delivered</span>
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-0.5 text-white/70 font-medium text-[9px] tracking-tight"
                                  title="Sent to cloud"
                                >
                                  <Check className="w-3 h-3 text-white/70" />
                                  <span>Sent</span>
                                </span>
                              )}
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
                                className="p-1 hover:scale-125 transition-transform cursor-pointer"
                                title={`React ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setReactingMessageId(reactingMessageId === msg.id ? null : msg.id)
                              }}
                              title="React with any emoji"
                              className="p-1 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] hover:scale-120 transition-all cursor-pointer"
                            >
                              <SmilePlus className="w-3.5 h-3.5" />
                            </button>
                            <div className="w-px h-3 bg-[var(--md-sys-color-outline-variant)] dark:bg-slate-700 mx-0.5" />
                            <button
                              onClick={() => {
                                setReplyingTo(msg)
                                mainInputRef.current?.focus()
                              }}
                              title="Quote Reply in Chat"
                              className="p-1 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-colors"
                            >
                              <Reply className="w-3.5 h-3.5" />
                            </button>
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

                          {/* Full Emoji Picker Popover Anchored to Message for Reactions */}
                          {reactingMessageId === msg.id && (
                            <div
                              className={`absolute bottom-full ${
                                isMe ? 'right-0' : 'left-0'
                              } mb-3 z-50 animate-in fade-in zoom-in-95`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <EmojiAndGifPicker
                                onSelectEmoji={(emoji) => {
                                  handleReaction(msg.id, emoji)
                                  setReactingMessageId(null)
                                }}
                                onClose={() => setReactingMessageId(null)}
                                hideGifTab
                                title="React with Any Emoji"
                              />
                            </div>
                          )}
                        </div>

                        {/* Inline Time for Sent GIF cards or Meet cards */}
                        {isMe && (msg.messageType === 'meet_card' || isGif) && (
                          <div className="flex items-center justify-end gap-1.5 mt-1 text-[9.5px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 select-none">
                            <span>{formatMessageTime(msg.createdAt)}</span>
                            {msg.status === 'seen' ? (
                              <span className="inline-flex items-center gap-0.5 text-sky-500 dark:text-sky-400 font-bold text-[9px] bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800/40">
                                <CheckCheck className="w-3 h-3 text-sky-500 dark:text-sky-400 stroke-[2.5]" />
                                <span>Seen</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-slate-400 dark:text-slate-500 font-medium text-[9px]">
                                <CheckCheck className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                <span>Delivered</span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Inline Time & Edited Status for Received text messages */}
                        {!isMe && msg.messageType !== 'meet_card' && (msg.isEdited || msg.metadata?.isEdited) && (
                          <div className="flex items-center gap-1 mt-1 -mb-0.5 text-[9.5px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500 italic select-none">
                            <span>(edited)</span>
                          </div>
                        )}

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

        {/* Bottom Composer (Pinned & Fixed) */}
        <div className="p-2.5 sm:p-3 border-t border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]/70 bg-[var(--md-sys-color-surface)] dark:bg-[#0c111d] shrink-0 sticky bottom-0 z-20 pb-safe">
          <form onSubmit={handleSendMessage} className="relative flex flex-col gap-1.5">
            <div className="relative rounded-2xl bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] border border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] focus-within:border-[var(--md-sys-color-primary)] focus-within:ring-2 focus-within:ring-[var(--md-sys-color-primary)]/20 transition-all p-3 shadow-xs">
              
              {/* In-Chat Quote Reply Preview Bar */}
              {replyingTo && (
                <div className="flex items-center justify-between mb-2.5 px-3 py-2 bg-[var(--md-sys-color-surface-container-high)] dark:bg-[#1c273c] rounded-xl border-l-4 border-[var(--md-sys-color-primary)] text-xs animate-in slide-in-from-bottom-1 select-none">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-[var(--md-sys-color-primary)]">
                      <Reply className="w-3.5 h-3.5 shrink-0" />
                      <span>Replying to {replyingTo.senderName}</span>
                    </div>
                    <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 truncate mt-0.5">
                      {replyingTo.messageType === 'file'
                        ? `📎 ${replyingTo.fileName || 'Attachment'}`
                        : replyingTo.messageType === 'meet_card'
                        ? '📹 Video Meeting'
                        : replyingTo.content}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
                    title="Cancel reply"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Live Voice Note Recording Bar */}
              {isRecordingVoice ? (
                <div className="flex items-center justify-between gap-2 sm:gap-3 p-1 min-h-[48px] animate-in fade-in select-none">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative flex items-center justify-center shrink-0">
                      <span className="w-3 h-3 rounded-full bg-red-500 animate-ping absolute" />
                      <span className="w-3 h-3 rounded-full bg-red-500 relative" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] sm:text-xs font-bold text-red-500 truncate">
                        Recording...
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400">
                        {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Fluctuating Soundwave Bars */}
                  <div className="flex items-center gap-[3px] sm:gap-1 h-6 flex-1 max-w-[120px] sm:max-w-[180px] justify-center px-1 sm:px-2">
                    {recordingWaveformLevels.map((lvl, i) => (
                      <div
                        key={i}
                        className="w-1 rounded-full bg-red-500 transition-all duration-75"
                        style={{ height: `${Math.max(20, lvl * 100)}%` }}
                      />
                    ))}
                  </div>

                  {/* Cancel & Send Actions */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStopVoiceRecording(false)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 active:scale-95 transition-all cursor-pointer"
                      title="Discard recording"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStopVoiceRecording(true)}
                      disabled={recordingDuration < 1}
                      className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-red-600/20 cursor-pointer"
                      title="Send voice note"
                    >
                      <span>Send</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <textarea
                    ref={mainInputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      } else if (e.key === 'Escape' && replyingTo) {
                        e.preventDefault()
                        setReplyingTo(null)
                      }
                    }}
                    placeholder={replyingTo ? `Reply to ${replyingTo.senderName}...` : `Message #${activeConv?.name || 'chat'}...`}
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
                        className="p-1.5 rounded-lg text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)] dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200 transition-colors cursor-pointer"
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
                        className="p-1.5 rounded-lg text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)] dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      >
                        <Smile className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={handleStartVoiceRecording}
                        title="Record Voice Note"
                        className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
                      >
                        <Mic className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartCall('video')}
                        title="Start Live Video Call"
                        className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 transition-colors cursor-pointer"
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
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold text-xs hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all shadow-md shadow-[var(--md-sys-color-primary)]/20 cursor-pointer"
                      >
                        <span>Send</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Full Emoji & Animated GIF Picker Popover */}
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-3 z-50 animate-in fade-in zoom-in-95">
                <EmojiAndGifPicker
                  onSelectEmoji={handleSelectEmoji}
                  onSelectGif={handleSelectGif}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
          </form>
        </div>

        {/* Floating Heart Particle Bursts */}
        {heartBursts.map((b) => (
          <div
            key={b.id}
            className="fixed z-[99999] pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-50 fade-out-0 duration-700 text-3xl select-none"
            style={{ left: b.x, top: b.y }}
          >
            ❤️
          </div>
        ))}
      </main>

      {/* 3. RIGHT COLLAPSIBLE THREAD SIDEBAR / MOBILE THREAD DRAWER */}
      {activeThreadParent && (
        <>
          {/* Mobile Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in"
            onClick={() => setActiveThreadParent(null)}
          />

          <aside className="fixed inset-x-0 bottom-0 top-12 md:top-auto md:bottom-auto md:relative md:inset-auto w-full md:w-80 flex-shrink-0 border-t md:border-t-0 md:border-l border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]/70 bg-[var(--md-sys-color-surface)] dark:bg-[#0c111d] flex flex-col z-50 animate-in slide-in-from-bottom md:slide-in-from-right-10 duration-200 rounded-t-3xl md:rounded-none shadow-2xl">
            {/* Mobile Drag Pill */}
            <div className="w-10 h-1.5 rounded-full bg-black/20 dark:bg-white/20 mx-auto mt-2 mb-1 md:hidden shrink-0" />

            <div className="p-3.5 border-b border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]/70 flex items-center justify-between bg-[var(--md-sys-color-surface-container)] dark:bg-[#0e1424]">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
                <h3 className="text-xs font-bold text-[var(--md-sys-color-on-surface)] dark:text-white">Thread Discussion</h3>
              </div>
              <button
                onClick={() => setActiveThreadParent(null)}
                className="p-1 rounded-lg text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 cursor-pointer"
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
            <div className="p-3 border-t border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]/70 bg-[var(--md-sys-color-surface)] dark:bg-[#0c111d] pb-safe">
              <form onSubmit={handleSendThreadReply} className="flex gap-2">
                <input
                  type="text"
                  value={threadInputText}
                  onChange={(e) => setThreadInputText(e.target.value)}
                  placeholder="Reply in thread..."
                  className="flex-1 px-3 py-2 rounded-xl bg-[var(--md-sys-color-surface-container-high)] dark:bg-[#141b2b] border border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] text-xs text-[var(--md-sys-color-on-surface)] dark:text-slate-100 placeholder-[var(--md-sys-color-on-surface-variant)] dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--md-sys-color-primary)]"
                />
                <button
                  type="submit"
                  disabled={!threadInputText.trim()}
                  className="p-2 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </aside>
        </>
      )}

      {/* 4. NATIVE-GRADE MOBILE MESSAGE ACTION BOTTOM SHEET */}
      {mobileActionMessage && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden animate-in fade-in duration-150"
            onClick={() => setMobileActionMessage(null)}
          />
          <div
            style={{
              transform: actionSheetPullOffset > 0 ? `translateY(${actionSheetPullOffset}px)` : undefined,
              transition: actionSheetPullOffset > 0 ? 'none' : 'transform 0.2s ease-out',
            }}
            className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-[var(--md-sys-color-surface-container-high)]/98 dark:bg-[#0e1626]/98 backdrop-blur-xl border-t border-[var(--md-sys-color-outline-variant)] dark:border-[#22304a] shadow-2xl rounded-t-3xl p-4 animate-in slide-in-from-bottom duration-200 select-none pb-safe"
          >
            {/* Pull-to-Dismiss Drag Handle Area */}
            <div
              onTouchStart={handleActionSheetTouchStart}
              onTouchMove={handleActionSheetTouchMove}
              onTouchEnd={handleActionSheetTouchEnd}
              className="w-full py-1 mb-2.5 flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-1.5 rounded-full bg-black/25 dark:bg-white/25" />
            </div>

            {/* Quick Emoji Reaction Bar */}
            <div className="flex items-center justify-around py-2 px-1 bg-black/5 dark:bg-black/30 rounded-2xl border border-[var(--md-sys-color-outline-variant)]/60 dark:border-white/5 mb-3">
              {['👍', '❤️', '😂', '🔥', '🎉', '👏'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    handleReaction(mobileActionMessage.id, emoji)
                    setMobileActionMessage(null)
                  }}
                  className="p-1.5 text-2xl hover:scale-125 active:scale-95 transition-transform"
                >
                  {emoji}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  const targetId = mobileActionMessage.id
                  setMobileActionMessage(null)
                  setReactingMessageId(targetId)
                }}
                className="p-1.5 text-xs font-bold text-[var(--md-sys-color-primary)] flex items-center justify-center w-9 h-9 rounded-full bg-black/5 dark:bg-white/10"
              >
                <SmilePlus className="w-4 h-4" />
              </button>
            </div>

            {/* Action Items List with 44px+ Touch Ergonomics */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(mobileActionMessage)
                  setMobileActionMessage(null)
                  mainInputRef.current?.focus()
                }}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-[var(--md-sys-color-on-surface)] dark:text-slate-100 hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 transition-colors"
              >
                <Reply className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
                <span>Reply in Chat</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveThreadParent(mobileActionMessage)
                  setMobileActionMessage(null)
                }}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-[var(--md-sys-color-on-surface)] dark:text-slate-100 hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
                <span>Reply in Thread</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleCopyMessage(mobileActionMessage.id, mobileActionMessage.content || '')
                  setMobileActionMessage(null)
                }}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-[var(--md-sys-color-on-surface)] dark:text-slate-100 hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 transition-colors"
              >
                <Copy className="w-4 h-4 text-emerald-500" />
                <span>Copy Message Text</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleOpenForward(mobileActionMessage)
                  setMobileActionMessage(null)
                }}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-[var(--md-sys-color-on-surface)] dark:text-slate-100 hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 transition-colors"
              >
                <Forward className="w-4 h-4 text-sky-500" />
                <span>Forward Message</span>
              </button>

              {mobileActionMessage.senderId === currentUserId && mobileActionMessage.messageType === 'text' && (
                <button
                  type="button"
                  onClick={() => {
                    handleStartEdit(mobileActionMessage)
                    setMobileActionMessage(null)
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-[var(--md-sys-color-on-surface)] dark:text-slate-100 hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 transition-colors"
                >
                  <Pencil className="w-4 h-4 text-amber-500" />
                  <span>Edit Message</span>
                </button>
              )}

              {(mobileActionMessage.senderId === currentUserId || currentUserRole === 'admin' || currentUserRole === 'superadmin') && (
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteMessage(mobileActionMessage.id)
                    setMobileActionMessage(null)
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 active:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Message</span>
                </button>
              )}
            </div>
          </div>
        </>
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

      {/* 5. INBUILT IMAGE PREVIEW LIGHTBOX MODAL */}
      <ImagePreviewModal
        isOpen={Boolean(previewImage)}
        imageUrl={previewImage?.url || ''}
        fileName={previewImage?.fileName}
        fileSize={previewImage?.fileSize}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  )
}
