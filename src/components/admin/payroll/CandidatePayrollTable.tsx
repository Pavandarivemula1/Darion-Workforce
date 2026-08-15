'use client'

import React, { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  CandidatePayrollSummary,
  formatINR,
} from '@/lib/utils/payroll'
import {
  Search,
  CreditCard,
  FileText,
  Clock,
  Building2,
  CheckCircle2,
  Copy,
  Check,
  User,
  IndianRupee,
} from 'lucide-react'

export interface CandidatePayrollTableProps {
  candidates: CandidatePayrollSummary[]
  onOpenSettle: (candidate: CandidatePayrollSummary) => void
  onOpenPayslip: (candidate: CandidatePayrollSummary) => void
  onOpenShifts: (candidate: CandidatePayrollSummary) => void
  onOpenBankDetails: (candidate: CandidatePayrollSummary) => void
}

export const CandidatePayrollTable: React.FC<CandidatePayrollTableProps> = ({
  candidates,
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
    <div className="flex flex-col gap-4">
      {/* Search & Status Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates, IDs, banks, UPI..."
            className="w-full h-10 pl-10 pr-10 rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] text-xs sm:text-sm text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)] transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] px-1 py-0.5 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Clean Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-medium no-scrollbar">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-all active:scale-95 ${
              statusFilter === 'all'
                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-semibold shadow-2xs'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]'
            }`}
          >
            All Candidates ({candidates.length})
          </button>
          <button
            onClick={() => setStatusFilter('due')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-all active:scale-95 ${
              statusFilter === 'due'
                ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                : 'text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 bg-amber-500/5 border border-amber-500/30'
            }`}
          >
            Has Unpaid Dues ({candidates.filter((c) => c.totalDueAmount > 0).length})
          </button>
          <button
            onClick={() => setStatusFilter('settled')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-all ${
              statusFilter === 'settled'
                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-semibold shadow-2xs'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]'
            }`}
          >
            Settled ({candidates.filter((c) => c.totalPaidAmount > 0 && c.totalDueAmount === 0).length})
          </button>
          <button
            onClick={() => setStatusFilter('pending_approval')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-all ${
              statusFilter === 'pending_approval'
                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-semibold shadow-2xs'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]'
            }`}
          >
            Pending Shifts ({candidates.filter((c) => c.pendingShifts > 0).length})
          </button>
        </div>
      </div>

      {/* Desktop Candidate Payroll Ledger Table */}
      <div className="hidden md:block overflow-hidden border border-[var(--md-sys-color-outline-variant)] rounded-2xl bg-[var(--md-sys-color-surface)] shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--md-sys-color-surface-container-low)] border-b border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)] font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Candidate</th>
              <th className="py-3.5 px-3">Base Rate</th>
              <th className="py-3.5 px-3">Approved Time</th>
              <th className="py-3.5 px-3">Total Payable</th>
              <th className="py-3.5 px-3">Payment Destination</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)]">
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-[var(--md-sys-color-on-surface-variant)]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <User className="w-8 h-8 opacity-40" />
                    <p className="font-semibold text-sm">No candidate payroll records found.</p>
                    <p className="text-xs opacity-75">Try changing the period filter or search query.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCandidates.map((c) => {
                const hasDue = c.totalDueAmount > 0
                const bankKey = `bank-${c.candidateId}`
                const upiKey = `upi-${c.candidateId}`

                return (
                  <tr
                    key={c.candidateId}
                    className="hover:bg-[var(--md-sys-color-surface-container-high)]/30 transition-colors"
                  >
                    {/* Candidate Identity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                          {c.avatarUrl ? (
                            <img src={c.avatarUrl} alt={c.fullName} className="w-full h-full object-cover" />
                          ) : (
                            c.fullName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-sm text-[var(--md-sys-color-on-surface)] block leading-tight truncate">
                            {c.fullName}
                          </span>
                          <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-mono block truncate">
                            {c.idNumber || c.phoneNumber || c.candidateId.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Hourly Rate */}
                    <td className="py-3.5 px-3 font-mono text-xs text-[var(--md-sys-color-on-surface)]">
                      {formatINR(c.hourlyRate)}/hr
                    </td>

                    {/* Approved Hours & Shifts */}
                    <td className="py-3.5 px-3">
                      <div className="font-mono font-semibold text-xs text-[var(--md-sys-color-on-surface)]">
                        {c.totalApprovedHours.toFixed(2)} hrs
                      </div>
                      <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block">
                        {c.approvedShifts} {c.approvedShifts === 1 ? 'Shift' : 'Shifts'}
                        {c.pendingShifts > 0 && ` • ${c.pendingShifts} pending`}
                      </span>
                    </td>

                    {/* Total Payable & Status */}
                    <td className="py-3.5 px-3">
                      <div className="font-mono font-bold text-sm text-[var(--md-sys-color-on-surface)]">
                        {formatINR(c.totalGrossPayable)}
                      </div>
                      <div className="mt-0.5">
                        {hasDue ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                            Due: {formatINR(c.totalDueAmount)}
                          </span>
                        ) : c.totalPaidAmount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Settled
                          </span>
                        ) : (
                          <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                            No Dues
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Payout Destination Info */}
                    <td className="py-3.5 px-3">
                      {c.bankAccountNumber ? (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--md-sys-color-on-surface)] font-mono">
                          <Building2 className="w-3.5 h-3.5 text-[var(--md-sys-color-on-surface-variant)] shrink-0" />
                          <span>{c.bankName || 'Bank'}: ••••{c.bankAccountNumber.slice(-4)}</span>
                          <button
                            onClick={() => handleCopy(c.bankAccountNumber!, bankKey)}
                            className="p-0.5 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] cursor-pointer"
                            title="Copy Account Number"
                          >
                            {copiedKey === bankKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ) : c.upiId ? (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--md-sys-color-on-surface)] font-mono">
                          <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-semibold">UPI:</span>
                          <span className="truncate max-w-[120px]" title={c.upiId}>{c.upiId}</span>
                          <button
                            onClick={() => handleCopy(c.upiId!, upiKey)}
                            className="p-0.5 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] cursor-pointer"
                            title="Copy UPI ID"
                          >
                            {copiedKey === upiKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onOpenBankDetails(c)}
                          className="text-xs text-[var(--md-sys-color-primary)] hover:underline font-medium cursor-pointer"
                        >
                          + Add Bank Details
                        </button>
                      )}
                    </td>

                    {/* Row Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {hasDue ? (
                          <Button
                            variant="filled"
                            size="sm"
                            onClick={() => onOpenSettle(c)}
                            icon={<CreditCard className="w-3.5 h-3.5" />}
                          >
                            Settle Pay
                          </Button>
                        ) : null}

                        <Button
                          variant="tonal"
                          size="sm"
                          onClick={() => onOpenPayslip(c)}
                          icon={<FileText className="w-3.5 h-3.5" />}
                        >
                          Payslip
                        </Button>

                        <button
                          onClick={() => onOpenShifts(c)}
                          className="p-2 rounded-lg hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
                          title="View Itemized Shifts"
                        >
                          <Clock className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onOpenBankDetails(c)}
                          className="p-2 rounded-lg hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
                          title="Edit Bank Details"
                        >
                          <Building2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Candidate Cards */}
      <div className="md:hidden flex flex-col gap-3">
        {filteredCandidates.length === 0 ? (
          <Card variant="elevated" className="py-10 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
            No candidate payroll records found.
          </Card>
        ) : (
          filteredCandidates.map((c) => {
            const hasDue = c.totalDueAmount > 0

            return (
              <Card
                key={c.candidateId}
                variant="elevated"
                className="flex flex-col gap-3 p-4 border border-[var(--md-sys-color-outline-variant)] rounded-2xl bg-[var(--md-sys-color-surface)]"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center font-bold text-xs">
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt={c.fullName} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        c.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-[var(--md-sys-color-on-surface)]">{c.fullName}</h4>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                        {formatINR(c.hourlyRate)}/hr • {c.totalApprovedHours.toFixed(1)} hrs
                      </p>
                    </div>
                  </div>

                  <div>
                    {hasDue ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-mono">
                        {formatINR(c.totalDueAmount)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        Settled
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)]">
                  <div>
                    <span className="text-[var(--md-sys-color-on-surface-variant)] text-[10px] uppercase font-semibold block">Total Payable</span>
                    <span className="font-semibold font-mono">{formatINR(c.totalGrossPayable)}</span>
                  </div>
                  <div>
                    <span className="text-[var(--md-sys-color-on-surface-variant)] text-[10px] uppercase font-semibold block">Destination</span>
                    <span className="font-medium truncate block">{c.bankName || c.upiId || 'Not Configured'}</span>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-[var(--md-sys-color-outline-variant)]">
                  {hasDue ? (
                    <Button
                      variant="filled"
                      size="sm"
                      className="flex-1"
                      onClick={() => onOpenSettle(c)}
                      icon={<CreditCard className="w-3.5 h-3.5" />}
                    >
                      Settle Pay
                    </Button>
                  ) : null}

                  <Button
                    variant="tonal"
                    size="sm"
                    className="flex-1"
                    onClick={() => onOpenPayslip(c)}
                    icon={<FileText className="w-3.5 h-3.5" />}
                  >
                    Payslip
                  </Button>

                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => onOpenShifts(c)}
                    icon={<Clock className="w-3.5 h-3.5" />}
                  >
                    Shifts
                  </Button>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
