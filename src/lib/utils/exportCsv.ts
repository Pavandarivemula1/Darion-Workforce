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
    'Status',
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
    let status = 'Incomplete'

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
      status = 'Completed'
    } else {
      const isToday =
        new Date().toLocaleDateString('en-IN', { timeZone: TIMEZONE }) ===
        loginDate.toLocaleDateString('en-IN', { timeZone: TIMEZONE })
      if (isToday) {
        status = r.break_start_time ? 'On Break' : 'Working'
      }
    }

    const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`

    return [
      escapeCsv(candidateName),
      escapeCsv(formattedDate),
      escapeCsv(formattedLogin),
      escapeCsv(formattedLogout),
      escapeCsv(breakDurationStr),
      escapeCsv(totalHoursStr),
      escapeCsv(status),
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
