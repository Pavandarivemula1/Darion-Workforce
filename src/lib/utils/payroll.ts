import { getKolkataDateKey } from '@/lib/utils/timesheet'

export interface PayrollAttendanceRecord {
  id: string
  user_id: string
  login_time: string
  logout_time: string | null
  break_start_time?: string | null
  break_duration_seconds?: number
  approval_status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string | null
  payout_amount?: number | null
  payment_status?: 'unpaid' | 'paid' | 'processing' | 'on_hold'
  paid_at?: string | null
  payment_reference?: string | null
  payment_method?: string | null
  payment_notes?: string | null
  created_at: string
}

export interface CandidatePayrollProfile {
  id: string
  full_name: string
  role?: string
  hourly_rate?: number
  avatar_url?: string | null
  phone_number?: string | null
  address?: string | null
  id_number?: string | null
  bank_name?: string | null
  bank_account_number?: string | null
  bank_ifsc?: string | null
  upi_id?: string | null
  pan_number?: string | null
  created_at?: string
}

export interface CandidatePayrollSummary {
  candidateId: string
  fullName: string
  avatarUrl: string | null
  phoneNumber: string | null
  idNumber: string | null
  hourlyRate: number
  bankName: string | null
  bankAccountNumber: string | null
  bankIfsc: string | null
  upiId: string | null
  panNumber: string | null
  totalShifts: number
  approvedShifts: number
  pendingShifts: number
  rejectedShifts: number
  totalApprovedMs: number
  totalApprovedHours: number
  totalPendingMs: number
  todayPay: number
  todayHours: number
  todayApprovedPay: number
  todayPendingPay: number
  totalGrossPayable: number
  totalPaidAmount: number
  totalDueAmount: number
  totalPendingApprovalValue: number
  paymentStatus: 'due' | 'settled' | 'no_dues' | 'pending_approval'
  records: PayrollAttendanceRecord[]
}

/**
 * Format a numeric amount into Indian Rupee currency format (₹12,345.67)
 */
export function formatINR(amount: number = 0): string {
  const safeNum = isNaN(amount) ? 0 : amount
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeNum)
}

/**
 * Calculate net working milliseconds for a single shift
 */
export function calculateNetShiftMs(loginTime: string, logoutTime: string | null, breakSecs = 0): number {
  if (!loginTime || !logoutTime) return 0
  const gross = Math.max(0, new Date(logoutTime).getTime() - new Date(loginTime).getTime())
  const breakMs = (breakSecs || 0) * 1000
  return Math.max(0, gross - breakMs)
}

/**
 * Convert numbers into words for formal Indian legal receipts & payslips
 */
export function numberToWordsINR(num: number): string {
  if (isNaN(num) || num <= 0) return 'Zero Rupees Only'

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ]
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function inWords(n: number): string {
    if (n === 0) return ''
    if (n < 20) return a[n] + ' '
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '') + ' '
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred ' + inWords(n % 100)
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000)
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000)
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000)
  }

  const rounded = Math.round(num * 100) / 100
  const integerPart = Math.floor(rounded)
  const decimalPart = Math.round((rounded - integerPart) * 100)

  let words = inWords(integerPart).trim() + ' Rupees'
  if (decimalPart > 0) {
    words += ' and ' + inWords(decimalPart).trim() + ' Paise'
  }
  return words + ' Only'
}

/**
 * Aggregate candidates and attendance records into comprehensive candidate payroll summaries
 */
