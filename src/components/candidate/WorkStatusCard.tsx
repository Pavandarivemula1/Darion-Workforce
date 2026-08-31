'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
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
  CheckSquare,
} from 'lucide-react'
import { formatINR } from '@/lib/utils/payroll'
import { useBranding } from '@/components/providers/BrandingProvider'
import {
  type ShiftConfig,
  DEFAULT_FALLBACK_SHIFT,
  getShiftWindowDates,
  getShiftEndTimeForSession,
  formatShiftTime,
} from '@/lib/utils/shift'
import { calculatePunctualityStatus } from '@/lib/utils/punctuality'
import { PunctualityBadge } from '@/components/ui/PunctualityBadge'
import { ShiftFeedbackDialog } from './ShiftFeedbackDialog'

export interface AttendanceRecord {
  id: string
  user_id: string
  login_time: string
  logout_time: string | null
  break_start_time?: string | null
  break_duration_seconds?: number
  is_auto_cutoff?: boolean
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
  const branding = useBranding()
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
      const endTime = getShiftEndTimeForSession(activeSession.login_time, assignedShift)
      
      if (
        assignedShift.auto_logout_enabled &&
        now >= endTime.getTime() &&
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
    const setFavicon = (status: string) => {
      const cacheBuster = Date.now()
      const iconUrl = `/api/favicon?status=${status}&t=${cacheBuster}`
      
      // Remove all existing favicons to force browser to use the new one
      const existingLinks = document.querySelectorAll("link[rel~='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']")
      existingLinks.forEach(link => link.remove())
      
      const newLink = document.createElement('link')
      newLink.rel = 'icon'
      newLink.type = 'image/svg+xml'
      newLink.href = iconUrl
      document.head.appendChild(newLink)

      const appleLink = document.createElement('link')
      appleLink.rel = 'apple-touch-icon'
      appleLink.href = iconUrl
      document.head.appendChild(appleLink)
    }

    const brandTitle = branding.appTitle || 'Workforce'
    if (activeSession) {
      if (isOnBreak) {
        document.title = `On Break | ${brandTitle}`
        setFavicon('break')
      } else {
        document.title = `${workDuration} | ${brandTitle}`
        if (localOvershiftStatus === 'approved') {
          setFavicon('overshift')
        } else {
          setFavicon('active')
        }
      }
    } else {
      document.title = brandTitle
      setFavicon('offline')
    }

    return () => {
      document.title = brandTitle
      // Optional: We could reset it here, but keeping it consistent with offline is fine
      // setFavicon('offline')
    }
  }, [activeSession, isOnBreak, workDuration, localOvershiftStatus, branding.appTitle])

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
    <div className="flex flex-col gap-2.5 sm:gap-4 w-full">
      <Card variant="elevated" className="border border-[var(--md-sys-color-outline-variant)] shadow-2xs p-3 sm:p-5">
        <div className="flex flex-col gap-2.5 sm:gap-4">
          {/* Header Status Row */}
          <div className="flex items-center justify-between gap-2 pb-2 sm:pb-3 border-b border-[var(--md-sys-color-outline-variant)]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold font-mono text-[var(--md-sys-color-primary)] text-sm sm:text-base tracking-tight shrink-0" suppressHydrationWarning>
                {liveTime}
              </span>
              <span className="text-[var(--md-sys-color-outline-variant)] hidden xs:inline">•</span>
              <span className="text-[11px] sm:text-xs text-[var(--md-sys-color-on-surface-variant)] truncate hidden xs:inline" suppressHydrationWarning>
                {new Date().toLocaleDateString('en-US', {
                  timeZone: 'Asia/Kolkata',
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            {/* Status & Punctuality Badge */}
            <div className="flex items-center gap-1.5 shrink-0">
              {(activeSession || todaySession) && (
                (() => {
                  const s = activeSession || todaySession!
                  const p = calculatePunctualityStatus(s.login_time, s.logout_time, assignedShift, s.is_auto_cutoff)
                  return (
                    <PunctualityBadge
                      loginStatus={p.loginStatus}
                      loginText={p.loginBadgeText}
                      logoutStatus={p.logoutStatus}
                      logoutText={p.logoutBadgeText}
                      isAutoCutoff={s.is_auto_cutoff}
                      isStale={p.isStale}
                      staleHours={p.staleHours}
                    />
                  )
                })()
              )}

              {isOnBreak ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-[var(--md-sys-color-warning-container)] text-[var(--md-sys-color-on-warning-container)] animate-pulse">
                  <Coffee className="w-3 h-3" />
                  On Break
                </span>
              ) : isWorking ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-primary)]" />
                  Working
                </span>
              ) : isCompletedToday ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-[var(--md-sys-color-success-container)] text-[var(--md-sys-color-on-success-container)]">
                  <CheckCircle2 className="w-3 h-3" />
                  Done
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
                  <AlertCircle className="w-3 h-3" />
                  Not Started
                </span>
              )}

              {!isWorking && !isCompletedToday && timeToNextShift && (
                <span className="text-[10px] font-mono text-[var(--md-sys-color-on-surface-variant)] hidden sm:inline-flex items-center gap-1">
                  In <strong className="text-[var(--md-sys-color-primary)]">{timeToNextShift}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Shift Timing Sub-Banner */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-[var(--md-sys-color-on-surface-variant)] px-0.5">
            <span className="inline-flex items-center gap-1 truncate">
              {assignedShift.is_overnight ? (
                <Moon className="w-3 h-3 text-indigo-500 shrink-0" />
              ) : (
                <Sun className="w-3 h-3 text-amber-500 shrink-0" />
              )}
              <strong className="text-[var(--md-sys-color-on-surface)] truncate">{assignedShift.name}</strong>
              <span className="opacity-80">({formatShiftTime(assignedShift.start_time)} – {formatShiftTime(assignedShift.end_time)})</span>
            </span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 shrink-0 text-xs sm:text-sm">
              ₹{Math.round(liveDailyPay)}
            </span>
          </div>

          {/* Mobile Micro-Stat Ribbon (4 dense cells) / Desktop 5-Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 sm:gap-2.5 p-1 sm:p-0 rounded-xl bg-[var(--md-sys-color-surface-container-low)] sm:bg-transparent border sm:border-0 border-[var(--md-sys-color-outline-variant)] text-center">
            {/* Cell 1: Started */}
            <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl sm:bg-[var(--md-sys-color-surface-container)] sm:border sm:border-[var(--md-sys-color-outline-variant)] flex flex-col">
              <span className="text-[9px] sm:text-[10px] text-[var(--md-sys-color-on-surface-variant)] uppercase font-semibold block">
                Started
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono truncate">
                {formatTime(activeSession?.login_time || todaySession?.login_time)}
              </span>
            </div>

            {/* Cell 2: Break */}
            <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 sm:border sm:border-amber-500/30 flex flex-col">
              <span className="text-[9px] sm:text-[10px] uppercase font-semibold block">
                Break
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono truncate" suppressHydrationWarning>
                {breakDurationText}
              </span>
            </div>

            {/* Cell 3: Net Work */}
            <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] sm:border sm:border-[var(--md-sys-color-outline-variant)] flex flex-col">
              <span className="text-[9px] sm:text-[10px] uppercase font-semibold block">
                Net Work
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono truncate" suppressHydrationWarning>{workDuration}</span>
            </div>

            {/* Cell 4: Pay (Mobile) / Ended (Desktop) */}
            <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 sm:hidden flex flex-col">
              <span className="text-[9px] uppercase font-bold block">
                Today Pay
              </span>
              <span className="text-xs font-black font-mono truncate" suppressHydrationWarning>
                ₹{Math.round(liveDailyPay)}
              </span>
            </div>

            {/* Cell 4 (Desktop): Ended */}
            <div className="hidden sm:flex p-2.5 rounded-xl bg-[var(--md-sys-color-surface-container)] flex-col border border-[var(--md-sys-color-outline-variant)]">
              <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] uppercase font-semibold block">
                Ended
              </span>
              <span className="text-sm font-bold font-mono truncate">
                {formatTime(activeSession ? null : todaySession?.logout_time)}
              </span>
            </div>

            {/* Cell 5 (Desktop): Today Pay */}
            <div className="hidden sm:flex p-2.5 rounded-xl bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 flex-col border border-emerald-500/30">
              <span className="text-[10px] uppercase font-bold block">
                Today&apos;s Pay
              </span>
              <span className="text-sm font-black font-mono truncate" suppressHydrationWarning>
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
                {isCompletedToday && (
                  <Link href="/candidate/tasks" className="w-full">
                    <Button
                      variant="filled"
                      size="lg"
                      className="w-full !bg-emerald-600 hover:!bg-emerald-700 !text-white"
                      icon={<CheckSquare className="w-5 h-5" />}
                    >
                      Log Daily Tasks
                    </Button>
                  </Link>
                )}
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
