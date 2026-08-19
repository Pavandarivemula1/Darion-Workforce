'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { soundEffects } from '@/lib/utils/soundEffects'
import { CallSessionPayload, respondToCallAction } from '@/app/actions/calls'
import {
  Phone,
  PhoneOff,
  Video,
  Mic,
  Volume2,
  X,
  User,
  Sparkles,
  Radio,
} from 'lucide-react'

interface GlobalCallManagerProps {
  currentUserId?: string
}

export const GlobalCallManager: React.FC<GlobalCallManagerProps> = ({ currentUserId }) => {
  const router = useRouter()
  const [resolvedUserId, setResolvedUserId] = useState<string | undefined>(currentUserId)

  // Incoming Call State
  const [incomingCall, setIncomingCall] = useState<CallSessionPayload | null>(null)
  // Outgoing Call State
  const [outgoingCall, setOutgoingCall] = useState<CallSessionPayload | null>(null)
  const [outgoingTimer, setOutgoingTimer] = useState(0)

  const incomingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const outgoingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const outgoingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Resolve user id
  useEffect(() => {
    if (currentUserId) {
      setResolvedUserId(currentUserId)
      return
    }
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id) setResolvedUserId(data.user.id)
    })
  }, [currentUserId])

  // Listen for outgoing call triggers dispatched locally
  useEffect(() => {
    const handleStartOutgoing = (e: CustomEvent<CallSessionPayload>) => {
      const payload = e.detail
      setOutgoingCall(payload)
      setOutgoingTimer(0)
      soundEffects.startRingingOutgoing()

      // Start timer
      outgoingIntervalRef.current = setInterval(() => {
        setOutgoingTimer((prev) => prev + 1)
      }, 1000)

      // Auto cancel after 40s if no answer
      outgoingTimeoutRef.current = setTimeout(() => {
        handleCancelOutgoing('No answer. Call ended.')
      }, 40000)
    }

    window.addEventListener('start-outgoing-call' as any, handleStartOutgoing)
    return () => {
      window.removeEventListener('start-outgoing-call' as any, handleStartOutgoing)
    }
  }, [])

  // Listen for real-time incoming call signals via Supabase notifications table
  useEffect(() => {
    if (!resolvedUserId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`call-signaling-${resolvedUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${resolvedUserId}`,
        },
        (payload) => {
          const item = payload.new as any
          if (item.type === 'meet_started') {
            // Parse roomCode from link
            const meetUrl = item.link || ''
            const roomCode = meetUrl.replace('/meet/', '') || 'dar-video'

            const incoming: CallSessionPayload = {
              callId: item.id,
              roomCode,
              callerId: '',
              callerName: item.title?.replace('📞 Incoming VIDEO Call: ', '').replace('📞 Incoming AUDIO Call: ', '') || 'Team Member',
              conversationId: '',
              callType: item.title?.includes('AUDIO') ? 'audio' : 'video',
              meetUrl: item.link || `/meet/${roomCode}`,
              startedAt: new Date().toISOString(),
            }

            // Trigger incoming call ringing screen
            setIncomingCall(incoming)
            soundEffects.startRingingIncoming()

            // 35s auto-missed timeout
            if (incomingTimeoutRef.current) clearTimeout(incomingTimeoutRef.current)
            incomingTimeoutRef.current = setTimeout(() => {
              handleDeclineIncoming('missed')
            }, 35000)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [resolvedUserId])

  // Handle Accept Incoming Call
  const handleAcceptIncoming = async () => {
    if (!incomingCall) return
    soundEffects.stopRinging()
    if (incomingTimeoutRef.current) clearTimeout(incomingTimeoutRef.current)

    const meetUrl = incomingCall.meetUrl
    setIncomingCall(null)

    await respondToCallAction({
      roomCode: incomingCall.roomCode,
      callerId: incomingCall.callerId,
      response: 'accept',
    })

    router.push(meetUrl)
  }

  // Handle Decline Incoming Call
  const handleDeclineIncoming = async (reason: 'decline' | 'missed' = 'decline') => {
    if (!incomingCall) return
    soundEffects.playCallEndedSound()
    if (incomingTimeoutRef.current) clearTimeout(incomingTimeoutRef.current)

    const cur = incomingCall
    setIncomingCall(null)

    await respondToCallAction({
      roomCode: cur.roomCode,
      callerId: cur.callerId,
      response: reason,
    })
  }

  // Handle Cancel Outgoing Call
  const handleCancelOutgoing = (msg?: string) => {
    soundEffects.playCallEndedSound()
    if (outgoingTimeoutRef.current) clearTimeout(outgoingTimeoutRef.current)
    if (outgoingIntervalRef.current) clearInterval(outgoingIntervalRef.current)
    setOutgoingCall(null)
    setOutgoingTimer(0)
  }

  // Join Meet from Outgoing Call directly
  const handleJoinOutgoingRoom = () => {
    if (!outgoingCall) return
    soundEffects.stopRinging()
    if (outgoingTimeoutRef.current) clearTimeout(outgoingTimeoutRef.current)
    if (outgoingIntervalRef.current) clearInterval(outgoingIntervalRef.current)

    const url = outgoingCall.meetUrl
    setOutgoingCall(null)
    router.push(url)
  }

  return (
    <>
      {/* 1. HIGH-PRIORITY INCOMING CALL MODAL OVERLAY */}
      {incomingCall && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] border border-[var(--md-sys-color-outline-variant)] dark:border-[#2a3854] rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden">
            {/* Ambient Animated Ripple Halo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-64 h-64 rounded-full bg-emerald-500 animate-ping duration-1000" />
            </div>

            {/* Top Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              <span>Incoming {incomingCall.callType.toUpperCase()} Call</span>
            </div>

            {/* Caller Avatar with Pulsing Radar Rings */}
            <div className="relative mb-5">
              <div className="absolute -inset-3 rounded-full bg-emerald-500/25 animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-4 border-[var(--md-sys-color-surface)] dark:border-[#141b2b] flex items-center justify-center text-white text-3xl font-bold shadow-xl overflow-hidden">
                {incomingCall.callerAvatar ? (
                  <img src={incomingCall.callerAvatar} alt={incomingCall.callerName} className="w-full h-full object-cover" />
                ) : (
                  <span>{incomingCall.callerName.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>

            {/* Caller Info */}
            <h3 className="text-xl font-bold text-[var(--md-sys-color-on-surface)] dark:text-white mb-1">
              {incomingCall.callerName}
            </h3>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 mb-8">
              Ringing... Click accept to join the live video session.
            </p>

            {/* Action Buttons: Accept & Decline */}
            <div className="w-full flex items-center justify-center gap-8">
              {/* Decline Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleDeclineIncoming('decline')}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Decline Call"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
                <span className="text-xs font-semibold text-rose-400">Decline</span>
              </div>

              {/* Accept Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleAcceptIncoming}
                  className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all animate-bounce cursor-pointer"
                  title="Accept Call"
                >
                  {incomingCall.callType === 'video' ? (
                    <Video className="w-7 h-7" />
                  ) : (
                    <Phone className="w-7 h-7" />
                  )}
                </button>
                <span className="text-xs font-semibold text-emerald-400">Accept</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. OUTGOING CALL OVERLAY (RINGING SCREEN FOR CALLER) */}
      {outgoingCall && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] border border-[var(--md-sys-color-outline-variant)] dark:border-[#2a3854] rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden">
            {/* Top Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-bold uppercase tracking-wider mb-6">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Outgoing {outgoingCall.callType.toUpperCase()} Call</span>
            </div>

            {/* Target Avatar with Outgoing Wave Animation */}
            <div className="relative mb-5">
              <div className="absolute -inset-3 rounded-full bg-blue-500/20 animate-ping duration-1000" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-4 border-[var(--md-sys-color-surface)] dark:border-[#141b2b] flex items-center justify-center text-white text-3xl font-bold shadow-xl overflow-hidden">
                {outgoingCall.callerAvatar ? (
                  <img src={outgoingCall.callerAvatar} alt={outgoingCall.callerName} className="w-full h-full object-cover" />
                ) : (
                  <span>{outgoingCall.callerName.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>

            {/* Recipient & Call Details */}
            <h3 className="text-xl font-bold text-[var(--md-sys-color-on-surface)] dark:text-white mb-1">
              {outgoingCall.conversationName || outgoingCall.callerName}
            </h3>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 mb-8 font-mono">
              Ringing... {Math.floor(outgoingTimer / 60)}:{(outgoingTimer % 60).toString().padStart(2, '0')}
            </p>

            {/* Actions: Cancel & Direct Enter */}
            <div className="w-full flex items-center justify-center gap-6">
              <button
                onClick={() => handleCancelOutgoing('Call cancelled by caller')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Cancel Call</span>
              </button>

              <button
                onClick={handleJoinOutgoingRoom}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold text-xs tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Enter Room</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