export function calculateCandidatePayrollSummaries(
  candidates: CandidatePayrollProfile[],
  records: PayrollAttendanceRecord[]
): CandidatePayrollSummary[] {
  const todayKolkataKey = getKolkataDateKey(new Date().toISOString())

  return candidates.map((cand) => {
    const candRecords = records.filter((r) => r.user_id === cand.id)
    const rate = cand.hourly_rate || 0

    let approvedShifts = 0
    let pendingShifts = 0
    let rejectedShifts = 0
    let totalApprovedMs = 0
    let totalPendingMs = 0
    let totalGrossPayable = 0
    let totalPaidAmount = 0
    let totalDueAmount = 0
    let totalPendingApprovalValue = 0

    let todayPay = 0
    let todayMs = 0
    let todayApprovedPay = 0
    let todayPendingPay = 0

    candRecords.forEach((r) => {
      const isApproved = r.approval_status === 'approved'
      const isPending = r.approval_status === 'pending'
      const isRejected = r.approval_status === 'rejected'
      const paymentStatus = r.payment_status || 'unpaid'

      const netMs = calculateNetShiftMs(r.login_time, r.logout_time, r.break_duration_seconds)
      const hours = netMs / (1000 * 60 * 60)

      // Calculated payout for shift (from DB payout_amount or computed from net duration * hourly rate)
      const calculatedShiftPayout = typeof r.payout_amount === 'number' && r.payout_amount > 0
        ? r.payout_amount
        : Math.round(hours * rate * 100) / 100

      // Check if logged today (Asia/Kolkata)
      const shiftDateKey = getKolkataDateKey(r.login_time)
      if (shiftDateKey === todayKolkataKey) {
        todayMs += netMs
        todayPay += calculatedShiftPayout
        if (isApproved) {
          todayApprovedPay += calculatedShiftPayout
        } else if (isPending) {
          todayPendingPay += calculatedShiftPayout
        }
      }

      if (isApproved) {
        approvedShifts++
        totalApprovedMs += netMs
        totalGrossPayable += calculatedShiftPayout

        if (paymentStatus === 'paid') {
          totalPaidAmount += calculatedShiftPayout
        } else {
          totalDueAmount += calculatedShiftPayout
        }
      } else if (isPending) {
        pendingShifts++
        totalPendingMs += netMs
        totalPendingApprovalValue += calculatedShiftPayout
      } else if (isRejected) {
        rejectedShifts++
      }
    })

    const totalApprovedHours = Math.round((totalApprovedMs / (1000 * 60 * 60)) * 100) / 100
    const todayHours = Math.round((todayMs / (1000 * 60 * 60)) * 100) / 100

    let status: 'due' | 'settled' | 'no_dues' | 'pending_approval' = 'no_dues'
    if (totalDueAmount > 0) {
      status = 'due'
    } else if (totalPaidAmount > 0 && totalDueAmount === 0) {
      status = 'settled'
    } else if (pendingShifts > 0) {
      status = 'pending_approval'
    }

    return {
      candidateId: cand.id,
      fullName: cand.full_name,
      avatarUrl: cand.avatar_url || null,
      phoneNumber: cand.phone_number || null,
      idNumber: cand.id_number || null,
      hourlyRate: rate,
      bankName: cand.bank_name || null,
      bankAccountNumber: cand.bank_account_number || null,
      bankIfsc: cand.bank_ifsc || null,
      upiId: cand.upi_id || null,
      panNumber: cand.pan_number || null,
      totalShifts: candRecords.length,
      approvedShifts,
      pendingShifts,
      rejectedShifts,
      totalApprovedMs,
      totalApprovedHours,
      totalPendingMs,
      todayPay: Math.round(todayPay * 100) / 100,
      todayHours,
      todayApprovedPay: Math.round(todayApprovedPay * 100) / 100,
      todayPendingPay: Math.round(todayPendingPay * 100) / 100,
      totalGrossPayable: Math.round(totalGrossPayable * 100) / 100,
      totalPaidAmount: Math.round(totalPaidAmount * 100) / 100,
      totalDueAmount: Math.round(totalDueAmount * 100) / 100,
      totalPendingApprovalValue: Math.round(totalPendingApprovalValue * 100) / 100,
      paymentStatus: status,
      records: candRecords,
    }
  })
}

/**
 * Generate CSV string for bank batch transfer / payroll register
 */
export function generatePayrollCsv(
  summaries: CandidatePayrollSummary[],
  periodLabel: string
): string {
  const headers = [
    'Candidate Name',
    'Candidate ID / Phone',
    'Hourly Rate (INR)',
    'Today Pay (INR)',
    'Approved Shifts',
    'Approved Hours',
    'Gross Payable (INR)',
    'Paid Amount (INR)',
    'Due Balance (INR)',
    'Payment Status',
    'Bank Name',
    'Account Number',
    'IFSC Code',
    'UPI ID',
    'PAN Number',
    'Period'
  ]

  const rows = summaries.map((s) => [
    `"${s.fullName.replace(/"/g, '""')}"`,
    `"${(s.idNumber || s.phoneNumber || s.candidateId).replace(/"/g, '""')}"`,
    s.hourlyRate.toFixed(2),
    s.todayPay.toFixed(2),
    s.approvedShifts,
    s.totalApprovedHours.toFixed(2),
    s.totalGrossPayable.toFixed(2),
    s.totalPaidAmount.toFixed(2),
    s.totalDueAmount.toFixed(2),
    `"${s.paymentStatus.toUpperCase()}"`,
    `"${(s.bankName || 'N/A').replace(/"/g, '""')}"`,
    `"${(s.bankAccountNumber || 'N/A').replace(/"/g, '""')}"`,
    `"${(s.bankIfsc || 'N/A').replace(/"/g, '""')}"`,
    `"${(s.upiId || 'N/A').replace(/"/g, '""')}"`,
    `"${(s.panNumber || 'N/A').replace(/"/g, '""')}"`,
    `"${periodLabel.replace(/"/g, '""')}"`
  ])

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
}
