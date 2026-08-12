export interface AttendanceRecord {
  id: string
  user_id: string
  login_time: string
  logout_time: string | null
  created_at: string
}

export interface CandidateProfile {
  id: string
  full_name: string
  role: string
  created_at: string
  email?: string
}

export interface DailyCellData {
  dateIso: string
  dayName: string // 'Mon', 'Tue', etc.
  totalMs: number
  hasWorkingSession: boolean
  hasIncompleteSession: boolean
  completedCount: number
  formattedDuration: string
}

export interface CandidateWeeklyRow {
  candidate: CandidateProfile
  days: DailyCellData[] // 7 items (Mon..Sun)
  weeklyTotalMs: number
  formattedWeeklyTotal: string
  completedSessionsCount: number
  incompleteSessionsCount: number
}

const TIMEZONE = 'Asia/Kolkata'

/**
 * Calculates Monday 00:00:00 to Sunday 23:59:59 boundaries for a given date in Asia/Kolkata timezone.
 */
export function getWeekBoundaries(referenceDate: Date = new Date()): {
  startOfWeek: Date
  endOfWeek: Date
  weekLabel: string
  daysHeader: { dayName: string; dateStr: string; dateIso: string }[]
} {
  // Extract YYYY, MM, DD in Asia/Kolkata
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(referenceDate)

  const year = Number(parts.find((p) => p.type === 'year')?.value)
  const month = Number(parts.find((p) => p.type === 'month')?.value)
  const day = Number(parts.find((p) => p.type === 'day')?.value)

  // Determine day of week in Kolkata (0=Sun, 1=Mon, ..., 6=Sat)
  const refKolkata = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
  const dayOfWeek = refKolkata.getUTCDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  // Monday YYYY-MM-DD in Kolkata
  const mondayKolkata = new Date(Date.UTC(year, month - 1, day + mondayOffset, 12, 0, 0))
  const mYear = mondayKolkata.getUTCFullYear()
  const mMonth = mondayKolkata.getUTCMonth()
  const mDay = mondayKolkata.getUTCDate()

  // Start of week: Monday 00:00:00 in Kolkata (UTC+5:30 -> subtract 5.5h)
  const startOfWeekUtc = new Date(Date.UTC(mYear, mMonth, mDay, 0, 0, 0, 0) - 5.5 * 60 * 60 * 1000)
  const endOfWeekUtc = new Date(Date.UTC(mYear, mMonth, mDay + 6, 23, 59, 59, 999) - 5.5 * 60 * 60 * 1000)

  // Generate 7 days header (Mon..Sun)
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const daysHeader = []

  for (let i = 0; i < 7; i++) {
    const curDate = new Date(Date.UTC(mYear, mMonth, mDay + i, 12, 0, 0))
    const cY = curDate.getUTCFullYear()
    const cM = curDate.getUTCMonth() + 1
    const cD = curDate.getUTCDate()

    const dateIso = `${cY}-${String(cM).padStart(2, '0')}-${String(cD).padStart(2, '0')}`
    const dateStr = `${cM}/${cD}`

    daysHeader.push({
      dayName: dayNames[i],
      dateStr,
      dateIso,
    })
  }

  // Week Label
  const startMonthName = new Date(Date.UTC(mYear, mMonth, mDay)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  const endMonthName = new Date(Date.UTC(mYear, mMonth, mDay + 6)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  const weekLabel = `${startMonthName} – ${endMonthName}`

  return {
    startOfWeek: startOfWeekUtc,
    endOfWeek: endOfWeekUtc,
    weekLabel,
    daysHeader,
  }
}

/**
 * Formats milliseconds duration into "XXh YYm"
 */
export function formatDurationMs(ms: number): string {
  if (!ms || ms <= 0) return '0h 00m'
  const totalMins = Math.floor(ms / (1000 * 60))
  const hours = Math.floor(totalMins / 60)
  const mins = totalMins % 60
  return `${hours}h ${mins.toString().padStart(2, '0')}m`
}

/**
 * Determines Kolkata calendar date key "YYYY-MM-DD" for a given ISO string
 */
export function getKolkataDateKey(isoString: string): string {
  const d = new Date(isoString)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d)

  const year = parts.find((p) => p.type === 'year')?.value
  const month = parts.find((p) => p.type === 'month')?.value
  const day = parts.find((p) => p.type === 'day')?.value

  return `${year}-${month}-${day}`
}

/**
 * Aggregates weekly attendance records into candidate matrix rows.
 * Handles multiple sessions per day and excludes incomplete sessions from total hours.
 */
export function processWeeklyTimesheet(
  candidates: CandidateProfile[],
  records: AttendanceRecord[],
  daysHeader: { dayName: string; dateStr: string; dateIso: string }[]
): CandidateWeeklyRow[] {
  const todayKolkataKey = getKolkataDateKey(new Date().toISOString())

  return candidates.map((candidate) => {
    const candidateRecords = records.filter((r) => r.user_id === candidate.id)

    let weeklyTotalMs = 0
    let completedSessionsCount = 0
    let incompleteSessionsCount = 0

    const days: DailyCellData[] = daysHeader.map(({ dayName, dateIso }) => {
      let dayTotalMs = 0
      let hasWorkingSession = false
      let hasIncompleteSession = false
      let dayCompletedCount = 0

      // Match records belonging to this calendar date in Kolkata
      const dayRecords = candidateRecords.filter((r) => {
        const recordDateKey = getKolkataDateKey(r.login_time)
        return recordDateKey === dateIso
      })

      dayRecords.forEach((r) => {
        if (r.logout_time) {
          const start = new Date(r.login_time).getTime()
          const end = new Date(r.logout_time).getTime()
          const duration = Math.max(0, end - start)
          dayTotalMs += duration
          dayCompletedCount += 1
          completedSessionsCount += 1
        } else {
          // Check if active today vs incomplete on past day
          const recordDateKey = getKolkataDateKey(r.login_time)
          if (recordDateKey === todayKolkataKey) {
            hasWorkingSession = true
          } else {
            hasIncompleteSession = true
            incompleteSessionsCount += 1
          }
        }
      })

      weeklyTotalMs += dayTotalMs

      return {
        dateIso,
        dayName,
        totalMs: dayTotalMs,
        hasWorkingSession,
        hasIncompleteSession,
        completedCount: dayCompletedCount,
        formattedDuration: formatDurationMs(dayTotalMs),
      }
    })

    return {
      candidate,
      days,
      weeklyTotalMs,
      formattedWeeklyTotal: formatDurationMs(weeklyTotalMs),
      completedSessionsCount,
      incompleteSessionsCount,
    }
  })
}
