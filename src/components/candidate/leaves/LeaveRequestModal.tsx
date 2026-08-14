'use client'

import React, { useState, useMemo } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { requestLeaveAction } from '@/app/actions/leaves'
import {
  Palmtree,
  Stethoscope,
  HeartPulse,
  Banknote,
  AlertOctagon,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

export interface LeaveBalances {
  casualAllowed: number
  casualUsed: number
  sickAllowed: number
  sickUsed: number
  paidAllowed: number
  paidUsed: number
}

export interface LeaveRequestModalProps {
  isOpen: boolean
  balances: LeaveBalances
  onClose: () => void
  onSuccess?: () => void
}

const LEAVE_TYPES = [
  {
    id: 'casual',
    label: 'Casual Leave (CL)',
    icon: Palmtree,
    color: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10',
    key: 'casual',
  },
  {
    id: 'sick',
    label: 'Sick Leave (SL)',
    icon: Stethoscope,
    color: 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10',
    key: 'sick',
  },
  {
    id: 'paid',
    label: 'Paid Leave (PL)',
    icon: Banknote,
    color: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    key: 'paid',
  },
  {
    id: 'emergency',
    label: 'Emergency Leave',
    icon: HeartPulse,
    color: 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10',
    key: null,
  },
  {
    id: 'unpaid',
    label: 'Unpaid Leave (LWP)',
    icon: AlertOctagon,
    color: 'border-zinc-500/30 text-zinc-600 dark:text-zinc-400 bg-zinc-500/10',
    key: null,
  },
] as const

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  isOpen,
  balances,
  onClose,
  onSuccess,
}) => {
  const [leaveType, setLeaveType] = useState<'casual' | 'sick' | 'paid' | 'unpaid' | 'emergency'>('casual')
  
  const todayStr = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState<string>(todayStr)
  const [endDate, setEndDate] = useState<string>(todayStr)
  const [reason, setReason] = useState<string>('')
  const [isPending, setIsPending] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  // Calculate inclusive calendar days
  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 1
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }, [startDate, endDate])

  // Calculate remaining balance for the selected leave type
  const remainingForType = useMemo(() => {
    if (leaveType === 'casual') return Math.max(0, balances.casualAllowed - balances.casualUsed)
    if (leaveType === 'sick') return Math.max(0, balances.sickAllowed - balances.sickUsed)
    if (leaveType === 'paid') return Math.max(0, balances.paidAllowed - balances.paidUsed)
    return null
  }, [leaveType, balances])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate) {
      setErrorMsg('Please select both start and end dates.')
      return
    }

    if (totalDays <= 0) {
      setErrorMsg('End date must be on or after start date.')
      return
    }

    if (!reason.trim()) {
      setErrorMsg('Please provide a reason for taking leave.')
      return
    }

    setIsPending(true)
    setErrorMsg(null)

    const res = await requestLeaveAction({
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      total_days: totalDays,
      reason: reason.trim(),
    })

    setIsPending(false)

    if (res?.error) {
      setErrorMsg(res.error)
    } else {
      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        setReason('')
        setStartDate(todayStr)
        setEndDate(todayStr)
        onClose()
        if (onSuccess) onSuccess()
      }, 1500)
    }
  }

  const handleClose = () => {
    if (!isPending) {
      setErrorMsg(null)
      onClose()
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      title="Apply for Leave / Time-Off"
      onClose={handleClose}
    >
      {isSuccess ? (
        <div className="py-8 flex flex-col items-center justify-center text-center gap-3 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-[var(--md-sys-color-success-container)] text-[var(--md-sys-color-success)] flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">
            Leave Request Submitted!
          </h3>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-xs">
            Your request for {totalDays} day(s) has been routed to the administration for approval.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          {/* Leave Type Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">
              Leave Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {LEAVE_TYPES.map((lt) => {
                const Icon = lt.icon
                const isSelected = leaveType === lt.id
                let balanceBadge = null
                if (lt.id === 'casual') {
                  const rem = Math.max(0, balances.casualAllowed - balances.casualUsed)
                  balanceBadge = `${rem} left`
                } else if (lt.id === 'sick') {
                  const rem = Math.max(0, balances.sickAllowed - balances.sickUsed)
                  balanceBadge = `${rem} left`
                } else if (lt.id === 'paid') {
                  const rem = Math.max(0, balances.paidAllowed - balances.paidUsed)
                  balanceBadge = `${rem} left`
                }

                return (
                  <button
                    key={lt.id}
                    type="button"
                    onClick={() => setLeaveType(lt.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold shadow-xs'
                        : 'border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{lt.label}</span>
                    </div>
                    {balanceBadge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 font-bold ${
                        isSelected
                          ? 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-primary)]'
                          : 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]'
                      }`}>
                        {balanceBadge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="leave-start-date" className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                id="leave-start-date"
                type="date"
                required
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  if (e.target.value > endDate) {
                    setEndDate(e.target.value)
                  }
                }}
                className="h-10 px-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="leave-end-date" className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                id="leave-end-date"
                type="date"
                required
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
              />
            </div>
          </div>

          {/* Duration Summary Pill */}
          <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
              <span className="font-semibold text-[var(--md-sys-color-on-surface)]">
                Calculated Duration:
              </span>
            </div>
            <span className="text-xs font-black text-[var(--md-sys-color-primary)] font-mono">
              {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
            </span>
          </div>

          {/* Balance Exceeded Warning */}
          {remainingForType !== null && totalDays > remainingForType && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Note: You only have {remainingForType} {leaveType} day(s) remaining. Days beyond balance will be marked unpaid upon admin review.
              </span>
            </div>
          )}

          {/* Reason Textarea */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="leave-reason" className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">
              Reason / Explanation <span className="text-red-500">*</span>
            </label>
            <textarea
              id="leave-reason"
              rows={3}
              required
              placeholder="Provide context for your leave request (e.g. Doctor appointment, family function)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs focus:outline-none focus:border-[var(--md-sys-color-primary)] resize-none"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
            <Button
              type="button"
              variant="outlined"
              size="sm"
              disabled={isPending}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="filled"
              size="sm"
              isLoading={isPending}
            >
              Submit Application
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  )
}
