'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Snackbar } from '@/components/ui/Snackbar'
import {
  CandidatePayrollProfile,
  PayrollAttendanceRecord,
  CandidatePayrollSummary,
  calculateCandidatePayrollSummaries,
  generatePayrollCsv,
} from '@/lib/utils/payroll'
import { getKolkataDateKey, getWeekBoundaries } from '@/lib/utils/timesheet'
import { PayrollSummaryCards } from './PayrollSummaryCards'
import { CandidatePayrollTable } from './CandidatePayrollTable'
import { SettlePaymentModal } from './SettlePaymentModal'
import { PayslipModal } from './PayslipModal'
import { ShiftBreakdownModal } from './ShiftBreakdownModal'
import { CandidateBankDetailsModal } from './CandidateBankDetailsModal'
import { BatchPayrollModal } from './BatchPayrollModal'
import {
  Download,
  Calendar,
  CreditCard,
} from 'lucide-react'

export interface AdminPayrollClientProps {
  candidates: CandidatePayrollProfile[]
  records: PayrollAttendanceRecord[]
  initialFilter?: string
}

export const AdminPayrollClient: React.FC<AdminPayrollClientProps> = ({
  candidates,
  records: allRecords,
  initialFilter = 'this_week',
}) => {
  const router = useRouter()

  const [filter, setFilter] = useState<string>(initialFilter)
  const [customStart, setCustomStart] = useState<string>('')
  const [customEnd, setCustomEnd] = useState<string>('')

  // Modals state
  const [settleCandidate, setSettleCandidate] = useState<CandidatePayrollSummary | null>(null)
  const [payslipCandidate, setPayslipCandidate] = useState<CandidatePayrollSummary | null>(null)
  const [shiftsCandidate, setShiftsCandidate] = useState<CandidatePayrollSummary | null>(null)
  const [bankCandidate, setBankCandidate] = useState<CandidatePayrollSummary | null>(null)
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false)

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)

  const todayKolkataKey = useMemo(() => getKolkataDateKey(new Date().toISOString()), [])

  // Today's All-Time Aggregation (always calculated across all records for the top KPI badge)
  const allTimeSummaries = useMemo(() => {
    return calculateCandidatePayrollSummaries(candidates, allRecords)
  }, [candidates, allRecords])

  const totalTodayPay = useMemo(() => {
    return allTimeSummaries.reduce((sum, c) => sum + c.todayPay, 0)
  }, [allTimeSummaries])

  const todayShiftsCount = useMemo(() => {
    return (allRecords || []).filter((r) => getKolkataDateKey(r.login_time) === todayKolkataKey).length
  }, [allRecords, todayKolkataKey])

  // Instant in-memory date range filter (< 1ms execution)
  const { filteredRecords, periodLabel, periodRange } = useMemo(() => {
    let rangeStart: Date | null = null
    let rangeEnd: Date | null = null
    let label = 'This Week'

    if (filter === 'today') {
      const startOfToday = new Date()
      startOfToday.setHours(0, 0, 0, 0)
      rangeStart = startOfToday
      label = `Today (${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' })})`
    } else if (filter === 'this_week') {
      const { startOfWeek, endOfWeek, weekLabel } = getWeekBoundaries()
      rangeStart = startOfWeek
      rangeEnd = endOfWeek
      label = `This Week (${weekLabel})`
    } else if (filter === 'last_week') {
      const lastWeekRef = new Date()
      lastWeekRef.setDate(lastWeekRef.getDate() - 7)
      const { startOfWeek, endOfWeek, weekLabel } = getWeekBoundaries(lastWeekRef)
      rangeStart = startOfWeek
      rangeEnd = endOfWeek
      label = `Last Week (${weekLabel})`
    } else if (filter === 'this_month') {
      const now = new Date()
      rangeStart = new Date(now.getFullYear(), now.getMonth(), 1)
      rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      label = `This Month (${now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })})`
    } else if (filter === 'last_month') {
      const now = new Date()
      rangeStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      rangeEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      label = `Last Month (${lastMonthDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })})`
    } else if (filter === 'all') {
      label = 'All Time Records'
    } else if (filter === 'custom') {
      if (customStart) rangeStart = new Date(customStart)
      if (customEnd) {
        rangeEnd = new Date(customEnd)
        rangeEnd.setHours(23, 59, 59, 999)
      }
      label = `Custom Period (${customStart || 'Start'} – ${customEnd || 'Present'})`
    }

    const filtered = (allRecords || []).filter((r) => {
      if (filter === 'today') {
        return getKolkataDateKey(r.login_time) === todayKolkataKey
      }
      const loginDate = new Date(r.login_time)
      if (rangeStart && loginDate < rangeStart) return false
      if (rangeEnd && loginDate > rangeEnd) return false
      return true
    })

    return {
      filteredRecords: filtered,
      periodLabel: label,
      periodRange: {
        start: rangeStart?.toISOString(),
        end: rangeEnd?.toISOString(),
      },
    }
  }, [allRecords, filter, customStart, customEnd, todayKolkataKey])

  // Summaries per candidate for the active filter
  const candidateSummaries = useMemo(() => {
    return calculateCandidatePayrollSummaries(candidates, filteredRecords)
  }, [candidates, filteredRecords])

  // KPI Metrics Calculations for selected filter
  const totalDue = useMemo(() => {
    return candidateSummaries.reduce((sum, c) => sum + c.totalDueAmount, 0)
  }, [candidateSummaries])

  const totalPaid = useMemo(() => {
    return candidateSummaries.reduce((sum, c) => sum + c.totalPaidAmount, 0)
  }, [candidateSummaries])

  const totalPendingApproval = useMemo(() => {
    return candidateSummaries.reduce((sum, c) => sum + c.totalPendingApprovalValue, 0)
  }, [candidateSummaries])

  const totalApprovedHours = useMemo(() => {
    return candidateSummaries.reduce((sum, c) => sum + c.totalApprovedHours, 0)
  }, [candidateSummaries])

  const payeesWithDueCount = useMemo(() => {
    return candidateSummaries.filter((c) => c.totalDueAmount > 0).length
  }, [candidateSummaries])

  // Handle Export CSV
  const handleExportCsv = () => {
    const csvContent = generatePayrollCsv(candidateSummaries, periodLabel)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dateStr = new Date().toISOString().slice(0, 10)
    link.setAttribute('href', url)
    link.setAttribute('download', `darion-payroll-${filter}-${dateStr}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setToast({ message: 'Payroll register CSV generated and downloaded.', variant: 'success' })
  }

  const periodTabs = [
    { key: 'today', label: 'Today' },
    { key: 'this_week', label: 'This Week' },
    { key: 'last_week', label: 'Last Week' },
    { key: 'this_month', label: 'This Month' },
    { key: 'last_month', label: 'Last Month' },
    { key: 'all', label: 'All Time' },
    { key: 'custom', label: 'Custom Range' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toast && (
        <Snackbar
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
            Payroll & Disbursements
          </h2>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
            Daily shift wages, automated disbursements, and candidate payment summaries
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outlined"
            size="md"
            onClick={handleExportCsv}
            icon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>

          <Button
            variant="filled"
            size="md"
            onClick={() => setIsBatchModalOpen(true)}
            disabled={payeesWithDueCount === 0}
            icon={<CreditCard className="w-4 h-4" />}
          >
            Batch Payout ({payeesWithDueCount})
          </Button>
        </div>
      </div>

      {/* Period Filter Tabs & Date Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs">
        {/* Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {periodTabs.map((tab) => {
            const isActive = filter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-2xs'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Custom Range Inputs */}
        {filter === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]"
            />
            <span className="text-[var(--md-sys-color-on-surface-variant)]">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]"
            />
          </div>
        )}

        {/* Active Period Badge */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-[var(--md-sys-color-on-surface-variant)] font-medium pr-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>{periodLabel}</span>
        </div>
      </div>

      {/* KPI Financial Metric Summary Cards */}
      <PayrollSummaryCards
        totalTodayPay={totalTodayPay}
        todayShiftsCount={todayShiftsCount}
        totalDue={totalDue}
        totalPaid={totalPaid}
        totalPendingApproval={totalPendingApproval}
        totalCandidates={candidates.length}
        totalApprovedHours={totalApprovedHours}
        payeesWithDueCount={payeesWithDueCount}
      />

      {/* Candidate Payroll Table */}
      <CandidatePayrollTable
        candidates={candidateSummaries}
        onOpenSettle={(c) => setSettleCandidate(c)}
        onOpenPayslip={(c) => setPayslipCandidate(c)}
        onOpenShifts={(c) => setShiftsCandidate(c)}
        onOpenBankDetails={(c) => setBankCandidate(c)}
      />

      {/* Settlement Modal */}
      <SettlePaymentModal
        isOpen={!!settleCandidate}
        onClose={() => setSettleCandidate(null)}
        candidate={settleCandidate}
        periodStart={periodRange.start}
        periodEnd={periodRange.end}
        onSuccess={(msg) => {
          setToast({ message: msg, variant: 'success' })
          router.refresh()
        }}
        onError={(msg) => setToast({ message: msg, variant: 'error' })}
      />

      {/* Payslip Modal */}
      <PayslipModal
        isOpen={!!payslipCandidate}
        onClose={() => setPayslipCandidate(null)}
        candidate={payslipCandidate}
        periodLabel={periodLabel}
      />

      {/* Itemized Shifts Modal */}
      <ShiftBreakdownModal
        isOpen={!!shiftsCandidate}
        onClose={() => setShiftsCandidate(null)}
        candidate={shiftsCandidate}
        onSuccess={(msg) => {
          setToast({ message: msg, variant: 'success' })
          router.refresh()
        }}
        onError={(msg) => setToast({ message: msg, variant: 'error' })}
      />

      {/* Candidate Bank & UPI Details Modal */}
      <CandidateBankDetailsModal
        isOpen={!!bankCandidate}
        onClose={() => setBankCandidate(null)}
        candidate={bankCandidate}
        onSuccess={(msg) => {
          setToast({ message: msg, variant: 'success' })
          router.refresh()
        }}
        onError={(msg) => setToast({ message: msg, variant: 'error' })}
      />

      {/* Batch Payout Modal */}
      <BatchPayrollModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        candidates={candidateSummaries}
        onSuccess={(msg) => {
          setToast({ message: msg, variant: 'success' })
          router.refresh()
        }}
        onError={(msg) => setToast({ message: msg, variant: 'error' })}
      />
    </div>
  )
}
