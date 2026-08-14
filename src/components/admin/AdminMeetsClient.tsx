'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  Copy,
  Check,
  Trash2,
  Play,
  Download,
  ExternalLink,
  Shield,
  Search,
  LogIn,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createInstantMeetingAction, scheduleMeetingAction, deleteMeetingAction } from '@/app/actions/meet'

export interface AdminMeetsClientProps {
  initialUpcoming: any[]
  initialPast: any[]
  adminName: string
  adminId: string
}

export const AdminMeetsClient: React.FC<AdminMeetsClientProps> = ({
  initialUpcoming,
  initialPast,
  adminName,
  adminId,
}) => {
  const router = useRouter()
  const [upcoming, setUpcoming] = useState(initialUpcoming)
  const [past, setPast] = useState(initialPast)
  const [isStartingInstant, setIsStartingInstant] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [playingRecording, setPlayingRecording] = useState<{ url: string; driveUrl?: string | null } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Handle Instant Meet
  const handleStartInstantMeet = async () => {
    if (isStartingInstant) return
    setIsStartingInstant(true)
    try {
      const res = await createInstantMeetingAction(adminName, adminId, `${adminName}'s Meeting`)
      if (res?.roomCode) {
        window.location.href = `/meet/${res.roomCode}`
      } else {
        throw new Error('Room code not returned')
      }
    } catch (err: any) {
      console.error('Failed to start instant meet:', err)
      alert('Could not start meeting: ' + (err?.message || 'Server error'))
      setIsStartingInstant(false)
    }
  }

  // Handle Schedule Submit
  const handleScheduleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsScheduling(true)
    const formData = new FormData(e.currentTarget)
    formData.append('host_name', adminName)
    formData.append('host_id', adminId)

    const res = await scheduleMeetingAction(formData)
    setIsScheduling(false)
    if (res.success && res.room) {
      setUpcoming([res.room, ...upcoming])
      setShowScheduleModal(false)
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

  // Handle Delete Meeting
  const handleDeleteMeeting = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return
    await deleteMeetingAction(roomId)
    setUpcoming(upcoming.filter((m) => m.id !== roomId))
    setPast(past.filter((m) => m.id !== roomId))
  }

  const handleCopyLink = (code: string) => {
    const meetUrl = `${window.location.origin}/meet/${code}`
    navigator.clipboard.writeText(meetUrl)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const filteredUpcoming = upcoming.filter(
    (m) =>
      m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.room_code?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner with Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Start Instant Meeting */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-lg shadow-blue-600/10 flex flex-col justify-between h-[230px] transition-all hover:shadow-xl hover:shadow-blue-600/15">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full border border-white/20">
              Instant
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight">Start Instant Meeting</h3>
            <p className="text-xs text-blue-100/85 mt-1 leading-relaxed line-clamp-2">
              Launch a live room with screen share, recording, and host controls.
            </p>
          </div>
          <button
            type="button"
            onClick={handleStartInstantMeet}
            disabled={isStartingInstant}
            className="w-full h-11 rounded-xl bg-white text-blue-700 hover:bg-blue-50 active:scale-[0.99] font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Video className="w-4 h-4" />
            <span>{isStartingInstant ? 'Launching Room...' : 'Start Meeting Now'}</span>
          </button>
        </div>

        {/* Card 2: Schedule a Meeting */}
        <div className="p-6 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex flex-col justify-between h-[230px] shadow-xs transition-all hover:border-blue-500/40 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container-high)] px-2.5 py-1 rounded-full">
              Calendar
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] tracking-tight">Schedule a Meeting</h3>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 leading-relaxed line-clamp-2">
              Set up interviews, team standups, training calls, or reviews in advance.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowScheduleModal(true)}
            className="w-full h-11 rounded-xl bg-[var(--md-sys-color-surface)] hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] font-semibold text-xs border border-[var(--md-sys-color-outline-variant)] hover:border-blue-500/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Schedule Call</span>
          </button>
        </div>

        {/* Card 3: Join with a Code */}
        <div className="p-6 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex flex-col justify-between h-[230px] shadow-xs transition-all hover:border-blue-500/40 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <LogIn className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container-high)] px-2.5 py-1 rounded-full">
              Quick Join
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] tracking-tight">Join with a Code</h3>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 leading-relaxed line-clamp-2">
              Enter a room code or paste any meeting link to join instantly.
            </p>
          </div>
          <form onSubmit={handleJoinByCode} className="w-full">
            <div className="flex items-stretch h-11 rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15 overflow-hidden transition-all shadow-2xs">
              <input
                type="text"
                placeholder="e.g. abc-def-ghi"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="flex-1 px-3 text-xs bg-transparent text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)]/50 focus:outline-none font-mono"
              />
              <button
                type="submit"
                disabled={!joinCode.trim()}
                className="px-4 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:hover:bg-blue-600 transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
              >
                Join
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]" />
          <input
            type="text"
            placeholder="Search meetings by title or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-full text-xs text-[var(--md-sys-color-on-surface)] focus:outline-none focus:border-[var(--md-sys-color-primary)] focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/15 transition-all"
          />
        </div>
      </div>

      {/* Upcoming & Active Meetings */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Upcoming & Active Sessions ({filteredUpcoming.length})</span>
          </h3>
        </div>

        {filteredUpcoming.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] text-center text-[var(--md-sys-color-on-surface-variant)] flex flex-col items-center justify-center gap-2">
            <Video className="w-8 h-8 opacity-40" />
            <p className="text-sm font-semibold">No active or scheduled meetings</p>
            <p className="text-xs">Start an instant meet or schedule one above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUpcoming.map((m) => (
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteMeeting(m.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Cancel/Delete Meeting"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <Button
                      onClick={() => router.push(`/meet/${m.room_code}`)}
                      className="text-xs font-bold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-xs"
                    >
                      Join Call
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Meetings & Saved Recordings */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
            <Video className="w-4 h-4 text-indigo-500" />
            <span>Past Sessions & Cloud Recordings ({past.length})</span>
          </h3>
        </div>

        {past.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] text-center text-[var(--md-sys-color-on-surface-variant)]">
            <p className="text-xs">No past recorded meetings yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] shadow-xs">
            <table className="w-full text-left text-xs text-[var(--md-sys-color-on-surface)]">
              <thead className="bg-[var(--md-sys-color-surface-container-high)]/70 text-[var(--md-sys-color-on-surface-variant)] uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Meeting</th>
                  <th className="py-3.5 px-4">Host</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Recordings</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]/60">
                {past.map((m) => {
                  const recordings = m.meet_recordings || []
                  const hasRecordings = recordings.length > 0
                  const firstRecording = recordings[0]
                  const durationSec = firstRecording?.duration_seconds || 0
                  const formattedDuration = durationSec > 0
                    ? `${Math.floor(durationSec / 60)}:${(durationSec % 60).toString().padStart(2, '0')}`
                    : null

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
                      <td className="py-3.5 px-4">
                        {hasRecordings ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-semibold text-[11px] border border-emerald-500/20">
                            <Play className="w-3 h-3 fill-emerald-500" />
                            <span>{recordings.length} Recorded</span>
                            {formattedDuration && (
                              <span className="opacity-75 text-[10px] font-mono">({formattedDuration})</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-[var(--md-sys-color-on-surface-variant)]/60 text-[11px]">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {hasRecordings && (
                            <>
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
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteMeeting(m.id)}
                            className="w-8 h-8 rounded-lg text-rose-500/70 hover:text-rose-600 hover:bg-rose-500/10 transition-all cursor-pointer flex items-center justify-center"
                            title="Delete Session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <h3 className="text-lg font-bold text-[var(--md-sys-color-on-surface)]">Schedule New Meeting</h3>
            <form onSubmit={handleScheduleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] block mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Candidate Technical Interview"
                  className="w-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--md-sys-color-primary)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] block mb-1">
                  Description / Agenda
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Topics to discuss, notes, instructions..."
                  className="w-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--md-sys-color-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] block mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduled_start_at"
                    required
                    className="w-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-[var(--md-sys-color-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] block mb-1">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduled_end_at"
                    className="w-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-[var(--md-sys-color-primary)]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-[var(--md-sys-color-surface-container)] rounded-xl">
                <input
                  type="checkbox"
                  name="waiting_room_enabled"
                  value="true"
                  id="waiting_room"
                  className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                />
                <label htmlFor="waiting_room" className="text-xs text-[var(--md-sys-color-on-surface)] cursor-pointer">
                  Enable Waiting Room (require admission)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setShowScheduleModal(false)}
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isScheduling}
                  className="text-xs font-bold bg-blue-600 text-white cursor-pointer"
                >
                  {isScheduling ? 'Scheduling...' : 'Save & Schedule'}
                </Button>
              </div>
            </form>
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
