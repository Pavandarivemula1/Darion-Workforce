'use client'

import React, { useRef } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import {
  CandidatePayrollSummary,
  formatINR,
  numberToWordsINR,
} from '@/lib/utils/payroll'
import {
  Printer,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard,
  User,
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
      title="Candidate Salary & Shift Payslip"
      maxWidth="max-w-3xl"
    >
      <div className="flex flex-col gap-6">
        {/* Printable Payslip Card Document */}
        <div
          ref={printRef}
          id="printable-payslip"
          className="p-6 sm:p-8 bg-white dark:bg-[#1A1C20] text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-2xl shadow-sm print:shadow-none print:border-0 print:p-0 print:m-0"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-primary/40 pb-5 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-sm">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight uppercase text-blue-900 dark:text-blue-400">
                  Darion Workforce Solutions
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Workforce Operations & Shift Management Division
                </p>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                  CIN: U74999DL2024PTC123456 • payroll@darionworkforce.internal
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-full border border-blue-200 dark:border-blue-800">
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
              <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                {formatINR(candidate.hourlyRate)}/hr
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider block">PAN Number</span>
              <span className="font-semibold font-mono text-gray-800 dark:text-gray-200">
                {candidate.panNumber || 'Not Provided'}
              </span>
            </div>

            <div>
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider block">Bank Name</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{candidate.bankName || 'Direct Disbursement'}</span>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider block">Account Number</span>
              <span className="font-mono font-medium text-gray-800 dark:text-gray-200">
                {candidate.bankAccountNumber ? `••••${candidate.bankAccountNumber.slice(-4)}` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider block">IFSC Code</span>
              <span className="font-mono font-medium text-gray-800 dark:text-gray-200">{candidate.bankIfsc || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider block">UPI ID</span>
              <span className="font-mono font-medium text-gray-800 dark:text-gray-200">{candidate.upiId || 'N/A'}</span>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="grid grid-cols-3 gap-3 mb-6 text-center text-xs">
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <span className="text-gray-400 text-[11px] font-semibold block">Total Shifts Completed</span>
              <span className="text-lg font-bold font-mono text-gray-900 dark:text-gray-100">{candidate.approvedShifts}</span>
            </div>
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <span className="text-gray-400 text-[11px] font-semibold block">Net Billable Hours</span>
              <span className="text-lg font-bold font-mono text-gray-900 dark:text-gray-100">{candidate.totalApprovedHours.toFixed(2)} hrs</span>
            </div>
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <span className="text-gray-400 text-[11px] font-semibold block">Payment Settlement</span>
              <span className={`text-sm font-bold block mt-1 ${candidate.totalDueAmount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {candidate.totalDueAmount === 0 ? 'Fully Settled' : 'Payment Due'}
              </span>
            </div>
          </div>

          {/* Earnings & Deductions Breakdown Table */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2.5 px-4">Earnings / Description</th>
                  <th className="py-2.5 px-4 text-right">Units / Rate</th>
                  <th className="py-2.5 px-4 text-right">Gross Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Shift Base Wages</span>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Regular verified candidate shift hours</p>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-gray-600 dark:text-gray-400">
                    {candidate.totalApprovedHours.toFixed(2)} hrs @ {formatINR(candidate.hourlyRate)}/hr
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 dark:text-gray-100">
                    {formatINR(candidate.totalGrossPayable)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Performance Incentive / Overtime</span>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Authorized overshift & special bonuses</p>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-gray-600 dark:text-gray-400">—</td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-gray-900 dark:text-gray-100">₹0.00</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-blue-50/70 dark:bg-blue-950/40 font-extrabold text-sm border-t-2 border-blue-500/40">
                  <td className="py-3.5 px-4 text-blue-950 dark:text-blue-200" colSpan={2}>
                    NET PAYABLE AMOUNT
                  </td>
                  <td className="py-3.5 px-4 text-right text-blue-950 dark:text-blue-200 font-mono text-base">
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
              This is a computer-generated official payroll slip generated by Darion Workforce System and does not require physical signature under digital signature compliance.
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-gray-400 pb-1 mb-1 font-semibold text-[11px] text-gray-700 dark:text-gray-300">
                Authorized Signatory
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Payroll Administrator</span>
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
