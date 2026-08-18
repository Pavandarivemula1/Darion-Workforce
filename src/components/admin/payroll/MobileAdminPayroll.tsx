'use client'

import React, { useState, useMemo } from 'react'
import {
  CandidatePayrollSummary,
  formatINR,
} from '@/lib/utils/payroll'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  CreditCard,
  CheckCircle2,
  Clock,
  IndianRupee,
  Download,
  Calendar,
  Search,
  FileText,
  Building2,
  Copy,
  Check,
} from 'lucide-react'

export interface MobileAdminPayrollProps {
  candidates: CandidatePayrollSummary[]
  totalTodayPay: number
  todayShiftsCount: number
  totalDue: number
  totalPaid: number
  totalPendingApproval: number
  totalCandidates: number
  totalApprovedHours: number
  payeesWithDueCount: number
  filter: string
  periodLabel: string
  onFilterChange: (newFilter: string) => void
  onExportCsv: () => void
  onOpenBatch: () => void
  onOpenSettle: (candidate: CandidatePayrollSummary) => void
  onOpenPayslip: (candidate: CandidatePayrollSummary) => void
  onOpenShifts: (candidate: CandidatePayrollSummary) => void
  onOpenBankDetails: (candidate: CandidatePayrollSummary) => void
}

export const MobileAdminPayroll: React.FC<MobileAdminPayrollProps> = ({
  candidates,
  totalTodayPay,
  todayShiftsCount,
  totalDue,
  totalPaid,
  totalPendingApproval,
  totalCandidates,
  totalApprovedHours,
  payeesWithDueCount,
  filter,
  periodLabel,
  onFilterChange,
  onExportCsv,
  onOpenBatch,
  onOpenSettle,
  onOpenPayslip,
  onOpenShifts,
  onOpenBankDetails,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'settled' | 'pending_approval'>('all')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCopy = (text: string, key: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const periodTabs = [
    { key: 'today', label: 'Today' },
    { key: 'this_week', label: 'This Week' },
    { key: 'last_week', label: 'Last Week' },
    { key: 'this_month', label: 'This Month' },
    { key: 'last_month', label: 'Last Month' },
    { key: 'all', label: 'All Time' },
  ]

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // Status filter
      if (statusFilter === 'due' && c.totalDueAmount <= 0) return false
      if (statusFilter === 'settled' && (c.totalPaidAmount <= 0 || c.totalDueAmount > 0)) return false
      if (statusFilter === 'pending_approval' && c.pendingShifts <= 0) return false

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = c.fullName.toLowerCase().includes(q)
        const matchPhone = (c.phoneNumber || '').toLowerCase().includes(q)
        const matchId = (c.idNumber || '').toLowerCase().includes(q)
        const matchBank = (c.bankName || '').toLowerCase().includes(q)
        const matchUpi = (c.upiId || '').toLowerCase().includes(q)
        const matchAcc = (c.bankAccountNumber || '').toLowerCase().includes(q)
        return matchName || matchPhone || matchId || matchBank || matchUpi || matchAcc
      }

      return true
    })
  }, [candidates, statusFilter, searchQuery])

  return (
    <div className="flex flex-col gap-2.5">
      {/* 1. Mobile Executive Payroll Command Strip (Executive Slate) */}
      <div className="p-3 rounded-2xl bg-slate-900 dark:bg-slate-950 text-slate-100 border border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payroll Ops</span>
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
            {formatINR(totalDue)} Due • {payeesWithDueCount} Awaiting
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onExportCsv}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 transition-all border border-slate-700 cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenBatch}
            disabled={payeesWithDueCount === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs flex items-center gap-1 transition-all border border-slate-700 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Batch ({payeesWithDueCount})</span>
          </button>
        </div>
      </div>

      {/* 2. 2x2 Ultra-Dense Bento Financial Matrix (Unified Neutral Elevated Surfaces) */}
      <div className="grid grid-cols-2 gap-2">
        {/* Metric 1: Total Due */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Total Due
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-base font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {formatINR(totalDue)}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">
              {payeesWithDueCount} Payees Waiting
            </span>
          </div>
        </div>

        {/* Metric 2: Settled / Paid */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Disbursed
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-base font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {formatINR(totalPaid)}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">
              Settled in Period
            </span>
          </div>
        </div>

        {/* Metric 3: Today's Wages */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Today&apos;s Pay
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-base font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {formatINR(totalTodayPay)}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">
              {todayShiftsCount} Shifts Logged
            </span>
          </div>
        </div>

        {/* Metric 4: Pending Approvals */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Pending Shifts
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-base font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {formatINR(totalPendingApproval)}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">
              {totalApprovedHours.toFixed(1)}h Approved
            </span>
          </div>
        </div>
      </div>

      {/* 3. Compact Period Selector Ribbon */}
      <div className="flex flex-col gap-1 p-2 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]">
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
          {periodTabs.map((tab) => {
            const isActive = filter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => onFilterChange(tab.key)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
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
        <div className="flex items-center gap-1 text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-medium px-1">
          <Calendar className="w-3 h-3 text-slate-500" />
          <span className="truncate">{periodLabel}</span>
        </div>
      </div>

      {/* 4. Mobile Candidate Payroll Ledger Hub */}
      <div className="flex flex-col gap-2">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]" />
          <input
            type="text"
            placeholder="Search candidate, bank, UPI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-xl text-xs bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:border-[var(--md-sys-color-outline)]"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-[10px] font-bold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]'
            }`}
          >
            All ({candidates.length})
          </button>
          <button
            onClick={() => setStatusFilter('due')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'due'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]'
            }`}
          >
            Has Dues ({candidates.filter((c) => c.totalDueAmount > 0).length})
          </button>
          <button
            onClick={() => setStatusFilter('settled')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'settled'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]'
            }`}
          >
            Settled ({candidates.filter((c) => c.totalPaidAmount > 0 && c.totalDueAmount === 0).length})
          </button>
          <button
            onClick={() => setStatusFilter('pending_approval')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'pending_approval'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]'
            }`}
          >
            Pending ({candidates.filter((c) => c.pendingShifts > 0).length})
          </button>
        </div>

        {/* Ledger Cards */}
        <div className="flex flex-col gap-2">
          {filteredCandidates.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
              No candidate payroll records found.
            </div>
          ) : (
            filteredCandidates.map((c) => {
              const hasDue = c.totalDueAmount > 0
              const bankKey = `bank-${c.candidateId}`
              const upiKey = `upi-${c.candidateId}`

              return (
                <Card
                  key={c.candidateId}
                  variant="outlined"
                  className="p-2.5 rounded-2xl flex flex-col gap-2 relative overflow-hidden transition-all border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] shadow-2xs"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] font-bold text-[11px] flex items-center justify-center shrink-0">
                        {c.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-[var(--md-sys-color-on-surface)] truncate">{c.fullName}</h4>
                        <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-mono">
                          {formatINR(c.hourlyRate)}/hr • {c.totalApprovedHours.toFixed(1)} hrs
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {hasDue ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40 font-mono">
                          {formatINR(c.totalDueAmount)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Settled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial & Banking Strip */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] p-2 rounded-xl bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)]">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[var(--md-sys-color-on-surface-variant)] block">
                        Total Payable
                      </span>
                      <span className="font-bold font-mono text-xs text-[var(--md-sys-color-on-surface)]">
                        {formatINR(c.totalGrossPayable)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-[var(--md-sys-color-on-surface-variant)] block">
                        Destination
                      </span>
                      {c.bankAccountNumber ? (
                        <div className="flex items-center gap-1 font-mono text-[10px]">
                          <span className="truncate max-w-[90px]">••{c.bankAccountNumber.slice(-4)}</span>
                          <button
                            onClick={() => handleCopy(c.bankAccountNumber!, bankKey)}
                            className="p-0.5 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] cursor-pointer"
                          >
                            {copiedKey === bankKey ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                          </button>
                        </div>
                      ) : c.upiId ? (
                        <div className="flex items-center gap-1 font-mono text-[10px]">
                          <span className="truncate max-w-[90px]">{c.upiId}</span>
                          <button
                            onClick={() => handleCopy(c.upiId!, upiKey)}
                            className="p-0.5 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] cursor-pointer"
                          >
                            {copiedKey === upiKey ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onOpenBankDetails(c)}
                          className="text-[10px] text-slate-600 dark:text-slate-400 hover:underline font-bold cursor-pointer"
                        >
                          + Set Bank
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 1-Tap Action Dock */}
                  <div className="flex items-center gap-1 pt-1 border-t border-[var(--md-sys-color-outline-variant)]">
                    {hasDue && (
                      <Button
                        variant="filled"
                        size="xs"
                        className="flex-1 text-[11px] h-7"
                        onClick={() => onOpenSettle(c)}
                        icon={<CreditCard className="w-3 h-3" />}
                      >
                        Settle
                      </Button>
                    )}

                    <Button
                      variant="tonal"
                      size="xs"
                      className="flex-1 text-[11px] h-7"
                      onClick={() => onOpenPayslip(c)}
                      icon={<FileText className="w-3 h-3" />}
                    >
                      Payslip
                    </Button>

                    <button
                      onClick={() => onOpenShifts(c)}
                      className="px-2 h-7 rounded-lg bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="Shifts Audit"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Shifts</span>
                    </button>

                    <button
                      onClick={() => onOpenBankDetails(c)}
                      className="px-2 h-7 rounded-lg bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="Bank Setup"
                    >
                      <Building2 className="w-3 h-3" />
                    </button>
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
