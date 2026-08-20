'use client'

import React, { useState } from 'react'
import {
  MessageSquare,
  Hash,
  Pin,
  Clock,
  Sparkles,
  SlidersHorizontal,
  SplitSquareVertical,
  Layers,
} from 'lucide-react'
import { ChatConversationItem } from '@/app/actions/messages'

interface HomeFeedPaneProps {
  conversations: ChatConversationItem[]
  activeConvId: string
  searchQuery: string
  onSelectConversation: (convId: string) => void
  onToggleDensity?: () => void
}

export const HomeFeedPane: React.FC<HomeFeedPaneProps> = ({
  conversations,
  activeConvId,
  searchQuery,
  onSelectConversation,
}) => {
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [threadFilter, setThreadFilter] = useState(false)

  // Filter conversations based on search, unread, and thread
  const filteredConversations = conversations.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchesName = c.name.toLowerCase().includes(q)
      const matchesSnippet = c.lastMessageSnippet?.toLowerCase().includes(q)
      if (!matchesName && !matchesSnippet) return false
    }
    if (onlyUnread && (!c.unreadCount || c.unreadCount === 0)) {
      return false
    }
    return true
  })

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes} min`
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    }
    const daysDiff = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (daysDiff < 7) {
      return d.toLocaleDateString([], { weekday: 'short' })
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="w-80 lg:w-96 h-full shrink-0 bg-[var(--md-sys-color-surface-container-lowest)] border-r border-[var(--md-sys-color-outline-variant)] flex flex-col select-none overflow-hidden">
      {/* 1. HOME HEADER BAR */}
      <div className="px-4 py-3 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between gap-2 shrink-0">
        <h2 className="text-lg font-bold text-[var(--md-sys-color-on-surface)] tracking-tight">
          Home
        </h2>

        {/* Action Controls: Unread Toggle & Thread Pill */}
        <div className="flex items-center gap-2">
          {/* Unread Toggle Switch */}
          <div className="flex items-center gap-1.5 bg-[var(--md-sys-color-surface-container-high)] px-2.5 py-1 rounded-full border border-[var(--md-sys-color-outline-variant)]">
            <span className="text-[11px] font-medium text-[var(--md-sys-color-on-surface)]">
              Unread
            </span>
            <button
              type="button"
              onClick={() => setOnlyUnread(!onlyUnread)}
              className={`w-7 h-4 rounded-full transition-colors relative cursor-pointer ${
                onlyUnread ? 'bg-[var(--md-sys-color-primary)]' : 'bg-[var(--md-sys-color-outline-variant)]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                  onlyUnread ? 'left-3.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Thread Filter Pill */}
          <button
            type="button"
            onClick={() => setThreadFilter(!threadFilter)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
              threadFilter
                ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)] font-bold'
                : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
            }`}
          >
            <Layers className="w-3 h-3 text-[var(--md-sys-color-primary)]" />
            <span>Thread</span>
          </button>

          {/* View Mode Icon */}
          <button
            type="button"
            className="p-1 rounded-lg text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
            title="Split pane view"
          >
            <SplitSquareVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. RECENT CONVERSATIONS STREAM */}
      <div className="flex-1 overflow-y-auto divide-y divide-[var(--md-sys-color-outline-variant)]/30">
        {filteredConversations.length === 0 ? (
          <div className="py-16 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] px-4">
            {onlyUnread
              ? 'No unread messages'
              : searchQuery
              ? `No chats found matching "${searchQuery}"`
              : 'No conversations yet'}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = activeConvId === conv.id
            const isUnread = conv.unreadCount && conv.unreadCount > 0

            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-[var(--md-sys-color-surface-container-high)] border-l-4 border-l-[var(--md-sys-color-primary)]'
                    : 'hover:bg-[var(--md-sys-color-surface-container)] bg-transparent'
                }`}
              >
                {/* Left Avatar / Space Icon */}
                <div className="relative shrink-0 mt-0.5">
                  {conv.type === 'channel' ? (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/10 text-amber-600 border border-[var(--md-sys-color-outline-variant)] flex items-center justify-center font-bold text-sm shadow-2xs">
                      {conv.name.includes('News') ? (
                        '📢'
                      ) : conv.name.includes('Payroll') ? (
                        '💰'
                      ) : conv.name.includes('Drive') ? (
                        '📁'
                      ) : (
                        <Hash className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
                      )}
                    </div>
                  ) : conv.avatarUrl ? (
                    <img
                      src={conv.avatarUrl}
                      alt={conv.name}
                      className="w-10 h-10 rounded-full object-cover border border-[var(--md-sys-color-outline-variant)] shadow-2xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-outline-variant)] flex items-center justify-center font-bold text-sm shadow-2xs">
                      {conv.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {conv.type === 'direct' && conv.status === 'online' && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--md-sys-color-surface-container-lowest)]" />
                  )}
                </div>

                {/* Center Content: Title & Snippet */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span
                      className={`text-xs sm:text-[13px] truncate ${
                        isUnread ? 'font-bold text-[var(--md-sys-color-on-surface)]' : 'font-semibold text-[var(--md-sys-color-on-surface)]'
                      }`}
                    >
                      {conv.name}
                    </span>

                    {/* Timestamp & Unread Dot */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-medium">
                        {formatTimestamp(conv.lastMessageAt)}
                      </span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-xs" />
                      )}
                    </div>
                  </div>

                  {/* Message Snippet with 'You:' or sender label */}
                  <p
                    className={`text-xs truncate ${
                      isUnread
                        ? 'font-semibold text-[var(--md-sys-color-on-surface)]'
                        : 'text-[var(--md-sys-color-on-surface-variant)]'
                    }`}
                  >
                    {conv.lastMessageSnippet || 'No messages yet'}
                  </p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
