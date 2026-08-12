'use client'

import React, { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { Snackbar } from '@/components/ui/Snackbar'
import { approveShiftAction, rejectShiftAction } from '@/app/actions/admin'
import {
  Filter,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  X,
  DollarSign,
  Edit2,
  HelpCircle,
} from 'lucide-react'
import { formatDurationMs, formatBreakDuration } from '@/lib/utils/timesheet'

export interface CandidateOption {
  id: string
  full_name: string
  hourly_rate?: number
}

export interface SystemAttendanceItem {
  id: string
  user_id: string
  login_time: string
  logout_time: string | null
  break_start_time?: string | null
  break_duration_seconds?: number
  approval_status?: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string | null
  payout_amount?: number | null
  created_at: string
  candidateName: string
}

export interface AdminAttendanceClientProps {
  candidates: CandidateOption[]
  records: SystemAttendanceItem[]
}

export const AdminAttendanceClient: React.FC<AdminAttendanceClientProps> = ({
  candidates,
  records: initialRecords,
}) => {
  const router = useRouter()

  const [selectedCandidate, setSelectedCandidate] = useState<string>('all')
  const [selectedFilter, setSelectedFilter] = useState<string>('this_week')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const [isApproving, startApproveTransition] = useTransition()
  const [isRejecting, startRejectTransition] = useTransition()

  const [optimisticOverrides, setOptimisticOverrides] = useState<
    Record<string, { approval_status: 'approved' | 'rejected'; payout_amount?: number; rejection_reason?: string }>
  >({})

  // Modal dialog states
  const [approveItem, setApproveItem] = useState<SystemAttendanceItem | null>(null)
  const [customPayoutText, setCustomPayoutText] = useState('')
  const [rejectItem, setRejectItem] = useState<SystemAttendanceItem | null>(null)
  const [rejectionReasonText, setRejectionReasonText] = useState('')

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)

  const records = useMemo(() => {
    return initialRecords
      .map((r) => {
        const override = optimisticOverrides[r.id]
        return override ? { ...r, ...override } : r
      })
      .filter((r) => {
        if (selectedCandidate !== 'all' && r.user_id !== selectedCandidate) return false

        const loginDate = new Date(r.login_time)
        const now = new Date()

        if (selectedFilter === 'today') {
          const startOfToday = new Date()
          startOfToday.setHours(0, 0, 0, 0)
          return loginDate >= startOfToday
        } else if (selectedFilter === 'this_week') {
          const day = now.getDay()
          const diff = now.getDate() - day + (day === 0 ? -6 : 1)
          const startOfWeek = new Date(now.setDate(diff))
          startOfWeek.setHours(0, 0, 0, 0)
          return loginDate >= startOfWeek
        } else if (selectedFilter === 'last_week') {
          const day = now.getDay()
          const diff = now.getDate() - day - 6
          const startOfWeek = new Date(now.setDate(diff))
          startOfWeek.setHours(0, 0, 0, 0)
          const endOfWeek = new Date(startOfWeek)
          endOfWeek.setDate(endOfWeek.getDate() + 6)
          endOfWeek.setHours(23, 59, 59, 999)
          return loginDate >= startOfWeek && loginDate <= endOfWeek
        } else if (selectedFilter === 'this_month') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          return loginDate >= startOfMonth
        } else if (selectedFilter === 'custom') {
          if (startDate && loginDate < new Date(startDate)) return false
          if (endDate) {
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)
            if (loginDate > end) return false
          }
        }
        return true
      })
  }, [initialRecords, optimisticOverrides, selectedCandidate, selectedFilter, startDate, endDate])

  const updateQueryParams = (key: string, value: string) => {
    if (key === 'filter') {
      setSelectedFilter(value)
      if (value !== 'custom') {
        setStartDate('')
        setEndDate('')
      }
    } else if (key === 'candidateId') {
      setSelectedCandidate(value)
    }
  }

  const handleDateChange = (start: string, end: string) => {
    setSelectedFilter('custom')
    setStartDate(start)
    setEndDate(end)
  }

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '--:--'
    return new Date(isoString).toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const isToday = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const calculateNetTotal = (loginIso: string, logoutIso: string | null, breakSecs = 0) => {
    if (!logoutIso) return '--'
    const start = new Date(loginIso).getTime()
    const end = new Date(logoutIso).getTime()
    const grossMs = Math.max(0, end - start)
    const netMs = Math.max(0, grossMs - breakSecs * 1000)
    return formatDurationMs(netMs)
  }

  const calculateAutoPayout = (item: SystemAttendanceItem) => {
    const candidate = candidates.find((c) => c.id === item.user_id)
    const rate = candidate?.hourly_rate || 0
    const start = new Date(item.login_time).getTime()
    const end = item.logout_time ? new Date(item.logout_time).getTime() : start
    const netMs = Math.max(0, end - start - (item.break_duration_seconds || 0) * 1000)
    const netHours = netMs / (1000 * 60 * 60)
    return Math.round(netHours * rate * 100) / 100
  }

  const openApproveModal = (item: SystemAttendanceItem) => {
    const autoAmount = item.payout_amount !== null && item.payout_amount !== undefined && item.payout_amount > 0
      ? item.payout_amount
      : calculateAutoPayout(item)
    setCustomPayoutText(autoAmount.toFixed(2))
    setApproveItem(item)
    setToast(null)
  }

  const openRejectModal = (item: SystemAttendanceItem) => {
    setRejectionReasonText(item.rejection_reason || '')
    setRejectItem(item)
    setToast(null)
  }

  const handleApproveSubmit = (formData: FormData) => {
    if (!approveItem) return
    const amount = parseFloat(customPayoutText) || 0
    setOptimisticOverrides((prev) => ({
      ...prev,
      [approveItem.id]: {
        approval_status: 'approved',
        payout_amount: amount,
      },
    }))

    startApproveTransition(async () => {
      const res = await approveShiftAction({ error: '', success: false }, formData)
      if (res.success) {
        setApproveItem(null)
        setToast({ message: 'Shift approved and payout recorded successfully.', variant: 'success' })
        router.refresh()
      } else if (res.error) {
        setToast({ message: res.error, variant: 'error' })
      }
    })
  }

  const handleRejectSubmit = (formData: FormData) => {
    if (!rejectItem) return
    setOptimisticOverrides((prev) => ({
      ...prev,
      [rejectItem.id]: {
        approval_status: 'rejected',
        rejection_reason: rejectionReasonText.trim(),
        payout_amount: 0,
      },
    }))

    startRejectTransition(async () => {
      const res = await rejectShiftAction({ error: '', success: false }, formData)
      if (res.success) {
        setRejectItem(null)
        setToast({ message: 'Shift rejected with feedback recorded.', variant: 'success' })
        router.refresh()
      } else if (res.error) {
        setToast({ message: res.error, variant: 'error' })
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">Attendance & Shift Payment Approvals</h2>
        <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
          Review completed work shifts, approve hourly payouts, or reject with feedback
        </p>
      </div>

      {/* Filter Control Card */}
      <Card variant="outlined" className="border border-[var(--md-sys-color-outline-variant)] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Candidate Dropdown Filter */}
        <div className="flex items-center gap-2 min-w-[220px]">
          <Users className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] shrink-0" />
          <select
            value={selectedCandidate}
            onChange={(e) => updateQueryParams('candidateId', e.target.value)}
            className="w-full h-10 px-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs font-semibold focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
          >
            <option value="all">All Candidates ({candidates.length})</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Date Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] shrink-0 mr-1" />
          {[
            { id: 'today', label: 'Today' },
            { id: 'this_week', label: 'This Week' },
            { id: 'last_week', label: 'Last Week' },
            { id: 'this_month', label: 'This Month' },
            { id: 'all', label: 'All Time' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => updateQueryParams('filter', f.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === f.id
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs font-semibold'
                  : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Custom Date Picker */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <Calendar className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] shrink-0" />
          <span className="text-[var(--md-sys-color-on-surface-variant)] font-medium">Range:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleDateChange(e.target.value, endDate)}
            className="h-8 px-2 rounded-[var(--md-sys-shape-corner-extra-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs focus:outline-none focus:border-[var(--md-sys-color-primary)]"
          />
          <span className="text-[var(--md-sys-color-on-surface-variant)]">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleDateChange(startDate, e.target.value)}
            className="h-8 px-2 rounded-[var(--md-sys-shape-corner-extra-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs focus:outline-none focus:border-[var(--md-sys-color-primary)]"
          />
        </div>
      </Card>

      {/* Attendance Table */}
      <Card variant="outlined" className="p-0 border border-[var(--md-sys-color-outline-variant)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] text-xs font-semibold uppercase tracking-wider border-b border-[var(--md-sys-color-outline-variant)]">
                <th className="py-3.5 px-4 sm:px-6">Candidate</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Login / Logout</th>
                <th className="py-3.5 px-4">Break</th>
                <th className="py-3.5 px-4">Net Work Time</th>
                <th className="py-3.5 px-4">Payment Approval</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
              {records && records.length > 0 ? (
                records.map((item) => {
                  const hasLogout = !!item.logout_time
                  const today = isToday(item.login_time)
                  const isWorking = !hasLogout && today
                  const isOnBreak = isWorking && !!item.break_start_time
                  const breakSecs = item.break_duration_seconds || 0
                  const status = item.approval_status || 'pending'
                  const payout = item.payout_amount || 0

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[var(--md-sys-color-surface-container-low)] transition-colors"
                    >
                      <td className="py-4 px-4 sm:px-6 font-semibold whitespace-nowrap">
                        {item.candidateName}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-xs">
                        {formatDate(item.login_time)}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap font-mono text-xs">
                        <div className="flex flex-col">
                          <span>In: {formatTime(item.login_time)}</span>
                          <span className="text-[var(--md-sys-color-on-surface-variant)]">
                            Out: {formatTime(item.logout_time)}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap font-mono text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
                        {formatBreakDuration(breakSecs)}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap font-mono text-xs font-semibold">
                        {isOnBreak ? (
                          <span className="text-[var(--md-sys-color-warning)] animate-pulse">
                            Paused (On Break)
                          </span>
                        ) : isWorking ? (
                          <span className="text-[var(--md-sys-color-primary)] animate-pulse">
                            In Progress
                          </span>
                        ) : (
                          calculateNetTotal(item.login_time, item.logout_time, breakSecs)
                        )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        {isWorking ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                            <Clock className="w-3.5 h-3.5" />
                            Shift In Progress
                          </span>
                        ) : status === 'approved' ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-success-container)] text-[var(--md-sys-color-on-success-container)]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approved (${payout.toFixed(2)})
                            </span>
                          </div>
                        ) : status === 'rejected' ? (
                          <div className="flex flex-col gap-0.5 max-w-[200px]">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Rejected
                            </span>
                            {item.rejection_reason && (
                              <span className="text-[10px] text-[var(--md-sys-color-error)] truncate" title={item.rejection_reason}>
                                Reason: {item.rejection_reason}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-warning-container)] text-[var(--md-sys-color-on-warning-container)] animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            Pending Admin Review
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                        {hasLogout && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant={status === 'approved' ? 'outlined' : 'filled'}
                              size="sm"
                              onClick={() => openApproveModal(item)}
                              icon={status === 'approved' ? <Edit2 className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                            >
                              {status === 'approved' ? 'Edit Payout' : 'Approve'}
                            </Button>

                            <Button
                              variant="outlined"
                              size="sm"
                              onClick={() => openRejectModal(item)}
                              icon={<X className="w-3.5 h-3.5 text-rose-600" />}
                            >
                              {status === 'rejected' ? 'Edit Rejection' : 'Reject'}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No attendance records found matching selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Approve Shift Payment Modal */}
      {approveItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] rounded-[var(--md-sys-shape-corner-extra-large)] p-6 shadow-[var(--md-sys-elevation-3)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
              <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="w-5 h-5" />
                Approve Shift Payment
              </h3>
              <button
                type="button"
                onClick={() => setApproveItem(null)}
                className="p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)] flex flex-col gap-1.5 text-xs border border-[var(--md-sys-color-outline-variant)]">
              <div className="flex justify-between font-semibold">
                <span>Candidate:</span>
                <span>{approveItem.candidateName}</span>
              </div>
              <div className="flex justify-between text-[var(--md-sys-color-on-surface-variant)]">
                <span>Shift Date:</span>
                <span>{formatDate(approveItem.login_time)}</span>
              </div>
              <div className="flex justify-between text-[var(--md-sys-color-on-surface-variant)]">
                <span>Net Work Duration:</span>
                <span className="font-mono font-bold">
                  {calculateNetTotal(approveItem.login_time, approveItem.logout_time, approveItem.break_duration_seconds || 0)}
                </span>
              </div>
            </div>

            <form
              action={handleApproveSubmit}
              className="flex flex-col gap-4"
            >
              <input type="hidden" name="attendanceId" value={approveItem.id} />

              <TextField
                name="payoutAmount"
                type="number"
                step="0.01"
                min="0"
                label="Approved Shift Payout Amount ($)"
                value={customPayoutText}
                onChange={(e) => setCustomPayoutText(e.target.value)}
                required
                disabled={isApproving}
                startIcon={<DollarSign className="w-4 h-4" />}
                supportingText="Auto-calculated from hourly rate. You can adjust this value if needed."
              />

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setApproveItem(null)}
                  disabled={isApproving}
                  className="px-4 h-10 rounded-full text-sm font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 cursor-pointer"
                >
                  Cancel
                </button>
                <Button type="submit" variant="filled" size="md" isLoading={isApproving}>
                  Confirm & Approve Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Shift Reason Modal */}
      {rejectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] rounded-[var(--md-sys-shape-corner-extra-large)] p-6 shadow-[var(--md-sys-elevation-3)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
              <h3 className="text-lg font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                Reject Shift Payment
              </h3>
              <button
                type="button"
                onClick={() => setRejectItem(null)}
                className="p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-[var(--md-sys-shape-corner-medium)] bg-rose-500/10 text-rose-600 dark:text-rose-300 text-xs flex items-start gap-2 border border-rose-500/20">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Rejection Feedback:</strong> State the exact reason for rejecting this shift on <strong>{formatDate(rejectItem.login_time)}</strong> for <strong>{rejectItem.candidateName}</strong>. This feedback will be displayed in the candidate portal.
              </div>
            </div>

            <form
              action={handleRejectSubmit}
              className="flex flex-col gap-4"
            >
              <input type="hidden" name="attendanceId" value={rejectItem.id} />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
                  Rejection Reason (Why is this shift being rejected?)
                </label>
                <textarea
                  name="rejectionReason"
                  rows={3}
                  required
                  placeholder="e.g. Incomplete task documentation, unapproved overtime, incorrect session..."
                  value={rejectionReasonText}
                  onChange={(e) => setRejectionReasonText(e.target.value)}
                  className="w-full p-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs focus:outline-none focus:border-[var(--md-sys-color-primary)]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setRejectItem(null)}
                  disabled={isRejecting}
                  className="px-4 h-10 rounded-full text-sm font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 cursor-pointer"
                >
                  Cancel
                </button>
                <Button type="submit" variant="filled" size="md" isLoading={isRejecting}>
                  Confirm Rejection
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Snackbar Notifications */}
      <Snackbar
        message={toast?.message || null}
        variant={toast?.variant || 'info'}
        onClose={() => setToast(null)}
      />
    </div>
  )
}
