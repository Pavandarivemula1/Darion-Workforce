'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { CheckCircle2, Clock, AlertTriangle, FileSpreadsheet, ChevronDown } from 'lucide-react'
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
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!records || records.length === 0) {
    return (
      <Card variant="outlined" className="w-full py-8 flex flex-col items-center justify-center gap-2 text-center border border-[var(--md-sys-color-outline-variant)]">
        <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
          <FileSpreadsheet className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold">No Attendance Records</h3>
        <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] max-w-xs">
          No work sessions match the selected criteria.
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
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const calculateNetTotal = (loginIso: string, logoutIso: string | null, breakSecs: number = 0) => {
    if (!logoutIso) return 'Running...'
    const start = new Date(loginIso).getTime()
    const end = new Date(logoutIso).getTime()
    const grossMs = Math.max(0, end - start)
    const netMs = Math.max(0, grossMs - breakSecs * 1000)
    return formatDurationMs(netMs)
  }

  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* 1. Mobile Expandable Master-Detail Rows (< 640px) */}
      <div className="flex flex-col divide-y divide-[var(--md-sys-color-outline-variant)] rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] overflow-hidden sm:hidden shadow-2xs">
        {records.map((item) => {
          const hasLogout = !!item.logout_time
          const today = isToday(item.login_time)
          const isWorking = !hasLogout && today
          const isOnBreak = isWorking && !!item.break_start_time
          const breakSecs = item.break_duration_seconds || 0
          const status = item.approval_status || 'pending'
          const payout = item.payout_amount || 0
          const isExpanded = expandedId === item.id
          const netDuration = calculateNetTotal(item.login_time, item.logout_time, breakSecs)

          return (
            <div key={item.id} className="flex flex-col transition-colors">
              {/* Collapsed Master Row */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="w-full py-2.5 px-3 flex items-center justify-between text-left active:bg-[var(--md-sys-color-surface-container)] transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-[var(--md-sys-color-on-surface)] truncate" suppressHydrationWarning>
                      {formatDate(item.login_time)}
                    </span>
                    {isOnBreak ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    ) : isWorking ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    ) : null}
                  </div>
                  <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-mono" suppressHydrationWarning>
                    {formatTime(item.login_time)} – {formatTime(item.logout_time)}
                  </p>
                </div>


                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-[var(--md-sys-color-primary)] block">
                      {netDuration}
                    </span>
                    <span
                      className={`text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                        status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                          : status === 'rejected'
                          ? 'bg-red-500/15 text-red-700 dark:text-red-300'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {status === 'approved' ? `₹${Math.round(payout)}` : status}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[var(--md-sys-color-on-surface-variant)] transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Expanded Detail Drawer */}
              {isExpanded && (
                <div className="px-3 pb-2.5 pt-1 bg-[var(--md-sys-color-surface-container-low)] border-t border-[var(--md-sys-color-outline-variant)] text-[11px] grid grid-cols-2 gap-2 animate-fade-in">
                  <div className="p-1.5 rounded-lg bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] font-mono">
                    <span className="text-[9px] text-[var(--md-sys-color-on-surface-variant)] uppercase block font-sans">
                      Break Time
                    </span>
                    <span className="font-bold text-amber-700 dark:text-amber-400">
                      {formatBreakDuration(breakSecs)}
                    </span>
                  </div>

                  <div className="p-1.5 rounded-lg bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] font-mono">
                    <span className="text-[9px] text-[var(--md-sys-color-on-surface-variant)] uppercase block font-sans">
                      Session Payout
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      ₹{payout.toFixed(2)}
                    </span>
                  </div>

                  {item.rejection_reason && (
                    <div className="col-span-2 p-1.5 rounded-lg bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20 text-[10px]">
                      <strong>Reason:</strong> {item.rejection_reason}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 2. Desktop Attendance Table (>= 640px) */}
      <Card variant="outlined" className="hidden sm:block w-full overflow-hidden p-0 border border-[var(--md-sys-color-outline-variant)]">
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
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-warning-container)] text-[var(--md-sys-color-on-warning-container)]">
                          <Clock className="w-3.5 h-3.5" />
                          On Break
                        </span>
                      ) : isWorking ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                          <Clock className="w-3.5 h-3.5" />
                          Working
                        </span>
                      ) : status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-success-container)] text-[var(--md-sys-color-on-success-container)]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approved (₹{payout.toFixed(2)})
                        </span>
                      ) : status === 'rejected' ? (
                        <div className="flex flex-col gap-0.5 max-w-[220px]">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Rejected
                          </span>
                          {item.rejection_reason && (
                            <span className="text-[10px] text-[var(--md-sys-color-error)] truncate" title={item.rejection_reason}>
                              Admin Reason: {item.rejection_reason}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-warning-container)] text-[var(--md-sys-color-on-warning-container)]">
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
    </div>
  )
}
