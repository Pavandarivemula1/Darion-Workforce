'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Users,
  Palmtree,
  Stethoscope,
  Banknote,
  HeartPulse,
  AlertOctagon,
  Check,
  X,
  Trash2,
} from 'lucide-react'
import { AdminLeaveRecord } from '@/components/admin/leaves/AdminLeavesClient'

export interface MobileAdminLeavesProps {
  leaves: AdminLeaveRecord[]
  onOpenApprove: (leave: AdminLeaveRecord) => void
  onOpenReject: (leave: AdminLeaveRecord) => void
  onDeleteConfirm: (id: string) => void
}

export const MobileAdminLeaves: React.FC<MobileAdminLeavesProps> = ({
  leaves,
  onOpenApprove,
  onOpenReject,
  onDeleteConfirm,
}) => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const todayStr = new Date().toISOString().split('T')[0]
  const pendingCount = leaves.filter((l) => l.status === 'pending').length
  const onLeaveTodayCount = leaves.filter(
    (l) => l.status === 'approved' && l.start_date <= todayStr && l.end_date >= todayStr
  ).length
  const approvedCount = leaves.filter((l) => l.status === 'approved').length
  const rejectedCount = leaves.filter((l) => l.status === 'rejected').length

  const filteredLeaves = leaves.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return l.candidateName.toLowerCase().includes(q) || l.reason.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="flex flex-col gap-2.5">
      {/* 1. Executive Leaves Command Strip */}
      <div className="p-3 rounded-2xl bg-slate-900 dark:bg-slate-950 text-slate-100 border border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Leave Operations</span>
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
            {pendingCount} Pending • {onLeaveTodayCount} On Leave Today
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700">
          {leaves.length} Total
        </span>
      </div>

      {/* 2. 2x2 Bento Matrix */}
      <div className="grid grid-cols-2 gap-2">
        {/* Metric 1: Pending Approvals */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Pending
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {pendingCount}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Awaiting Review</span>
          </div>
        </div>

        {/* Metric 2: On Leave Today */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              On Leave Today
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Palmtree className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {onLeaveTodayCount}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Currently Absent</span>
          </div>
        </div>

        {/* Metric 3: Approved */}
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
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Granted Requests</span>
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
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Denied Requests</span>
          </div>
        </div>
      </div>

      {/* 3. Leave Requests Feed */}
      <div className="flex flex-col gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]" />
          <input
            type="text"
            placeholder="Search candidate or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-xl text-xs bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] focus:outline-none"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-[10px] font-bold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]'
            }`}
          >
            All ({leaves.length})
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

        {/* Leave Cards */}
        <div className="flex flex-col gap-2">
          {filteredLeaves.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
              No leave records found matching criteria.
            </div>
          ) : (
            filteredLeaves.map((l) => {
              const isPending = l.status === 'pending'
              const isApproved = l.status === 'approved'
              const isRejected = l.status === 'rejected'

              return (
                <Card
                  key={l.id}
                  variant="outlined"
                  className="p-2.5 rounded-2xl flex flex-col gap-2 relative overflow-hidden transition-all border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] shadow-2xs"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] font-bold text-[11px] flex items-center justify-center shrink-0">
                        {l.candidateName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[var(--md-sys-color-on-surface)] truncate">{l.candidateName}</p>
                        <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] capitalize">
                          {l.leave_type} Leave • {l.total_days} {l.total_days === 1 ? 'day' : 'days'}
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
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dates & Reason Strip */}
                  <div className="flex flex-col gap-1 p-2 rounded-xl bg-[var(--md-sys-color-surface-container-low)] text-xs text-[var(--md-sys-color-on-surface)]">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="font-bold text-[var(--md-sys-color-primary)]">
                        {l.start_date} – {l.end_date}
                      </span>
                      <span className="text-[var(--md-sys-color-on-surface-variant)]">
                        {l.total_days} Day{l.total_days > 1 ? 's' : ''}
                      </span>
                    </div>
                    {l.reason && (
                      <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] line-clamp-2 italic">
                        &quot;{l.reason}&quot;
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-1 border-t border-[var(--md-sys-color-outline-variant)]">
                    {isPending ? (
                      <>
                        <Button
                          variant="filled"
                          size="xs"
                          className="flex-1 h-7 text-[11px]"
                          onClick={() => onOpenApprove(l)}
                          icon={<Check className="w-3 h-3" />}
                        >
                          Approve
                        </Button>
                        <button
                          onClick={() => onOpenReject(l)}
                          className="flex-1 h-7 rounded-lg bg-[var(--md-sys-color-surface-container-high)] hover:bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onDeleteConfirm(l.id)}
                        className="p-1.5 rounded-lg bg-[var(--md-sys-color-surface-container-high)] hover:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold ml-auto flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
