'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { adminEndWorkAction } from '@/app/actions/admin'
import { Square, Clock, AlertCircle, IndianRupee, Coffee, CheckCircle2 } from 'lucide-react'
import { formatDurationMs, formatBreakDuration } from '@/lib/utils/timesheet'
import { SystemAttendanceItem } from '@/app/admin/attendance/AdminAttendanceClient'

export interface StopTimerModalProps {
  isOpen: boolean
  onClose: () => void
  session: SystemAttendanceItem | null
  hourlyRate?: number
  onSuccess?: () => void
  onError?: (err: string) => void
}

function getLocalDatetimeInputValue(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const yyyy = date.getFullYear()
  const MM = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const hh = pad(date.getHours())
  const mm = pad(date.getMinutes())
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`
}

export const StopTimerModal: React.FC<StopTimerModalProps> = ({
  isOpen,
  onClose,
  session,
  hourlyRate = 0,
  onSuccess,
  onError,
}) => {
  const [mode, setMode] = useState<'now' | 'custom'>('now')
  const [customStopTime, setCustomStopTime] = useState<string>(getLocalDatetimeInputValue())
  const [breakMinutes, setBreakMinutes] = useState<string>('0')
  const [customPayout, setCustomPayout] = useState<string>('')
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'pending'>('approved')
  const [adminNotes, setAdminNotes] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Calculate default break minutes and reset on session change
  useEffect(() => {
    if (session && isOpen) {
      const now = new Date().getTime()
      let initialBreakSec = session.break_duration_seconds || 0
      if (session.break_start_time) {
        const bStart = new Date(session.break_start_time).getTime()
        initialBreakSec += Math.max(0, Math.floor((now - bStart) / 1000))
      }
      const initialMins = Math.round(initialBreakSec / 60)
      setBreakMinutes(String(initialMins))
      setMode('now')
      setCustomStopTime(getLocalDatetimeInputValue())
      setApprovalStatus('approved')
      setAdminNotes('')
      setErrorMsg(null)
    }
  }, [session, isOpen])

  // Compute live duration and auto payout calculation preview
  const calculation = React.useMemo(() => {
    if (!session) return { grossMs: 0, breakMs: 0, netMs: 0, netHours: 0, autoPayout: 0 }

    const loginDate = new Date(session.login_time)
    let logoutDate = new Date()
    if (mode === 'custom' && customStopTime) {
      const parsed = new Date(customStopTime)
      if (!isNaN(parsed.getTime())) {
        logoutDate = parsed
      }
    }

    const grossMs = Math.max(0, logoutDate.getTime() - loginDate.getTime())
    const breakMins = parseInt(breakMinutes || '0', 10)
    const breakMs = isNaN(breakMins) || breakMins < 0 ? 0 : breakMins * 60 * 1000
    const netMs = Math.max(0, grossMs - breakMs)
    const netHours = netMs / (1000 * 60 * 60)
    const autoPayout = Math.round(netHours * (hourlyRate || 0) * 100) / 100

    return { grossMs, breakMs, netMs, netHours, autoPayout }
  }, [session, mode, customStopTime, breakMinutes, hourlyRate])

  // Update payout placeholder or value
  useEffect(() => {
    if (isOpen && customPayout === '') {
      setCustomPayout(calculation.autoPayout.toFixed(2))
    }
  }, [calculation.autoPayout, isOpen, customPayout])

  if (!session) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const formData = new FormData()
    formData.append('attendanceId', session.id)
    if (mode === 'custom' && customStopTime) {
      formData.append('stopTime', new Date(customStopTime).toISOString())
    }
    formData.append('breakDurationMinutes', breakMinutes)
    if (customPayout.trim()) {
      formData.append('payoutAmount', customPayout.trim())
    }
    formData.append('approvalStatus', approvalStatus)
    if (adminNotes.trim()) {
      formData.append('adminNotes', adminNotes.trim())
    }

    startTransition(async () => {
      const res = await adminEndWorkAction({ error: '', success: false }, formData)
      if (res.success) {
        onSuccess?.()
        onClose()
      } else if (res.error) {
        setErrorMsg(res.error)
        onError?.(res.error)
      }
    })
  }

  const isOnBreak = !!session.break_start_time

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Stop Candidate Work Shift"
      description={`End active session for ${session.candidateName}.`}
      hideFooter
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-1">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Candidate & Live Session Badge */}
        <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {session.candidateAvatarUrl ? (
              <img
                src={session.candidateAvatarUrl}
                alt={session.candidateName}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center font-bold text-sm shrink-0">
                {session.candidateName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h4 className="font-bold text-sm leading-tight">{session.candidateName}</h4>
              <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                Started: {new Date(session.login_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </p>
            </div>
          </div>

          {isOnBreak ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Coffee className="w-3.5 h-3.5" /> On Break
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Working
            </span>
          )}
        </div>

        {/* Stop Timing Mode */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Stop Time
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('now')}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'now'
                  ? 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 font-bold'
                  : 'bg-[var(--md-sys-color-surface-container)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)]'
              }`}
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              Stop Now (Current)
            </button>
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'custom'
                  ? 'bg-[var(--md-sys-color-primary-container)] border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary-container)] font-bold'
                  : 'bg-[var(--md-sys-color-surface-container)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Custom Stop Time
            </button>
          </div>
        </div>

        {/* Custom Stop Time Input */}
        {mode === 'custom' && (
          <div className="flex flex-col gap-1.5 animate-fade-in">
            <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              Specify Shift End Date & Time
            </label>
            <input
              type="datetime-local"
              value={customStopTime}
              onChange={(e) => setCustomStopTime(e.target.value)}
              disabled={isPending}
              className="w-full h-11 px-3 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs font-mono focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
              required
            />
          </div>
        )}

        {/* Break Duration Adjustment */}
        <div className="flex flex-col gap-1.5">
          <TextField
            label="Total Break Duration (Minutes)"
            type="number"
            min="0"
            step="1"
            value={breakMinutes}
            onChange={(e) => setBreakMinutes(e.target.value)}
            disabled={isPending}
            startIcon={<Coffee className="w-4 h-4" />}
            supportingText="Auto-populated from recorded break sessions; editable"
          />
        </div>

        {/* Calculated Shift Summary Matrix */}
        <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-sans text-[var(--md-sys-color-on-surface-variant)]">Net Work Time</span>
            <span className="font-bold text-sm text-[var(--md-sys-color-primary)]">
              {formatDurationMs(calculation.netMs)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-sans text-[var(--md-sys-color-on-surface-variant)]">Calculated Daily Payout</span>
            <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
              ₹{calculation.autoPayout.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payout Override & Approval Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField
            label="Final Payout (₹)"
            type="number"
            step="0.01"
            min="0"
            value={customPayout}
            onChange={(e) => setCustomPayout(e.target.value)}
            disabled={isPending}
            startIcon={<IndianRupee className="w-4 h-4" />}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              Approval Status
            </label>
            <select
              value={approvalStatus}
              onChange={(e) => setApprovalStatus(e.target.value as 'approved' | 'pending')}
              disabled={isPending}
              className="w-full h-11 px-3 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs font-medium focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
            >
              <option value="approved">Approve Immediately</option>
              <option value="pending">Keep as Pending</option>
            </select>
          </div>
        </div>

        {/* Admin Notes */}
        <TextField
          label="Admin Note / Audit Reason (Optional)"
          placeholder="e.g., Manually ended at shift cutoff"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          disabled={isPending}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--md-sys-color-outline-variant)] mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 h-10 rounded-full text-xs sm:text-sm font-semibold text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            type="submit"
            variant="filled"
            size="md"
            className="bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800"
            icon={<Square className="w-4 h-4 fill-current" />}
            isLoading={isPending}
          >
            Stop Shift & Save
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
