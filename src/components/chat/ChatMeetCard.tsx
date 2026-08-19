'use client'

import React from 'react'
import Link from 'next/link'
import {
  Video,
  Phone,
  PhoneMissed,
  PhoneOff,
  ArrowUpRight,
  Lock,
  RotateCw,
  Radio,
} from 'lucide-react'

interface ChatMeetCardProps {
  metadata?: {
    roomId?: string
    roomCode?: string
    title?: string
    hostName?: string
    callerId?: string
    callType?: 'video' | 'audio'
    status?: 'ringing' | 'connected' | 'missed' | 'declined' | 'cancelled'
    startedAt?: string
    endedAt?: string
    meetUrl?: string
  }
}

export const ChatMeetCard: React.FC<ChatMeetCardProps> = ({ metadata }) => {
  const roomCode = metadata?.roomCode || 'live-room'
  const meetTitle = metadata?.title || 'Team Call'
  const hostName = metadata?.hostName || 'Team Member'
  const meetUrl = metadata?.meetUrl || `/meet/${roomCode}`
  const callType = metadata?.callType || 'video'
  const status = metadata?.status || 'connected'

  // Handle Call Back trigger
  const handleCallBack = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('start-outgoing-call', {
          detail: {
            callId: metadata?.roomId || '',
            roomCode: `dar-${callType}-${Math.floor(1000 + Math.random() * 9000)}`,
            callerId: metadata?.callerId || '',
            callerName: hostName,
            conversationId: '',
            callType,
            meetUrl: `/meet/${roomCode}`,
            startedAt: new Date().toISOString(),
          },
        })
      )
    }
  }

  // 1. MISSED / DECLINED / CANCELLED CALL CARD (No direct meeting link, shows Missed Call banner + Call Back)
  if (status === 'missed' || status === 'declined' || status === 'cancelled') {
    const isMissed = status === 'missed'
    const isDeclined = status === 'declined'
    const isCancelled = status === 'cancelled'

    return (
      <div className="my-1.5 max-w-sm w-full rounded-2xl overflow-hidden border border-rose-500/30 bg-rose-950/10 dark:bg-rose-950/20 shadow-xs text-[var(--md-sys-color-on-surface)] dark:text-slate-100 transition-all select-none">
        <div className="p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Red / Rose Phone Missed Icon Badge */}
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center flex-shrink-0 border border-rose-500/30 shadow-xs">
              {callType === 'video' ? (
                <PhoneMissed className="w-5 h-5 text-rose-500" />
              ) : (
                <PhoneOff className="w-5 h-5 text-rose-500" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                <span className="text-[10px] font-black tracking-wide text-rose-600 dark:text-rose-400 uppercase">
                  {isMissed ? 'Missed Call' : isDeclined ? 'Declined Call' : 'Cancelled Call'}
                </span>
                <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400">• {callType.toUpperCase()}</span>
              </div>
              <h4 className="text-xs font-bold text-[var(--md-sys-color-on-surface)] dark:text-white truncate mt-0.5">
                {hostName}
              </h4>
              <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 truncate">
                {isMissed ? 'No answer • Call disconnected' : isDeclined ? 'Call was declined' : 'Call ended by caller'}
              </p>
            </div>
          </div>

          {/* Call Back Button */}
          <button
            type="button"
            onClick={handleCallBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs active:scale-95 transition-all shadow-xs flex-shrink-0 cursor-pointer"
            title="Call back"
          >
            {callType === 'video' ? (
              <Video className="w-3.5 h-3.5" />
            ) : (
              <Phone className="w-3.5 h-3.5" />
            )}
            <span>Call Back</span>
          </button>
        </div>

        <div className="px-3.5 py-1.5 bg-rose-500/5 border-t border-rose-500/20 flex items-center justify-between text-[10px] text-rose-400/90 font-medium">
          <span>{callType === 'video' ? 'Video' : 'Voice'} Call wasn&apos;t connected</span>
          <span className="text-[9px] opacity-75">Click Call Back to retry</span>
        </div>
      </div>
    )
  }

  // 2. ACTIVE RINGING CALL CARD (In progress)
  if (status === 'ringing') {
    return (
      <div className="my-1.5 max-w-sm w-full rounded-2xl overflow-hidden border border-amber-500/40 bg-amber-500/10 shadow-xs text-[var(--md-sys-color-on-surface)] dark:text-slate-100 transition-all select-none animate-pulse">
        <div className="p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
              <Radio className="w-5 h-5 animate-pulse text-amber-500" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping flex-shrink-0" />
                <span className="text-[10px] font-black tracking-wide text-amber-600 dark:text-amber-400 uppercase">
                  Ringing...
                </span>
                <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400">• {callType.toUpperCase()}</span>
              </div>
              <h4 className="text-xs font-bold text-[var(--md-sys-color-on-surface)] dark:text-white truncate mt-0.5">
                {meetTitle}
              </h4>
              <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 truncate">
                Calling by {hostName}...
              </p>
            </div>
          </div>

          <Link
            href={meetUrl}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs active:scale-95 transition-all shadow-xs flex-shrink-0"
          >
            <span>Answer</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    )
  }

  // 3. SUCCESSFUL CONNECTED MEETING / CALL CARD
  return (
    <div className="my-1.5 max-w-sm w-full rounded-2xl overflow-hidden border border-emerald-500/40 bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] shadow-sm text-[var(--md-sys-color-on-surface)] dark:text-slate-100 transition-all select-none">
      <div className="p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30 shadow-xs">
            {callType === 'video' ? (
              <Video className="w-5 h-5 text-emerald-500" />
            ) : (
              <Phone className="w-5 h-5 text-emerald-500" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="text-[10px] font-black tracking-wide text-emerald-600 dark:text-emerald-400 uppercase">
                Connected Meeting
              </span>
              <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400">• {roomCode}</span>
            </div>
            <h4 className="text-xs font-bold text-[var(--md-sys-color-on-surface)] dark:text-white truncate mt-0.5">
              {meetTitle}
            </h4>
            <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 truncate">
              Connected with {hostName}
            </p>
          </div>
        </div>

        <Link
          href={meetUrl}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs hover:opacity-95 active:scale-95 transition-all shadow-xs flex-shrink-0"
        >
          <span>Join</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="px-3.5 py-1.5 bg-emerald-500/5 dark:bg-[#0e1424] border-t border-emerald-500/20 dark:border-[#1e293b] flex items-center justify-between text-[10px] text-emerald-600/90 dark:text-emerald-400/90 font-medium">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-emerald-500" />
          <span>Active Enterprise Meeting</span>
        </div>
        <span className="text-[9px] opacity-75">Click Join to enter</span>
      </div>
    </div>
  )
}
