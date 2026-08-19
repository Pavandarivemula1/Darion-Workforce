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
  Volume2,
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

  // Start outgoing call handler
  const startOutgoingCall = (payload: CallSessionPayload) => {
    setOutgoingCall(payload)
    setOutgoingTimer(0)
    soundEffects.startRingingOutgoing()

    if (outgoingIntervalRef.current) clearInterval(outgoingIntervalRef.current)
    outgoingIntervalRef.current = setInterval(() => {
      setOutgoingTimer((prev) => prev + 1)
    }, 1000)

    if (outgoingTimeoutRef.current) clearTimeout(outgoingTimeoutRef.current)
    outgoingTimeoutRef.current = setTimeout(() => {
      handleCancelOutgoing(true)
    }, 45000)
  }

  // Start incoming call handler (Loud Ringing)
  const triggerIncomingCall = (incoming: CallSessionPayload) => {
    // Don't ring if the caller is ourselves
    if (resolvedUserId && incoming.callerId === resolvedUserId) return

    setIncomingCall(incoming)
    soundEffects.startRingingIncoming()

    if (incomingTimeoutRef.current) clearTimeout(incomingTimeoutRef.current)
    incomingTimeoutRef.current = setTimeout(() => {
      handleDeclineIncoming('missed')
    }, 40000)
  }

  // 1. Listen for local events dispatched from Chat / Anywhere in UI
  useEffect(() => {
    const handleStartOutgoingEvent = (e: CustomEvent<CallSessionPayload>) => {
      if (e.detail) startOutgoingCall(e.detail)
    }

    const handleTriggerIncomingEvent = (e: CustomEvent<CallSessionPayload>) => {
      if (e.detail) triggerIncomingCall(e.detail)
    }

    window.addEventListener('start-outgoing-call' as any, handleStartOutgoingEvent)
    window.addEventListener('trigger-incoming-call' as any, handleTriggerIncomingEvent)

    return () => {
      window.removeEventListener('start-outgoing-call' as any, handleStartOutgoingEvent)
      window.removeEventListener('trigger-incoming-call' as any, handleTriggerIncomingEvent)
    }
  }, [resolvedUserId])

  // 2. Real-time Supabase Signaling (Broadcast + Database triggers)
  useEffect(() => {
    const supabase = createClient()

    // Global Call Signaling Broadcast Channel (Ultra-fast direct WebRTC signaling)
    const broadcastChannel = supabase.channel('global-call-signaling')
    broadcastChannel
      .on('broadcast', { event: 'incoming_call' }, ({ payload }) => {
        if (!payload) return
        if (!payload.recipientIds || (resolvedUserId && payload.recipientIds.includes(resolvedUserId))) {
          triggerIncomingCall(payload)
        }
      })
      .on('broadcast', { event: 'call_declined' }, ({ payload }) => {
        // If our outgoing call was declined by recipient
        setOutgoingCall((cur) => {
          if (cur && (!payload?.roomCode || cur.roomCode === payload.roomCode)) {
            soundEffects.playCallEndedSound()
            if (outgoingTimeoutRef.current) clearTimeout(outgoingTimeoutRef.current)
            if (outgoingIntervalRef.current) clearInterval(outgoingIntervalRef.current)
            return null
          }
          return cur
        })
      })
      .on('broadcast', { event: 'call_cancelled' }, ({ payload }) => {
        // If caller cancelled/hung up before we answered
        setIncomingCall((cur) => {
          if (cur && (!payload?.roomCode || cur.roomCode === payload.roomCode)) {
            soundEffects.playCallEndedSound()
            if (incomingTimeoutRef.current) clearTimeout(incomingTimeoutRef.current)
            return null
          }
          return cur
        })
      })
      .on('broadcast', { event: 'call_accepted' }, ({ payload }) => {
        // If recipient accepted, transition caller to meet room
        setOutgoingCall((cur) => {
          if (cur && (!payload?.roomCode || cur.roomCode === payload.roomCode)) {
            soundEffects.stopRinging()
            if (outgoingTimeoutRef.current) clearTimeout(outgoingTimeoutRef.current)
            if (outgoingIntervalRef.current) clearInterval(outgoingIntervalRef.current)
            const destUrl = payload.meetUrl || cur.meetUrl
            setTimeout(() => {
              router.push(destUrl)
            }, 100)
            return null
          }
          return cur
        })
      })
      .subscribe()

    // Database notifications table change listener
    let notifChannel: any = null
    if (resolvedUserId) {
      notifChannel = supabase
        .channel(`call-notifs-${resolvedUserId}`)
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
            if (item?.type === 'meet_started') {
              const meetUrl = item.link || ''
              const roomCode = meetUrl.replace('/meet/', '') || 'dar-video'

              const incoming: CallSessionPayload = {
                callId: item.id,
                roomCode,
                callerId: item.metadata?.callerId || '',
                callerName: item.title?.replace(/📞 Incoming (VIDEO|AUDIO) Call: /i, '') || 'Team Member',
                callerAvatar: item.metadata?.callerAvatar || '',
                callerRole: item.metadata?.callerRole || '',
                conversationId: item.metadata?.conversationId || '',
                callType: item.title?.includes('AUDIO') ? 'audio' : 'video',
                meetUrl: item.link || `/meet/${roomCode}`,
                startedAt: new Date().toISOString(),
              }

              triggerIncomingCall(incoming)
            }
          }
        )
        .subscribe()
    }

    return () => {
      supabase.removeChannel(broadcastChannel)
      if (notifChannel) supabase.removeChannel(notifChannel)
    }
  }, [resolvedUserId, router])

  // Handle Accept Incoming Call
  const handleAcceptIncoming = async () => {
    if (!incomingCall) return
    soundEffects.stopRinging()
    if (incomingTimeoutRef.current) clearTimeout(incomingTimeoutRef.current)

    const meetUrl = incomingCall.meetUrl
    const targetRoom = incomingCall.roomCode
    const targetCaller = incomingCall.callerId
    setIncomingCall(null)

    // Broadcast to caller that call was accepted
    try {
      const supabase = createClient()
      const broadcastChannel = supabase.channel('global-call-signaling')
      broadcastChannel.send({
        type: 'broadcast',
        event: 'call_accepted',
        payload: { roomCode: targetRoom, meetUrl },
      })
    } catch {
      // Ignored
    }

    await respondToCallAction({
      roomCode: targetRoom,
      callerId: targetCaller,
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

    // Broadcast to caller that call was declined
    try {
      const supabase = createClient()
      const broadcastChannel = supabase.channel('global-call-signaling')
      broadcastChannel.send({
        type: 'broadcast',
        event: 'call_declined',
        payload: { roomCode: cur.roomCode, callerId: cur.callerId },
      })
    } catch {
      // Ignored
    }

    await respondToCallAction({
      roomCode: cur.roomCode,
      callerId: cur.callerId,
      response: reason,
    })
  }

  // Handle Cancel Outgoing Call (Caller hangs up)
  const handleCancelOutgoing = (isAutoTimeout = false) => {
    soundEffects.playCallEndedSound()
    if (outgoingTimeoutRef.current) clearTimeout(outgoingTimeoutRef.current)
    if (outgoingIntervalRef.current) clearInterval(outgoingIntervalRef.current)

    const cur = outgoingCall
    setOutgoingCall(null)
    setOutgoingTimer(0)

    // Broadcast to all receivers that call was cancelled
    if (cur) {
      try {
        const supabase = createClient()
        const broadcastChannel = supabase.channel('global-call-signaling')
        broadcastChannel.send({
          type: 'broadcast',
          event: 'call_cancelled',
          payload: { roomCode: cur.roomCode, callerId: cur.callerId },
        })
      } catch {
        // Ignored
      }
    }
  }

  // Join Meet Room directly from Outgoing Screen
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
      {/* 1. LOUD, HIGH-PRIORITY INCOMING CALL POPUP OVERLAY */}
      {incomingCall && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-in fade-in duration-150 select-none">
          <div className="relative w-full max-w-sm bg-[#0d1424] border-2 border-emerald-500/60 rounded-3xl p-7 shadow-[0_0_60px_rgba(16,185,129,0.35)] flex flex-col items-center text-center overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Ambient Pulsing Radar Aura */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
              <div className="w-72 h-72 rounded-full bg-emerald-500 animate-ping duration-1000" />
            </div>

            {/* Top Live Call Header Pill with Soundwave animation */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse shadow-sm">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Incoming {incomingCall.callType.toUpperCase()} Call</span>
              
              {/* Equalizer audio bars */}
              <div className="flex items-center gap-0.5 ml-1 h-3">
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce duration-300" style={{ height: '70%' }} />
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce duration-500" style={{ height: '100%' }} />
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce duration-400" style={{ height: '50%' }} />
              </div>
            </div>

            {/* Caller Avatar with Animated Ripple Rings */}
            <div className="relative mb-5">
              <div className="absolute -inset-4 rounded-full bg-emerald-500/30 animate-pulse duration-700" />
              <div className="absolute -inset-8 rounded-full bg-emerald-500/10 animate-ping duration-1000" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-4 border-emerald-400/80 flex items-center justify-center text-white text-3xl font-bold shadow-2xl overflow-hidden">
                {incomingCall.callerAvatar ? (
                  <img src={incomingCall.callerAvatar} alt={incomingCall.callerName} className="w-full h-full object-cover" />
                ) : (
                  <span>{incomingCall.callerName.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>

            {/* Caller Identity */}
            <h3 className="text-2xl font-black text-white mb-1 tracking-tight">
              {incomingCall.callerName}
            </h3>
            <p className="text-xs text-slate-300 mb-8 flex items-center justify-center gap-1.5 font-medium">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Ringing... Tap Accept to answer</span>
            </p>

            {/* Action Buttons: Accept & Decline */}
            <div className="w-full flex items-center justify-around px-4">
              {/* Decline Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleDeclineIncoming('decline')}
                  className="w-18 h-18 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center justify-center shadow-[0_0_25px_rgba(225,29,72,0.5)] hover:shadow-rose-500/70 transition-all cursor-pointer"
                  title="Decline Call"
                  aria-label="Decline Call"
                >
                  <PhoneOff className="w-8 h-8" />
                </button>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wide">Decline</span>
              </div>

              {/* Accept Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleAcceptIncoming}
                  className="w-18 h-18 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.7)] hover:shadow-emerald-400/90 transition-all animate-bounce cursor-pointer"
                  title="Accept Call"
                  aria-label="Accept Call"
                >
                  {incomingCall.callType === 'video' ? (
                    <Video className="w-8 h-8" />
                  ) : (
                    <Phone className="w-8 h-8" />
                  )}
                </button>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Accept</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. OUTGOING CALL OVERLAY (RINGING SCREEN FOR CALLER) */}
      {outgoingCall && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-in fade-in duration-150 select-none">
          <div className="relative w-full max-w-sm bg-[#0d1424] border-2 border-blue-500/50 rounded-3xl p-7 shadow-[0_0_50px_rgba(59,130,246,0.3)] flex flex-col items-center text-center overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Top Outgoing Live Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Radio className="w-3.5 h-3.5 animate-pulse text-blue-400" />
              <span>Calling {outgoingCall.callType.toUpperCase()}</span>
            </div>

            {/* Target Avatar with Outgoing Wave Ripple */}
            <div className="relative mb-5">
              <div className="absolute -inset-4 rounded-full bg-blue-500/25 animate-ping duration-1000" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-4 border-blue-400/80 flex items-center justify-center text-white text-3xl font-bold shadow-2xl overflow-hidden">
                {outgoingCall.callerAvatar ? (
                  <img src={outgoingCall.callerAvatar} alt={outgoingCall.callerName} className="w-full h-full object-cover" />
                ) : (
                  <span>{outgoingCall.callerName.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>

            {/* Recipient & Duration */}
            <h3 className="text-2xl font-black text-white mb-1 tracking-tight">
              {outgoingCall.conversationName || outgoingCall.callerName}
            </h3>
            <p className="text-xs text-slate-400 mb-8 font-mono">
              Ringing... {Math.floor(outgoingTimer / 60)}:{(outgoingTimer % 60).toString().padStart(2, '0')}
            </p>

            {/* Actions: Cancel & Direct Enter */}
            <div className="w-full flex items-center justify-center gap-4">
              <button
                onClick={() => handleCancelOutgoing()}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Cancel</span>
              </button>

              <button
                onClick={handleJoinOutgoingRoom}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
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
