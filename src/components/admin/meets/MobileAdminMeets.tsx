'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
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
  Search,
  LogIn,
} from 'lucide-react'

export interface MobileAdminMeetsProps {
  upcoming: any[]
  past: any[]
  isStartingInstant: boolean
  onStartInstantMeet: () => void
  onOpenSchedule: () => void
  onDeleteMeeting: (id: string) => void
  onCopyLink: (code: string) => void
  copiedCode: string | null
  onPlayRecording: (recording: { url: string; driveUrl?: string | null }) => void
}

export const MobileAdminMeets: React.FC<MobileAdminMeetsProps> = ({
  upcoming,
  past,
  isStartingInstant,
  onStartInstantMeet,
  onOpenSchedule,
  onDeleteMeeting,
  onCopyLink,
  copiedCode,
  onPlayRecording,
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'join'>('upcoming')
  const [joinCode, setJoinCode] = useState('')

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCode = joinCode.trim().replace(/^https?:\/\/[^/]+\/meet\//, '')
    if (cleanCode) {
      window.location.href = `/meet/${cleanCode}`
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* 1. Executive Meets Command Strip */}
      <div className="p-3 rounded-2xl bg-slate-900 dark:bg-slate-950 text-slate-100 border border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Video Operations</span>
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
            {upcoming.length} Scheduled • {past.length} Recordings
          </p>
        </div>

        <button
          onClick={onStartInstantMeet}
          disabled={isStartingInstant}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs shrink-0 flex items-center gap-1 transition-all border border-slate-700 cursor-pointer disabled:opacity-50"
        >
          <Video className="w-3.5 h-3.5" />
          <span>{isStartingInstant ? 'Launching...' : 'Start Live'}</span>
        </button>
      </div>

      {/* 2. 2x2 Bento Matrix */}
      <div className="grid grid-cols-2 gap-2">
        {/* Metric 1: Scheduled Meetings */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Upcoming Calls
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {upcoming.length}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Scheduled Sessions</span>
          </div>
        </div>

        {/* Metric 2: Cloud Recordings */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Recordings
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Play className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {past.filter((p) => p.recording_url).length}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Saved Cloud Sessions</span>
          </div>
        </div>

        {/* Metric 3: Quick Action Schedule */}
        <button
          onClick={onOpenSchedule}
          className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between text-left hover:bg-[var(--md-sys-color-surface-container-high)] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Schedule Call
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] block">
              + Plan New Room
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Set Date & Password</span>
          </div>
        </button>

        {/* Metric 4: Direct Join */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Join Code
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <LogIn className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] block truncate">
              Direct Access
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Enter Room URL</span>
          </div>
        </div>
      </div>

      {/* 3. Section Switcher Pill */}
      <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'upcoming'
              ? 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] shadow-2xs border border-[var(--md-sys-color-outline-variant)]'
              : 'text-[var(--md-sys-color-on-surface-variant)]'
          }`}
        >
          <Calendar className="w-3 h-3" />
          <span>Upcoming ({upcoming.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'past'
              ? 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] shadow-2xs border border-[var(--md-sys-color-outline-variant)]'
              : 'text-[var(--md-sys-color-on-surface-variant)]'
          }`}
        >
          <Play className="w-3 h-3" />
          <span>Recordings ({past.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('join')}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'join'
              ? 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] shadow-2xs border border-[var(--md-sys-color-outline-variant)]'
              : 'text-[var(--md-sys-color-on-surface-variant)]'
          }`}
        >
          <LogIn className="w-3 h-3" />
          <span>Join</span>
        </button>
      </div>

      {/* 4. Tab Content */}
      {activeTab === 'upcoming' && (
        <div className="flex flex-col gap-2">
          {upcoming.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
              No scheduled meetings. Click &quot;Schedule Call&quot; to create one.
            </div>
          ) : (
            upcoming.map((m) => {
              const isCopied = copiedCode === m.room_code

              return (
                <Card
                  key={m.id}
                  variant="outlined"
                  className="p-2.5 rounded-2xl flex flex-col gap-2 relative overflow-hidden transition-all border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] shadow-2xs"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center shrink-0">
                        <Video className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[var(--md-sys-color-on-surface)] truncate">{m.title || 'Untitled Meet'}</p>
                        <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-mono truncate">
                          Code: {m.room_code}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className="text-[10px] font-semibold text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container-high)] px-2 py-0.5 rounded-full">
                        {m.scheduled_start_time
                          ? new Date(m.scheduled_start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                          : 'Live'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-1 border-t border-[var(--md-sys-color-outline-variant)]">
                    <a
                      href={`/meet/${m.room_code}`}
                      className="flex-1 h-7 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-[11px] transition-all flex items-center justify-center gap-1"
                    >
                      <Video className="w-3 h-3" />
                      <span>Join Room</span>
                    </a>

                    <button
                      onClick={() => onCopyLink(m.room_code)}
                      className="px-2.5 h-7 rounded-lg bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copied' : 'Link'}</span>
                    </button>

                    <button
                      onClick={() => onDeleteMeeting(m.id)}
                      className="px-2 h-7 rounded-lg bg-[var(--md-sys-color-surface-container-high)] hover:bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      )}

      {activeTab === 'past' && (
        <div className="flex flex-col gap-2">
          {past.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
              No past recordings found.
            </div>
          ) : (
            past.map((m) => {
              const hasRec = !!m.recording_url

              return (
                <Card
                  key={m.id}
                  variant="outlined"
                  className="p-2.5 rounded-2xl flex flex-col gap-2 relative overflow-hidden transition-all border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[var(--md-sys-color-on-surface)] truncate">{m.title || 'Past Meeting'}</p>
                      <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-mono">
                        {new Date(m.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    {hasRec && (
                      <button
                        onClick={() => onPlayRecording({ url: m.recording_url, driveUrl: m.drive_view_url })}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        <span>Watch</span>
                      </button>
                    )}
                  </div>
                </Card>
              )
            })
          )}
        </div>
      )}

      {activeTab === 'join' && (
        <Card variant="outlined" className="p-3 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col gap-2.5">
          <h4 className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">Join Meeting by Code</h4>
          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. abc-def-ghi"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="flex-1 h-8 px-3 rounded-xl text-xs bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] focus:outline-none"
            />
            <Button type="submit" variant="filled" size="xs" className="h-8 px-4 text-xs font-bold">
              Join
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}
