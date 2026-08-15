'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  startWorkAction,
  startBreakAction,
  endBreakAction,
  endWorkAction,
} from '@/app/actions/attendance'
import { requestOvershiftAction } from '@/app/actions/overshift'
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
  IndianRupee,
  Moon,
  Sun,
} from 'lucide-react'
import { formatINR } from '@/lib/utils/payroll'
import {
  type ShiftConfig,
  DEFAULT_FALLBACK_SHIFT,
  getShiftWindowDates,
  getShiftEndTimeForSession,
  formatShiftTime,
} from '@/lib/utils/shift'
import { ShiftFeedbackDialog } from './ShiftFeedbackDialog'

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
  overshiftStatus?: string | null
  hourlyRate?: number
  todayPayoutAmount?: number
  assignedShift?: ShiftConfig
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
  overshiftStatus,
  hourlyRate = 0,
  todayPayoutAmount = 0,
  assignedShift = DEFAULT_FALLBACK_SHIFT,
}) => {
  const [workDuration, setWorkDuration] = useState<string>(() =>
    calculateInitialWorkDuration(activeSession, todaySession)
  )
  const [breakDurationText, setBreakDurationText] = useState<string>('0m 00s')
  const [liveDailyPay, setLiveDailyPay] = useState<number>(() => {
    if (todayPayoutAmount && todayPayoutAmount > 0) return todayPayoutAmount
    if (todaySession?.logout_time && todaySession?.login_time) {
      const gross = Math.max(0, new Date(todaySession.logout_time).getTime() - new Date(todaySession.login_time).getTime())
      const net = Math.max(0, gross - (todaySession.break_duration_seconds || 0) * 1000)
      return Math.round((net / (1000 * 60 * 60)) * hourlyRate * 100) / 100
    }
    return 0
  })
  const [isPending, setIsPending] = useState<boolean>(false)
  const [confirmDialog, setConfirmDialog] = useState<
    'start' | 'startBreak' | 'endBreak' | 'end' | 'requestOvershift' | null
  >(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [overshiftPending, setOvershiftPending] = useState<boolean>(false)
  const [localOvershiftStatus, setLocalOvershiftStatus] = useState<string | null>(overshiftStatus || null)
  const [timeToNextShift, setTimeToNextShift] = useState<string | null>(null)
  const [isWithinRegularHours, setIsWithinRegularHours] = useState(true)
  const [liveTime, setLiveTime] = useState<string>('')
  const [scheduledDate, setScheduledDate] = useState<string>('')
  const [showShiftFeedback, setShowShiftFeedback] = useState<boolean>(false)
  const [feedbackSessionId, setFeedbackSessionId] = useState<string | null>(null)
  const isAutoEndingRef = useRef(false)

  useEffect(() => {
    const updateClock = () => {
      setLiveTime(
        new Date().toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
    }
    updateClock()
    const intv = setInterval(updateClock, 1000)
    return () => clearInterval(intv)
  }, [])

  const isOnBreak = !!activeSession?.break_start_time
  const isWorking = !!activeSession

  // Live Timers Effect
  useEffect(() => {
    if (!activeSession) {
      isAutoEndingRef.current = false
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

      // Realtime auto pay calculation
      const curHours = netMs / (1000 * 60 * 60)
      const curPay = Math.round(curHours * hourlyRate * 100) / 100
      setLiveDailyPay(curPay)

      // Dynamic Auto stop logic based on candidate's assigned shift
      const nowKolkata = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
      const endTime = getShiftEndTimeForSession(activeSession.login_time, assignedShift)
      
      if (
        assignedShift.auto_logout_enabled &&
        nowKolkata.getTime() >= endTime.getTime() &&
        localOvershiftStatus !== 'approved' &&
        !isAutoEndingRef.current
      ) {
        isAutoEndingRef.current = true
        setIsPending(true)
        const currentSessionId = activeSession.id
        endWorkAction().then(res => {
          setIsPending(false)
          if (res?.error) setErrorMsg(res.error)
          else {
            setSuccessMsg(`Shift completed. Ended automatically at scheduled end time (${formatShiftTime(assignedShift.end_time)}).`)
            setFeedbackSessionId(currentSessionId)
            setShowShiftFeedback(true)
          }
        }).catch(() => {
          setIsPending(false)
          setErrorMsg('Failed to auto-end shift.')
        })
      }
    }

    updateTimers()
    const interval = setInterval(updateTimers, 1000)
    return () => clearInterval(interval)
  }, [activeSession, localOvershiftStatus, assignedShift, hourlyRate])

  useEffect(() => {
    const setFavicon = (color: string) => {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${color}"/><g stroke="white" stroke-width="5" fill="none"><path d="M5,50 h90 M14,25 h72 M14,75 h72" /><path d="M50,0 v100" /><path d="M50,0 A 30,50 0 0,1 50,100" /><path d="M50,0 A 30,50 0 0,0 50,100" /><circle cx="50" cy="50" r="47.5" /></g></svg>`
      link.href = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
    }

    if (activeSession) {
      if (isOnBreak) {
        document.title = `On Break | Darion Workforce`
        setFavicon('#F59E0B') // Amber/Orange
      } else {
        document.title = `${workDuration} | Darion Workforce`
        if (localOvershiftStatus === 'approved') {
          setFavicon('#3B82F6') // Blue
        } else {
          setFavicon('#10B981') // Green
        }
      }
    } else {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
      if (link) {
        link.href = '/icon.svg'
      }
    }
  }, [workDuration, isOnBreak, activeSession, localOvershiftStatus])

  useEffect(() => {
    const checkShift = () => {
      const { isWithinWindow, formattedTimeUntilStart } = getShiftWindowDates(assignedShift)
      setIsWithinRegularHours(isWithinWindow)
      setTimeToNextShift(formattedTimeUntilStart)
    }
    
    checkShift()
    const intv = setInterval(checkShift, 10000)
    return () => clearInterval(intv)
  }, [assignedShift])

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
    const currentSessionId = activeSession?.id || null
    setIsPending(true)
    setErrorMsg(null)
    setConfirmDialog(null)
    const res = await endWorkAction()
    setIsPending(false)

    if (res?.error) setErrorMsg(res.error)
    else {
      setSuccessMsg('Work session ended successfully.')
      setFeedbackSessionId(currentSessionId)
      setShowShiftFeedback(true)
    }
  }

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '--:--'
    return new Date(isoString).toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const handleRequestOvershift = async (type: 'now' | 'later') => {
    setOvershiftPending(true)
    setErrorMsg(null)
    setConfirmDialog(null)
    
    let dateToRequest = ''
    if (type === 'now') {
      dateToRequest = new Date().toLocaleString('en-CA', { timeZone: 'Asia/Kolkata' }).split(',')[0].split(' ')[0]
    } else {
      if (!scheduledDate) {
        setErrorMsg('Please select a date for the scheduled overshift.')
        setOvershiftPending(false)
        return
      }
      dateToRequest = scheduledDate
    }

    const res = await requestOvershiftAction(dateToRequest, type)
    setOvershiftPending(false)
    
    if (res?.error) setErrorMsg(res.error)
    else {
      setSuccessMsg(`Overshift requested successfully for ${dateToRequest}.`)
      setLocalOvershiftStatus('pending')
      setScheduledDate('')
    }
  }

  const isCompletedToday = !isWorking && !!todaySession?.logout_time
  const requiresOvershift = isCompletedToday || !isWithinRegularHours
  const canStartWork = !requiresOvershift || localOvershiftStatus === 'approved'

  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full">
      <Card variant="elevated" className="border border-[var(--md-sys-color-outline-variant)] shadow-xs">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Header Status Row */}
          <div className="flex items-start sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-[var(--md-sys-color-outline-variant)]">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[var(--md-sys-color-on-surface)]">
                <Calendar className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
                <span className="truncate" suppressHydrationWarning>
                  {new Date().toLocaleDateString('en-US', {
                    timeZone: 'Asia/Kolkata',
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-[var(--md-sys-color-outline-variant)]">•</span>
                <span className="font-bold font-mono text-[var(--md-sys-color-primary)] text-sm sm:text-base tracking-tight" suppressHydrationWarning>
                  {liveTime}
                </span>
              </div>

              {/* Assigned Shift Pill */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] truncate max-w-full">
                  {assignedShift.is_overnight ? (
                    <Moon className="w-3 h-3 text-indigo-500 shrink-0" />
                  ) : (
                    <Sun className="w-3 h-3 text-amber-500 shrink-0" />
                  )}
                  <span className="truncate">
                    <strong>{assignedShift.name}</strong> ({formatShiftTime(assignedShift.start_time)} – {formatShiftTime(assignedShift.end_time)})
                  </span>
                </span>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              {isOnBreak ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-[var(--md-sys-color-warning-container)] text-[var(--md-sys-color-on-warning-container)] animate-pulse">
                  <Coffee className="w-3.5 h-3.5" />
                  On Break
                </span>
              ) : isWorking ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)]" />
                  Working
                </span>
              ) : isCompletedToday ? (
                <span className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-[var(--md-sys-color-success-container)] text-[var(--md-sys-color-on-success-container)]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Not Started
                </span>
              )}

              {!isWorking && !isCompletedToday && timeToNextShift && (
                <span className="text-[10px] sm:text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[var(--md-sys-color-primary)] shrink-0" />
                  In <strong className="text-[var(--md-sys-color-primary)]">{timeToNextShift}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Time & Duration Grid - High Density Responsive Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--md-sys-color-surface-container)] flex flex-col gap-0.5 border border-[var(--md-sys-color-outline-variant)]">
              <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider font-semibold">
                Started
              </span>
              <span className="text-sm sm:text-base font-bold font-mono">
                {formatTime(activeSession?.login_time || todaySession?.login_time)}
              </span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--md-sys-color-surface-container)] flex flex-col gap-0.5 border border-[var(--md-sys-color-outline-variant)]">
              <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider font-semibold">
                Ended
              </span>
              <span className="text-sm sm:text-base font-bold font-mono">
                {formatTime(activeSession ? null : todaySession?.logout_time)}
              </span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--md-sys-color-warning-container)] text-[var(--md-sys-color-on-warning-container)] flex flex-col gap-0.5 border border-[var(--md-sys-color-outline-variant)]">
              <span className="text-[10px] opacity-90 uppercase tracking-wider font-semibold flex items-center gap-1">
                <Coffee className="w-3 h-3" /> Break
              </span>
              <span className="text-sm sm:text-base font-bold font-mono">
                {breakDurationText}
              </span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex flex-col gap-0.5 border border-[var(--md-sys-color-outline-variant)]">
              <span className="text-[10px] opacity-80 uppercase tracking-wider font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" /> Net Work
              </span>
              <span className="text-sm sm:text-base font-bold font-mono truncate">{workDuration}</span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-2.5 sm:p-3 rounded-xl bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 flex flex-col gap-0.5 border border-emerald-500/30">
              <span className="text-[10px] opacity-90 uppercase tracking-wider font-bold flex items-center gap-1">
                <IndianRupee className="w-3 h-3" /> Today&apos;s Pay
              </span>
              <span className="text-sm sm:text-base font-black font-mono">
                {formatINR(liveDailyPay)}
              </span>
            </div>
          </div>


          {/* Action Buttons Row */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            {!isWorking ? (
              <div className="w-full flex flex-col sm:flex-row gap-3">
                <Button
                  variant="filled"
                  size="lg"
                  className="w-full"
                  icon={<Play className="w-5 h-5 fill-current" />}
                  isLoading={isPending}
                  disabled={!canStartWork}
                  onClick={() => setConfirmDialog('start')}
                >
                  {isCompletedToday && localOvershiftStatus === 'approved'
                    ? 'Start Overshift'
                    : isCompletedToday
                    ? 'Shift Finished Today'
                    : 'Start Work'}
                </Button>
                {requiresOvershift && localOvershiftStatus !== 'approved' && (
                  <Button
                    variant="outlined"
                    size="lg"
                    className="w-full"
                    isLoading={overshiftPending}
                    disabled={localOvershiftStatus === 'pending'}
                    onClick={() => setConfirmDialog('requestOvershift')}
                  >
                    {localOvershiftStatus === 'pending'
                      ? 'Overshift Pending'
                      : localOvershiftStatus === 'rejected'
                      ? 'Overshift Rejected'
                      : timeToNextShift
                      ? `Req Overshift (or wait ${timeToNextShift})`
                      : 'Request Overshift'}
                  </Button>
                )}
              </div>
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
        confirmLabel={isPending ? 'Clocking In...' : 'Start Work'}
        isLoading={isPending}
        onConfirm={handleStartWork}
        onClose={() => setConfirmDialog(null)}
      />

      <Dialog
        isOpen={confirmDialog === 'startBreak'}
        title="Take a Break?"
        description="Your active work timer will pause while you are on break. Break duration is automatically excluded from your net working hours."
        confirmLabel={isPending ? 'Starting Break...' : 'Take Break'}
        isLoading={isPending}
        onConfirm={handleStartBreak}
        onClose={() => setConfirmDialog(null)}
      />

      <Dialog
        isOpen={confirmDialog === 'endBreak'}
        title="End Break?"
        description="Your break duration will be recorded and your net work timer will resume."
        confirmLabel={isPending ? 'Resuming Work...' : 'Resume Work'}
        isLoading={isPending}
        onConfirm={handleEndBreak}
        onClose={() => setConfirmDialog(null)}
      />

      <Dialog
        isOpen={confirmDialog === 'end'}
        title="End Work Session?"
        description="Are you sure you want to end your work session? This will calculate your final net working hours."
        confirmLabel={isPending ? 'Ending Work...' : 'End Work'}
        variant="error"
        isLoading={isPending}
        onConfirm={handleEndWork}
        onClose={() => setConfirmDialog(null)}
      />

      <Dialog
        isOpen={confirmDialog === 'requestOvershift'}
        title="Request Overshift"
        onClose={() => setConfirmDialog(null)}
      >
        <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mb-4">
          You can request to start working right now, or schedule an overshift for a future date. This requires an Admin's approval.
        </p>

        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Overshift Now</h4>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
              Request to start working immediately today.
            </p>
            <Button
              variant="filled"
              size="md"
              className="w-full"
              isLoading={overshiftPending}
              onClick={() => handleRequestOvershift('now')}
            >
              Request for Today
            </Button>
          </div>

          <div className="p-4 rounded-xl border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Schedule for Later</h4>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
              Request an overshift for a future date.
            </p>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="h-10 px-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-sm focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
            />
            <Button
              variant="outlined"
              size="md"
              className="w-full"
              isLoading={overshiftPending}
              disabled={!scheduledDate}
              onClick={() => handleRequestOvershift('later')}
            >
              Schedule Request
            </Button>
          </div>
        </div>
      </Dialog>

      <ShiftFeedbackDialog
        isOpen={showShiftFeedback}
        attendanceId={feedbackSessionId}
        onClose={() => setShowShiftFeedback(false)}
      />

      <Snackbar message={errorMsg} variant="error" onClose={() => setErrorMsg(null)} />
      <Snackbar message={successMsg} variant="success" onClose={() => setSuccessMsg(null)} />
    </div>
  )
}
