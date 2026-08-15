'use client'

import React, { useState, useTransition } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Snackbar } from '@/components/ui/Snackbar'
import { LeaveRequestModal, LeaveBalances } from './LeaveRequestModal'
import { cancelLeaveAction } from '@/app/actions/leaves'
import {
  Palmtree,
  Stethoscope,
  Banknote,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageCircle,
  Sparkles,
  CalendarOff,
} from 'lucide-react'

export interface LeaveRecord {
  id: string
  leave_type: 'casual' | 'sick' | 'paid' | 'unpaid' | 'emergency'
  start_date: string
  end_date: string
  total_days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  admin_notes: string | null
  created_at: string
}

export interface CandidateLeavesClientProps {
  leaves: LeaveRecord[]
  balances: LeaveBalances
}

const TYPE_CONFIG = {
  casual: { label: 'Casual Leave (CL)', icon: Palmtree, color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30' },
  sick: { label: 'Sick Leave (SL)', icon: Stethoscope, color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30' },
  paid: { label: 'Paid Leave (PL)', icon: Banknote, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  emergency: { label: 'Emergency Leave', icon: AlertCircle, color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30' },
  unpaid: { label: 'Unpaid Leave (LWP)', icon: CalendarOff, color: 'text-zinc-600 dark:text-zinc-400 bg-zinc-500/10 border-zinc-500/30' },
}

const STATUS_CONFIG = {
  pending: { label: 'Pending Review', bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
  approved: { label: 'Approved', bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
  rejected: { label: 'Rejected', bg: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30' },
  cancelled: { label: 'Cancelled', bg: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30' },
}

export const CandidateLeavesClient: React.FC<CandidateLeavesClientProps> = ({
  leaves,
  balances,
}) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [cancelDialogId, setCancelDialogId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const filteredLeaves = leaves.filter((l) => {
    if (statusFilter === 'all') return true
    return l.status === statusFilter
  })

  const handleCancelLeave = (id: string) => {
    setErrorMsg(null)
    setCancelDialogId(null)

    startTransition(async () => {
      const res = await cancelLeaveAction(id)
      if (res?.error) {
        setErrorMsg(res.error)
      } else {
        setSuccessMsg('Leave request cancelled.')
      }
    })
  }

  const casualRem = Math.max(0, balances.casualAllowed - balances.casualUsed)
  const sickRem = Math.max(0, balances.sickAllowed - balances.sickUsed)
  const paidRem = Math.max(0, balances.paidAllowed - balances.paidUsed)
  const totalApprovedDays = leaves
    .filter((l) => l.status === 'approved')
    .reduce((sum, l) => sum + Number(l.total_days || 0), 0)

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-5xl mx-auto w-full pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-primary)] flex items-center justify-center shrink-0 shadow-xs">
            <Palmtree className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold">Leave & Time-Off</h1>
            <p className="text-[11px] sm:text-xs opacity-85 mt-0.5">
              Plan and request time-off, track leave balances, and review approvals.
            </p>
          </div>
        </div>
        <Button
          variant="filled"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setModalOpen(true)}
          className="shrink-0 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90 w-full sm:w-auto"
        >
          Apply for Leave
        </Button>
      </div>


      {/* Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Casual Leave */}
        <Card variant="elevated" className="p-4 border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Casual Leave
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Palmtree className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <p className="text-2xl font-black text-amber-700 dark:text-amber-300">{casualRem}</p>
            <span className="text-xs font-semibold text-amber-600">/ {balances.casualAllowed} days left</span>
          </div>
          <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
            {balances.casualUsed} days utilized
          </p>
        </Card>

        {/* Sick Leave */}
        <Card variant="elevated" className="p-4 border border-blue-500/30 bg-blue-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Sick Leave
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{sickRem}</p>
            <span className="text-xs font-semibold text-blue-600">/ {balances.sickAllowed} days left</span>
          </div>
          <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
            {balances.sickUsed} days utilized
          </p>
        </Card>

        {/* Paid Leave */}
        <Card variant="elevated" className="p-4 border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Paid Leave
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{paidRem}</p>
            <span className="text-xs font-semibold text-emerald-600">/ {balances.paidAllowed} days left</span>
          </div>
          <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
            {balances.paidUsed} days utilized
          </p>
        </Card>

        {/* Total Taken */}
        <Card variant="elevated" className="p-4 border border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Total Approved
            </span>
            <div className="w-8 h-8 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <p className="text-2xl font-black">{totalApprovedDays}</p>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Days</span>
          </div>
          <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Total leave taken this year
          </p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Requests' },
          { id: 'pending', label: 'Pending' },
          { id: 'approved', label: 'Approved' },
          { id: 'rejected', label: 'Rejected' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map((tab) => {
          const isActive = statusFilter === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                  : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Leave Requests List */}
      {filteredLeaves.length === 0 ? (
        <Card variant="outlined" className="py-12 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)]">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
            No leave requests found
          </h3>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-xs">
            {statusFilter === 'all'
              ? 'You have not submitted any leave applications yet.'
              : `No ${statusFilter} leave applications.`}
          </p>
          <Button
            variant="filled"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setModalOpen(true)}
            className="mt-2"
          >
            Apply for Leave
          </Button>
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
                className="border border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-primary)]/40 transition-all p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center text-[var(--md-sys-color-primary)] shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      {/* Top Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>

                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusStyle.bg}`}>
                          {item.status === 'pending' && <Clock className="w-3 h-3 animate-spin" />}
                          {item.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                          {item.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {statusStyle.label}
                        </span>

                        <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] ml-auto sm:ml-0">
                          Applied on {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Dates & Duration */}
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
                        <span className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
                          {formattedStart} {item.start_date !== item.end_date ? `→ ${formattedEnd}` : ''}
                        </span>
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-primary)]">
                          {item.total_days} {item.total_days === 1 ? 'Day' : 'Days'}
                        </span>
                      </div>

                      {/* Reason */}
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                        <strong className="text-[var(--md-sys-color-on-surface)] font-semibold">Reason: </strong>
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

                  {/* Cancel Button (Only if pending) */}
                  {item.status === 'pending' && (
                    <div className="self-end sm:self-center shrink-0">
                      <Button
                        variant="outlined"
                        size="sm"
                        className="text-xs text-red-600 border-red-500/30 hover:bg-red-500/10"
                        onClick={() => setCancelDialogId(item.id)}
                      >
                        Cancel Request
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Apply Modal */}
      <LeaveRequestModal
        isOpen={modalOpen}
        balances={balances}
        onClose={() => setModalOpen(false)}
      />

      {/* Cancel Confirmation Dialog */}
      <Dialog
        isOpen={!!cancelDialogId}
        title="Cancel Leave Request?"
        description="Are you sure you want to cancel this pending leave request?"
        confirmLabel="Yes, Cancel Request"
        variant="error"
        isLoading={isPending}
        onConfirm={() => cancelDialogId && handleCancelLeave(cancelDialogId)}
        onClose={() => setCancelDialogId(null)}
      />

      <Snackbar message={errorMsg} variant="error" onClose={() => setErrorMsg(null)} />
      <Snackbar message={successMsg} variant="success" onClose={() => setSuccessMsg(null)} />
    </div>
  )
}
