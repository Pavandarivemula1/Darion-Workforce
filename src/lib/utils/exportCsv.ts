import { AttendanceRecord, CandidateProfile, formatDurationMs, formatBreakDuration } from './timesheet'

const TIMEZONE = 'Asia/Kolkata'

export function exportAttendanceToCsv(
  records: AttendanceRecord[],
  candidates: CandidateProfile[],
  weekLabel: string
) {
  const candidateMap = new Map<string, string>()
  candidates.forEach((c) => candidateMap.set(c.id, c.full_name))

  const headers = [
    'Candidate',
    'Date',
    'Login Time',
    'Logout Time',
    'Break Duration',
    'Net Working Hours',
    'Shift Status',
    'Payment Approval',
    'Approved Payout ($)',
    'Rejection Reason',
  ]

  const rows = records.map((r) => {
    const candidateName = candidateMap.get(r.user_id) || 'Unknown Candidate'
    const loginDate = new Date(r.login_time)

    const formattedDate = loginDate.toLocaleDateString('en-IN', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

    const formattedLogin = loginDate.toLocaleTimeString('en-IN', {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    let formattedLogout = '--'
    let totalHoursStr = '--'
    let shiftStatus = 'Incomplete'

    const breakSecs = r.break_duration_seconds || 0
    const breakDurationStr = formatBreakDuration(breakSecs)

    if (r.logout_time) {
      const logoutDate = new Date(r.logout_time)
      formattedLogout = logoutDate.toLocaleTimeString('en-IN', {
        timeZone: TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      const grossMs = Math.max(0, logoutDate.getTime() - loginDate.getTime())
      const netMs = Math.max(0, grossMs - breakSecs * 1000)
      totalHoursStr = formatDurationMs(netMs)
      shiftStatus = 'Completed'
    } else {
      const isToday =
        new Date().toLocaleDateString('en-IN', { timeZone: TIMEZONE }) ===
        loginDate.toLocaleDateString('en-IN', { timeZone: TIMEZONE })
      if (isToday) {
        shiftStatus = r.break_start_time ? 'On Break' : 'Working'
      }
    }

    const approvalStatus = r.approval_status ? r.approval_status.toUpperCase() : 'PENDING'
    const payoutAmountStr = r.payout_amount ? `$${r.payout_amount.toFixed(2)}` : '$0.00'
    const rejectionReasonStr = r.rejection_reason || ''

    const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`

    return [
      escapeCsv(candidateName),
      escapeCsv(formattedDate),
      escapeCsv(formattedLogin),
      escapeCsv(formattedLogout),
      escapeCsv(breakDurationStr),
      escapeCsv(totalHoursStr),
      escapeCsv(shiftStatus),
      escapeCsv(approvalStatus),
      escapeCsv(payoutAmountStr),
      escapeCsv(rejectionReasonStr),
    ].join(',')
  })

  const csvContent = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const sanitizedLabel = weekLabel.replace(/[^a-zA-Z0-9]/g, '_')
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `timesheet_${sanitizedLabel}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
