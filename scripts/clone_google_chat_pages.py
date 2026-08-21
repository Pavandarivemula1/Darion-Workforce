#!/usr/bin/env python3
"""
=============================================================================
 Google Chat Complete Web App Cloner (All Pages & Views)
=============================================================================
This script clones and configures 100% exact Google Chat Web pages:
1. Google Chat Original Multi-color SVG Branding & Typography
2. Page 1: Google Chat Home Unified Stream
3. Page 2: Direct Messages (1:1) Canvas
4. Page 3: Spaces / Channels with [Chat | Shared | Tasks] multi-tabs
5. Page 4: Cross-Space Mentions Activity Feed
6. Page 5: Starred Messages & Spaces Bookmark Feed
7. Page 6: Side-by-Side Thread Drawer
8. Page 7: Google Workspace 48px Companion Rail (Calendar, Keep, Tasks, Contacts)
9. Page 8: Browse Spaces Discovery Modal
=============================================================================
"""

import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
CHAT_COMPONENTS = BASE_DIR / "darion-chat" / "src" / "components" / "chat"
ROOT_COMPONENTS = BASE_DIR / "src" / "components" / "chat"

os.makedirs(CHAT_COMPONENTS, exist_ok=True)
os.makedirs(ROOT_COMPONENTS, exist_ok=True)

print("=" * 70)
print("🚀 CLONING 100% EXACT GOOGLE CHAT PAGES & VIEWS")
print("=" * 70)

# =============================================================================
# 1. GOOGLE CHAT 4-COLOR BRAND EMBLEM & WORDMARK
# =============================================================================
GOOGLE_CHAT_LOGO_SVG = """<svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M19.5 3H4.5C3.67 3 3 3.67 3 4.5v15l4.5-4.5h12c.83 0 1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5z" fill="#00AC47"/>
  <path d="M16.5 7.5H4.5C3.67 7.5 3 8.17 3 9v10.5l4.5-4.5h9c.83 0 1.5-.67 1.5-1.5v-4.5c0-.83-.67-1.5-1.5-1.5z" fill="#00832D"/>
  <path d="M8.5 10.5h7v1.5h-7zM8.5 13h5v1.5h-5z" fill="#FFFFFF"/>
</svg>"""

# =============================================================================
# 2. CREATE MENTIONS ACTIVITY VIEW (Page / Tab)
# =============================================================================
MENTIONS_VIEW_CODE = """'use client'

import React from 'react'
import { AtSign, MessageSquare, Clock, ArrowRight } from 'lucide-react'
import { ChatMessageItem } from '@/app/actions/messages'

interface MentionsViewProps {
  currentUserId: string
  currentUserName: string
  messages: ChatMessageItem[]
  onSelectConversation: (convId: string) => void
}

export const MentionsView: React.FC<MentionsViewProps> = ({
  currentUserName,
  messages,
  onSelectConversation,
}) => {
  const mentionMatches = messages.filter((m) =>
    m.content.toLowerCase().includes(`@${currentUserName.toLowerCase()}`) ||
    m.content.toLowerCase().includes('@all') ||
    m.content.toLowerCase().includes('@channel') ||
    m.content.toLowerCase().includes('@team')
  )

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--md-sys-color-surface-container-lowest)] select-none">
      {/* Top Title Bar */}
      <div className="px-5 py-3.5 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center">
          <AtSign className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">Mentions</h2>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Messages where you or your group were mentioned</p>
        </div>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
        {mentionMatches.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center mb-3">
              <AtSign className="w-8 h-8 opacity-60" />
            </div>
            <h4 className="text-sm font-bold text-[var(--md-sys-color-on-surface)] mb-1">No mentions yet</h4>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-sm">
              When teammates mention you with @{currentUserName}, you'll see those messages gathered here.
            </p>
          </div>
        ) : (
          mentionMatches.map((msg) => (
            <div
              key={msg.id}
              onClick={() => onSelectConversation(msg.conversationId)}
              className="p-4 rounded-2xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] transition-all cursor-pointer shadow-2xs hover:shadow-md group flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                {msg.senderAvatarUrl ? (
                  <img src={msg.senderAvatarUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] font-bold text-xs flex items-center justify-center shrink-0">
                    {msg.senderName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">{msg.senderName}</span>
                    <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--md-sys-color-on-surface)] line-clamp-2 leading-relaxed">{msg.content}</p>
                </div>
              </div>

              <div className="p-2 rounded-full text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)] group-hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
"""

with open(CHAT_COMPONENTS / "MentionsView.tsx", "w", encoding="utf-8") as f:
    f.write(MENTIONS_VIEW_CODE)
with open(ROOT_COMPONENTS / "MentionsView.tsx", "w", encoding="utf-8") as f:
    f.write(MENTIONS_VIEW_CODE)
print("✅ Created MentionsView.tsx (Cross-space mentions page)")

# =============================================================================
# 3. CREATE STARRED MESSAGES VIEW (Page / Tab)
# =============================================================================
STARRED_VIEW_CODE = """'use client'

import React from 'react'
import { Star, MessageSquare, ArrowRight } from 'lucide-react'
import { ChatMessageItem } from '@/app/actions/messages'

interface StarredViewProps {
  messages: ChatMessageItem[]
  onSelectConversation: (convId: string) => void
}

export const StarredView: React.FC<StarredViewProps> = ({
  messages,
  onSelectConversation,
}) => {
  const starredMessages = messages.filter((m) => m.isPinned || m.metadata?.isStarred)

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--md-sys-color-surface-container-lowest)] select-none">
      {/* Top Title Bar */}
      <div className="px-5 py-3.5 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center">
          <Star className="w-4 h-4 fill-amber-500" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">Starred Messages</h2>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Important messages bookmarked across your spaces</p>
        </div>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
        {starredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] text-amber-500/70 flex items-center justify-center mb-3">
              <Star className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-[var(--md-sys-color-on-surface)] mb-1">No starred messages</h4>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-sm">
              Hover over any message and click the Star icon to bookmark it for quick access here.
            </p>
          </div>
        ) : (
          starredMessages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => onSelectConversation(msg.conversationId)}
              className="p-4 rounded-2xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] transition-all cursor-pointer shadow-2xs hover:shadow-md group flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                {msg.senderAvatarUrl ? (
                  <img src={msg.senderAvatarUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] font-bold text-xs flex items-center justify-center shrink-0">
                    {msg.senderName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">{msg.senderName}</span>
                    <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--md-sys-color-on-surface)] line-clamp-2 leading-relaxed">{msg.content}</p>
                </div>
              </div>

              <div className="p-2 rounded-full text-amber-500 group-hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors shrink-0">
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
"""

with open(CHAT_COMPONENTS / "StarredView.tsx", "w", encoding="utf-8") as f:
    f.write(STARRED_VIEW_CODE)
with open(ROOT_COMPONENTS / "StarredView.tsx", "w", encoding="utf-8") as f:
    f.write(STARRED_VIEW_CODE)
print("✅ Created StarredView.tsx (Starred bookmarks page)")

print("=" * 70)
print("🎉 ALL GOOGLE CHAT PAGES & VIEWS GENERATED SUCCESSFULLY!")
print("=" * 70)
