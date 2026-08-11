'use client'

import React, { useState, useEffect } from 'react'
import { startWorkAction, endWorkAction } from '@/app/actions/attendance'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Snackbar } from '@/components/ui/Snackbar'
import { Play, Square, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'

export interface AttendanceRecord {
  id: string
  user_id: string
  login_time: string
  logout_time: string | null
  created_at: string
}

export interface WorkStatusCardProps {
  activeSession: AttendanceRecord | null
  todaySession: AttendanceRecord | null
}

function calculateInitialDuration(
  activeSession: AttendanceRecord | null,
  todaySession: AttendanceRecord | null
): string {
  if (activeSession) {
    const start = new Date(activeSession.login_time).getTime()
    const now = new Date().getTime()
    const diffMs = Math.max(0, now - start)
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const secs = Math.floor((diffMs % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`
  }

  if (todaySession?.logout_time && todaySession?.login_time) {
    const start = new Date(todaySession.login_time).getTime()
    const end = new Date(todaySession.logout_time).getTime()
    const diffMs = Math.max(0, end - start)
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`
  }

  return '00h 00m'
}

export const WorkStatusCard: React.FC<WorkStatusCardProps> = ({
  activeSession,
  todaySession,
}) => {
  const [duration, setDuration] = useState<string>(() =>
    calculateInitialDuration(activeSession, todaySession)
  )
  const [isPending, setIsPending] = useState<boolean>(false)
  const [confirmDialog, setConfirmDialog] = useState<'start' | 'end' | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Live timer for active working session only
  useEffect(() => {
    if (!activeSession) {
      return
    }

    const updateTimer = () => {
      const start = new Date(activeSession.login_time).getTime()
      const now = new Date().getTime()
      const diffMs = Math.max(0, now - start)

      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000)

      setDuration(
        `${hours.toString().padStart(2, '0')}h ${mins
          .toString()
          .padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`
      )
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [activeSession])

  const handleStartWork = async () => {
    setIsPending(true)
    setErrorMsg(null)
    setConfirmDialog(null)
    const res = await startWorkAction()
    setIsPending(false)

    if (res?.error) {
      setErrorMsg(res.error)
    } else {
      setSuccessMsg('Work session started successfully.')
    }
  }

  const handleEndWork = async () => {
    setIsPending(true)
    setErrorMsg(null)
    setConfirmDialog(null)
    const res = await endWorkAction()
    setIsPending(false)

    if (res?.error) {
      setErrorMsg(res.error)
    } else {
      setSuccessMsg('Work session ended successfully.')
    }
  }

  // Format timestamp helper
  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '--:--'
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const isWorking = !!activeSession
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

            {/* Status Badge */}
            {isWorking ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Working
              </span>
            ) : isCompletedToday ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Shift Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]">
                <AlertCircle className="w-3.5 h-3.5" />
                Not Started
              </span>
            )}
          </div>

          {/* Time & Duration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)] flex flex-col gap-1">
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider font-medium">
                Started
              </span>
              <span className="text-lg font-bold">
                {formatTime(activeSession?.login_time || todaySession?.login_time)}
              </span>
            </div>

            <div className="p-4 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)] flex flex-col gap-1">
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider font-medium">
                Ended
              </span>
              <span className="text-lg font-bold">
                {formatTime(activeSession ? null : todaySession?.logout_time)}
              </span>
            </div>

            <div className="p-4 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex flex-col gap-1">
              <span className="text-xs opacity-80 uppercase tracking-wider font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Duration
              </span>
              <span className="text-lg font-bold font-mono">{duration}</span>
            </div>
          </div>

          {/* Action Buttons */}
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
            ) : (
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
            )}
          </div>
        </div>
      </Card>

      {/* Start Work Confirmation Dialog */}
      <Dialog
        isOpen={confirmDialog === 'start'}
        title="Start Work Session?"
        description="This will register your official shift login timestamp on the server."
        confirmLabel="Start Work"
        isLoading={isPending}
        onConfirm={handleStartWork}
        onClose={() => setConfirmDialog(null)}
      />

      {/* End Work Confirmation Dialog */}
      <Dialog
        isOpen={confirmDialog === 'end'}
        title="End Work Session?"
        description="Are you sure you want to end your work session? This will calculate your total shift duration."
        confirmLabel="End Work"
        variant="error"
        isLoading={isPending}
        onConfirm={handleEndWork}
        onClose={() => setConfirmDialog(null)}
      />

      {/* Notifications */}
      <Snackbar message={errorMsg} variant="error" onClose={() => setErrorMsg(null)} />
      <Snackbar message={successMsg} variant="success" onClose={() => setSuccessMsg(null)} />
    </div>
  )
}
