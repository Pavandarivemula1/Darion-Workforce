'use client'

import React, { useState, useTransition } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import {
  CandidatePayrollSummary,
  formatINR,
} from '@/lib/utils/payroll'
import { settleCandidatePayrollAction } from '@/app/actions/payroll'
import {
  CreditCard,
  Building2,
  QrCode,
  Banknote,
  Receipt,
  FileCheck2,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react'

export interface SettlePaymentModalProps {
  isOpen: boolean
  onClose: () => void
  candidate: CandidatePayrollSummary | null
  periodStart?: string
  periodEnd?: string
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export const SettlePaymentModal: React.FC<SettlePaymentModalProps> = ({
  isOpen,
  onClose,
  candidate,
  periodStart,
  periodEnd,
  onSuccess,
  onError,
}) => {
  const [isPending, startTransition] = useTransition()

  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer (NEFT/IMPS)')
  const [paymentReference, setPaymentReference] = useState<string>('')
  const [bonusAmount, setBonusAmount] = useState<string>('0')
  const [deductionAmount, setDeductionAmount] = useState<string>('0')
  const [notes, setNotes] = useState<string>('')

  if (!candidate) return null

  const baseDue = candidate.totalDueAmount
  const bonus = Math.max(0, parseFloat(bonusAmount) || 0)
  const deduction = Math.max(0, parseFloat(deductionAmount) || 0)
  const netPayable = Math.max(0, baseDue + bonus - deduction)

  // Unpaid approved shifts
  const dueShifts = candidate.records.filter(
    (r) => r.approval_status === 'approved' && (r.payment_status === 'unpaid' || !r.payment_status)
  )

  const handleSettle = () => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('candidateId', candidate.candidateId)
      formData.append('shiftIds', JSON.stringify(dueShifts.map((s) => s.id)))
      if (periodStart) formData.append('periodStart', periodStart)
      if (periodEnd) formData.append('periodEnd', periodEnd)
      formData.append('bonusAmount', String(bonus))
      formData.append('deductionAmount', String(deduction))
      formData.append('paymentMethod', paymentMethod)
      formData.append('paymentReference', paymentReference.trim())
      formData.append('paymentNotes', notes.trim())

      const result = await settleCandidatePayrollAction({}, formData)

      if (result.error) {
        onError(result.error)
      } else {
        onSuccess(result.message || `Payment of ${formatINR(netPayable)} recorded for ${candidate.fullName}.`)
        onClose()
      }
    })
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payroll Payout / Settlement"
      maxWidth="max-w-xl"
    >
      <div className="flex flex-col gap-5">
        {/* Candidate & Dues Header Banner */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
              {candidate.avatarUrl ? (
                <img src={candidate.avatarUrl} alt={candidate.fullName} className="w-full h-full object-cover" />
              ) : (
                candidate.fullName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] leading-tight">
                {candidate.fullName}
              </h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                Rate: <span className="font-semibold">{formatINR(candidate.hourlyRate)}/hr</span> • {dueShifts.length} Unpaid {dueShifts.length === 1 ? 'Shift' : 'Shifts'} ({candidate.totalApprovedHours} hrs)
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] block">Base Due</span>
            <span className="text-lg font-extrabold text-amber-700 dark:text-amber-400 font-mono">
              {formatINR(baseDue)}
            </span>
          </div>
        </div>

        {/* Banking & UPI Destination Card */}
        <div className="p-3.5 rounded-lg bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] text-xs flex flex-col gap-1.5">
          <span className="font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider text-[10px]">
            Registered Payment Destination
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[var(--md-sys-color-on-surface)]">
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)]">Bank: </span>
              <span className="font-semibold">{candidate.bankName || 'Not Provided'}</span>
            </div>
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)]">A/C: </span>
              <span className="font-semibold font-mono">{candidate.bankAccountNumber || 'Not Provided'}</span>
            </div>
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)]">IFSC: </span>
              <span className="font-semibold font-mono">{candidate.bankIfsc || 'Not Provided'}</span>
            </div>
            <div>
              <span className="text-[var(--md-sys-color-on-surface-variant)]">UPI ID: </span>
              <span className="font-semibold font-mono">{candidate.upiId || 'Not Provided'}</span>
            </div>
          </div>
        </div>

        {/* Adjustments (Bonus / Deduction) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-emerald-600" /> Incentive / Bonus (₹)
            </label>
            <TextField
              type="number"
              min="0"
              step="0.01"
              value={bonusAmount}
              onChange={(e) => setBonusAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1 flex items-center gap-1">
              <Minus className="w-3.5 h-3.5 text-red-600" /> Deductions / Advance (₹)
            </label>
            <TextField
              type="number"
              min="0"
              step="0.01"
              value={deductionAmount}
              onChange={(e) => setDeductionAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Net Payout Summary Pill */}
        <div className="p-4 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider block opacity-80">
              Net Disbursement Payout
            </span>
            <p className="text-[11px] opacity-75">
              Base {formatINR(baseDue)} + Bonus {formatINR(bonus)} - Deductions {formatINR(deduction)}
            </p>
          </div>
          <span className="text-2xl font-black font-mono">
            {formatINR(netPayable)}
          </span>
        </div>

        {/* Payment Method & UTR Reference */}
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
              <option value="UPI / GPay / PhonePe">UPI / GPay / PhonePe</option>
              <option value="Cash Disbursement">Cash Disbursement</option>
              <option value="Cheque">Company Cheque</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1 block">
              Transaction Ref / UTR No.
            </label>
            <TextField
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="e.g. UTR123498765432"
            />
          </div>
        </div>

        {/* Payment Notes */}
        <div>
          <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1 block">
            Payment Notes / Memo (Optional)
          </label>
          <TextField
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Weekly shift wages processed via HDFC Corporate"
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
            onClick={handleSettle}
            disabled={isPending || dueShifts.length === 0}
            icon={<FileCheck2 className="w-4 h-4" />}
          >
            {isPending ? 'Processing Settlement...' : `Confirm & Settle ${formatINR(netPayable)}`}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
