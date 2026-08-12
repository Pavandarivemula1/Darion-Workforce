'use client'

import React, { useState, useEffect } from 'react'
import {
  startWorkAction,
  startBreakAction,
  endBreakAction,
  endWorkAction,
} from '@/app/actions/attendance'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Snackbar } from '@/components/ui/Snackbar'
import {
  Play,
  Square,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Pause,
} from 'lucide-react'

export interface AttendanceRecord {
  id: string
  user_id: string
  login_time: string
  logout_time: string | null
  break_start_time?: string | null
  break_duration_seconds?: number
  created_at: string
}

export interface WorkStatusCardProps {
  activeSession: AttendanceRecord | null
  todaySession: AttendanceRecord | null
}

function calculateInitialWorkDuration(
  activeSession: AttendanceRecord | null,
  todaySession: AttendanceRecord | null
): string {
  if (activeSession) {
    const start = new Date(activeSession.login_time).getTime()
    const now = new Date().getTime()
    const grossMs = Math.max(0, now - start)

    let breakSecs = activeSession.break_duration_seconds || 0
    if (activeSession.break_start_time) {
      const bStart = new Date(activeSession.break_start_time).getTime()
      breakSecs += Math.max(0, Math.floor((now - bStart) / 1000))
    }

    const netMs = Math.max(0, grossMs - breakSecs * 1000)
    const hours = Math.floor(netMs / (1000 * 60 * 60))
    const mins = Math.floor((netMs % (1000 * 60 * 60)) / (1000 * 60))
    const secs = Math.floor((netMs % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`
  }

  if (todaySession?.logout_time && todaySession?.login_time) {
    const start = new Date(todaySession.login_time).getTime()
    const end = new Date(todaySession.logout_time).getTime()
    const grossMs = Math.max(0, end - start)
    const breakMs = (todaySession.break_duration_seconds || 0) * 1000
    const netMs = Math.max(0, grossMs - breakMs)

    const hours = Math.floor(netMs / (1000 * 60 * 60))
    const mins = Math.floor((netMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`
  }

  return '00h 00m 00s'
}

export const WorkStatusCard: React.FC<WorkStatusCardProps> = ({
  activeSession,
  todaySession,
}) => {
  const [workDuration, setWorkDuration] = useState<string>(() =>
    calculateInitialWorkDuration(activeSession, todaySession)
  )
  const [breakDurationText, setBreakDurationText] = useState<string>('0m 00s')
  const [isPending, setIsPending] = useState<boolean>(false)
  const [confirmDialog, setConfirmDialog] = useState<
    'start' | 'startBreak' | 'endBreak' | 'end' | null
  >(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const isOnBreak = !!activeSession?.break_start_time
  const isWorking = !!activeSession

  // Live Timers Effect
  useEffect(() => {
    if (!activeSession) {
      return
    }

    const updateTimers = () => {
      const start = new Date(activeSession.login_time).getTime()
      const now = new Date().getTime()
      const grossMs = Math.max(0, now - start)

      let totalBreakSecs = activeSession.break_duration_seconds || 0

      if (activeSession.break_start_time) {
        const bStart = new Date(activeSession.break_start_time).getTime()
        const currentBreakSecs = Math.max(0, Math.floor((now - bStart) / 1000))
        totalBreakSecs += currentBreakSecs
      }

      // Format Break Text
      const bMins = Math.floor(totalBreakSecs / 60)
      const bSecs = totalBreakSecs % 60
      setBreakDurationText(`${bMins}m ${bSecs.toString().padStart(2, '0')}s`)

      // Format Net Working Duration
      const netMs = Math.max(0, grossMs - totalBreakSecs * 1000)
      const hours = Math.floor(netMs / (1000 * 60 * 60))
      const mins = Math.floor((netMs % (1000 * 60 * 60)) / (1000 * 60))
      const secs = Math.floor((netMs % (1000 * 60)) / 1000)

      setWorkDuration(
        `${hours.toString().padStart(2, '0')}h ${mins
          .toString()
          .padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`
      )
    }

    updateTimers()
    const interval = setInterval(updateTimers, 1000)
    return () => clearInterval(interval)
  }, [activeSession])

  const handleStartWork = async () => {
    setIsPending(true)
    setErrorMsg(null)
    setConfirmDialog(null)
    const res = await startWorkAction()
    setIsPending(false)

    if (res?.error) setErrorMsg(res.error)
    else setSuccessMsg('Work session started.')
  }

  const handleStartBreak = async () => {
    setIsPending(true)
    setErrorMsg(null)
    setConfirmDialog(null)
    const res = await startBreakAction()
    setIsPending(false)

    if (res?.error) setErrorMsg(res.error)
    else setSuccessMsg('Break started. Work timer paused.')
  }

  const handleEndBreak = async () => {
    setIsPending(true)
    setErrorMsg(null)
    setConfirmDialog(null)
    const res = await endBreakAction()
    setIsPending(false)

    if (res?.error) setErrorMsg(res.error)
    else setSuccessMsg('Break ended. Work timer resumed.')
  }

  const handleEndWork = async () => {
    setIsPending(true)
    setErrorMsg(null)
    setConfirmDialog(null)
    const res = await endWorkAction()
    setIsPending(false)

    if (res?.error) setErrorMsg(res.error)
    else setSuccessMsg('Work session ended successfully.')
  }

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '--:--'
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const isCompletedToday = !isWorking && !!todaySession?.logout_time

  return (
    <div className="flex flex-col gap-4 w-full">
      <Card variant="elevated" className="border border-[var(--md-sys-color-outline-variant)]">
        <div className="flex flex-col gap-6">
          {/* Header Status Row */}
          <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-[var(--md-sys-color-outline-variant)]">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
              <span className="text-sm font-medium">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            {/* Status Badges */}
            {isOnBreak ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse">
                <Coffee className="w-4 h-4" />
                On Break
              </span>
            ) : isWorking ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Working
              </span>
            ) : isCompletedToday ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Shift Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]">
                <AlertCircle className="w-3.5 h-3.5" />
                Not Started
              </span>
            )}
          </div>

          {/* Time & Duration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)] flex flex-col gap-1 border border-[var(--md-sys-color-outline-variant)]">
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider font-medium">
                Started
              </span>
              <span className="text-lg font-bold">
                {formatTime(activeSession?.login_time || todaySession?.login_time)}
              </span>
            </div>

            <div className="p-4 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)] flex flex-col gap-1 border border-[var(--md-sys-color-outline-variant)]">
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider font-medium">
                Ended
              </span>
              <span className="text-lg font-bold">
                {formatTime(activeSession ? null : todaySession?.logout_time)}
              </span>
            </div>

            <div className="p-4 rounded-[var(--md-sys-shape-corner-medium)] bg-amber-500/10 flex flex-col gap-1 border border-amber-500/20">
              <span className="text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wider font-medium flex items-center gap-1">
                <Coffee className="w-3.5 h-3.5" /> Break Taken
              </span>
              <span className="text-lg font-bold font-mono text-amber-700 dark:text-amber-400">
                {breakDurationText}
              </span>
            </div>

            <div className="p-4 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex flex-col gap-1 border border-[var(--md-sys-color-outline-variant)]">
              <span className="text-xs opacity-80 uppercase tracking-wider font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Net Work Time
              </span>
              <span className="text-lg font-bold font-mono">{workDuration}</span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            {!isWorking ? (
              <Button
                variant="filled"
                size="lg"
                className="w-full"
                icon={<Play className="w-5 h-5 fill-current" />}
                isLoading={isPending}
                disabled={isCompletedToday}
                onClick={() => setConfirmDialog('start')}
              >
                {isCompletedToday ? 'Shift Finished Today' : 'Start Work'}
              </Button>
            ) : isOnBreak ? (
              <>
                <Button
                  variant="filled"
                  size="lg"
                  className="w-full bg-amber-600 text-white hover:bg-amber-700"
                  icon={<Play className="w-5 h-5 fill-current" />}
                  isLoading={isPending}
                  onClick={() => setConfirmDialog('endBreak')}
                >
                  End Break & Resume Work
                </Button>

                <Button
                  variant="outlined"
                  size="lg"
                  className="sm:w-auto"
                  icon={<Square className="w-5 h-5" />}
                  isLoading={isPending}
                  onClick={() => setConfirmDialog('end')}
                >
                  End Work Shift
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  size="lg"
                  className="w-full border-amber-500 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
                  icon={<Pause className="w-5 h-5" />}
                  isLoading={isPending}
                  onClick={() => setConfirmDialog('startBreak')}
                >
                  Take Break
                </Button>

                <Button
                  variant="filled"
                  size="lg"
                  className="w-full bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] hover:opacity-90"
                  icon={<Square className="w-5 h-5 fill-current" />}
                  isLoading={isPending}
                  onClick={() => setConfirmDialog('end')}
                >
                  End Work
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Dialogs */}
      <Dialog
        isOpen={confirmDialog === 'start'}
        title="Start Work Session?"
        description="This will register your official shift login timestamp."
        confirmLabel="Start Work"
        isLoading={isPending}
        onConfirm={handleStartWork}
        onClose={() => setConfirmDialog(null)}
      />

      <Dialog
        isOpen={confirmDialog === 'startBreak'}
        title="Take a Break?"
        description="Your active work timer will pause while you are on break. Break duration is automatically excluded from your net working hours."
        confirmLabel="Take Break"
        isLoading={isPending}
        onConfirm={handleStartBreak}
        onClose={() => setConfirmDialog(null)}
      />

      <Dialog
        isOpen={confirmDialog === 'endBreak'}
        title="End Break?"
        description="Your break duration will be recorded and your net work timer will resume."
        confirmLabel="Resume Work"
        isLoading={isPending}
        onConfirm={handleEndBreak}
        onClose={() => setConfirmDialog(null)}
      />

      <Dialog
        isOpen={confirmDialog === 'end'}
        title="End Work Session?"
        description="Are you sure you want to end your work session? This will calculate your final net working hours."
        confirmLabel="End Work"
        variant="error"
        isLoading={isPending}
        onConfirm={handleEndWork}
        onClose={() => setConfirmDialog(null)}
      />

      <Snackbar message={errorMsg} variant="error" onClose={() => setErrorMsg(null)} />
      <Snackbar message={successMsg} variant="success" onClose={() => setSuccessMsg(null)} />
    </div>
  )
}
