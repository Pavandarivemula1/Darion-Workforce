'use client'

import React, { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { Snackbar } from '@/components/ui/Snackbar'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  IndianRupee,
  AlertTriangle,
  Calendar,
  Users,
  X,
  Play,
  Plus,
  Square,
  Edit,
  ShieldAlert,
} from 'lucide-react'
import { formatDurationMs, formatBreakDuration } from '@/lib/utils/timesheet'
import { ShiftConfig, DEFAULT_FALLBACK_SHIFT } from '@/lib/utils/shift'
import { calculatePunctualityStatus } from '@/lib/utils/punctuality'
import { PunctualityBadge } from '@/components/ui/PunctualityBadge'
import {
  approveShiftAction,
  rejectShiftAction,
  adminAutoCutoffSessionAction,
  adminResolveAllStaleSessionsAction,
} from '@/app/actions/admin'
import { approveOvershiftAction, rejectOvershiftAction } from '@/app/actions/overshift'
import { MobileAdminAttendance } from '@/components/admin/attendance/MobileAdminAttendance'
import { StartTimerModal } from '@/components/admin/attendance/StartTimerModal'
import { StopTimerModal } from '@/components/admin/attendance/StopTimerModal'
import { ManualShiftModal } from '@/components/admin/attendance/ManualShiftModal'
import { EditShiftModal } from '@/components/admin/attendance/EditShiftModal'
import { ActiveSessionsCard } from '@/components/admin/attendance/ActiveSessionsCard'
import { RealtimeAttendanceListener } from '@/components/ui/RealtimeAttendanceListener'

export interface CandidateItem {
  id: string
  full_name: string
  hourly_rate?: number
  shift_id?: string | null
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
  admin_notes?: string | null
  is_auto_cutoff?: boolean
  shiftId?: string | null
  created_at: string
  candidateName: string
  candidateAvatarUrl?: string | null
}

export interface OvershiftRequestItem {
  id: string
  user_id: string
  request_date: string
  request_type?: 'now' | 'later'
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  candidateName: string
  candidateAvatarUrl?: string | null
}

export interface AdminAttendanceClientProps {
  candidates: CandidateItem[]
  shifts?: ShiftConfig[]
  records: SystemAttendanceItem[]
  activeSessions?: SystemAttendanceItem[]
  overshiftRequests?: OvershiftRequestItem[]
}

