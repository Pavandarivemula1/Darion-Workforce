import React from 'react'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import {
  ShieldCheck,
  FileSpreadsheet,
  Banknote,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  CalendarCheck,
  Palmtree,
  Eye,
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
    <div className="flex flex-col gap-6">
      {/* Auditor Executive Hero */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-linear-to-br from-teal-950/80 via-slate-900 to-slate-950 border border-teal-500/30 shadow-2xl text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Audit & Compliance Center</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/30 text-teal-200 border border-teal-400/40">
                  Read-Only Compliance Mode
                </span>
              </div>
              <p className="text-sm text-teal-200/80 mt-1 max-w-2xl">
                Independent compliance observation across workforce working hours, payroll settlement records, leave logs, and time-tracking variances.
              </p>
            </div>
          </div>
        </div>

        {/* Auditor Key Figures */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-teal-500/20">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300/70 block">Audited Shifts Volume</span>
            <span className="text-2xl font-black font-mono text-white">{totalAttendanceRecords.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300/70 block">Shift Compliance Rate</span>
            <span className="text-2xl font-black font-mono text-emerald-400">{complianceRate}%</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300/70 block">Auto-Cutoff Anomalies</span>
            <span className="text-2xl font-black font-mono text-amber-300">{autoCutoffCount}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300/70 block">Historical Disbursements</span>
            <span className="text-2xl font-black font-mono text-teal-200">₹{totalDisbursedPayroll.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Compliance Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/timesheet">
          <Card variant="outlined" className="p-5 rounded-3xl border-[var(--md-sys-color-outline-variant)] hover:border-teal-500/50 transition-all flex flex-col justify-between h-full group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <FileSpreadsheet className="w-6 h-6 text-teal-600" />
                <ArrowRight className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">Weekly Timesheet Matrix</h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
                Inspect daily working hour distributions in Asia/Kolkata timezone and identify duration outliers.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--md-sys-color-outline-variant)] text-xs font-bold text-teal-600">
              Review Timesheets &rarr;
            </div>
          </Card>
        </Link>

        <Link href="/admin/payroll">
          <Card variant="outlined" className="p-5 rounded-3xl border-[var(--md-sys-color-outline-variant)] hover:border-teal-500/50 transition-all flex flex-col justify-between h-full group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Banknote className="w-6 h-6 text-emerald-600" />
                <ArrowRight className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">Payroll Disbursements</h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
                View verified payment batches, payment reference IDs, hourly rates, and settlement records.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--md-sys-color-outline-variant)] text-xs font-bold text-emerald-600">
              Audit Payroll &rarr;
            </div>
          </Card>
        </Link>

        <Link href="/admin/leaves">
          <Card variant="outlined" className="p-5 rounded-3xl border-[var(--md-sys-color-outline-variant)] hover:border-teal-500/50 transition-all flex flex-col justify-between h-full group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Palmtree className="w-6 h-6 text-blue-600" />
                <ArrowRight className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">Leaves Compliance Logs</h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
                Inspect leave approvals, manager notes, leave types, and historical utilization patterns.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--md-sys-color-outline-variant)] text-xs font-bold text-blue-600">
              View Leave Logs &rarr;
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
