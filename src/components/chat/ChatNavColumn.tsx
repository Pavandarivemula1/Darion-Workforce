'use client'

import React, { useState } from 'react'
import {
  Plus,
  Home,
  AtSign,
  Star,
  ChevronDown,
  ChevronRight,
  Pin,
  MessageSquare,
  Hash,
  Users,
  ShieldCheck,
} from 'lucide-react'
import { ChatConversationItem } from '@/app/actions/messages'

interface ChatNavColumnProps {
  conversations: ChatConversationItem[]
  activeConvId: string
  activeNavShortcut: 'home' | 'mentions' | 'starred'
  onSelectShortcut: (shortcut: 'home' | 'mentions' | 'starred') => void
  onSelectConversation: (convId: string) => void
  onNewChat: () => void
  onNewChannel: () => void
}

export const ChatNavColumn: React.FC<ChatNavColumnProps> = ({
  conversations,
  activeConvId,
  activeNavShortcut,
  onSelectShortcut,
  onSelectConversation,
  onNewChat,
}) => {
  const [shortcutsOpen, setShortcutsOpen] = useState(true)
  const [dmsOpen, setDmsOpen] = useState(true)
  const [spacesOpen, setSpacesOpen] = useState(true)
  const [showAllDms, setShowAllDms] = useState(false)

  const directMessages = conversations.filter((c) => c.type === 'direct')
  const spaces = conversations.filter((c) => c.type === 'channel')

  const totalSpacesUnread = spaces.reduce((acc, s) => acc + (s.unreadCount || 0), 0)

  const displayedDms = showAllDms ? directMessages : directMessages.slice(0, 7)

  return (
    <aside className="w-60 lg:w-64 h-full shrink-0 bg-[var(--md-sys-color-surface-container-low)] border-r border-[var(--md-sys-color-outline-variant)] flex flex-col select-none overflow-y-auto">
      {/* 1. TOP '+ New chat' PILL BUTTON */}
      <div className="p-3">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[var(--md-sys-color-surface-container-highest)] hover:bg-[var(--md-sys-color-primary-container)] border border-[var(--md-sys-color-outline-variant)] shadow-sm hover:shadow-md text-xs sm:text-sm font-semibold text-[var(--md-sys-color-on-surface)] transition-all cursor-pointer group"
        >
          <Plus className="w-4 h-4 text-[var(--md-sys-color-primary)] group-hover:scale-110 transition-transform" />
          <span>New chat</span>
        </button>
      </div>

      <div className="flex-1 px-2 space-y-4 pb-6">
        {/* 2. SHORTCUTS SECTION */}
        <div>
          <button
            type="button"
            onClick={() => setShortcutsOpen(!shortcutsOpen)}
            className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
          >
            <span>Shortcuts</span>
            {shortcutsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {shortcutsOpen && (
            <div className="space-y-0.5 mt-1">
              {/* Home */}
              <button
                type="button"
                onClick={() => onSelectShortcut('home')}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeNavShortcut === 'home'
                    ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shadow-2xs font-bold'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                <Home className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
                <span>Home</span>
              </button>

              {/* Mentions */}
              <button
                type="button"
                onClick={() => onSelectShortcut('mentions')}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeNavShortcut === 'mentions'
                    ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shadow-2xs font-bold'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                <AtSign className="w-4 h-4" />
                <span>Mentions</span>
              </button>

              {/* Starred */}
              <button
                type="button"
                onClick={() => onSelectShortcut('starred')}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeNavShortcut === 'starred'
                    ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shadow-2xs font-bold'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                <Star className="w-4 h-4 text-amber-500" />
                <span>Starred</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. DIRECT MESSAGES SECTION */}
        <div>
          <button
            type="button"
            onClick={() => setDmsOpen(!dmsOpen)}
            className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
          >
            <span>Direct messages</span>
            {dmsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {dmsOpen && (
            <div className="space-y-0.5 mt-1">
              {displayedDms.map((dm) => {
                const isSelected = activeConvId === dm.id
                return (
                  <button
                    key={dm.id}
                    type="button"
                    onClick={() => onSelectConversation(dm.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] font-bold shadow-2xs'
                        : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        {dm.avatarUrl ? (
                          <img
                            src={dm.avatarUrl}
                            alt={dm.name}
                            className="w-5 h-5 rounded-full object-cover border border-[var(--md-sys-color-outline-variant)]"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center font-bold text-[9px]">
                            {dm.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {dm.status === 'online' && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-[var(--md-sys-color-surface-container-low)]" />
                        )}
                      </div>
                      <span className="truncate">{dm.name}</span>
                    </div>

                    {dm.unreadCount && dm.unreadCount > 0 ? (
                      <span className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)] shrink-0" />
                    ) : null}
                  </button>
                )
              })}

              {directMessages.length > 7 && (
                <button
                  type="button"
                  onClick={() => setShowAllDms(!showAllDms)}
                  className="w-full text-left px-2.5 py-1 text-[11px] font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] cursor-pointer"
                >
                  {showAllDms ? 'Show less' : `Show all (${directMessages.length})`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* 4. SPACES (CHANNELS) SECTION */}
        <div>
          <button
            type="button"
            onClick={() => setSpacesOpen(!spacesOpen)}
            className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span>Spaces</span>
              {totalSpacesUnread > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-[9px] font-bold">
                  {totalSpacesUnread}
                </span>
              )}
            </div>
            {spacesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {spacesOpen && (
            <div className="space-y-0.5 mt-1">
              {spaces.map((space) => {
                const isSelected = activeConvId === space.id
                return (
                  <button
                    key={space.id}
                    type="button"
                    onClick={() => onSelectConversation(space.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] font-bold shadow-2xs'
                        : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Rounded Square Space Icon */}
                      <div className="w-5 h-5 rounded-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] border border-[var(--md-sys-color-outline-variant)] flex items-center justify-center font-bold text-[10px] shrink-0">
                        <Hash className="w-3 h-3" />
                      </div>
                      <span className="truncate">{space.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {space.isPinned && (
                        <Pin className="w-3 h-3 text-[var(--md-sys-color-on-surface-variant)]" />
                      )}
                      {space.unreadCount && space.unreadCount > 0 ? (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      ) : null}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
