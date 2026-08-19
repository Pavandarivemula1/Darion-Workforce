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
      <div className="w-[310px] sm:w-[330px] rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm p-3.5 flex items-center justify-between gap-3 text-slate-800 dark:text-slate-100 select-none">
        <div className="flex items-center gap-3 min-w-0">
          {/* Subtle Rose/Red Icon Container */}
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 flex items-center justify-center flex-shrink-0 border border-rose-100 dark:border-rose-900/30">
            {callType === 'video' ? (
              <PhoneMissed className="w-5 h-5" />
            ) : (
              <PhoneOff className="w-5 h-5" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
              <span className="text-[10px] font-bold tracking-wider text-rose-600 dark:text-rose-400 uppercase">
                {isMissed ? 'Missed Call' : isDeclined ? 'Declined Call' : 'Cancelled'}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                • {callType.toUpperCase()}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {meetTitle}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {isDeclined ? 'Call was declined' : 'No answer'} {formattedTime && `• ${formattedTime}`}
            </p>
          </div>
        </div>

        {/* 1-Click Call Back Action */}
        <button
          type="button"
          onClick={handleCallBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white font-semibold text-xs transition-all active:scale-95 shadow-xs flex-shrink-0 cursor-pointer"
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

  // 2. ACTIVE RINGING IN-PROGRESS (RULED ENTERPRISE UI)
  if (status === 'ringing') {
    return (
      <div className="w-[310px] sm:w-[330px] rounded-2xl bg-white dark:bg-[#111827] border border-amber-200 dark:border-amber-500/30 shadow-sm p-3.5 flex items-center justify-between gap-3 text-slate-800 dark:text-slate-100 select-none">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-100 dark:border-amber-900/30">
            <Radio className="w-5 h-5 animate-pulse text-amber-500" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping flex-shrink-0" />
              <span className="text-[10px] font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase">
                Ringing...
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                • {callType.toUpperCase()}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {meetTitle}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              Calling {hostName}...
            </p>
          </div>
        </div>

        <Link
          href={meetUrl}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all active:scale-95 shadow-xs flex-shrink-0"
        >
          <span>Answer</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    )
  }

  // 3. SUCCESSFUL CONNECTED MEETING (RULED ENTERPRISE UI)
  return (
    <div className="w-[310px] sm:w-[330px] rounded-2xl bg-white dark:bg-[#111827] border border-emerald-200 dark:border-emerald-500/30 shadow-sm p-3.5 flex items-center justify-between gap-3 text-slate-800 dark:text-slate-100 select-none">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-100 dark:border-emerald-900/30">
          {callType === 'video' ? (
            <Video className="w-5 h-5" />
          ) : (
            <Phone className="w-5 h-5" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
              Connected Meeting
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              • {roomCode}
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {meetTitle}
          </h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            Connected with {hostName} {formattedTime && `• ${formattedTime}`}
          </p>
        </div>
      </div>

      <Link
        href={meetUrl}
        target="_blank"
        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all active:scale-95 shadow-xs flex-shrink-0"
      >
        <span>Join</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}
