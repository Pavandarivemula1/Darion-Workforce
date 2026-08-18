'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { adminUpdateAttendanceAction, adminDeleteAttendanceAction } from '@/app/actions/admin'
import { Edit, Clock, Trash2, IndianRupee, Coffee, AlertCircle, AlertTriangle } from 'lucide-react'
import { formatDurationMs } from '@/lib/utils/timesheet'
import { SystemAttendanceItem } from '@/app/admin/attendance/AdminAttendanceClient'

export interface EditShiftModalProps {
  isOpen: boolean
  onClose: () => void
  record: SystemAttendanceItem | null
  hourlyRate?: number
  onSuccess?: () => void
  onError?: (err: string) => void
}

function getLocalDatetimeInputValue(dateString?: string | null): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  const pad = (n: number) => n.toString().padStart(2, '0')
  const yyyy = date.getFullYear()
  const MM = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const hh = pad(date.getHours())
  const mm = pad(date.getMinutes())
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`
}

export const EditShiftModal: React.FC<EditShiftModalProps> = ({
  isOpen,
  onClose,
  record,
  hourlyRate = 0,
  onSuccess,
  onError,
}) => {
  const [loginTime, setLoginTime] = useState<string>('')
  const [logoutTime, setLogoutTime] = useState<string>('')
  const [breakMinutes, setBreakMinutes] = useState<string>('0')
  const [payoutAmount, setPayoutAmount] = useState<string>('')
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [rejectionReason, setRejectionReason] = useState<string>('')
  const [adminNotes, setAdminNotes] = useState<string>('')
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [isUpdating, startUpdateTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()

  useEffect(() => {
    if (record && isOpen) {
      setLoginTime(getLocalDatetimeInputValue(record.login_time))
      setLogoutTime(getLocalDatetimeInputValue(record.logout_time))
      setBreakMinutes(String(Math.round((record.break_duration_seconds || 0) / 60)))
      setPayoutAmount(record.payout_amount !== null && record.payout_amount !== undefined ? String(record.payout_amount) : '')
      setApprovalStatus(record.approval_status || 'pending')
      setRejectionReason(record.rejection_reason || '')
      setAdminNotes('')
      setIsConfirmingDelete(false)
      setErrorMsg(null)
    }
  }, [record, isOpen])

  // Calculation Matrix Preview
  const calculation = React.useMemo(() => {
    if (!loginTime) return { grossMs: 0, breakMs: 0, netMs: 0, netHours: 0, autoPayout: 0 }

    const loginDate = new Date(loginTime)
    const logoutDate = logoutTime ? new Date(logoutTime) : null

    if (!logoutDate || isNaN(logoutDate.getTime()) || isNaN(loginDate.getTime())) {
      return { grossMs: 0, breakMs: 0, netMs: 0, netHours: 0, autoPayout: 0 }
    }

    const grossMs = Math.max(0, logoutDate.getTime() - loginDate.getTime())
    const breakMins = parseInt(breakMinutes || '0', 10)
    const breakMs = isNaN(breakMins) || breakMins < 0 ? 0 : breakMins * 60 * 1000
    const netMs = Math.max(0, grossMs - breakMs)
    const netHours = netMs / (1000 * 60 * 60)
    const autoPayout = Math.round(netHours * (hourlyRate || 0) * 100) / 100

    return { grossMs, breakMs, netMs, netHours, autoPayout }
  }, [loginTime, logoutTime, breakMinutes, hourlyRate])

  if (!record) return null

  const handleRecalculatePayout = () => {
    setPayoutAmount(calculation.autoPayout.toFixed(2))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const formData = new FormData()
    formData.append('attendanceId', record.id)
    if (loginTime) formData.append('loginTime', new Date(loginTime).toISOString())
    if (logoutTime) formData.append('logoutTime', new Date(logoutTime).toISOString())
    formData.append('breakDurationMinutes', breakMinutes)
    if (payoutAmount.trim()) formData.append('payoutAmount', payoutAmount.trim())
    formData.append('approvalStatus', approvalStatus)
    if (adminNotes.trim()) formData.append('adminNotes', adminNotes.trim())

    startUpdateTransition(async () => {
      const res = await adminUpdateAttendanceAction({ error: '', success: false }, formData)
      if (res.success) {
        onSuccess?.()
        onClose()
      } else if (res.error) {
        setErrorMsg(res.error)
        onError?.(res.error)
      }
    })
  }

  const handleDelete = () => {
    setErrorMsg(null)
    const formData = new FormData()
    formData.append('attendanceId', record.id)

    startDeleteTransition(async () => {
      const res = await adminDeleteAttendanceAction({ error: '', success: false }, formData)
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
      title="Edit Shift & Attendance Record"
      description={`Modify time entries, break durations, or pay calculations for ${record.candidateName}.`}
      hideFooter
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSave} className="flex flex-col gap-4 mt-1">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Delete Confirmation Banner */}
        {isConfirmingDelete && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex flex-col gap-2 animate-fade-in">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4" /> Are you sure you want to delete this shift?
            </div>
            <p className="text-[11px]">
              This action cannot be undone. It will remove this attendance entry from timesheets and payroll logs.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Button
                type="button"
                variant="filled"
                size="sm"
                className="bg-rose-600 text-white hover:bg-rose-700"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                Yes, Delete Shift
              </Button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-3 py-1 text-xs font-semibold text-[var(--md-sys-color-on-surface)] hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Candidate Info Header */}
        <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {record.candidateAvatarUrl ? (
              <img
                src={record.candidateAvatarUrl}
                alt={record.candidateName}
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center font-bold text-xs shrink-0">
                {record.candidateName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h4 className="font-bold text-sm leading-tight">{record.candidateName}</h4>
              <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                Rate: ₹{hourlyRate.toFixed(2)}/hr
              </p>
            </div>
          </div>
        </div>

        {/* Start and End Times */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Start Time (In)
            </label>
            <input
              type="datetime-local"
              value={loginTime}
              onChange={(e) => setLoginTime(e.target.value)}
              disabled={isUpdating || isDeleting}
              className="w-full h-11 px-3 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs font-mono focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> End Time (Out)
            </label>
            <input
              type="datetime-local"
              value={logoutTime}
              onChange={(e) => setLogoutTime(e.target.value)}
              disabled={isUpdating || isDeleting}
              className="w-full h-11 px-3 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs font-mono focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
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
          disabled={isUpdating || isDeleting}
          startIcon={<Coffee className="w-4 h-4" />}
        />

        {/* Calculated Matrix & Recalculate Button */}
        <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] flex items-center justify-between gap-2 text-xs font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-sans text-[var(--md-sys-color-on-surface-variant)]">Net Work Time</span>
            <span className="font-bold text-sm text-[var(--md-sys-color-primary)]">
              {formatDurationMs(calculation.netMs)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-sans text-[var(--md-sys-color-on-surface-variant)]">Auto Calculated Pay</span>
            <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
              ₹{calculation.autoPayout.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRecalculatePayout}
            className="px-2.5 py-1 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-[11px] font-sans font-semibold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
          >
            Apply Auto Pay
          </button>
        </div>

        {/* Payout Override & Approval Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField
            label="Payout Amount (₹)"
            type="number"
            step="0.01"
            min="0"
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
            disabled={isUpdating || isDeleting}
            startIcon={<IndianRupee className="w-4 h-4" />}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              Approval Status
            </label>
            <select
              value={approvalStatus}
              onChange={(e) => setApprovalStatus(e.target.value as 'pending' | 'approved' | 'rejected')}
              disabled={isUpdating || isDeleting}
              className="w-full h-11 px-3 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs font-medium focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
            >
              <option value="approved">Approved</option>
              <option value="pending">Pending Approval</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Admin Notes */}
        <TextField
          label="Admin Note / Audit Reason (Optional)"
          placeholder="e.g., Corrected logout time due to power outage"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          disabled={isUpdating || isDeleting}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--md-sys-color-outline-variant)] mt-2">
          {!isConfirmingDelete ? (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              disabled={isUpdating || isDeleting}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Shift
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating || isDeleting}
              className="px-4 h-10 rounded-full text-xs sm:text-sm font-semibold text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <Button
              type="submit"
              variant="filled"
              size="md"
              icon={<Edit className="w-4 h-4" />}
              isLoading={isUpdating}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  )
}
