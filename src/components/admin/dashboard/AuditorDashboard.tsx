'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import {
  ShieldCheck,
  FileSpreadsheet,
  Banknote,
  AlertTriangle,
  ArrowRight,
  Palmtree,
  CheckCircle2,
  Clock,
} from 'lucide-react'

export interface AuditorDashboardProps {
  totalAttendanceRecords: number
  completedShiftsCount: number
  incompleteShiftsCount: number
  autoCutoffCount: number
  totalDisbursedPayroll: number
  totalWeeklyHours: string
}

export const AuditorDashboard: React.FC<AuditorDashboardProps> = ({
  totalAttendanceRecords,
  completedShiftsCount,
  incompleteShiftsCount,
  autoCutoffCount,
  totalDisbursedPayroll,
  totalWeeklyHours,
}) => {
  const complianceRate = totalAttendanceRecords > 0
    ? Math.round(((totalAttendanceRecords - autoCutoffCount) / totalAttendanceRecords) * 100)
    : 100

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* 1. TOP STATUS BANNER */}
      <Card
        variant="elevated"
        className="p-4 sm:p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] truncate">
                  Audit & Compliance Oversight
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Read-Only Compliance Mode
                </span>
              </div>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5 truncate">
                Independent compliance observation across workforce working hours, payroll settlement records, and leave logs
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. AUDIT KPI METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Audited Shifts Volume */}
        <Card
          variant="elevated"
          className="p-4 sm:p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              Audited Shifts Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--md-sys-color-on-surface)] tracking-tight">
              {totalAttendanceRecords.toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">
              Total attendance records
            </span>
          </div>
        </Card>

        {/* Shift Compliance Rate */}
        <Card
          variant="elevated"
          className="p-4 sm:p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              Shift Compliance Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              {complianceRate}%
            </span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">
              Completed without anomaly
            </span>
          </div>
        </Card>

        {/* Auto-Cutoff Anomalies */}
        <Card
          variant="elevated"
          className="p-4 sm:p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              Auto-Cutoff Anomalies
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tracking-tight">
              {autoCutoffCount.toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">
              Enforced max shift exits
            </span>
          </div>
        </Card>

        {/* Historical Disbursements */}
        <Card
          variant="elevated"
          className="p-4 sm:p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              Historical Disbursements
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--md-sys-color-on-surface)] tracking-tight">
              ₹{totalDisbursedPayroll.toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">
              Verified payroll payouts
            </span>
          </div>
        </Card>
      </div>

      {/* 3. COMPLIANCE AUDIT MODULES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/timesheet" className="group">
          <Card
            variant="elevated"
            className="p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] shadow-xs hover:border-[var(--md-sys-color-primary)] transition-all flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
                Weekly Timesheet Matrix
              </h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
                Inspect daily working hour distributions in Asia/Kolkata timezone and identify duration outliers.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--md-sys-color-outline-variant)]/60 text-xs font-semibold text-[var(--md-sys-color-primary)]">
              Review Timesheets &rarr;
            </div>
          </Card>
        </Link>

        <Link href="/admin/payroll" className="group">
          <Card
            variant="elevated"
            className="p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] shadow-xs hover:border-emerald-500 transition-all flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Banknote className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
                Payroll Disbursements
              </h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
                View verified payment batches, payment reference IDs, hourly rates, and settlement records.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--md-sys-color-outline-variant)]/60 text-xs font-semibold text-emerald-600">
              Audit Payroll &rarr;
            </div>
          </Card>
        </Link>

        <Link href="/admin/leaves" className="group">
          <Card
            variant="elevated"
            className="p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] shadow-xs hover:border-blue-500 transition-all flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Palmtree className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
                Leaves Compliance Logs
              </h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
                Inspect leave approvals, manager notes, leave types, and historical utilization patterns.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--md-sys-color-outline-variant)]/60 text-xs font-semibold text-blue-600">
              View Leave Logs &rarr;
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
