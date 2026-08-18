'use client'

import React, { useState, useEffect, useTransition, useId } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { adminCreateManualShiftAction } from '@/app/actions/admin'
import { PlusCircle, Clock, User, Calendar, IndianRupee, Coffee, AlertCircle } from 'lucide-react'
import { formatDurationMs } from '@/lib/utils/timesheet'
import { CandidateOption } from './StartTimerModal'

export interface ManualShiftModalProps {
  isOpen: boolean
  onClose: () => void
  candidates: CandidateOption[]
  preselectedCandidateId?: string
  onSuccess?: () => void
  onError?: (err: string) => void
}

function getTodayDateString(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const MM = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${MM}-${dd}`
}

export const ManualShiftModal: React.FC<ManualShiftModalProps> = ({
  isOpen,
  onClose,
  candidates,
  preselectedCandidateId,
  onSuccess,
  onError,
}) => {
  const candidateSelectId = useId()
  const [selectedCandidate, setSelectedCandidate] = useState<string>(preselectedCandidateId || '')
  const [shiftDate, setShiftDate] = useState<string>(getTodayDateString())
  const [startTime, setStartTime] = useState<string>('09:00')
  const [endTime, setEndTime] = useState<string>('18:00')
  const [breakMinutes, setBreakMinutes] = useState<string>('0')
  const [customPayout, setCustomPayout] = useState<string>('')
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'pending'>('approved')
  const [adminNotes, setAdminNotes] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Reset fields when opening
  useEffect(() => {
    if (isOpen) {
      if (preselectedCandidateId) {
        setSelectedCandidate(preselectedCandidateId)
      } else if (candidates.length > 0 && !selectedCandidate) {
        setSelectedCandidate(candidates[0].id)
      }
      setShiftDate(getTodayDateString())
      setStartTime('09:00')
      setEndTime('18:00')
      setBreakMinutes('0')
      setCustomPayout('')
      setApprovalStatus('approved')
      setAdminNotes('')
      setErrorMsg(null)
    }
  }, [isOpen, preselectedCandidateId, candidates])

  const selectedCandidateObj = candidates.find((c) => c.id === selectedCandidate)
  const hourlyRate = selectedCandidateObj?.hourly_rate || 0

  // Calculate live shift totals
  const calculation = React.useMemo(() => {
    if (!shiftDate || !startTime || !endTime) {
      return { grossMs: 0, breakMs: 0, netMs: 0, netHours: 0, autoPayout: 0, isValid: false }
    }

    const startDateTime = new Date(`${shiftDate}T${startTime}`)
    const endDateTime = new Date(`${shiftDate}T${endTime}`)

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return { grossMs: 0, breakMs: 0, netMs: 0, netHours: 0, autoPayout: 0, isValid: false }
    }

    const grossMs = Math.max(0, endDateTime.getTime() - startDateTime.getTime())
    const breakMins = parseInt(breakMinutes || '0', 10)
    const breakMs = isNaN(breakMins) || breakMins < 0 ? 0 : breakMins * 60 * 1000
    const netMs = Math.max(0, grossMs - breakMs)
    const netHours = netMs / (1000 * 60 * 60)
    const autoPayout = Math.round(netHours * hourlyRate * 100) / 100
    const isValid = endDateTime.getTime() > startDateTime.getTime() && grossMs > breakMs

    return { grossMs, breakMs, netMs, netHours, autoPayout, isValid }
  }, [shiftDate, startTime, endTime, breakMinutes, hourlyRate])

  // Update payout text whenever calculation changes if user hasn't overridden
  useEffect(() => {
    if (calculation.isValid) {
      setCustomPayout(calculation.autoPayout.toFixed(2))
    }
  }, [calculation.autoPayout, calculation.isValid])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCandidate) {
      setErrorMsg('Please select a candidate.')
      return
    }

    if (!calculation.isValid) {
      setErrorMsg('End time must be later than start time and exceed break duration.')
      return
    }

    setErrorMsg(null)
    const startDateTime = new Date(`${shiftDate}T${startTime}`).toISOString()
    const endDateTime = new Date(`${shiftDate}T${endTime}`).toISOString()

    const formData = new FormData()
    formData.append('candidateId', selectedCandidate)
    formData.append('loginTime', startDateTime)
    formData.append('logoutTime', endDateTime)
    formData.append('breakDurationMinutes', breakMinutes)
    if (customPayout.trim()) {
      formData.append('payoutAmount', customPayout.trim())
    }
    formData.append('approvalStatus', approvalStatus)
    if (adminNotes.trim()) {
      formData.append('adminNotes', adminNotes.trim())
    }

    startTransition(async () => {
      const res = await adminCreateManualShiftAction({ error: '', success: false }, formData)
      if (res.success) {
        onSuccess?.()
        onClose()
      } else if (res.error) {
        setErrorMsg(res.error)
        onError?.(res.error)
      }
    })
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add Manual Shift / Log Hours"
      description="Record a completed past work session with custom hours and pay calculation."
      hideFooter
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-1">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Candidate Selector */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={candidateSelectId} className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Candidate
          </label>
          <select
            id={candidateSelectId}
            value={selectedCandidate}
            onChange={(e) => setSelectedCandidate(e.target.value)}
            disabled={isPending}
            className="w-full h-11 px-3 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs font-medium focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
            required
          >
            <option value="" disabled>
              Select Candidate...
            </option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} (₹{(c.hourly_rate || 0).toFixed(2)}/hr)
              </option>
            ))}
          </select>
        </div>

        {/* Date Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Shift Date
          </label>
          <input
            type="date"
            value={shiftDate}
            onChange={(e) => setShiftDate(e.target.value)}
            max={getTodayDateString()}
            disabled={isPending}
            className="w-full h-11 px-3 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs font-mono focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
            required
          />
        </div>

        {/* Start and End Times */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Start Time (In)
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={isPending}
              className="w-full h-11 px-3 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs font-mono focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> End Time (Out)
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={isPending}
              className="w-full h-11 px-3 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs font-mono focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
              required
            />
          </div>
        </div>

        {/* Break Duration in Minutes */}
        <TextField
          label="Break Duration (Minutes)"
          type="number"
          min="0"
          step="1"
          value={breakMinutes}
          onChange={(e) => setBreakMinutes(e.target.value)}
          disabled={isPending}
          startIcon={<Coffee className="w-4 h-4" />}
          supportingText="Unpaid break subtracted from gross duration"
        />

        {/* Calculation Preview Matrix */}
        <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-sans text-[var(--md-sys-color-on-surface-variant)]">Net Work Time</span>
            <span className="font-bold text-sm text-[var(--md-sys-color-primary)]">
              {formatDurationMs(calculation.netMs)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-sans text-[var(--md-sys-color-on-surface-variant)]">Hourly Rate</span>
            <span className="font-semibold text-sm">₹{hourlyRate.toFixed(2)}/hr</span>
          </div>
          <div className="flex flex-col col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-sans text-[var(--md-sys-color-on-surface-variant)]">Computed Pay</span>
            <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
              ₹{calculation.autoPayout.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payout Override & Approval Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField
            label="Payment Amount (₹)"
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
              <option value="approved">Approved</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>
        </div>

        {/* Admin Notes */}
        <TextField
          label="Admin Note / Audit Reason (Optional)"
          placeholder="e.g., Logged manual hours on candidate request"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          disabled={isPending}
        />

        {/* Actions */}
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
            icon={<PlusCircle className="w-4 h-4" />}
            isLoading={isPending}
          >
            Add Shift Record
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
