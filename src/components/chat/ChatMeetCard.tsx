'use client'

import React from 'react'
import Link from 'next/link'
import { Video, ArrowUpRight, Lock } from 'lucide-react'

interface ChatMeetCardProps {
  metadata?: {
    roomId?: string
    roomCode?: string
    title?: string
    hostName?: string
    startedAt?: string
    meetUrl?: string
  }
}

export const ChatMeetCard: React.FC<ChatMeetCardProps> = ({ metadata }) => {
  const roomCode = metadata?.roomCode || 'live-room'
  const meetTitle = metadata?.title || 'Team Video Meeting'
  const hostName = metadata?.hostName || 'Team Host'
  const meetUrl = metadata?.meetUrl || `/meet/${roomCode}`

  return (
    <div className="my-1.5 max-w-sm w-full rounded-xl overflow-hidden border border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] shadow-xs text-[var(--md-sys-color-on-surface)] dark:text-slate-100 transition-all">
      <div className="p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center flex-shrink-0 border border-[var(--md-sys-color-outline-variant)]/60">
            <Video className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="text-[10px] font-semibold tracking-wide text-emerald-600 dark:text-emerald-400 uppercase">
                Active Call
              </span>
              <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400">• {roomCode}</span>
            </div>
            <h4 className="text-xs font-bold text-[var(--md-sys-color-on-surface)] dark:text-white truncate mt-0.5">
              {meetTitle}
            </h4>
            <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 truncate">
              Hosted by {hostName}
            </p>
          </div>
        </div>

        <Link
          href={meetUrl}
          target="_blank"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-semibold text-xs hover:opacity-90 active:scale-95 transition-all shadow-xs flex-shrink-0"
        >
          <span>Join</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="px-3.5 py-1.5 bg-[var(--md-sys-color-surface-container-high)]/60 dark:bg-[#0e1424] border-t border-[var(--md-sys-color-outline-variant)]/60 dark:border-[#1e293b] flex items-center gap-1.5 text-[10px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400">
        <Lock className="w-3 h-3 text-[var(--md-sys-color-on-surface-variant)]" />
        <span>End-to-end encrypted video meeting</span>
      </div>
    </div>
  )
}
