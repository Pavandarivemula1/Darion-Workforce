'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Timer,
  IndianRupee,
} from 'lucide-react'
import { formatINR } from '@/lib/utils/payroll'

export interface PayrollSummaryCardsProps {
  totalTodayPay: number
  todayShiftsCount: number
  totalDue: number
  totalPaid: number
  totalPendingApproval: number
  totalCandidates: number
  totalApprovedHours: number
  payeesWithDueCount: number
}

export const PayrollSummaryCards: React.FC<PayrollSummaryCardsProps> = ({
  totalTodayPay,
  todayShiftsCount,
  totalDue,
  totalPaid,
  totalPendingApproval,
  totalCandidates,
  totalApprovedHours,
  payeesWithDueCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Today's Pay Count */}
      <Card
        variant="elevated"
        className="flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-5 bg-[var(--md-sys-color-surface)] shadow-2xs hover:shadow-xs transition-shadow"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
            Today&apos;s Pay
          </span>
          <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--md-sys-color-on-surface)] tracking-tight font-mono">
            {formatINR(totalTodayPay)}
          </div>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 truncate">
            {todayShiftsCount} {todayShiftsCount === 1 ? 'Shift' : 'Shifts'} Logged Today
          </p>
        </div>
      </Card>

      {/* 2. Total Payout Due */}
      <Card
        variant="elevated"
        className="flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-5 bg-[var(--md-sys-color-surface)] shadow-2xs hover:shadow-xs transition-shadow"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
            Total Payout Due
          </span>
          <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--md-sys-color-on-surface)] tracking-tight font-mono">
            {formatINR(totalDue)}
          </div>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 truncate">
            {payeesWithDueCount} {payeesWithDueCount === 1 ? 'Candidate' : 'Candidates'} Awaiting
          </p>
        </div>
      </Card>

      {/* 3. Settled / Paid */}
      <Card
        variant="elevated"
        className="flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-5 bg-[var(--md-sys-color-surface)] shadow-2xs hover:shadow-xs transition-shadow"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
            Settled / Paid
          </span>
          <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--md-sys-color-on-surface)] tracking-tight font-mono">
            {formatINR(totalPaid)}
          </div>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 truncate">
            Disbursed in Period
          </p>
        </div>
      </Card>

      {/* 4. Pending Shift Approvals */}
      <Card
        variant="elevated"
        className="flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-5 bg-[var(--md-sys-color-surface)] shadow-2xs hover:shadow-xs transition-shadow"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
            Pending Approval
          </span>
          <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--md-sys-color-on-surface)] tracking-tight font-mono">
            {formatINR(totalPendingApproval)}
          </div>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 truncate">
            Unreviewed Shifts
          </p>
        </div>
      </Card>

      {/* 5. Billable Hours & Candidates */}
      <Card
        variant="elevated"
        className="flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-5 bg-[var(--md-sys-color-surface)] shadow-2xs hover:shadow-xs transition-shadow"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
            Approved Hours
          </span>
          <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center">
            <Timer className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--md-sys-color-on-surface)] tracking-tight font-mono">
            {totalApprovedHours.toFixed(1)} <span className="text-sm font-medium font-sans">hrs</span>
          </div>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 truncate">
            {totalCandidates} Candidates Total
          </p>
        </div>
      </Card>
    </div>
  )
}
