import React from 'react'
import { Card } from '@/components/ui/Card'
import { CandidateWeeklyRow } from '@/lib/utils/timesheet'
import { Clock, AlertTriangle, FileSpreadsheet } from 'lucide-react'

export interface WeeklyMatrixTableProps {
  timesheetRows: CandidateWeeklyRow[]
  daysHeader: { dayName: string; dateStr: string; dateIso: string }[]
}

export const WeeklyMatrixTable: React.FC<WeeklyMatrixTableProps> = ({
  timesheetRows,
  daysHeader,
}) => {
  if (!timesheetRows || timesheetRows.length === 0) {
    return (
      <Card variant="outlined" className="py-12 flex flex-col items-center justify-center gap-3 text-center border border-[var(--md-sys-color-outline-variant)]">
        <FileSpreadsheet className="w-8 h-8 opacity-40 text-[var(--md-sys-color-on-surface-variant)]" />
        <p className="text-sm font-semibold">No Attendance Records Found</p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Mobile Candidate Summary Cards (< 768px) */}
      <div className="flex flex-col gap-4 md:hidden print:hidden">
        {timesheetRows.map((row) => (
          <Card
            key={row.candidate.id}
            variant="outlined"
            className="border border-[var(--md-sys-color-outline-variant)] p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-xs font-bold shrink-0">
                  {row.candidate.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold">{row.candidate.full_name}</h4>
                  <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">Weekly Breakdown</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-[var(--md-sys-color-on-surface-variant)] block">Total</span>
                <span className="text-sm font-bold font-mono text-[var(--md-sys-color-primary)]">
                  {row.formattedWeeklyTotal}
                </span>
              </div>
            </div>

            {/* Daily Grid Stack for Mobile */}
            <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 text-xs">
              {row.days.map((dayCell) => (
                <div
                  key={dayCell.dateIso}
                  className="p-2 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex flex-col items-center justify-center gap-1 text-center"
                >
                  <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)]">
                    {dayCell.dayName}
                  </span>
                  {dayCell.totalMs > 0 ? (
                    <span className="font-mono font-bold text-xs text-[var(--md-sys-color-on-surface)]">
                      {dayCell.formattedDuration}
                    </span>
                  ) : dayCell.hasWorkingSession ? (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Working
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] opacity-40">
                      --
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* 2. Desktop Matrix Table (>= 768px & Print View) */}
      <Card variant="outlined" className="hidden md:block print:block p-0 border border-[var(--md-sys-color-outline-variant)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] font-semibold uppercase tracking-wider border-b border-[var(--md-sys-color-outline-variant)]">
                <th className="py-3.5 px-4 sm:px-6 min-w-[160px]">Candidate</th>
                {daysHeader.map((h) => (
                  <th key={h.dateIso} className="py-3.5 px-3 text-center min-w-[95px]">
                    <div>{h.dayName}</div>
                    <div className="text-[10px] font-normal text-[var(--md-sys-color-on-surface-variant)]">
                      {h.dateStr}
                    </div>
                  </th>
                ))}
                <th className="py-3.5 px-4 sm:px-6 text-right min-w-[110px]">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
              {timesheetRows.map((row) => (
                <tr
                  key={row.candidate.id}
                  className="hover:bg-[var(--md-sys-color-surface-container-low)] transition-colors"
                >
                  {/* Candidate Name Cell */}
                  <td className="py-4 px-4 sm:px-6 font-semibold">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-xs font-bold shrink-0 print:hidden">
                        {row.candidate.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{row.candidate.full_name}</span>
                    </div>
                  </td>

                  {/* 7 Days Columns (Mon..Sun) */}
                  {row.days.map((dayCell) => (
                    <td key={dayCell.dateIso} className="py-4 px-3 text-center align-middle">
                      {dayCell.totalMs > 0 ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-mono font-bold text-xs text-[var(--md-sys-color-on-surface)]">
                            {dayCell.formattedDuration}
                          </span>
                          {dayCell.completedCount > 1 && (
                            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
                              ({dayCell.completedCount} shifts)
                            </span>
                          )}
                          {dayCell.hasWorkingSession && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 print:text-emerald-700">
                              <Clock className="w-2.5 h-2.5" /> Working
                            </span>
                          )}
                        </div>
                      ) : dayCell.hasWorkingSession ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                          <Clock className="w-3 h-3" /> Working
                        </span>
                      ) : dayCell.hasIncompleteSession ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]">
                          <AlertTriangle className="w-3 h-3" /> Incomplete
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] opacity-40">
                          --
                        </span>
                      )}
                    </td>
                  ))}

                  {/* Row Total Cell */}
                  <td className="py-4 px-4 sm:px-6 text-right font-mono font-bold text-sm text-[var(--md-sys-color-primary)]">
                    {row.formattedWeeklyTotal}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
