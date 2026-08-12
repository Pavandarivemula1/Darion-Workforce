import React from 'react'
import { Card } from '@/components/ui/Card'
import { CheckCircle2, Clock, AlertTriangle, FileSpreadsheet } from 'lucide-react'
import { formatDurationMs, formatBreakDuration } from '@/lib/utils/timesheet'

export interface AttendanceItem {
  id: string
  user_id: string
  login_time: string
  logout_time: string | null
  break_start_time?: string | null
  break_duration_seconds?: number
  approval_status?: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string | null
  payout_amount?: number | null
  created_at: string
}

export interface AttendanceTableProps {
  records: AttendanceItem[]
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({ records }) => {
  if (!records || records.length === 0) {
    return (
      <Card variant="outlined" className="w-full py-12 flex flex-col items-center justify-center gap-3 text-center border border-[var(--md-sys-color-outline-variant)]">
        <div className="w-12 h-12 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold">No Attendance Records</h3>
        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-sm">
          No work sessions match the selected filter criteria.
        </p>
      </Card>
    )
  }

  const isToday = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '--:--'
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const calculateNetTotal = (loginIso: string, logoutIso: string | null, breakSecs = 0) => {
    if (!logoutIso) return '--'
    const start = new Date(loginIso).getTime()
    const end = new Date(logoutIso).getTime()
    const grossMs = Math.max(0, end - start)
    const netMs = Math.max(0, grossMs - breakSecs * 1000)
    return formatDurationMs(netMs)
  }

  return (
    <Card variant="outlined" className="w-full overflow-hidden p-0 border border-[var(--md-sys-color-outline-variant)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] text-xs font-semibold uppercase tracking-wider border-b border-[var(--md-sys-color-outline-variant)]">
              <th className="py-3.5 px-4 sm:px-6">Date</th>
              <th className="py-3.5 px-4">Login</th>
              <th className="py-3.5 px-4">Logout</th>
              <th className="py-3.5 px-4">Break</th>
              <th className="py-3.5 px-4">Net Work Time</th>
              <th className="py-3.5 px-4 sm:px-6">Shift Payment Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
            {records.map((item) => {
              const hasLogout = !!item.logout_time
              const today = isToday(item.login_time)
              const isWorking = !hasLogout && today
              const isOnBreak = isWorking && !!item.break_start_time
              const breakSecs = item.break_duration_seconds || 0
              const status = item.approval_status || 'pending'
              const payout = item.payout_amount || 0

              return (
                <tr
                  key={item.id}
                  className="hover:bg-[var(--md-sys-color-surface-container-low)] transition-colors"
                >
                  <td className="py-4 px-4 sm:px-6 font-medium whitespace-nowrap">
                    {formatDate(item.login_time)}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap font-mono text-xs">
                    {formatTime(item.login_time)}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap font-mono text-xs">
                    {formatTime(item.logout_time)}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap font-mono text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    {formatBreakDuration(breakSecs)}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap font-mono text-xs font-semibold">
                    {isOnBreak ? (
                      <span className="text-amber-600 dark:text-amber-400 animate-pulse">Paused (On Break)</span>
                    ) : isWorking ? (
                      <span className="text-[var(--md-sys-color-primary)] animate-pulse">In Progress</span>
                    ) : (
                      calculateNetTotal(item.login_time, item.logout_time, breakSecs)
                    )}
                  </td>
                  <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                    {isOnBreak ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        <Clock className="w-3.5 h-3.5" />
                        On Break
                      </span>
                    ) : isWorking ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                        <Clock className="w-3.5 h-3.5" />
                        Working
                      </span>
                    ) : status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved (${payout.toFixed(2)})
                      </span>
                    ) : status === 'rejected' ? (
                      <div className="flex flex-col gap-0.5 max-w-[220px]">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Rejected
                        </span>
                        {item.rejection_reason && (
                          <span className="text-[10px] text-rose-500 truncate" title={item.rejection_reason}>
                            Admin Reason: {item.rejection_reason}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Approval
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
