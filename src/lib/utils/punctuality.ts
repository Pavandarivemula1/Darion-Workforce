import {
  type ShiftConfig,
  DEFAULT_FALLBACK_SHIFT,
} from '@/lib/utils/shift'

const TIMEZONE = 'Asia/Kolkata'

export type LoginPunctuality = 'on_time' | 'late' | 'early'
export type LogoutPunctuality = 'left_early' | 'overtime' | 'on_schedule' | 'in_progress'

export interface PunctualityResult {
  loginStatus: LoginPunctuality
  loginDelayMinutes: number
  loginBadgeText: string
  logoutStatus?: LogoutPunctuality
  logoutDiffMinutes?: number
  logoutBadgeText?: string
  isAutoCutoff: boolean
  isStale: boolean
  staleHours: number
}

function parseTimeComponents(timeStr: string): { hours: number; minutes: number; seconds: number } {
  const [h, m, s] = (timeStr || '09:00:00').split(':').map((v) => parseInt(v || '0', 10))
  return {
    hours: isNaN(h) ? 9 : h,
    minutes: isNaN(m) ? 0 : m,
    seconds: isNaN(s) ? 0 : s,
  }
}

export function formatDelayString(minutes: number, prefix: string = '+'): string {
  const abs = Math.abs(minutes)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  if (h > 0 && m > 0) return `${prefix}${h}h ${m}m`
  if (h > 0) return `${prefix}${h}h`
  return `${prefix}${m}m`
}

/**
 * Evaluates punctuality and adherence of a work session against assigned or default shift schedule.
 */
export function calculatePunctualityStatus(
  loginTime: string,
  logoutTime: string | null = null,
  shift: ShiftConfig = DEFAULT_FALLBACK_SHIFT,
  isAutoCutoff: boolean = false,
  maxHoursThreshold: number = 12
): PunctualityResult {
  const loginDateKolkata = new Date(
    new Date(loginTime).toLocaleString('en-US', { timeZone: TIMEZONE })
  )

  const startComp = parseTimeComponents(shift.start_time)
  const endComp = parseTimeComponents(shift.end_time)

  // Target shift start date on the same calendar day in Kolkata
  const targetStart = new Date(loginDateKolkata)
  targetStart.setHours(startComp.hours, startComp.minutes, startComp.seconds, 0)

  const graceMins = shift.grace_period_mins ?? 15
  const graceThresholdMs = graceMins * 60 * 1000

  const loginDiffMs = loginDateKolkata.getTime() - targetStart.getTime()
  const loginDiffMinutes = Math.round(loginDiffMs / (60 * 1000))

  let loginStatus: LoginPunctuality = 'on_time'
  let loginBadgeText = 'On Time'

  if (loginDiffMs > graceThresholdMs) {
    loginStatus = 'late'
    // Delay beyond scheduled start
    loginBadgeText = `Late (${formatDelayString(loginDiffMinutes, '+')})`
  } else if (loginDiffMs < -15 * 60 * 1000) {
    loginStatus = 'early'
    loginBadgeText = `Early (${formatDelayString(loginDiffMinutes, '-')})`
  } else {
    loginStatus = 'on_time'
    loginBadgeText = 'On Time'
  }

  // Evaluate Logout Punctuality if completed
  let logoutStatus: LogoutPunctuality | undefined = undefined
  let logoutDiffMinutes: number | undefined = undefined
  let logoutBadgeText: string | undefined = undefined

  const isOvernight = shift.is_overnight || (endComp.hours < startComp.hours || (endComp.hours === startComp.hours && endComp.minutes <= startComp.minutes))

  const targetEnd = new Date(loginDateKolkata)
  targetEnd.setHours(endComp.hours, endComp.minutes, endComp.seconds, 0)
  if (isOvernight && loginDateKolkata.getHours() >= startComp.hours) {
    targetEnd.setDate(targetEnd.getDate() + 1)
  }

  if (logoutTime) {
    const logoutDateKolkata = new Date(
      new Date(logoutTime).toLocaleString('en-US', { timeZone: TIMEZONE })
    )

    const logoutDiffMs = logoutDateKolkata.getTime() - targetEnd.getTime()
    logoutDiffMinutes = Math.round(logoutDiffMs / (60 * 1000))

    if (logoutDiffMs < -10 * 60 * 1000) {
      logoutStatus = 'left_early'
      logoutBadgeText = `Left Early (${formatDelayString(logoutDiffMinutes, '-')})`
    } else if (logoutDiffMs >= 30 * 60 * 1000) {
      logoutStatus = 'overtime'
      logoutBadgeText = `Overtime (${formatDelayString(logoutDiffMinutes, '+')})`
    } else {
      logoutStatus = 'on_schedule'
      logoutBadgeText = 'On Schedule'
    }
  } else {
    logoutStatus = 'in_progress'
  }

  // Stale detection
  const nowKolkata = new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }))
  const totalElapsedMs = (logoutTime ? new Date(logoutTime).getTime() : nowKolkata.getTime()) - new Date(loginTime).getTime()
  const totalElapsedHours = totalElapsedMs / (1000 * 60 * 60)
  const isStale = !logoutTime && totalElapsedHours >= maxHoursThreshold

  return {
    loginStatus,
    loginDelayMinutes: loginDiffMinutes,
    loginBadgeText,
    logoutStatus,
    logoutDiffMinutes,
    logoutBadgeText,
    isAutoCutoff,
    isStale,
    staleHours: Math.floor(totalElapsedHours),
  }
}
