'use client'

import React, { useState, useTransition } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import {
  Users,
  Clock,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  Coffee,
  CheckCircle2,
  CalendarCheck,
  Radio,
  Sparkles,
} from 'lucide-react'
import { approveOvershiftAction, rejectOvershiftAction } from '@/app/actions/overshift'

export interface SupervisorDashboardProps {
  totalTeamMembers: number
  workingNowCount: number
  onBreakCount: number
  activeSessions: any[]
  pendingOvershiftRequests: any[]
  todayTasksSubmitted: number
  unreviewedTasksCount: number
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({
  totalTeamMembers,
  workingNowCount,
  onBreakCount,
  activeSessions,
  pendingOvershiftRequests: initialOvershift,
  todayTasksSubmitted,
  unreviewedTasksCount,
}) => {
  const [overshiftRequests, setOvershiftRequests] = useState<any[]>(initialOvershift || [])
  const [isPending, startTransition] = useTransition()
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)

  const handleApproveOvershift = (requestId: string) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('requestId', requestId)
      const res = await approveOvershiftAction(null, formData)
      if (res.success) {
        setOvershiftRequests((prev) => prev.filter((r) => r.id !== requestId))
        setActionFeedback('Overshift request approved.')
        setTimeout(() => setActionFeedback(null), 4000)
      }
    })
  }

  const handleRejectOvershift = (requestId: string) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('requestId', requestId)
      const res = await rejectOvershiftAction(null, formData)
      if (res.success) {
        setOvershiftRequests((prev) => prev.filter((r) => r.id !== requestId))
        setActionFeedback('Overshift request rejected.')
        setTimeout(() => setActionFeedback(null), 4000)
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Feedback */}
      {actionFeedback && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {actionFeedback}
        </div>
      )}

      {/* Supervisor Team Operations Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Working Now */}
        <Card variant="outlined" className="p-4 rounded-3xl border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">Clocked In Now</span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black font-mono text-emerald-600 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              {workingNowCount}
            </span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">
              out of {totalTeamMembers} team members
            </span>
          </div>
        </Card>

        {/* On Break */}
        <Card variant="outlined" className="p-4 rounded-3xl border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">Active Breaks</span>
            <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black font-mono text-amber-600">{onBreakCount}</span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">
              team members paused
            </span>
          </div>
        </Card>

        {/* Today's Tasks */}
        <Card variant="outlined" className="p-4 rounded-3xl border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">Today's Tasks</span>
            <div className="w-8 h-8 rounded-full bg-blue-500/15 text-blue-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black font-mono text-blue-600">{todayTasksSubmitted}</span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">
              deliverables submitted
            </span>
          </div>
        </Card>

        {/* Unreviewed Tasks */}
        <Card variant="outlined" className="p-4 rounded-3xl border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">Tasks Awaiting Review</span>
            <div className="w-8 h-8 rounded-full bg-purple-500/15 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black font-mono text-purple-600">{unreviewedTasksCount}</span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">
              ready for feedback & scoring
            </span>
          </div>
        </Card>
      </div>

      {/* Main 2-Column Content: Live Working Radar & Supervisor Action Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Active Workers Radar */}
        <Card variant="outlined" className="p-5 rounded-3xl border-[var(--md-sys-color-outline-variant)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
                <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">
                  Live Team Shift Radar
                </h3>
              </div>
              <Link href="/admin/attendance" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                Live Attendance <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              {activeSessions.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] italic">
                  No team members currently clocked in.
                </div>
              ) : (
                activeSessions.slice(0, 5).map((session) => {
                  const profileObj = Array.isArray(session.profiles) ? session.profiles[0] : session.profiles
                  const name = profileObj?.full_name || 'Team Member'
                  const isOnBreak = !!session.break_start_time

                  return (
                    <div
                      key={session.id}
                      className="p-3 rounded-2xl bg-[var(--md-sys-color-surface-container)] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-surface-container-highest)] font-bold flex items-center justify-center text-xs">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--md-sys-color-on-surface)]">{name}</p>
                          <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-mono">
                            Clocked in: {new Date(session.login_time).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div>
                        {isOnBreak ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                            ☕ On Break
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Working
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </Card>

        {/* Supervisor Action Queue (Pending Overshift & Task Reviews) */}
        <Card variant="outlined" className="p-5 rounded-3xl border-[var(--md-sys-color-outline-variant)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">
                  Overshift Approvals Queue
                </h3>
              </div>
              <Link href="/admin/attendance" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {overshiftRequests.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] italic">
                  🎉 No pending overshift requests to approve.
                </div>
              ) : (
                overshiftRequests.slice(0, 4).map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[var(--md-sys-color-on-surface)]">{req.candidateName || 'Team Member'}</span>
                      <span className="text-[10px] font-mono text-[var(--md-sys-color-on-surface-variant)]">{req.request_date}</span>
                    </div>

                    <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] line-clamp-1 italic">
                      "{req.reason || 'Reason not provided'}"
                    </p>

                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[var(--md-sys-color-outline-variant)] text-[11px]">
                      <button
                        onClick={() => handleRejectOvershift(req.id)}
                        disabled={isPending}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-red-600 hover:bg-red-500/10 cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveOvershift(req.id)}
                        disabled={isPending}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                      >
                        Authorize
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--md-sys-color-outline-variant)]">
            <Link
              href="/admin/tasks"
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckSquare className="w-4 h-4" />
              Score & Review Daily Tasks ({unreviewedTasksCount} pending)
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
