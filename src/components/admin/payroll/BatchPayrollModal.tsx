'use client'

import React, { useState, useTransition } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { CandidatePayrollSummary, formatINR } from '@/lib/utils/payroll'
import { batchSettlePayrollAction } from '@/app/actions/payroll'
import { CheckCheck, CreditCard, Users, AlertCircle } from 'lucide-react'

export interface BatchPayrollModalProps {
  isOpen: boolean
  onClose: () => void
  candidates: CandidatePayrollSummary[]
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export const BatchPayrollModal: React.FC<BatchPayrollModalProps> = ({
  isOpen,
  onClose,
  candidates,
  onSuccess,
  onError,
}) => {
  const [isPending, startTransition] = useTransition()

  // Eligible candidates are those with due amount > 0
  const eligibleCandidates = candidates.filter((c) => c.totalDueAmount > 0)
  const [selectedIds, setSelectedIds] = useState<string[]>(eligibleCandidates.map((c) => c.candidateId))
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer (NEFT/IMPS)')
  const [batchReference, setBatchReference] = useState<string>(`BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`)
  const [notes, setNotes] = useState<string>('Batch Payroll Run')

  React.useEffect(() => {
    setSelectedIds(eligibleCandidates.map((c) => c.candidateId))
  }, [candidates])

  const toggleCandidate = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedIds.length === eligibleCandidates.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(eligibleCandidates.map((c) => c.candidateId))
    }
  }

  const selectedCandidates = eligibleCandidates.filter((c) => selectedIds.includes(c.candidateId))
  const totalBatchAmount = selectedCandidates.reduce((sum, c) => sum + c.totalDueAmount, 0)
  const totalBatchShifts = selectedCandidates.reduce((sum, c) => sum + c.approvedShifts, 0)

  const handleBatchSettle = () => {
    if (selectedIds.length === 0) {
      onError('Please select at least one candidate for batch payout.')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('candidateIds', JSON.stringify(selectedIds))
      formData.append('paymentMethod', paymentMethod)
      formData.append('paymentReference', batchReference.trim())
      formData.append('paymentNotes', notes.trim())

      const result = await batchSettlePayrollAction({}, formData)
      if (result.error) {
        onError(result.error)
      } else {
        onSuccess(result.message || `Batch settlement completed for ${selectedIds.length} candidates.`)
        onClose()
      }
    })
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Batch Payroll Payout Run"
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col gap-5">
        {/* Batch Overview Banner */}
        <div className="p-4 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider block opacity-80">
              Total Batch Payout Liability
            </span>
            <p className="text-[11px] opacity-75 mt-0.5">
              {selectedCandidates.length} Candidates Selected • {totalBatchShifts} Total Shifts
            </p>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono">
            {formatINR(totalBatchAmount)}
          </span>
        </div>

        {/* Candidate Selection Checklist */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[var(--md-sys-color-on-surface)] uppercase tracking-wider">
              Select Candidates to Pay ({selectedIds.length}/{eligibleCandidates.length})
            </label>
            <button
              onClick={toggleAll}
              className="text-xs font-semibold text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
            >
              {selectedIds.length === eligibleCandidates.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto border border-[var(--md-sys-color-outline-variant)] rounded-xl divide-y divide-[var(--md-sys-color-outline-variant)]">
            {eligibleCandidates.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
                No candidates with outstanding unpaid shifts in this period.
              </div>
            ) : (
              eligibleCandidates.map((c) => {
                const isSelected = selectedIds.includes(c.candidateId)
                return (
                  <label
                    key={c.candidateId}
                    className="flex items-center justify-between p-3 hover:bg-[var(--md-sys-color-surface-container-high)] cursor-pointer text-xs transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCandidate(c.candidateId)}
                        className="w-4 h-4 rounded text-[var(--md-sys-color-primary)] focus:ring-[var(--md-sys-color-primary)] cursor-pointer"
                      />
                      <div>
                        <span className="font-semibold text-[var(--md-sys-color-on-surface)]">{c.fullName}</span>
                        <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                          {c.totalApprovedHours} hrs @ {formatINR(c.hourlyRate)}/hr • {c.bankName || 'No Bank Info'}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-sm text-amber-700 dark:text-amber-400">
                      {formatINR(c.totalDueAmount)}
                    </span>
                  </label>
                )
              })
            )}
          </div>
        </div>

        {/* Batch Payment Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1 block">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] text-sm text-[var(--md-sys-color-on-surface)] focus:border-[var(--md-sys-color-primary)] outline-none"
            >
              <option value="Bank Transfer (NEFT/IMPS)">Bank Transfer (NEFT/IMPS)</option>
              <option value="UPI Batch Payout">UPI Batch Payout</option>
              <option value="Corporate Cheque Run">Corporate Cheque Run</option>
              <option value="Cash Disbursement">Cash Disbursement</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1 block">
              Batch Reference / Run ID
            </label>
            <TextField
              type="text"
              value={batchReference}
              onChange={(e) => setBatchReference(e.target.value)}
              placeholder="e.g. BATCH-20260814-01"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1 block">
            Batch Notes / Memo
          </label>
          <TextField
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Weekly Candidate Payout Run via HDFC Corporate Banking"
          />
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--md-sys-color-outline-variant)]">
          <Button variant="outlined" size="md" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="filled"
            size="md"
            onClick={handleBatchSettle}
            disabled={isPending || selectedIds.length === 0}
            icon={<CheckCheck className="w-4 h-4" />}
          >
            {isPending ? 'Executing Batch Payout...' : `Disburse ${formatINR(totalBatchAmount)} to (${selectedIds.length})`}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
