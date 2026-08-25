export interface ShiftConfig {
  id: string
  name: string
  start_time: string // 'HH:mm:ss' or 'HH:mm'
  end_time: string   // 'HH:mm:ss' or 'HH:mm'
  grace_period_mins: number
  auto_logout_enabled: boolean
  is_overnight: boolean
  is_default: boolean
  created_at?: string
  updated_at?: string
}

export interface ShiftWithCandidateCount extends ShiftConfig {
  candidate_count: number
}

export const DEFAULT_FALLBACK_SHIFT: ShiftConfig = {
  id: 'default-general-shift',
  name: 'General Shift (9 AM - 5 PM)',
  start_time: '09:00:00',
  end_time: '17:00:00',
  grace_period_mins: 15,
  auto_logout_enabled: true,
  is_overnight: false,
  is_default: true,
}

const TIMEZONE = 'Asia/Kolkata'

/**
 * Formats a time string ('09:00:00' or '09:00') into 12-hour format with AM/PM (e.g. '09:00 AM')
 */
export function formatShiftTime(timeStr?: string | null): string {
  if (!timeStr) return '--:--'
  const [hStr, mStr] = timeStr.split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr || '0', 10)
  if (isNaN(h)) return timeStr

  const period = h >= 12 ? 'PM' : 'AM'
  const displayH = h % 12 === 0 ? 12 : h % 12
  const displayM = m.toString().padStart(2, '0')
  return `${displayH.toString().padStart(2, '0')}:${displayM} ${period}`
}

/**
 * Calculates duration in hours (e.g. 8.0 hrs) from start_time and end_time
 */
export function calculateShiftDurationHours(startTime: string, endTime: string, isOvernight?: boolean): number {
  const [sH, sM] = startTime.split(':').map((v) => parseInt(v || '0', 10))
  const [eH, eM] = endTime.split(':').map((v) => parseInt(v || '0', 10))

  const startMinutes = sH * 60 + sM
  let endMinutes = eH * 60 + eM

  if (isOvernight || endMinutes < startMinutes) {
    endMinutes += 24 * 60
  }

  const diffMinutes = Math.max(0, endMinutes - startMinutes)
  return Math.round((diffMinutes / 60) * 10) / 10
}

/**
 * Parse time string into hours and minutes
 */
function parseTimeComponents(timeStr: string): { hours: number; minutes: number; seconds: number } {
  const [h, m, s] = (timeStr || '09:00:00').split(':').map((v) => parseInt(v || '0', 10))
  return {
    hours: isNaN(h) ? 9 : h,
    minutes: isNaN(m) ? 0 : m,
    seconds: isNaN(s) ? 0 : s,
  }
}

/**
 * Helper to get the absolute UTC Date corresponding to a specific local wall-clock time in IST (UTC+5:30)
 */
function getISTDate(year: number, month: number, date: number, hours: number, minutes: number, seconds: number): Date {
  // IST is UTC+05:30, so UTC time is IST time - 5 hours and 30 minutes.
  return new Date(Date.UTC(year, month, date, hours - 5, minutes - 30, seconds))
}

function getISTComponents(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false
  })
  const parts = formatter.formatToParts(date)
  const c: Record<string, number> = {}
  for (const p of parts) c[p.type] = parseInt(p.value, 10)
  return {
    year: c.year,
    month: c.month - 1, // 0-indexed for Date.UTC
    day: c.day,
    hours: c.hour === 24 ? 0 : c.hour,
    minutes: c.minute,
    seconds: c.second
  }
}

/**
 * Calculates the exact shift start and end Date objects in Asia/Kolkata timezone
 */
export function getShiftWindowDates(
  shift: ShiftConfig = DEFAULT_FALLBACK_SHIFT,
  referenceDate: Date = new Date()
) {
  const nowIST = getISTComponents(referenceDate)
  const nowMs = referenceDate.getTime()

  const startComp = parseTimeComponents(shift.start_time)
  const endComp = parseTimeComponents(shift.end_time)

  // Shift Start Date today in Kolkata
  const shiftStart = getISTDate(nowIST.year, nowIST.month, nowIST.day, startComp.hours, startComp.minutes, startComp.seconds)
  const graceStart = new Date(shiftStart.getTime() - (shift.grace_period_mins || 0) * 60 * 1000)
  const shiftEnd = getISTDate(nowIST.year, nowIST.month, nowIST.day, endComp.hours, endComp.minutes, endComp.seconds)

  const isOvernight = shift.is_overnight || shiftEnd.getTime() <= shiftStart.getTime()

  if (isOvernight) {
    // If it's an overnight shift and current hour is in early morning, the shift actually started yesterday evening.
    if (nowIST.hours < endComp.hours || (nowIST.hours === endComp.hours && nowIST.minutes < endComp.minutes)) {
      shiftStart.setDate(shiftStart.getDate() - 1)
      graceStart.setDate(graceStart.getDate() - 1)
    } else {
      shiftEnd.setDate(shiftEnd.getDate() + 1)
    }
  }

  const isWithinWindow = nowMs >= graceStart.getTime() && nowMs < shiftEnd.getTime()
  const isBeforeShift = nowMs < graceStart.getTime()
  const isAfterShift = nowMs >= shiftEnd.getTime()

  let timeUntilStartMs = 0
  let formattedTimeUntilStart: string | null = null

  if (isBeforeShift) {
    timeUntilStartMs = Math.max(0, graceStart.getTime() - nowMs)
    const totalMinutes = Math.ceil(timeUntilStartMs / (1000 * 60))
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    formattedTimeUntilStart = h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  return {
    nowKolkata: referenceDate, // Kept for interface compatibility
    shiftStart,
    graceStart,
    shiftEnd,
    isOvernight,
    isWithinWindow,
    isBeforeShift,
    isAfterShift,
    timeUntilStartMs,
    formattedTimeUntilStart,
  }
}

/**
 * Computes exact shift end timestamp for an active attendance session
 */
export function getShiftEndTimeForSession(
  loginTime: string,
  shift: ShiftConfig = DEFAULT_FALLBACK_SHIFT
): Date {
  const loginDate = new Date(loginTime)
  const loginIST = getISTComponents(loginDate)

  const endComp = parseTimeComponents(shift.end_time)
  const startComp = parseTimeComponents(shift.start_time)

  const endTime = getISTDate(loginIST.year, loginIST.month, loginIST.day, endComp.hours, endComp.minutes, endComp.seconds)

  const isOvernight = shift.is_overnight || (endComp.hours < startComp.hours || (endComp.hours === startComp.hours && endComp.minutes <= startComp.minutes))

  if (isOvernight) {
    // If logged in at or after start time (e.g. 22:00), shift ends tomorrow morning at 06:00
    if (loginIST.hours >= startComp.hours) {
      endTime.setDate(endTime.getDate() + 1)
    }
  } else {
    // If somehow login occurred after the standard end time on same day, bump end to next day
    if (endTime.getTime() <= loginDate.getTime()) {
      endTime.setDate(endTime.getDate() + 1)
    }
  }

  return endTime
}
