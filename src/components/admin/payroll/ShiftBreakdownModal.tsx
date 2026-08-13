'use client'

import React, { useState, useTransition } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import {
  CandidatePayrollSummary,
  PayrollAttendanceRecord,
  formatINR,
  calculateNetShiftMs,
} from '@/lib/utils/payroll'
import { formatDurationMs, formatBreakDuration } from '@/lib/utils/timesheet'
import { markShiftPaymentStatusAction } from '@/app/actions/payroll'
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  IndianRupee,
  Coffee,
  Calendar,
} from 'lucide-react'

export interface ShiftBreakdownModalProps {
  isOpen: boolean
  onClose: () => void
  candidate: CandidatePayrollSummary | null
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export const ShiftBreakdownModal: React.FC<ShiftBreakdownModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onSuccess,
  onError,
}) => {
  const [isPending, startTransition] = useTransition()
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null)

  if (!candidate) return null

  const handleTogglePaymentStatus = (shift: PayrollAttendanceRecord, newStatus: string) => {
    setActiveShiftId(shift.id)
    startTransition(async () => {
      const formData = new FormData()
      formData.append('shiftId', shift.id)
      formData.append('paymentStatus', newStatus)
      if (newStatus === 'paid') {
        formData.append('paymentMethod', 'Manual Adjustment')
        formData.append('paymentReference', `MANUAL-${Date.now()}`)
      }

      const result = await markShiftPaymentStatusAction({}, formData)
      if (result.error) {
        onError(result.error)
      } else {
        onSuccess(`Shift payment status updated to ${newStatus}.`)
      }
      setActiveShiftId(null)
    })
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Itemized Shifts — ${candidate.fullName}`}
      maxWidth="max-w-4xl"
    >
      <div className="flex flex-col gap-4">
        {/* Subheader info banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[var(--md-sys-color-surface-container-high)] text-xs text-[var(--md-sys-color-on-surface)]">
          <div>
            <span className="font-bold">{candidate.fullName}</span> • Rate: <span className="font-semibold text-emerald-700 dark:text-emerald-400">{formatINR(candidate.hourlyRate)}/hr</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Total Shifts: <strong className="font-mono">{candidate.totalShifts}</strong></span>
            <span>Approved Time: <strong className="font-mono">{candidate.totalApprovedHours} hrs</strong></span>
            <span>Gross Value: <strong className="font-mono text-emerald-700 dark:text-emerald-400">{formatINR(candidate.totalGrossPayable)}</strong></span>
          </div>
        </div>

        {/* Shifts Table */}
        <div className="overflow-x-auto border border-[var(--md-sys-color-outline-variant)] rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--md-sys-color-surface-container-low)] border-b border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5">Date & Time</th>
                <th className="py-3 px-3">Duration & Break</th>
                <th className="py-3 px-3">Shift Payout</th>
                <th className="py-3 px-3">Approval</th>
                <th className="py-3 px-3">Payment Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)]">
              {candidate.records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--md-sys-color-on-surface-variant)]">
                    No shift records found for this candidate in the selected period.
                  </td>
                </tr>
              ) : (
                candidate.records.map((r) => {
                  const netMs = calculateNetShiftMs(r.login_time, r.logout_time, r.break_duration_seconds)
                  const hours = netMs / (1000 * 60 * 60)
                  const payout = typeof r.payout_amount === 'number' && r.payout_amount >= 0 
                    ? r.payout_amount 
                    : Math.round(hours * candidate.hourlyRate * 100) / 100

                  const loginD = new Date(r.login_time)
                  const logoutD = r.logout_time ? new Date(r.logout_time) : null

                  const isShiftPending = isPending && activeShiftId === r.id

                  return (
                    <tr key={r.id} className="hover:bg-[var(--md-sys-color-surface-container-high)]/50 transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-xs text-[var(--md-sys-color-on-surface)]">
                          {loginD.toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-mono flex items-center gap-1.5 mt-0.5">
                          <span>{loginD.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>→</span>
                          <span>{logoutD ? logoutD.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'In Progress'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono font-semibold text-xs">
                          {formatDurationMs(netMs)}
                        </div>
                        {r.break_duration_seconds && r.break_duration_seconds > 0 ? (
                          <div className="text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                            <Coffee className="w-3 h-3" />
                            <span>Break: {formatBreakDuration(r.break_duration_seconds)}</span>
                          </div>
                        ) : null}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
                          {formatINR(payout)}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {r.approval_status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {r.approval_status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                        {r.approval_status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-700 dark:text-red-300">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {r.payment_status === 'paid' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                              Paid
                            </span>
                            {r.payment_reference && (
                              <div className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-mono mt-0.5 truncate max-w-[120px]" title={r.payment_reference}>
                                {r.payment_reference}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                            Unpaid
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        {r.approval_status === 'approved' && (
                          <button
                            disabled={isShiftPending}
                            onClick={() => handleTogglePaymentStatus(r, r.payment_status === 'paid' ? 'unpaid' : 'paid')}
                            className="px-2.5 py-1 rounded text-[11px] font-semibold border border-[var(--md-sys-color-outline)] hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] cursor-pointer transition-colors"
                          >
                            {isShiftPending ? 'Updating...' : r.payment_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-end pt-2">
          <Button variant="outlined" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
