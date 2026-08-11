import React from 'react'
import { Card } from '@/components/ui/Card'
import { CandidateWeeklyRow, formatDurationMs } from '@/lib/utils/timesheet'
import { Users, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'

export interface WeeklySummaryCardsProps {
  timesheetRows: CandidateWeeklyRow[]
  weekLabel: string
}

export const WeeklySummaryCards: React.FC<WeeklySummaryCardsProps> = ({
  timesheetRows,
  weekLabel,
}) => {
  const totalCandidates = timesheetRows.length

  let totalWeeklyMs = 0
  let totalCompletedSessions = 0
  let totalIncompleteSessions = 0

  timesheetRows.forEach((row) => {
    totalWeeklyMs += row.weeklyTotalMs
    totalCompletedSessions += row.completedSessionsCount
    totalIncompleteSessions += row.incompleteSessionsCount
  })

  return (
    <div className="flex flex-col gap-4">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated" className="flex items-center gap-4 border border-[var(--md-sys-color-outline-variant)]">
          <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider font-medium">
              Candidates
            </p>
            <p className="text-xl font-bold">{totalCandidates}</p>
          </div>
        </Card>

        <Card variant="elevated" className="flex items-center gap-4 border border-[var(--md-sys-color-outline-variant)]">
          <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider font-medium">
              Total Working Time
            </p>
            <p className="text-xl font-bold font-mono">{formatDurationMs(totalWeeklyMs)}</p>
          </div>
        </Card>

        <Card variant="elevated" className="flex items-center gap-4 border border-[var(--md-sys-color-outline-variant)]">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider font-medium">
              Completed Sessions
            </p>
            <p className="text-xl font-bold">{totalCompletedSessions}</p>
          </div>
        </Card>

        <Card variant="elevated" className="flex items-center gap-4 border border-[var(--md-sys-color-outline-variant)]">
          <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider font-medium">
              Incomplete Sessions
            </p>
            <p className="text-xl font-bold">{totalIncompleteSessions}</p>
          </div>
        </Card>
      </div>

      {/* Candidate Hours Breakdown Bar */}
      <Card variant="outlined" className="p-4 border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
            Weekly Breakdown ({weekLabel}):
          </span>

          <div className="flex items-center gap-6 flex-wrap text-sm">
            {timesheetRows.map((r) => (
              <div key={r.candidate.id} className="flex items-center gap-2">
                <span className="font-semibold">{r.candidate.full_name}:</span>
                <span className="font-mono font-bold text-[var(--md-sys-color-primary)]">
                  {r.formattedWeeklyTotal}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
