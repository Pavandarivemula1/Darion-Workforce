'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Video,
  Calendar,
  Clock,
  LogIn,
  Play,
  Copy,
  Check,
  Download,
  Search,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createInstantMeetingAction } from '@/app/actions/meet'

export interface CandidateMeetsClientProps {
  upcomingMeetings: any[]
  pastMeetings: any[]
  candidateName: string
  candidateId: string
}

export const CandidateMeetsClient: React.FC<CandidateMeetsClientProps> = ({
  upcomingMeetings,
  pastMeetings,
  candidateName,
  candidateId,
}) => {
  const router = useRouter()
  const [joinCode, setJoinCode] = useState('')
  const [isStartingInstant, setIsStartingInstant] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [playingRecording, setPlayingRecording] = useState<{ url: string; driveUrl?: string | null } | null>(null)

  // Handle Instant Meet
  const handleStartInstantMeet = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (isStartingInstant) return
    setIsStartingInstant(true)
    try {
      const res = await createInstantMeetingAction(candidateName, candidateId, `${candidateName}'s Meeting`)
      if (res && res.roomCode) {
        window.location.href = `/meet/${res.roomCode}`
      } else {
        throw new Error('Room was not created. Please try again.')
      }
    } catch (err: any) {
      console.error('Failed to start instant meet:', err)
      alert('Could not start meeting: ' + (err?.message || 'Please check your connection and try again.'))
      setIsStartingInstant(false)
    }
  }

  // Handle Join by Code
  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCode = joinCode.trim().replace(/^https?:\/\/[^/]+\/meet\//, '')
    if (cleanCode) {
      window.location.href = `/meet/${cleanCode}`
    }
  }

  const handleCopyLink = (code: string) => {
    const meetUrl = `${window.location.origin}/meet/${code}`
    navigator.clipboard.writeText(meetUrl)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner Cards - Fluid Mobile Height */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
        {/* Card 1: Join with a Code */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-md flex flex-col justify-between gap-3 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
              <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full border border-white/20">
              Quick Join
            </span>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold tracking-tight">Join a Meeting</h3>
            <p className="text-[11px] sm:text-xs text-blue-100/85 mt-0.5 leading-relaxed line-clamp-2">
              Enter room code or link provided by your team.
            </p>
          </div>
          <form onSubmit={handleJoinByCode} className="w-full">
            <div className="flex items-stretch h-9 sm:h-11 rounded-xl border border-white/25 bg-white/15 focus-within:border-white focus-within:ring-2 focus-within:ring-white/30 overflow-hidden transition-all shadow-xs">
              <input
                type="text"
                placeholder="e.g. abc-def-ghi"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="flex-1 px-3 text-xs bg-transparent text-white placeholder:text-blue-200/70 focus:outline-none font-mono"
              />
              <button
                type="submit"
                disabled={!joinCode.trim()}
                className="px-3 sm:px-4 text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 active:scale-[0.99] disabled:opacity-40 transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
              >
                Join
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Start Instant Meet Card */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex flex-col justify-between gap-3 shadow-2xs transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Video className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container-high)] px-2 py-0.5 rounded-full">
              Instant
            </span>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[var(--md-sys-color-on-surface)] tracking-tight">Start Quick Meeting</h3>
            <p className="text-[11px] sm:text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5 leading-relaxed line-clamp-2">
              Launch a live video call with screen share & chat.
            </p>
          </div>
          <button
            type="button"
            onClick={handleStartInstantMeet}
            disabled={isStartingInstant}
            className="w-full h-9 sm:h-11 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{isStartingInstant ? 'Launching...' : 'Start Instant Meet'}</span>
          </button>
        </div>
      </div>


      {/* Upcoming & Live Meetings */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          <span>Scheduled & Live Meetings ({upcomingMeetings.length})</span>
        </h3>

        {upcomingMeetings.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] text-center text-[var(--md-sys-color-on-surface-variant)] flex flex-col items-center justify-center gap-2">
            <Video className="w-8 h-8 opacity-40" />
            <p className="text-sm font-semibold">No scheduled meetings</p>
            <p className="text-xs">Any upcoming interviews or team meetings will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingMeetings.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex flex-col justify-between gap-4 hover:border-blue-500/50 transition-all shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        m.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 animate-pulse'
                          : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                      }`}
                    >
                      {m.status === 'active' ? '● Live Now' : 'Scheduled'}
                    </span>
                    <span className="text-xs font-mono font-bold text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container-high)] px-2 py-0.5 rounded-md">
                      {m.room_code}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[var(--md-sys-color-on-surface)] line-clamp-1">{m.title}</h4>
                  {m.description && (
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] line-clamp-2 mt-1">
                      {m.description}
                    </p>
                  )}

                  {m.scheduled_start_at && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-3">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>{new Date(m.scheduled_start_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--md-sys-color-outline-variant)]">
                  <button
                    onClick={() => handleCopyLink(m.room_code)}
                    className="p-2 rounded-xl hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] transition-all cursor-pointer"
                    title="Copy Meeting Link"
                  >
                    {copiedCode === m.room_code ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <Button
                    onClick={() => router.push(`/meet/${m.room_code}`)}
                    className="text-xs font-bold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-xs"
                  >
                    Join Call
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Meetings & Recordings */}
      {pastMeetings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
            <Video className="w-4 h-4 text-indigo-500" />
            <span>Past Recordings ({pastMeetings.length})</span>
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] shadow-xs">
            <table className="w-full text-left text-xs text-[var(--md-sys-color-on-surface)]">
              <thead className="bg-[var(--md-sys-color-surface-container-high)]/70 text-[var(--md-sys-color-on-surface-variant)] uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Meeting</th>
                  <th className="py-3.5 px-4">Host</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Watch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]/60">
                {pastMeetings.map((m) => {
                  const recordings = m.meet_recordings || []
                  if (recordings.length === 0) return null
                  const firstRecording = recordings[0]
                  return (
                    <tr key={m.id} className="hover:bg-[var(--md-sys-color-surface-container-highest)]/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold">
                        <div className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">{m.title}</div>
                        <span className="text-[10px] font-mono text-[var(--md-sys-color-on-surface-variant)]">
                          {m.room_code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[var(--md-sys-color-on-surface-variant)] font-medium">
                        {m.host_name}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--md-sys-color-on-surface-variant)]">
                        {new Date(m.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPlayingRecording({
                              url: firstRecording.file_url,
                              driveUrl: firstRecording.google_drive_url,
                            })}
                            className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                          >
                            <Play className="w-3 h-3 fill-white" /> Watch
                          </button>
                          {firstRecording.google_drive_url && (
                            <a
                              href={firstRecording.google_drive_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8 px-3 rounded-lg bg-[var(--md-sys-color-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] font-semibold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer border border-[var(--md-sys-color-outline-variant)] shadow-2xs active:scale-95"
                              title="Open in Google Drive"
                            >
                              <ExternalLink className="w-3 h-3 text-amber-500" /> Drive
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {playingRecording && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900/95 border border-slate-800/80 rounded-3xl p-5 max-w-3xl w-full flex flex-col gap-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-bold text-white tracking-wide">Meeting Playback</span>
              </div>
              <button
                onClick={() => setPlayingRecording(null)}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl bg-black border border-slate-800 shadow-inner aspect-video flex items-center justify-center">
              <video
                src={playingRecording.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Direct streaming via CDN • Cloud Backup Synchronized
              </span>
              <div className="flex items-center gap-2">
                {playingRecording.driveUrl && (
                  <a
                    href={playingRecording.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open in Google Drive
                  </a>
                )}
                <a
                  href={playingRecording.url}
                  download="recording.webm"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
