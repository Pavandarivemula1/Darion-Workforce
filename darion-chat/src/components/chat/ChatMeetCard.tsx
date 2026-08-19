'use client'

import React from 'react'
import Link from 'next/link'
import {
  Video,
  Phone,
  PhoneMissed,
  PhoneOff,
  ArrowUpRight,
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
    status?: 'calling' | 'ringing' | 'connected' | 'missed' | 'declined' | 'cancelled'
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

  const formattedTime = metadata?.startedAt
    ? new Date(metadata.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  // Handle Call Back trigger
  const handleCallBack = (e: React.MouseEvent) => {
    e.stopPropagation()
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

  // 1. MISSED / DECLINED / CANCELLED CALL (RULED ENTERPRISE UI - NO MEETING LINK)
  if (status === 'missed' || status === 'declined' || status === 'cancelled') {
    const isMissed = status === 'missed'
    const isDeclined = status === 'declined'

    return (
      <div className="w-full min-w-0 max-w-full sm:max-w-[320px] rounded-2xl bg-white dark:bg-[#0f172a] border border-rose-200/80 dark:border-rose-900/40 shadow-xs hover:shadow-md p-2.5 sm:p-3 flex items-center justify-between gap-2 sm:gap-2.5 text-slate-800 dark:text-slate-100 select-none transition-all overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 overflow-hidden">
          {/* Subtle Rose/Red Icon Container */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/40 shadow-2xs">
            {callType === 'video' ? (
              <PhoneMissed className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </div>

          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 truncate">
              <span className="px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/40 text-[9px] font-black uppercase tracking-wider shrink-0">
                {isMissed ? 'Missed' : isDeclined ? 'Declined' : 'Cancelled'}
              </span>
              <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-bold uppercase truncate">
                • {callType}
              </span>
            </div>
            <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white truncate">
              {meetTitle}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {isDeclined ? 'Declined' : 'No answer'} {formattedTime && `• ${formattedTime}`}
            </p>
          </div>
        </div>

        {/* 1-Click Call Back Action */}
        <button
          type="button"
          onClick={handleCallBack}
          className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white font-bold text-[11px] sm:text-xs transition-all active:scale-95 shadow-xs shrink-0 cursor-pointer"
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
    )
  }

  // 2. ACTIVE CALLING OR RINGING IN-PROGRESS (RULED ENTERPRISE UI)
  if (status === 'calling' || status === 'ringing') {
    const isCalling = status === 'calling'

    return (
      <div className={`w-full min-w-0 max-w-full sm:max-w-[320px] rounded-2xl bg-white dark:bg-[#0f172a] border ${
        isCalling ? 'border-blue-200/80 dark:border-blue-500/40' : 'border-amber-200/80 dark:border-amber-500/40'
      } shadow-xs hover:shadow-md p-2.5 sm:p-3 flex items-center justify-between gap-2 sm:gap-2.5 text-slate-800 dark:text-slate-100 select-none transition-all overflow-hidden`}>
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 overflow-hidden">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl ${
            isCalling
              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-500 dark:text-blue-400 border-blue-100 dark:border-blue-900/40'
              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-500 dark:text-amber-400 border-amber-100 dark:border-amber-900/40'
          } flex items-center justify-center shrink-0 border shadow-2xs`}>
            <Radio className={`w-4 h-4 sm:w-5 sm:h-5 animate-pulse ${isCalling ? 'text-blue-500' : 'text-amber-500'}`} />
          </div>

          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 truncate">
              <span className={`px-1.5 py-0.5 rounded-md ${
                isCalling
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/40'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/40'
              } text-[9px] font-black uppercase tracking-wider border shrink-0`}>
                {isCalling ? 'Calling...' : 'Ringing...'}
              </span>
              <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-bold uppercase truncate">
                • {callType}
              </span>
            </div>
            <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white truncate">
              {meetTitle}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {isCalling ? `Connecting to ${hostName}...` : `Ringing...`}
            </p>
          </div>
        </div>

        <Link
          href={meetUrl}
          className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] sm:text-xs transition-all active:scale-95 shadow-sm shrink-0"
        >
          <span>Answer</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    )
  }

  // 3. SUCCESSFUL CONNECTED MEETING (RULED ENTERPRISE UI)
  return (
    <div className="w-full min-w-0 max-w-full sm:max-w-[320px] rounded-2xl bg-white dark:bg-[#0f172a] border border-emerald-200/80 dark:border-emerald-500/40 shadow-xs hover:shadow-md p-2.5 sm:p-3 flex items-center justify-between gap-2 sm:gap-2.5 text-slate-800 dark:text-slate-100 select-none transition-all overflow-hidden">
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 overflow-hidden">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40 shadow-2xs">
          {callType === 'video' ? (
            <Video className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 truncate">
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40 text-[9px] font-black uppercase tracking-wider shrink-0">
              Meeting
            </span>
            <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-bold uppercase truncate">
              • {roomCode}
            </span>
          </div>
          <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white truncate">
            {meetTitle}
          </h4>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
            Host: {hostName} {formattedTime && `• ${formattedTime}`}
          </p>
        </div>
      </div>

      <Link
        href={meetUrl}
        target="_blank"
        className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] sm:text-xs transition-all active:scale-95 shadow-sm shrink-0"
      >
        <span>Join</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}
