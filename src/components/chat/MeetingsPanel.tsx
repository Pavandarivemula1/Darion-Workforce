'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Video, Plus, KeyRound, Sparkles, Radio, ArrowRight, Loader2, Users } from 'lucide-react'
import { createInstantMeetingAction } from '@/app/actions/meet'

interface MeetingsPanelProps {
  currentUserId: string
  currentUserName: string
}

export const MeetingsPanel: React.FC<MeetingsPanelProps> = ({ currentUserId, currentUserName }) => {
  const router = useRouter()
  const [roomCodeInput, setRoomCodeInput] = useState('')
  const [creatingMeet, setCreatingMeet] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleStartInstantMeet = async () => {
    setCreatingMeet(true)
    setErrorMsg('')
    try {
      const res = await createInstantMeetingAction(
        currentUserName,
        currentUserId,
        `${currentUserName}'s Meeting`
      )
      if (!res?.roomCode) {
        throw new Error('Failed to generate meeting room')
      }
      router.push(`/meet/${res.roomCode}`)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start meeting')
    } finally {
      setCreatingMeet(false)
    }
  }

  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCode = roomCodeInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (!cleanCode) return
    router.push(`/meet/${cleanCode}`)
  }

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 bg-[var(--md-sys-color-surface)] dark:bg-[#0c111d] flex flex-col justify-between max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--md-sys-color-on-surface)] dark:text-white flex items-center gap-2">
              Video Meetings & Huddles
              <Sparkles className="w-4 h-4 text-blue-400" />
            </h2>
            <p className="text-xs text-slate-400">
              HD WebRTC video rooms, screen sharing, and encrypted P2P calls
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. Start Instant Meeting */}
          <div className="p-5 rounded-3xl bg-[var(--md-sys-color-surface-container)] dark:bg-[#101726] border border-[var(--md-sys-color-outline-variant)] dark:border-[#202d46] shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 mb-3">
                <Plus className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Instant Meeting</h3>
              <p className="text-xs text-slate-400">
                Generate a private video room and share the link with teammates
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartInstantMeet}
              disabled={creatingMeet}
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
            >
              {creatingMeet ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Room...</span>
                </>
              ) : (
                <>
                  <span>Start Instant Meet</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* 2. Join via Code */}
          <form
            onSubmit={handleJoinWithCode}
            className="p-5 rounded-3xl bg-[var(--md-sys-color-surface-container)] dark:bg-[#101726] border border-[var(--md-sys-color-outline-variant)] dark:border-[#202d46] shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-3">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Join with a Code</h3>
              <p className="text-xs text-slate-400">
                Enter the 9-digit meeting code or room link to jump in
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value)}
                placeholder="abc-defg-hij"
                className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!roomCodeInput.trim()}
                className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>Join Meeting</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Feature Highlights */}
        <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-900/30 flex items-center gap-3 text-xs text-blue-300">
          <Radio className="w-5 h-5 text-blue-400 flex-shrink-0 animate-pulse" />
          <span>
            Meetings feature live multi-participant WebRTC mesh, full HD screen sharing, noise suppression, and host admission controls.
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 text-center text-[11px] text-slate-500">
        Enterprise Cloud Signaling • End-to-End Encrypted WebRTC
      </div>
    </div>
  )
}
