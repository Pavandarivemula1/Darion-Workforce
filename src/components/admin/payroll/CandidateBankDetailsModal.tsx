'use client'

import React, { useState, useTransition } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { CandidatePayrollSummary } from '@/lib/utils/payroll'
import { updateCandidateBankDetailsAction } from '@/app/actions/payroll'
import { Building2, CreditCard, Save } from 'lucide-react'

export interface CandidateBankDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  candidate: CandidatePayrollSummary | null
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export const CandidateBankDetailsModal: React.FC<CandidateBankDetailsModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onSuccess,
  onError,
}) => {
  const [isPending, startTransition] = useTransition()

  const [bankName, setBankName] = useState(candidate?.bankName || '')
  const [accountNumber, setAccountNumber] = useState(candidate?.bankAccountNumber || '')
  const [ifsc, setIfsc] = useState(candidate?.bankIfsc || '')
  const [upiId, setUpiId] = useState(candidate?.upiId || '')
  const [panNumber, setPanNumber] = useState(candidate?.panNumber || '')

  React.useEffect(() => {
    if (candidate) {
      setBankName(candidate.bankName || '')
      setAccountNumber(candidate.bankAccountNumber || '')
      setIfsc(candidate.bankIfsc || '')
      setUpiId(candidate.upiId || '')
      setPanNumber(candidate.panNumber || '')
    }
  }, [candidate])

  if (!candidate) return null

  const handleSave = () => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('candidateId', candidate.candidateId)
      formData.append('bankName', bankName)
      formData.append('bankAccountNumber', accountNumber)
      formData.append('bankIfsc', ifsc)
      formData.append('upiId', upiId)
      formData.append('panNumber', panNumber)

      const result = await updateCandidateBankDetailsAction({}, formData)
      if (result.error) {
        onError(result.error)
      } else {
        onSuccess(result.message || 'Banking details updated successfully.')
        onClose()
      }
    })
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Bank & Payout Details — ${candidate.fullName}`}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1 block">
            Bank Name
          </label>
          <TextField
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g. HDFC Bank / State Bank of India"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1 block">
            Account Number
          </label>
          <TextField
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="e.g. 50100234567890"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1 block">
            IFSC Code
          </label>
          <TextField
            type="text"
            value={ifsc}
            onChange={(e) => setIfsc(e.target.value.toUpperCase())}
            placeholder="e.g. HDFC0001234"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1 block">
            UPI ID / VPA
          </label>
          <TextField
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="e.g. candidate@okhdfcbank"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1 block">
            PAN Number
          </label>
          <TextField
            type="text"
            value={panNumber}
            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
            placeholder="e.g. ABCDE1234F"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--md-sys-color-outline-variant)]">
          <Button variant="outlined" size="md" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="filled"
            size="md"
            onClick={handleSave}
            disabled={isPending}
            icon={<Save className="w-4 h-4" />}
          >
            {isPending ? 'Saving...' : 'Save Bank Details'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
