'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  AlertTriangle,
  Calendar,
  Users,
  Search,
  Check,
  X,
  Filter,
} from 'lucide-react'
import { formatDurationMs, formatBreakDuration } from '@/lib/utils/timesheet'
import {
  CandidateItem,
  SystemAttendanceItem,
  OvershiftRequestItem,
} from '@/app/admin/attendance/AdminAttendanceClient'

export interface MobileAdminAttendanceProps {
  candidates: CandidateItem[]
  records: SystemAttendanceItem[]
  overshiftRequests: OvershiftRequestItem[]
  selectedCandidate: string
  selectedFilter: string
  onCandidateChange: (candidateId: string) => void
  onFilterChange: (filter: string) => void
  onOpenApprove: (record: SystemAttendanceItem) => void
  onOpenReject: (record: SystemAttendanceItem) => void
  onApproveOvershift: (requestId: string) => void
  onRejectOvershift: (requestId: string) => void
  isApprovingOvershift: boolean
  isRejectingOvershift: boolean
}

export const MobileAdminAttendance: React.FC<MobileAdminAttendanceProps> = ({
  candidates,
  records,
  overshiftRequests,
  selectedCandidate,
  selectedFilter,
  onCandidateChange,
  onFilterChange,
  onOpenApprove,
  onOpenReject,
  onApproveOvershift,
  onRejectOvershift,
  isApprovingOvershift,
  isRejectingOvershift,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const totalCount = records.length
  const approvedCount = records.filter((r) => r.approval_status === 'approved').length
  const pendingCount = records.filter((r) => !r.approval_status || r.approval_status === 'pending').length
  const rejectedCount = records.filter((r) => r.approval_status === 'rejected').length

  const periodTabs = [
    { key: 'today', label: 'Today' },
    { key: 'this_week', label: 'This Week' },
    { key: 'last_week', label: 'Last Week' },
    { key: 'this_month', label: 'This Month' },
    { key: 'all', label: 'All Time' },
  ]

  const filteredRecords = records.filter((r) => {
    if (statusFilter === 'pending' && r.approval_status && r.approval_status !== 'pending') return false
    if (statusFilter === 'approved' && r.approval_status !== 'approved') return false
    if (statusFilter === 'rejected' && r.approval_status !== 'rejected') return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return r.candidateName.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="flex flex-col gap-2.5">
      {/* 1. Executive Attendance Command Strip */}
      <div className="p-3 rounded-2xl bg-slate-900 dark:bg-slate-950 text-slate-100 border border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attendance Audit</span>
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
            {totalCount} Shifts Logged • {pendingCount} Pending Review
          </p>
        </div>

        <select
          value={selectedCandidate}
          onChange={(e) => onCandidateChange(e.target.value)}
          className="h-8 px-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700 focus:outline-none cursor-pointer max-w-[130px] truncate"
        >
          <option value="all">All Staff</option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* 2. 2x2 Bento Summary Matrix */}
      <div className="grid grid-cols-2 gap-2">
        {/* Metric 1: Pending Review */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Pending Review
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {pendingCount}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Awaiting Approval</span>
          </div>
        </div>

        {/* Metric 2: Approved Shifts */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Approved
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {approvedCount}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Verified Records</span>
          </div>
        </div>

        {/* Metric 3: Total Logs */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Total Logs
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {totalCount}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">In Filtered Period</span>
          </div>
        </div>

        {/* Metric 4: Rejected */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Rejected
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {rejectedCount}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Flagged / Denied</span>
          </div>
        </div>
      </div>

      {/* 3. Overshift Alerts Deck (If Any) */}
      {overshiftRequests && overshiftRequests.length > 0 && (
        <div className="flex flex-col gap-1.5 p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-1.5 px-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-[11px] font-bold">Overshift Authorization Requests ({overshiftRequests.length})</span>
          </div>
          <div className="flex flex-col gap-1">
            {overshiftRequests.map((req) => (
              <div
                key={req.id}
                className="p-2 rounded-xl bg-[var(--md-sys-color-surface)] border border-amber-500/25 flex items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-bold truncate text-[var(--md-sys-color-on-surface)]">{req.candidateName}</p>
                  <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
                    Req: {new Date(req.request_date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onApproveOvershift(req.id)}
                    disabled={isApprovingOvershift}
                    className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] cursor-pointer"
                  >
                    Allow
                  </button>
                  <button
                    onClick={() => onRejectOvershift(req.id)}
                    disabled={isRejectingOvershift}
                    className="px-2 py-1 rounded-lg bg-red-600 text-white font-bold text-[10px] cursor-pointer"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Period Selector Ribbon */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar p-1 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]">
        {periodTabs.map((tab) => {
          const isActive = selectedFilter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* 5. Mobile Shift Ledger Feed */}
      <div className="flex flex-col gap-2">
        {/* Search & Status Filters */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]" />
          <input
            type="text"
            placeholder="Search candidate name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-xl text-xs bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-[10px] font-bold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]'
            }`}
          >
            All ({records.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'pending'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'approved'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'rejected'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Ledger Rows */}
        <div className="flex flex-col gap-2">
          {filteredRecords.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
              No shift records found.
            </div>
          ) : (
            filteredRecords.map((r) => {
              const loginDate = new Date(r.login_time)
              const logoutDate = r.logout_time ? new Date(r.logout_time) : null
              const isApproved = r.approval_status === 'approved'
              const isRejected = r.approval_status === 'rejected'
              const isPending = !r.approval_status || r.approval_status === 'pending'
              const isLive = !logoutDate

              let netDurationMs = 0
              if (logoutDate) {
                const totalMs = logoutDate.getTime() - loginDate.getTime()
                const breakMs = (r.break_duration_seconds || 0) * 1000
                netDurationMs = Math.max(0, totalMs - breakMs)
              }

              return (
                <Card
                  key={r.id}
                  variant="outlined"
                  className="p-2.5 rounded-2xl flex flex-col gap-2 relative overflow-hidden transition-all border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] shadow-2xs"
                >
                  {/* Row Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] font-bold text-[11px] flex items-center justify-center shrink-0">
                        {r.candidateName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[var(--md-sys-color-on-surface)] truncate">{r.candidateName}</p>
                        <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-mono" suppressHydrationWarning>
                          {loginDate.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      ) : isRejected ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/60 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/40">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      ) : isLive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Shift
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
                          Pending Review
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Punch Timeline Bar */}
                  <div className="grid grid-cols-3 gap-1 p-2 rounded-xl bg-[var(--md-sys-color-surface-container-low)] text-[10px] font-mono text-[var(--md-sys-color-on-surface)]" suppressHydrationWarning>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[var(--md-sys-color-on-surface-variant)] block font-sans">
                        Clock In
                      </span>
                      <span className="font-bold">
                        {loginDate.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-[var(--md-sys-color-on-surface-variant)] block font-sans">
                        Clock Out
                      </span>
                      <span className="font-bold">
                        {logoutDate
                          ? logoutDate.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })
                          : '— Live —'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-[var(--md-sys-color-on-surface-variant)] block font-sans">
                        Duration
                      </span>
                      <span className="font-bold text-[var(--md-sys-color-primary)]">
                        {logoutDate ? formatDurationMs(netDurationMs) : 'Active'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isPending && !isLive && (
                    <div className="flex items-center gap-1.5 pt-1 border-t border-[var(--md-sys-color-outline-variant)]">
                      <Button
                        variant="filled"
                        size="xs"
                        className="flex-1 h-7 text-[11px]"
                        onClick={() => onOpenApprove(r)}
                        icon={<Check className="w-3 h-3" />}
                      >
                        Approve
                      </Button>

                      <button
                        onClick={() => onOpenReject(r)}
                        className="flex-1 h-7 rounded-lg bg-[var(--md-sys-color-surface-container-high)] hover:bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
