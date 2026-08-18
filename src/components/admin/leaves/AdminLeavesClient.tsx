'use client'

import React, { useState, useTransition } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Snackbar } from '@/components/ui/Snackbar'
import {
  approveLeaveAction,
  rejectLeaveAction,
  deleteLeaveAction,
} from '@/app/actions/leaves'
import {
  Palmtree,
  Stethoscope,
  Banknote,
  HeartPulse,
  AlertOctagon,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Users,
  MessageCircle,
  Trash2,
  CalendarCheck2,
  CalendarOff,
} from 'lucide-react'
import { MobileAdminLeaves } from './MobileAdminLeaves'


export interface AdminLeaveRecord {
  id: string
  user_id: string
  leave_type: 'casual' | 'sick' | 'paid' | 'unpaid' | 'emergency'
  start_date: string
  end_date: string
  total_days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  admin_notes: string | null
  created_at: string
  candidateName: string
  candidateEmail: string
  candidateAvatarUrl?: string | null
}

export interface AdminLeavesClientProps {
  leaves: AdminLeaveRecord[]
}

const TYPE_CONFIG = {
  casual: { label: 'Casual Leave (CL)', icon: Palmtree, color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30' },
  sick: { label: 'Sick Leave (SL)', icon: Stethoscope, color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30' },
  paid: { label: 'Paid Leave (PL)', icon: Banknote, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  emergency: { label: 'Emergency Leave', icon: HeartPulse, color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30' },
  unpaid: { label: 'Unpaid Leave (LWP)', icon: AlertOctagon, color: 'text-zinc-600 dark:text-zinc-400 bg-zinc-500/10 border-zinc-500/30' },
}

const STATUS_CONFIG = {
  pending: { label: 'Pending Action', bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
  approved: { label: 'Approved', bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
  rejected: { label: 'Rejected', bg: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30' },
  cancelled: { label: 'Cancelled', bg: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30' },
}

export const AdminLeavesClient: React.FC<AdminLeavesClientProps> = ({ leaves }) => {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [approveDialogItem, setApproveDialogItem] = useState<AdminLeaveRecord | null>(null)
  const [approveNotes, setApproveNotes] = useState('')

  const [rejectDialogItem, setRejectDialogItem] = useState<AdminLeaveRecord | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Metrics
  const todayStr = new Date().toISOString().split('T')[0]
  const pendingCount = leaves.filter((l) => l.status === 'pending').length
  const onLeaveTodayCount = leaves.filter(
    (l) => l.status === 'approved' && l.start_date <= todayStr && l.end_date >= todayStr
  ).length
  const approvedThisMonthCount = leaves.filter((l) => {
    if (l.status !== 'approved') return false
    const d = new Date(l.start_date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const rejectedCount = leaves.filter((l) => l.status === 'rejected').length

  // Filtered List
  const filteredLeaves = leaves.filter((item) => {
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchesCandidate = item.candidateName.toLowerCase().includes(q) || item.candidateEmail.toLowerCase().includes(q)
      const matchesReason = item.reason.toLowerCase().includes(q)
      if (!matchesCandidate && !matchesReason) return false
    }

    if (typeFilter !== 'all' && item.leave_type !== typeFilter) return false
    if (statusFilter !== 'all' && item.status !== statusFilter) return false

    return true
  })

  const handleApprove = () => {
    if (!approveDialogItem) return
    setErrorMsg(null)

    startTransition(async () => {
      const res = await approveLeaveAction(approveDialogItem.id, approveNotes)
      if (res?.error) {
        setErrorMsg(res.error)
      } else {
        setSuccessMsg(`Leave approved for ${approveDialogItem.candidateName}.`)
        setApproveDialogItem(null)
        setApproveNotes('')
      }
    })
  }

  const handleReject = () => {
    if (!rejectDialogItem) return
    if (!rejectReason.trim()) {
      setErrorMsg('Please specify a rejection reason.')
      return
    }
    setErrorMsg(null)

    startTransition(async () => {
      const res = await rejectLeaveAction(rejectDialogItem.id, rejectReason)
      if (res?.error) {
        setErrorMsg(res.error)
      } else {
        setSuccessMsg(`Leave request rejected.`)
        setRejectDialogItem(null)
        setRejectReason('')
      }
    })
  }

  const handleDelete = (id: string) => {
    setErrorMsg(null)
    setDeleteConfirmId(null)

    startTransition(async () => {
      const res = await deleteLeaveAction(id)
      if (res?.error) {
        setErrorMsg(res.error)
      } else {
        setSuccessMsg('Leave record deleted.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-2.5 sm:gap-6 w-full pb-16">
      {/* DEDICATED PURPOSE-BUILT MOBILE VIEW (< 768px) */}
      <div className="md:hidden">
        <MobileAdminLeaves
          leaves={leaves}
          onOpenApprove={(l) => setApproveDialogItem(l)}
          onOpenReject={(l) => setRejectDialogItem(l)}
          onDeleteConfirm={(id) => setDeleteConfirmId(id)}
        />
      </div>

      {/* DESKTOP VIEW (>= 768px) - 100% UNTOUCHED ORIGINAL LAYOUT */}
      <div className="hidden md:flex flex-col gap-6">
        {/* Top Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
              Leave & Time-Off Management
            </h1>
            <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
              Review time-off requests, monitor daily absenteeism, and manage workforce availability.
            </p>
          </div>
        </div>


      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Pending Approvals */}
        <Card variant="elevated" className="p-4 border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-2">{pendingCount}</p>
          <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
            {pendingCount === 1 ? '1 request requires review' : `${pendingCount} requests require review`}
          </p>
        </Card>

        {/* On Leave Today */}
        <Card variant="elevated" className="p-4 border border-blue-500/30 bg-blue-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              On Leave Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Palmtree className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-2">{onLeaveTodayCount}</p>
          <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Candidates scheduled off today
          </p>
        </Card>

        {/* Approved This Month */}
        <Card variant="elevated" className="p-4 border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Approved This Month
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-2">{approvedThisMonthCount}</p>
          <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Active approved requests
          </p>
        </Card>

        {/* Rejected Requests */}
        <Card variant="elevated" className="p-4 border border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Rejected Requests
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black mt-2">{rejectedCount}</p>
          <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Total rejected requests
          </p>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card variant="outlined" className="p-4 flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]" />
            <input
              type="text"
              placeholder="Search candidate name, email, reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] text-xs border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)]"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] text-xs border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
          >
            <option value="all">All Leave Types</option>
            <option value="casual">🌴 Casual Leave (CL)</option>
            <option value="sick">🤒 Sick Leave (SL)</option>
            <option value="paid">🏖️ Paid Leave (PL)</option>
            <option value="emergency">🚨 Emergency Leave</option>
            <option value="unpaid">📋 Unpaid Leave (LWP)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] text-xs border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">⏳ Pending Review</option>
            <option value="approved">🟢 Approved</option>
            <option value="rejected">🔴 Rejected</option>
            <option value="cancelled">⚪ Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Leaves Queue List */}
      {filteredLeaves.length === 0 ? (
        <Card variant="outlined" className="py-16 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)]">
            <Palmtree className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
            No leave records found
          </h3>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-xs">
            {leaves.length === 0
              ? 'No candidate leave applications have been submitted yet.'
              : 'Try changing your search or filter parameters.'}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredLeaves.map((item) => {
            const typeInfo = TYPE_CONFIG[item.leave_type] || TYPE_CONFIG.casual
            const Icon = typeInfo.icon
            const statusStyle = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending

            const formattedStart = new Date(item.start_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
            const formattedEnd = new Date(item.end_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })

            return (
              <Card
                key={item.id}
                variant="elevated"
                className={`border transition-all p-5 ${
                  item.status === 'pending'
                    ? 'border-amber-500/40 bg-amber-500/[0.02]'
                    : 'border-[var(--md-sys-color-outline-variant)]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left Main Content */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Candidate Avatar */}
                    {item.candidateAvatarUrl ? (
                      <img
                        src={item.candidateAvatarUrl}
                        alt={item.candidateName}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-[var(--md-sys-color-outline-variant)]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0 font-bold text-xs">
                        {item.candidateName.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      {/* Name & Apply Date */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
                          {item.candidateName}
                        </span>
                        <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                          ({item.candidateEmail})
                        </span>
                        <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] ml-auto sm:ml-0">
                          • Applied on {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Type & Status Badges */}
                      <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeInfo.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {typeInfo.label}
                        </span>

                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusStyle.bg}`}>
                          {statusStyle.label}
                        </span>
                      </div>

                      {/* Requested Dates */}
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
                        <span className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
                          {formattedStart} {item.start_date !== item.end_date ? `→ ${formattedEnd}` : ''}
                        </span>
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-primary)]">
                          {item.total_days} {item.total_days === 1 ? 'Day' : 'Days'}
                        </span>
                      </div>

                      {/* Candidate Reason */}
                      <p className="text-xs leading-relaxed text-[var(--md-sys-color-on-surface)] mt-0.5">
                        <strong className="font-semibold text-[var(--md-sys-color-on-surface-variant)]">Reason: </strong>
                        {item.reason}
                      </p>

                      {/* Admin Remarks */}
                      {item.admin_notes && (
                        <div className="mt-2 p-2.5 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex items-start gap-2">
                          <MessageCircle className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)] shrink-0 mt-0.5" />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold text-[var(--md-sys-color-primary)] uppercase tracking-wider">
                              Admin Remark:
                            </span>
                            <p className="text-xs text-[var(--md-sys-color-on-surface)]">
                              {item.admin_notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center sm:flex-col gap-2 shrink-0 self-end sm:self-start pt-2 sm:pt-0">
                    {item.status === 'pending' ? (
                      <div className="flex items-center sm:flex-col gap-2 w-full">
                        <Button
                          variant="filled"
                          size="sm"
                          className="bg-emerald-600 text-white hover:bg-emerald-700 w-full text-xs"
                          onClick={() => {
                            setApproveDialogItem(item)
                            setApproveNotes('')
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          size="sm"
                          className="border-red-500/40 text-red-600 hover:bg-red-500/10 w-full text-xs"
                          onClick={() => {
                            setRejectDialogItem(item)
                            setRejectReason('')
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>

      {/* Approve Dialog */}

      {approveDialogItem && (
        <Dialog
          isOpen={!!approveDialogItem}
          title="Approve Leave Request?"
          description={`Approve ${approveDialogItem.total_days} day(s) ${approveDialogItem.leave_type} leave for ${approveDialogItem.candidateName} (${approveDialogItem.start_date} to ${approveDialogItem.end_date}).`}
          confirmLabel="Confirm Approval"
          isLoading={isPending}
          onConfirm={handleApprove}
          onClose={() => setApproveDialogItem(null)}
        >
          <div className="flex flex-col gap-2 pt-2">
            <label htmlFor="approve-notes" className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">
              Admin Note / Instructions <span className="font-normal text-[var(--md-sys-color-on-surface-variant)]">(Optional)</span>
            </label>
            <input
              id="approve-notes"
              type="text"
              placeholder="e.g. Approved. Please ensure handover before leave."
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              className="h-10 px-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] text-xs border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)]"
            />
          </div>
        </Dialog>
      )}

      {/* Reject Dialog */}
      {rejectDialogItem && (
        <Dialog
          isOpen={!!rejectDialogItem}
          title="Reject Leave Request"
          confirmLabel="Reject Request"
          variant="error"
          isLoading={isPending}
          onConfirm={handleReject}
          onClose={() => setRejectDialogItem(null)}
        >
          <div className="flex flex-col gap-2 pt-1">
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
              Specify the reason for rejecting {rejectDialogItem.candidateName}&apos;s leave request. This will be shared with the candidate.
            </p>
            <textarea
              rows={3}
              required
              placeholder="e.g. High workload on selected dates, please reschedule..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] text-xs border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)] resize-none"
            />
          </div>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <Dialog
        isOpen={!!deleteConfirmId}
        title="Delete Leave Record?"
        description="Are you sure you want to delete this record permanently? This action cannot be undone."
        confirmLabel="Delete"
        variant="error"
        isLoading={isPending}
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
      />

      <Snackbar message={errorMsg} variant="error" onClose={() => setErrorMsg(null)} />
      <Snackbar message={successMsg} variant="success" onClose={() => setSuccessMsg(null)} />
    </div>
  )
}
