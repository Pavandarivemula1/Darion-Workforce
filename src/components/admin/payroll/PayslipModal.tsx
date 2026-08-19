'use client'

import React, { useRef } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { useBranding } from '@/components/providers/BrandingProvider'
import {
  CandidatePayrollSummary,
  formatINR,
  numberToWordsINR,
} from '@/lib/utils/payroll'
import {
  Printer,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'

export interface PayslipModalProps {
  isOpen: boolean
  onClose: () => void
  candidate: CandidatePayrollSummary | null
  periodLabel: string
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  isOpen,
  onClose,
  candidate,
  periodLabel,
}) => {
  const printRef = useRef<HTMLDivElement>(null)
  const branding = useBranding()

  if (!candidate) return null

  const handlePrint = () => {
    window.print()
  }

  const currentDateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const netPayable = candidate.totalGrossPayable
  const amountWords = numberToWordsINR(netPayable)

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Candidate Official Payslip"
      maxWidth="max-w-4xl"
      hideFooter={true}
    >
      <div className="flex flex-col gap-6">
        {/* Printable Area */}
        <div
          ref={printRef}
          id="printable-payslip"
          className="p-6 sm:p-8 bg-white dark:bg-[#1A1C20] text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-2xl shadow-sm print:shadow-none print:border-0 print:p-0 print:m-0"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-[var(--md-sys-color-primary)]/40 pb-5 mb-5">
            <div className="flex items-center gap-3">
              {branding.logoLightUrl ? (
                <img
                  src={branding.logoLightUrl}
                  alt={branding.payslip.legalName}
                  className="h-12 max-w-[160px] object-contain shrink-0"
                />
              ) : branding.iconUrl ? (
                <img
                  src={branding.iconUrl}
                  alt={branding.payslip.legalName}
                  className="w-12 h-12 rounded-xl object-contain shrink-0 border border-gray-300 dark:border-gray-700"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[var(--md-sys-color-primary)] text-white flex items-center justify-center font-black text-xl shadow-sm">
                  <ShieldCheck className="w-7 h-7" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-extrabold tracking-tight uppercase text-[var(--md-sys-color-primary)] dark:text-blue-400">
                  {branding.payslip.legalName || branding.appTitle}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {branding.payslip.addressLine1 || branding.tagline || 'Workforce Operations Division'}
                </p>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                  {branding.payslip.cinNumber ? `CIN/Reg: ${branding.payslip.cinNumber} • ` : ''}
                  {branding.payslip.taxId ? `Tax ID: ${branding.payslip.taxId} • ` : ''}
                  {branding.supportEmail}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold text-xs rounded-full border border-[var(--md-sys-color-primary)]/20">
                OFFICIAL PAYSLIP
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
                Issue Date: <span className="font-semibold text-gray-800 dark:text-gray-200">{currentDateStr}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Pay Period: <span className="font-semibold text-gray-800 dark:text-gray-200">{periodLabel}</span>
              </p>
            </div>
          </div>

          {/* Employee & Payment Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/80 mb-6 text-xs">
            <div>
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider block">Candidate Name</span>
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{candidate.fullName}</span>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider block">Employee / ID</span>
              <span className="font-semibold font-mono text-gray-800 dark:text-gray-200">
                {candidate.idNumber || candidate.phoneNumber || candidate.candidateId.slice(0, 8)}
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider block">Base Hourly Rate</span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatINR(candidate.hourlyRate)}/hr
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider block">Payment Status</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">
                {candidate.paymentStatus.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Detailed Hours & Earnings Breakdown Table */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Pay Component / Description</th>
                  <th className="py-3 px-4 text-center">Computation / Metric</th>
                  <th className="py-3 px-4 text-right">Payable (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-medium">
                <tr>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Approved Work Hours</span>
                    <p className="text-[11px] text-gray-400">Logged shift time approved by admin</p>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">
                    {candidate.totalApprovedHours.toFixed(2)} hrs @ {formatINR(candidate.hourlyRate)}/hr
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold">
                    {formatINR(candidate.totalGrossPayable)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Approved Paid Shifts</span>
                    <p className="text-[11px] text-gray-400">Total sessions accounted in cycle</p>
                  </td>
                  <td className="py-3 px-4 text-center font-mono">
                    {candidate.approvedShifts} Shift(s)
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-gray-500">
                    —
                  </td>
                </tr>
                {candidate.totalPaidAmount > 0 && (
                  <tr className="bg-emerald-50/40 dark:bg-emerald-950/20">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">Amount Previously Disbursed</span>
                      <p className="text-[11px] text-emerald-500">Recorded payouts</p>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-emerald-700 dark:text-emerald-300">
                      Disbursed
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700 dark:text-emerald-300">
                      {formatINR(candidate.totalPaidAmount)}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-[var(--md-sys-color-primary-container)] font-extrabold text-sm border-t-2 border-[var(--md-sys-color-primary)]/40">
                  <td className="py-3.5 px-4 text-[var(--md-sys-color-on-primary-container)]" colSpan={2}>
                    NET PAYABLE AMOUNT
                  </td>
                  <td className="py-3.5 px-4 text-right text-[var(--md-sys-color-on-primary-container)] font-mono text-base">
                    {formatINR(netPayable)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount in Words */}
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/80 mb-6 text-xs flex items-center justify-between">
            <div>
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider block">Net Amount (In Words)</span>
              <span className="font-bold text-gray-800 dark:text-gray-200 italic">{amountWords}</span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>

          {/* Signature & Verification Footer */}
          <div className="flex items-end justify-between pt-6 border-t border-gray-200 dark:border-gray-700 text-xs">
            <div className="text-[11px] text-gray-400 leading-relaxed max-w-sm">
              {branding.payslip.disclaimer}
            </div>
            <div className="text-center flex flex-col items-center">
              {branding.payslip.stampUrl && (
                <img
                  src={branding.payslip.stampUrl}
                  alt="Official Seal"
                  className="w-16 h-16 object-contain mb-1 opacity-90"
                />
              )}
              {branding.payslip.signatureUrl ? (
                <img
                  src={branding.payslip.signatureUrl}
                  alt="Authorized Signature"
                  className="h-10 object-contain mb-1"
                />
              ) : (
                <div className="w-36 border-b border-gray-400 pb-1 mb-1 font-semibold text-[11px] text-gray-700 dark:text-gray-300">
                  {branding.payslip.signatoryName || 'Authorized Signatory'}
                </div>
              )}
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                {branding.payslip.signatoryTitle || 'Payroll Operations'}
              </span>
            </div>
          </div>
        </div>

        {/* Dialog Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outlined" size="md" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="filled"
            size="md"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
          >
            Print / Save PDF
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
