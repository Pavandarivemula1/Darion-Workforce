'use client'

import React, { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Snackbar } from '@/components/ui/Snackbar'
import {
  CandidatePayrollProfile,
  PayrollAttendanceRecord,
  CandidatePayrollSummary,
  calculateCandidatePayrollSummaries,
  formatINR,
  calculateNetShiftMs,
} from '@/lib/utils/payroll'
import { getKolkataDateKey, getWeekBoundaries, formatDurationMs, formatBreakDuration } from '@/lib/utils/timesheet'
import { PayslipModal } from '@/components/admin/payroll/PayslipModal'
import { CandidateBankDetailsModal } from '@/components/admin/payroll/CandidateBankDetailsModal'
import {
  CreditCard,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  IndianRupee,
  Coffee,
  Edit,
} from 'lucide-react'

export interface CandidatePayrollClientProps {
  candidateProfile: CandidatePayrollProfile
  records: PayrollAttendanceRecord[]
}

export const CandidatePayrollClient: React.FC<CandidatePayrollClientProps> = ({
  candidateProfile,
  records: allRecords,
}) => {
  const [filter, setFilter] = useState<string>('this_week')
  const [isPayslipOpen, setIsPayslipOpen] = useState(false)
  const [isBankModalOpen, setIsBankModalOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)

  const todayKolkataKey = useMemo(() => getKolkataDateKey(new Date().toISOString()), [])

  // Filter records by period
  const { filteredRecords, periodLabel } = useMemo(() => {
    let rangeStart: Date | null = null
    let rangeEnd: Date | null = null
    let label = 'This Week'

    if (filter === 'today') {
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
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      label = `Last Month (${lm.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })})`
    } else if (filter === 'all') {
      label = 'All Time Records'
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

    return { filteredRecords: filtered, periodLabel: label }
  }, [allRecords, filter, todayKolkataKey])

  // Candidate summary for the selected period
  const candidateSummary: CandidatePayrollSummary = useMemo(() => {
    const list = calculateCandidatePayrollSummaries([candidateProfile], filteredRecords)
    return (
      list[0] || {
        candidateId: candidateProfile.id,
        fullName: candidateProfile.full_name,
        avatarUrl: candidateProfile.avatar_url || null,
        phoneNumber: candidateProfile.phone_number || null,
        idNumber: candidateProfile.id_number || null,
        hourlyRate: candidateProfile.hourly_rate || 0,
        bankName: candidateProfile.bank_name || null,
        bankAccountNumber: candidateProfile.bank_account_number || null,
        bankIfsc: candidateProfile.bank_ifsc || null,
        upiId: candidateProfile.upi_id || null,
        panNumber: candidateProfile.pan_number || null,
        totalShifts: 0,
        approvedShifts: 0,
        pendingShifts: 0,
        rejectedShifts: 0,
        totalApprovedMs: 0,
        totalApprovedHours: 0,
        totalPendingMs: 0,
        todayPay: 0,
        todayHours: 0,
        todayApprovedPay: 0,
        todayPendingPay: 0,
        totalGrossPayable: 0,
        totalPaidAmount: 0,
        totalDueAmount: 0,
        totalPendingApprovalValue: 0,
        paymentStatus: 'no_dues',
        records: [],
      }
    )
  }, [candidateProfile, filteredRecords])

  const periodTabs = [
    { key: 'today', label: 'Today' },
    { key: 'this_week', label: 'This Week' },
    { key: 'last_week', label: 'Last Week' },
    { key: 'this_month', label: 'This Month' },
    { key: 'last_month', label: 'Last Month' },
    { key: 'all', label: 'All Time' },
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
            My Earnings & Payroll
          </h2>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
            Verified shift payouts, daily auto wage counts, and official payslips
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="filled"
            size="md"
            onClick={() => setIsPayslipOpen(true)}
            icon={<FileText className="w-4 h-4" />}
          >
            View Official Payslip
          </Button>
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs">
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

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Today's Pay */}
        <Card variant="elevated" className="flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-5 bg-[var(--md-sys-color-surface)] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Today&apos;s Pay
            </span>
            <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--md-sys-color-on-surface)] font-mono">
              {formatINR(candidateSummary.todayPay)}
            </span>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 truncate">
              {candidateSummary.todayHours} hrs logged today
            </p>
          </div>
        </Card>

        {/* Total Gross in Period */}
        <Card variant="elevated" className="flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-5 bg-[var(--md-sys-color-surface)] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Gross Value
            </span>
            <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--md-sys-color-on-surface)] font-mono">
              {formatINR(candidateSummary.totalGrossPayable)}
            </span>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 truncate">
              Rate: {formatINR(candidateSummary.hourlyRate)}/hr
            </p>
          </div>
        </Card>

        {/* Pending Due Payout */}
        <Card variant="elevated" className="flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-5 bg-[var(--md-sys-color-surface)] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Awaiting Payout
            </span>
            <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--md-sys-color-on-surface)] font-mono">
              {formatINR(candidateSummary.totalDueAmount)}
            </span>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 truncate">
              Unpaid approved balance
            </p>
          </div>
        </Card>

        {/* Settled / Disbursed */}
        <Card variant="elevated" className="flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-5 bg-[var(--md-sys-color-surface)] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Settled / Paid
            </span>
            <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--md-sys-color-on-surface)] font-mono">
              {formatINR(candidateSummary.totalPaidAmount)}
            </span>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 truncate">
              Paid to account
            </p>
          </div>
        </Card>

        {/* Approved Hours */}
        <Card variant="elevated" className="flex flex-col justify-between border border-[var(--md-sys-color-outline-variant)] rounded-2xl p-5 bg-[var(--md-sys-color-surface)] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Approved Hours
            </span>
            <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--md-sys-color-on-surface)] font-mono">
              {candidateSummary.totalApprovedHours.toFixed(1)} <span className="text-sm font-medium font-sans">hrs</span>
            </span>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 truncate">
              {candidateSummary.approvedShifts} of {candidateSummary.totalShifts} shifts
            </p>
          </div>
        </Card>
      </div>

      {/* Payout Banking Details Card */}
      <Card variant="outlined" className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[var(--md-sys-color-outline-variant)] rounded-2xl bg-[var(--md-sys-color-surface)] shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
              Registered Payout Destination
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[var(--md-sys-color-on-surface-variant)]">
              <span>Bank: <strong className="text-[var(--md-sys-color-on-surface)] font-medium">{candidateProfile.bank_name || 'Not Configured'}</strong></span>
              <span>A/C: <strong className="text-[var(--md-sys-color-on-surface)] font-mono">{candidateProfile.bank_account_number ? `••••${candidateProfile.bank_account_number.slice(-4)}` : 'N/A'}</strong></span>
              <span>IFSC: <strong className="text-[var(--md-sys-color-on-surface)] font-mono">{candidateProfile.bank_ifsc || 'N/A'}</strong></span>
              <span>UPI: <strong className="text-[var(--md-sys-color-on-surface)] font-mono">{candidateProfile.upi_id || 'N/A'}</strong></span>
            </div>
          </div>
        </div>

        <Button
          variant="tonal"
          size="sm"
          onClick={() => setIsBankModalOpen(true)}
          icon={<Edit className="w-3.5 h-3.5" />}
        >
          Update Details
        </Button>
      </Card>

      {/* Itemized Shift Earnings Table */}
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">
          Itemized Shift Payouts ({candidateSummary.records.length})
        </h3>

        <div className="overflow-x-auto border border-[var(--md-sys-color-outline-variant)] rounded-2xl bg-[var(--md-sys-color-surface)] shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--md-sys-color-surface-container-low)] border-b border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Shift Date</th>
                <th className="py-3.5 px-3">Duration & Break</th>
                <th className="py-3.5 px-3">Hourly Rate</th>
                <th className="py-3.5 px-3">Calculated Payout</th>
                <th className="py-3.5 px-3">Approval</th>
                <th className="py-3.5 px-4 text-right">Disbursement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)]">
              {candidateSummary.records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[var(--md-sys-color-on-surface-variant)]">
                    No shifts logged in this period.
                  </td>
                </tr>
              ) : (
                candidateSummary.records.map((r) => {
                  const netMs = calculateNetShiftMs(r.login_time, r.logout_time, r.break_duration_seconds)
                  const hours = netMs / (1000 * 60 * 60)
                  const payout = typeof r.payout_amount === 'number' && r.payout_amount >= 0
                    ? r.payout_amount
                    : Math.round(hours * candidateSummary.hourlyRate * 100) / 100

                  const loginD = new Date(r.login_time)
                  const logoutD = r.logout_time ? new Date(r.logout_time) : null

                  return (
                    <tr key={r.id} className="hover:bg-[var(--md-sys-color-surface-container-high)]/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-xs text-[var(--md-sys-color-on-surface)]">
                          {loginD.toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-mono mt-0.5">
                          {loginD.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} → {logoutD ? logoutD.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-mono font-semibold text-xs">
                          {formatDurationMs(netMs)}
                        </div>
                        {r.break_duration_seconds && r.break_duration_seconds > 0 ? (
                          <div className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1 mt-0.5">
                            <Coffee className="w-3 h-3" />
                            <span>Break: {formatBreakDuration(r.break_duration_seconds)}</span>
                          </div>
                        ) : null}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-xs text-[var(--md-sys-color-on-surface)]">
                        {formatINR(candidateSummary.hourlyRate)}/hr
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-sm text-[var(--md-sys-color-on-surface)]">
                        {formatINR(payout)}
                      </td>

                      <td className="py-3.5 px-3">
                        {r.approval_status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {r.approval_status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                        {r.approval_status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20">
                            Rejected
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {r.payment_status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            Paid {r.payment_reference ? `(${r.payment_reference})` : ''}
                          </span>
                        ) : r.approval_status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                            Awaiting Payout
                          </span>
                        ) : (
                          <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">Auto Counted</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal */}
      <PayslipModal
        isOpen={isPayslipOpen}
        onClose={() => setIsPayslipOpen(false)}
        candidate={candidateSummary}
        periodLabel={periodLabel}
      />

      {/* Bank Details Modal */}
      <CandidateBankDetailsModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        candidate={candidateSummary}
        onSuccess={(msg) => setToast({ message: msg, variant: 'success' })}
        onError={(msg) => setToast({ message: msg, variant: 'error' })}
      />
    </div>
  )
}
