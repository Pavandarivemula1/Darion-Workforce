'use client'

import React, { useState, useTransition } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import {
  Users,
  Palmtree,
  Banknote,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  UserPlus,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react'
import { approveLeaveAction, rejectLeaveAction } from '@/app/actions/leaves'

export interface HRManagerDashboardProps {
  totalCandidates: number
  pendingLeaves: any[]
  unsettledPayrollAmount: number
  unpaidShiftsCount: number
  missingHourlyRateCount: number
  workingNowCount: number
}

export const HRManagerDashboard: React.FC<HRManagerDashboardProps> = ({
  totalCandidates,
  pendingLeaves: initialPendingLeaves,
  unsettledPayrollAmount,
  unpaidShiftsCount,
  missingHourlyRateCount,
  workingNowCount,
}) => {
  const [pendingLeaves, setPendingLeaves] = useState<any[]>(initialPendingLeaves || [])
  const [isPending, startTransition] = useTransition()
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)

  const handleApprove = (leaveId: string) => {
    startTransition(async () => {
      const res = await approveLeaveAction(leaveId, 'Approved via HR Dashboard')
      if (res.success) {
        setPendingLeaves((prev) => prev.filter((l) => l.id !== leaveId))
        setActionFeedback('Leave request approved successfully.')
        setTimeout(() => setActionFeedback(null), 4000)
      }
    })
  }

  const handleReject = (leaveId: string) => {
    startTransition(async () => {
      const res = await rejectLeaveAction(leaveId, 'Rejected via HR Dashboard')
      if (res.success) {
        setPendingLeaves((prev) => prev.filter((l) => l.id !== leaveId))
        setActionFeedback('Leave request rejected.')
        setTimeout(() => setActionFeedback(null), 4000)
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Feedback */}
      {actionFeedback && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {actionFeedback}
        </div>
      )}

      {/* HR Executive Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workforce */}
        <Card variant="outlined" className="p-4 rounded-3xl border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">Active Workforce</span>
            <div className="w-8 h-8 rounded-full bg-blue-500/15 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black font-mono text-[var(--md-sys-color-on-surface)]">{totalCandidates}</span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">
              {workingNowCount} currently on shift
            </span>
          </div>
        </Card>

        {/* Pending Leaves */}
        <Card variant="outlined" className="p-4 rounded-3xl border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">Pending Leaves</span>
            <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center">
              <Palmtree className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black font-mono text-amber-600">{pendingLeaves.length}</span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">
              Awaiting manager action
            </span>
          </div>
        </Card>

        {/* Unsettled Payroll Total */}
        <Card variant="outlined" className="p-4 rounded-3xl border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">Unpaid Shift Payroll</span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black font-mono text-emerald-600">₹{unsettledPayrollAmount.toLocaleString()}</span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">
              {unpaidShiftsCount} shifts ready for settlement
            </span>
          </div>
        </Card>

        {/* Data Hygiene / Missing Rates */}
        <Card variant="outlined" className="p-4 rounded-3xl border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">Rate Compliance</span>
            <div className="w-8 h-8 rounded-full bg-purple-500/15 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-black font-mono ${missingHourlyRateCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {missingHourlyRateCount === 0 ? '100%' : `${missingHourlyRateCount} Missing`}
            </span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">
              {missingHourlyRateCount > 0 ? 'Staff missing hourly rates' : 'All profiles have rates set'}
            </span>
          </div>
        </Card>
      </div>

      {/* Main 2-Column Content: Leave Approvals Queue & Payroll Cycle Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Leave Requests Queue */}
        <Card variant="outlined" className="p-5 rounded-3xl border-[var(--md-sys-color-outline-variant)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Palmtree className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">
                  Leave Applications Queue
                </h3>
              </div>
              <Link href="/admin/leaves" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {pendingLeaves.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] italic">
                  🎉 No pending leave applications to review.
                </div>
              ) : (
                pendingLeaves.slice(0, 4).map((leave) => (
                  <div
                    key={leave.id}
                    className="p-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-700 font-bold flex items-center justify-center text-xs">
                          {leave.candidateName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">{leave.candidateName}</p>
                          <span className="text-[10px] uppercase font-bold text-emerald-600">{leave.leave_type} Leave</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[var(--md-sys-color-on-surface-variant)]">
                        {leave.total_days} day(s)
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] line-clamp-1 italic">
                      "{leave.reason || 'No reason provided'}"
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--md-sys-color-outline-variant)] text-[11px]">
                      <span className="text-[var(--md-sys-color-on-surface-variant)]">
                        {leave.start_date} to {leave.end_date}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleReject(leave.id)}
                          disabled={isPending}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-red-600 hover:bg-red-500/10 cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(leave.id)}
                          disabled={isPending}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Payroll Readiness & Quick Settlement */}
        <Card variant="outlined" className="p-5 rounded-3xl border-[var(--md-sys-color-outline-variant)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">
                  Payroll Cycle Readiness
                </h3>
              </div>
              <Link href="/admin/payroll" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                Payroll Portal <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--md-sys-color-on-surface-variant)]">Unpaid Approved Shifts:</span>
                <span className="font-bold font-mono text-sm text-[var(--md-sys-color-on-surface)]">{unpaidShiftsCount} shifts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--md-sys-color-on-surface-variant)]">Total Pending Settlement:</span>
                <span className="font-extrabold font-mono text-base text-emerald-700 dark:text-emerald-300">
                  ₹{unsettledPayrollAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Quick Action Links */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Link
                href="/admin/candidates"
                className="p-3 rounded-2xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors flex items-center gap-2.5 text-xs font-bold text-[var(--md-sys-color-on-surface)]"
              >
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Onboard Staff</span>
              </Link>
              <Link
                href="/admin/payroll"
                className="p-3 rounded-2xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors flex items-center gap-2.5 text-xs font-bold text-[var(--md-sys-color-on-surface)]"
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>Batch Payout</span>
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--md-sys-color-outline-variant)] flex items-center justify-between text-xs">
            <span className="text-[var(--md-sys-color-on-surface-variant)]">Next Payroll Run:</span>
            <span className="font-bold text-[var(--md-sys-color-on-surface)]">Ready on Demand</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
