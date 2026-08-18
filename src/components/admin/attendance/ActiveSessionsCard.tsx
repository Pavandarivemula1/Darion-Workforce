'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Clock, Coffee, Square, Users, Play, AlertTriangle } from 'lucide-react'
import { SystemAttendanceItem, CandidateItem } from '@/app/admin/attendance/AdminAttendanceClient'
import { PunctualityBadge } from '@/components/ui/PunctualityBadge'
import { calculatePunctualityStatus } from '@/lib/utils/punctuality'
import { ShiftConfig, DEFAULT_FALLBACK_SHIFT } from '@/lib/utils/shift'

export interface ActiveSessionsCardProps {
  activeSessions: SystemAttendanceItem[]
  candidates: CandidateItem[]
  shifts?: ShiftConfig[]
  onOpenStopModal: (session: SystemAttendanceItem) => void
  onOpenStartModal: () => void
  onAutoCutoff?: (session: SystemAttendanceItem) => void
  isAutoCutoffLoading?: boolean
}

function calculateLiveElapsed(loginTime: string, breakStartTime?: string | null, breakDurationSeconds: number = 0): string {
  const start = new Date(loginTime).getTime()
  const now = new Date().getTime()
  const grossMs = Math.max(0, now - start)

  let breakSecs = breakDurationSeconds || 0
  if (breakStartTime) {
    const bStart = new Date(breakStartTime).getTime()
    breakSecs += Math.max(0, Math.floor((now - bStart) / 1000))
  }

  const netMs = Math.max(0, grossMs - breakSecs * 1000)
  const hours = Math.floor(netMs / (1000 * 60 * 60))
  const mins = Math.floor((netMs % (1000 * 60 * 60)) / (1000 * 60))
  const secs = Math.floor((netMs % (1000 * 60)) / 1000)

  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export const ActiveSessionsCard: React.FC<ActiveSessionsCardProps> = ({
  activeSessions,
  candidates,
  shifts = [],
  onOpenStopModal,
  onOpenStartModal,
  onAutoCutoff,
  isAutoCutoffLoading = false,
}) => {
  const [, setTick] = useState(0)

  // Live timer tick every 1 second
  useEffect(() => {
    if (activeSessions.length === 0) return
    const timer = setInterval(() => {
      setTick((t) => t + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [activeSessions.length])

  const defaultShift = shifts.find((s) => s.is_default) || DEFAULT_FALLBACK_SHIFT

  return (
    <Card variant="outlined" className="p-4 sm:p-5 border border-emerald-500/30 bg-emerald-500/5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Clock className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base flex items-center gap-2 text-[var(--md-sys-color-on-surface)]">
              Active Work Timers
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                {activeSessions.length} Working Now
              </span>
            </h3>
            <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
              Live shifts currently in progress with punctuality tracking and remote cutoff controls.
            </p>
          </div>
        </div>

        <Button
          variant="outlined"
          size="sm"
          onClick={onOpenStartModal}
          icon={<Play className="w-3.5 h-3.5 fill-current" />}
          className="self-start sm:self-auto shrink-0 border-emerald-600/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
        >
          Start Timer
        </Button>
      </div>

      {activeSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          {activeSessions.map((session) => {
            const candidate = candidates.find((c) => c.id === session.user_id)
            const candidateShift = shifts.find((s) => s.id === (session as any).shiftId) || defaultShift
            const punctuality = calculatePunctualityStatus(
              session.login_time,
              session.logout_time,
              candidateShift,
              session.is_auto_cutoff,
              12
            )

            const isOnBreak = !!session.break_start_time
            const elapsed = calculateLiveElapsed(
              session.login_time,
              session.break_start_time,
              session.break_duration_seconds
            )

            const isStale = punctuality.isStale

            return (
              <div
                key={session.id}
                className={`p-3.5 rounded-xl bg-[var(--md-sys-color-surface)] border shadow-2xs flex flex-col justify-between gap-3 transition-all ${
                  isStale
                    ? 'border-amber-500/80 bg-amber-500/5'
                    : 'border-[var(--md-sys-color-outline-variant)] hover:border-emerald-500/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {session.candidateAvatarUrl ? (
                      <img
                        src={session.candidateAvatarUrl}
                        alt={session.candidateName}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center font-bold text-xs shrink-0">
                        {session.candidateName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm truncate leading-tight">
                        {session.candidateName}
                      </h4>
                      <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">
                        In: {new Date(session.login_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {isOnBreak ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Coffee className="w-3 h-3" /> Break
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                      </span>
                    )}

                    <PunctualityBadge
                      loginStatus={punctuality.loginStatus}
                      loginText={punctuality.loginBadgeText}
                      isStale={isStale}
                      staleHours={punctuality.staleHours}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                  <div className="flex flex-col font-mono">
                    <span className="text-[9px] uppercase font-sans text-[var(--md-sys-color-on-surface-variant)]">
                      Elapsed Time
                    </span>
                    <span className={`text-sm font-bold ${isStale ? 'text-amber-600 dark:text-amber-400 font-black' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {elapsed}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isStale && onAutoCutoff && (
                      <Button
                        variant="outlined"
                        size="sm"
                        className="border-amber-600 text-amber-700 dark:text-amber-300 text-xs px-2.5 h-8 hover:bg-amber-500/10"
                        onClick={() => onAutoCutoff(session)}
                        isLoading={isAutoCutoffLoading}
                        title="Auto-cutoff to standard shift length"
                      >
                        Auto-Cutoff
                      </Button>
                    )}

                    <Button
                      variant="filled"
                      size="sm"
                      className="bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 text-xs px-3 h-8"
                      icon={<Square className="w-3 h-3 fill-current" />}
                      onClick={() => onOpenStopModal(session)}
                    >
                      Stop Timer
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center gap-2">
          <Users className="w-4 h-4 opacity-50" />
          <span>No candidates are currently clocked in. You can start a timer above.</span>
        </div>
      )}
    </Card>
  )
}