export const AdminAttendanceClient: React.FC<AdminAttendanceClientProps> = ({
  candidates,
  shifts = [],
  records: initialRecords,
  activeSessions: initialActiveSessions = [],
  overshiftRequests = [],
}) => {
  const router = useRouter()

  const [selectedCandidate, setSelectedCandidate] = useState<string>('all')
  const [selectedFilter, setSelectedFilter] = useState<string>('this_week')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const [isApproving, startApproveTransition] = useTransition()
  const [isRejecting, startRejectTransition] = useTransition()
  const [isAutoCutoffLoading, startAutoCutoffTransition] = useTransition()

  const [optimisticOverrides, setOptimisticOverrides] = useState<
    Record<string, { approval_status: 'approved' | 'rejected'; payout_amount?: number; rejection_reason?: string }>
  >({})

  // Modal dialog states
  const [isStartTimerModalOpen, setIsStartTimerModalOpen] = useState(false)
  const [stopTimerSession, setStopTimerSession] = useState<SystemAttendanceItem | null>(null)
  const [isManualShiftModalOpen, setIsManualShiftModalOpen] = useState(false)
  const [editShiftRecord, setEditShiftRecord] = useState<SystemAttendanceItem | null>(null)

  const [approveItem, setApproveItem] = useState<SystemAttendanceItem | null>(null)
  const [customPayoutText, setCustomPayoutText] = useState('')
  const [rejectItem, setRejectItem] = useState<SystemAttendanceItem | null>(null)
  const [rejectionReasonText, setRejectionReasonText] = useState('')

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)
  
  const [isApprovingOvershift, startApproveOvershift] = useTransition()
  const [isRejectingOvershift, startRejectOvershift] = useTransition()

  const defaultShift = useMemo(() => {
    return shifts.find((s) => s.is_default) || DEFAULT_FALLBACK_SHIFT
  }, [shifts])

  const handleAutoCutoff = (session: SystemAttendanceItem) => {
    startAutoCutoffTransition(async () => {
      const formData = new FormData()
      formData.append('attendanceId', session.id)
      const res = await adminAutoCutoffSessionAction({} as any, formData)
      if (res.error) {
        setToast({ message: res.error, variant: 'error' })
      } else {
        setToast({ message: `Shift auto-cutoff applied for ${session.candidateName}.`, variant: 'success' })
        router.refresh()
      }
    })
  }

  const handleResolveAllStale = () => {
    startAutoCutoffTransition(async () => {
      const res = await adminResolveAllStaleSessionsAction({} as any)
      if (res.error) {
        setToast({ message: res.error, variant: 'error' })
      } else {
        setToast({ message: 'All overdue stale sessions auto-resolved successfully.', variant: 'success' })
        router.refresh()
      }
    })
  }

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

  const handleApproveOvershift = (id: string) => {
    startApproveOvershift(async () => {
      const formData = new FormData()
      formData.append('requestId', id)
      const res = await approveOvershiftAction({ error: '', success: false }, formData)
      if (res.success) {
        setToast({ message: 'Overshift approved.', variant: 'success' })
        router.refresh()
      } else if (res.error) {
        setToast({ message: res.error, variant: 'error' })
      }
    })
  }

  const handleRejectOvershift = (id: string) => {
    startRejectOvershift(async () => {
      const formData = new FormData()
      formData.append('requestId', id)
      const res = await rejectOvershiftAction({ error: '', success: false }, formData)
      if (res.success) {
        setToast({ message: 'Overshift rejected.', variant: 'success' })
        router.refresh()
      } else if (res.error) {
        setToast({ message: res.error, variant: 'error' })
      }
    })
  }

  const activeSessionsList = useMemo(() => {
    if (initialActiveSessions && initialActiveSessions.length > 0) {
      return initialActiveSessions
    }
    return initialRecords.filter((r) => !r.logout_time)
  }, [initialActiveSessions, initialRecords])

  const activeUserIds = useMemo(() => {
    return activeSessionsList.map((s) => s.user_id)
  }, [activeSessionsList])

  const activeOvershifts = overshiftRequests.filter((req) => {
    if (req.status === 'rejected') return false
    if (selectedCandidate !== 'all' && req.user_id !== selectedCandidate) return false
    return true
  })

  const staleActiveSessions = useMemo(() => {
    return activeSessionsList.filter((s) => {
      const sShift = shifts.find((sh) => sh.id === s.shiftId) || defaultShift
      const res = calculatePunctualityStatus(s.login_time, s.logout_time, sShift, s.is_auto_cutoff, 12)
      return res.isStale
    })
  }, [activeSessionsList, shifts, defaultShift])

  return (
    <div className="flex flex-col gap-2.5 sm:gap-6 max-w-7xl mx-auto w-full">
      {/* DEDICATED PURPOSE-BUILT MOBILE VIEW (< 768px) */}
      <div className="md:hidden">
        <MobileAdminAttendance
          candidates={candidates}
          records={records}
          shifts={shifts}
          activeSessions={activeSessionsList}
          overshiftRequests={activeOvershifts}
          selectedCandidate={selectedCandidate}
          selectedFilter={selectedFilter}
          onCandidateChange={(val) => {
            setSelectedCandidate(val)
            updateQueryParams('candidateId', val)
          }}
          onFilterChange={(val) => {
            setSelectedFilter(val)
            updateQueryParams('filter', val)
          }}
          onOpenApprove={openApproveModal}
          onOpenReject={openRejectModal}
          onOpenStartModal={() => setIsStartTimerModalOpen(true)}
          onOpenStopModal={(session) => setStopTimerSession(session)}
          onOpenManualModal={() => setIsManualShiftModalOpen(true)}
          onOpenEditModal={(record) => setEditShiftRecord(record)}
          onApproveOvershift={handleApproveOvershift}
          onRejectOvershift={handleRejectOvershift}
          isApprovingOvershift={isApprovingOvershift}
          isRejectingOvershift={isRejectingOvershift}
        />
      </div>

      {/* DESKTOP VIEW (>= 768px) */}
      <div className="hidden md:flex flex-col gap-6">
        {/* Header & Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Attendance & Shift Payment Approvals</h2>
            <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
              Manage live timers, schedule adherence & punctuality, log manual shift hours, and approve compensation
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outlined"
              size="md"
              icon={<Play className="w-4 h-4 fill-current text-emerald-600 dark:text-emerald-400" />}
              onClick={() => setIsStartTimerModalOpen(true)}
              className="border-emerald-600/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
            >
              Start Timer
            </Button>
            <Button
              variant="filled"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsManualShiftModalOpen(true)}
            >
              + Add Shift / Hours
            </Button>
          </div>
        </div>

        {/* Stale Sessions Alert Banner (if > 12h runaway sessions exist) */}
        {staleActiveSessions.length > 0 && (
          <Card variant="outlined" className="p-3.5 sm:p-4 border border-amber-500/50 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-200">
                  {staleActiveSessions.length} Overdue / Stale Session{staleActiveSessions.length > 1 ? 's' : ''} Detected
                </h4>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                  Continuous timers exceeding 12 hours. You can auto-cutoff to standard shift length.
                </p>
              </div>
            </div>
            <Button
              variant="filled"
              size="sm"
              isLoading={isAutoCutoffLoading}
              onClick={handleResolveAllStale}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0"
            >
              Auto-Cutoff All ({staleActiveSessions.length})
            </Button>
          </Card>
        )}

        {/* Active Timers Banner & Session Controls */}
        <ActiveSessionsCard
          activeSessions={activeSessionsList}
          candidates={candidates}
          shifts={shifts}
          onOpenStopModal={(session) => setStopTimerSession(session)}
          onOpenStartModal={() => setIsStartTimerModalOpen(true)}
          onAutoCutoff={handleAutoCutoff}
          isAutoCutoffLoading={isAutoCutoffLoading}
        />


      {activeOvershifts.length > 0 && (
        <Card variant="outlined" className="border-amber-500/50 p-4">
          <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Active Overshift Requests
          </h3>
          <div className="flex flex-col gap-3">
            {activeOvershifts.map((req) => (
              <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]">
                <div className="flex items-center gap-3">
                  {req.candidateAvatarUrl ? (
                    <img src={req.candidateAvatarUrl} alt={req.candidateName} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-xs font-bold">
                      {req.candidateName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      {req.candidateName}
                      {req.request_type === 'later' && (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-[10px] uppercase font-bold tracking-wider">
                          Scheduled
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--md-sys-color-success-container)] text-[var(--md-sys-color-on-success-container)] text-[10px] uppercase font-bold tracking-wider">
                          Approved
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                      Requested for: {req.request_date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 sm:mt-0">
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => handleRejectOvershift(req.id)}
                    isLoading={isRejectingOvershift}
                  >
                    {req.status === 'approved' ? 'Cancel / Reject' : 'Reject'}
                  </Button>
                  {req.status === 'pending' && (
                    <Button
                      variant="filled"
                      size="sm"
                      className="bg-amber-600 text-white hover:bg-amber-700"
                      onClick={() => handleApproveOvershift(req.id)}
                      isLoading={isApprovingOvershift}
                    >
                      Approve Overshift
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filter Control Card */}
      <Card variant="outlined" className="border border-[var(--md-sys-color-outline-variant)] p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Candidate Dropdown Filter */}
        <div className="flex items-center gap-2 w-full lg:w-auto min-w-[200px]">
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
          <Filter className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] shrink-0 mr-1 hidden sm:inline" />
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
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === f.id
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-semibold'
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
            className="h-8 px-2 rounded-[var(--md-sys-shape-corner-extra-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
          />
          <span className="text-[var(--md-sys-color-on-surface-variant)]">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleDateChange(startDate, e.target.value)}
            className="h-8 px-2 rounded-[var(--md-sys-shape-corner-extra-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
          />
        </div>
      </Card>

      {/* 1. Mobile Shift Cards (< 768px) */}
      <div className="flex flex-col gap-4 md:hidden">
        {records && records.length > 0 ? (
          records.map((item) => {
            const hasLogout = !!item.logout_time
            const today = isToday(item.login_time)
            const isWorking = !hasLogout && today
            const breakSecs = item.break_duration_seconds || 0
            const status = item.approval_status || 'pending'
            const payout = item.payout_amount || 0
            const sShift = shifts.find((sh) => sh.id === item.shiftId) || defaultShift
            const punctuality = calculatePunctualityStatus(
              item.login_time,
              item.logout_time,
              sShift,
              item.is_auto_cutoff,
              12
            )

            return (
              <Card
                key={item.id}
                variant="outlined"
                className="p-4 flex flex-col gap-3 border border-[var(--md-sys-color-outline-variant)]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
                  <div className="flex items-center gap-2">
                    {item.candidateAvatarUrl ? (
                      <img src={item.candidateAvatarUrl} alt={item.candidateName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-xs font-bold shrink-0">
                        {item.candidateName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold">{item.candidateName}</h4>
                      <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
                        {formatDate(item.login_time)}
                      </p>
                    </div>
                  </div>

                  {isWorking ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                      <Clock className="w-3.5 h-3.5" /> Working
                    </span>
                  ) : status === 'approved' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-success-container)] text-[var(--md-sys-color-on-success-container)]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved (₹{payout.toFixed(2)})
                    </span>
                  ) : status === 'rejected' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]">
                      <AlertTriangle className="w-3.5 h-3.5" /> Rejected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-warning-container)] text-[var(--md-sys-color-on-warning-container)]">
                      <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-[var(--md-sys-color-surface-container)] flex flex-col gap-0.5 border border-[var(--md-sys-color-outline-variant)]">
                    <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-sans uppercase">Login / Logout</span>
                    <span>In: {formatTime(item.login_time)}</span>
                    <span className="text-[var(--md-sys-color-on-surface-variant)]">Out: {formatTime(item.logout_time)}</span>
                  </div>

                  <div className="p-2 rounded bg-[var(--md-sys-color-surface-container)] flex flex-col gap-0.5 border border-[var(--md-sys-color-outline-variant)]">
                    <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-sans uppercase">Duration & Break</span>
                    <span>Net: {calculateNetTotal(item.login_time, item.logout_time, breakSecs)}</span>
                    <span className="text-amber-600 dark:text-amber-400">Break: {formatBreakDuration(breakSecs)}</span>
                  </div>
                </div>

                {/* Punctuality Badge Row on Mobile */}
                <div className="pt-1">
                  <PunctualityBadge
                    loginStatus={punctuality.loginStatus}
                    loginText={punctuality.loginBadgeText}
                    logoutStatus={punctuality.logoutStatus}
                    logoutText={punctuality.logoutBadgeText}
                    isAutoCutoff={item.is_auto_cutoff}
                  />
                </div>

                {isWorking ? (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                    <Button
                      variant="filled"
                      size="sm"
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                      onClick={() => setStopTimerSession(item)}
                      icon={<Square className="w-3.5 h-3.5 fill-current" />}
                    >
                      Stop Candidate Timer
                    </Button>
                  </div>
                ) : hasLogout ? (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                    <button
                      type="button"
                      onClick={() => setEditShiftRecord(item)}
                      className="px-2.5 py-1.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-xs font-semibold hover:bg-[var(--md-sys-color-surface-container-highest)]"
                    >
                      Edit
                    </button>

                    {status === 'approved' ? (
                      <button
                        onClick={() => openApproveModal(item)}
                        className="px-3 py-1.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-xs font-semibold hover:bg-[var(--md-sys-color-surface-container-highest)]"
                      >
                        Edit Payout (₹{payout.toFixed(2)})
                      </button>
                    ) : status === 'rejected' ? (
                      <button
                        onClick={() => openApproveModal(item)}
                        className="px-3 py-1.5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-semibold"
                      >
                        Approve Instead
                      </button>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          size="sm"
                          icon={<XCircle className="w-3.5 h-3.5" />}
                          onClick={() => openRejectModal(item)}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="filled"
                          size="sm"
                          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          onClick={() => openApproveModal(item)}
                        >
                          Approve Payout
                        </Button>
                      </>
                    )}
                  </div>
                ) : null}
              </Card>
            )
          })
        ) : (
          <Card variant="outlined" className="py-8 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
            No attendance records found matching criteria.
          </Card>
        )}
      </div>

      {/* 2. Desktop Attendance Table (>= 768px) */}
      <Card variant="outlined" className="hidden md:block p-0 border border-[var(--md-sys-color-outline-variant)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] text-xs font-semibold uppercase tracking-wider border-b border-[var(--md-sys-color-outline-variant)]">
                <th className="py-3.5 px-4 sm:px-6">Candidate</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Login / Logout</th>
                <th className="py-3.5 px-4">Punctuality</th>
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
                  const sShift = shifts.find((sh) => sh.id === item.shiftId) || defaultShift
                  const punctuality = calculatePunctualityStatus(
                    item.login_time,
                    item.logout_time,
                    sShift,
                    item.is_auto_cutoff,
                    12
                  )

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

                      <td className="py-4 px-4 whitespace-nowrap">
                        <PunctualityBadge
                          loginStatus={punctuality.loginStatus}
                          loginText={punctuality.loginBadgeText}
                          logoutStatus={punctuality.logoutStatus}
                          logoutText={punctuality.logoutBadgeText}
                          isAutoCutoff={item.is_auto_cutoff}
                          isStale={punctuality.isStale}
                          staleHours={punctuality.staleHours}
                        />
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
                              Approved (₹{payout.toFixed(2)})
                            </span>
                          </div>
                        ) : status === 'rejected' ? (
                          <div className="flex flex-col gap-0.5 max-w-[220px]">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]">
                              <XCircle className="w-3.5 h-3.5" />
                              Rejected
                            </span>
                            {item.rejection_reason && (
                              <span className="text-[10px] text-[var(--md-sys-color-error)] truncate" title={item.rejection_reason}>
                                Reason: {item.rejection_reason}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-warning-container)] text-[var(--md-sys-color-on-warning-container)]">
                            <Clock className="w-3.5 h-3.5" />
                            Pending Approval
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                        {isWorking ? (
                          <Button
                            variant="filled"
                            size="sm"
                            className="bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 text-xs px-3 h-8"
                            icon={<Square className="w-3 h-3 fill-current" />}
                            onClick={() => setStopTimerSession(item)}
                          >
                            Stop Timer
                          </Button>
                        ) : hasLogout ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditShiftRecord(item)}
                              className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-colors cursor-pointer"
                              title="Edit Shift Record"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {status === 'approved' ? (
                              <button
                                onClick={() => openApproveModal(item)}
                                className="px-3 py-1 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-xs font-semibold hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors cursor-pointer"
                                title="Edit Approved Payout"
                              >
                                Edit Payout (₹{payout.toFixed(2)})
                              </button>
                            ) : status === 'rejected' ? (
                              <button
                                onClick={() => openApproveModal(item)}
                                className="px-3 py-1 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-semibold transition-colors cursor-pointer"
                                title="Approve Instead"
                              >
                                Approve
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => openRejectModal(item)}
                                  className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-error)] transition-colors cursor-pointer"
                                  title="Reject Shift"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openApproveModal(item)}
                                  className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-success-container)] text-[var(--md-sys-color-success)] transition-colors cursor-pointer"
                                  title="Approve Payout"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    No attendance records found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>

      {/* Start Timer Modal Dialog */}
      <StartTimerModal
        isOpen={isStartTimerModalOpen}
        onClose={() => setIsStartTimerModalOpen(false)}
        candidates={candidates}
        activeUserIds={activeUserIds}
        onSuccess={() => {
          setToast({ message: 'Work timer started successfully.', variant: 'success' })
          router.refresh()
        }}
      />

      {/* Stop Timer Modal Dialog */}
      <StopTimerModal
        isOpen={!!stopTimerSession}
        onClose={() => setStopTimerSession(null)}
        session={stopTimerSession}
        hourlyRate={candidates.find((c) => c.id === stopTimerSession?.user_id)?.hourly_rate || 0}
        onSuccess={() => {
          setToast({ message: 'Candidate shift ended and recorded.', variant: 'success' })
          router.refresh()
        }}
      />

      {/* Manual Shift Modal Dialog */}
      <ManualShiftModal
        isOpen={isManualShiftModalOpen}
        onClose={() => setIsManualShiftModalOpen(false)}
        candidates={candidates}
        onSuccess={() => {
          setToast({ message: 'Manual shift record added successfully.', variant: 'success' })
          router.refresh()
        }}
      />

      {/* Edit Shift Modal Dialog */}
      <EditShiftModal
        isOpen={!!editShiftRecord}
        onClose={() => setEditShiftRecord(null)}
        record={editShiftRecord}
        hourlyRate={candidates.find((c) => c.id === editShiftRecord?.user_id)?.hourly_rate || 0}
        onSuccess={() => {
          setToast({ message: 'Attendance record updated successfully.', variant: 'success' })
          router.refresh()
        }}
      />

      {/* Approve Shift Modal Dialog */}
      {approveItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] rounded-[var(--md-sys-shape-corner-extra-large)] p-6 border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-4 my-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Approve Shift & Record Payment
              </h3>
              <button
                onClick={() => setApproveItem(null)}
                className="p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container)] flex flex-col gap-1 text-xs border border-[var(--md-sys-color-outline-variant)]">
              <div className="flex justify-between font-semibold">
                <span>Candidate: {approveItem.candidateName}</span>
                <span>Date: {formatDate(approveItem.login_time)}</span>
              </div>
              <div className="flex justify-between font-mono text-[var(--md-sys-color-on-surface-variant)]">
                <span>Shift Duration: {calculateNetTotal(approveItem.login_time, approveItem.logout_time, approveItem.break_duration_seconds)}</span>
              </div>
            </div>

            <form action={handleApproveSubmit} className="flex flex-col gap-4">
              <input type="hidden" name="attendanceId" value={approveItem.id} />

              <TextField
                name="payoutAmount"
                type="number"
                step="0.01"
                min="0"
                label="Payment Amount (₹)"
                value={customPayoutText}
                onChange={(e) => setCustomPayoutText(e.target.value)}
                required
                disabled={isApproving}
                startIcon={<IndianRupee className="w-4 h-4" />}
                supportingText="Auto-calculated from hourly rate; editable before confirming"
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
                  Confirm Approval
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Shift Modal Dialog */}
      {rejectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] rounded-[var(--md-sys-shape-corner-extra-large)] p-6 border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-4 my-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
              <h3 className="text-lg font-bold flex items-center gap-2 text-[var(--md-sys-color-error)]">
                <XCircle className="w-5 h-5" />
                Reject Shift
              </h3>
              <button
                onClick={() => setRejectItem(null)}
                className="p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container)] flex flex-col gap-1 text-xs border border-[var(--md-sys-color-outline-variant)]">
              <div className="flex justify-between font-semibold">
                <span>Candidate: {rejectItem.candidateName}</span>
                <span>Date: {formatDate(rejectItem.login_time)}</span>
              </div>
            </div>

            <form action={handleRejectSubmit} className="flex flex-col gap-4">
              <input type="hidden" name="attendanceId" value={rejectItem.id} />

              <TextField
                name="rejectionReason"
                label="Rejection Reason & Admin Feedback"
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                placeholder="e.g., Incomplete shift logs or unverified duration"
                required
                disabled={isRejecting}
              />

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

      {/* Realtime Attendance Listener */}
      <RealtimeAttendanceListener />

      {/* Snackbar Notifications */}
      <Snackbar
        message={toast?.message || null}
        variant={toast?.variant || 'success'}
        onClose={() => setToast(null)}
      />
    </div>
  )
}
