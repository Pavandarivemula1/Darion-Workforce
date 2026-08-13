'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { BarChart3, Target, Clock, CheckCircle2 } from 'lucide-react'

export interface CandidateDailyBar {
  dayName: string
  dateStr: string
  dateIso: string
  totalMs: number
  formattedDuration: string
  hoursNum: number
}

export interface CandidateAnalyticsChartsProps {
  dailyData: CandidateDailyBar[]
  weeklyTotalMs: number
  formattedWeeklyTotal: string
  formattedMonthTotal: string
  completedShiftsCount: number
}

export const CandidateAnalyticsCharts: React.FC<CandidateAnalyticsChartsProps> = ({
  dailyData,
  weeklyTotalMs,
  formattedWeeklyTotal,
  formattedMonthTotal,
  completedShiftsCount,
}) => {
  // Target weekly hours (40h)
  const targetWeeklyMs = 40 * 60 * 60 * 1000
  const percentOfWeeklyTarget = Math.min(100, Math.round((weeklyTotalMs / targetWeeklyMs) * 100))

  // Find max daily hours for relative scaling (minimum scale 9h)
  const maxHours = Math.max(...dailyData.map((d) => d.hoursNum), 9)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Candidate Weekly Hours Bar Graph */}
      <Card variant="outlined" className="lg:col-span-2 flex flex-col gap-4 border border-[var(--md-sys-color-outline-variant)]">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">Your Weekly Work Hours</h3>
              <p className="text-[11px] sm:text-xs text-[var(--md-sys-color-on-surface-variant)]">
                Daily shift durations for the current week (Mon – Sun)
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shrink-0">
            This Week
          </span>
        </div>

        {/* Visual Bar Graph Container */}
        <div className="pt-2 pb-1 px-1 sm:px-2">
          <div className="h-44 flex items-end justify-between gap-1 sm:gap-4 border-b border-[var(--md-sys-color-outline-variant)] pb-2 relative">
            {/* 8h Target Indicator Line */}
            <div
              className="absolute left-0 right-0 border-b border-dashed border-[var(--md-sys-color-outline)] z-0 pointer-events-none"
              style={{ bottom: `${(8 / maxHours) * 100}%` }}
            >
              <span className="text-[9px] sm:text-[10px] text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface)] px-1 font-mono absolute right-0 -top-3">
                8h target
              </span>
            </div>

            {dailyData.map((d) => {
              const heightPercent = Math.min(100, Math.max(6, (d.hoursNum / maxHours) * 100))
              const isZero = d.hoursNum === 0

              return (
                <div key={d.dateIso} className="flex-1 min-w-0 flex flex-col items-center gap-1.5 group h-full justify-end z-10">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] sm:text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[var(--md-sys-color-inverse-surface)] text-[var(--md-sys-color-inverse-on-surface)] whitespace-nowrap pointer-events-none">
                    {d.formattedDuration}
                  </div>

                  {/* Visual Bar */}
                  <div
                    className={`w-full max-w-[28px] sm:max-w-[34px] rounded-t-md transition-all duration-500 relative ${
                      isZero
                        ? 'bg-[var(--md-sys-color-surface-container-high)] border-t border-[var(--md-sys-color-outline-variant)]'
                        : d.hoursNum >= 8
                        ? 'bg-gradient-to-t from-[var(--md-sys-color-primary)] to-[var(--md-sys-color-tertiary)]'
                        : 'bg-gradient-to-t from-[var(--md-sys-color-secondary)] to-[var(--md-sys-color-primary)]'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {!isZero && (
                      <span className="text-[9px] sm:text-[10px] font-bold text-white font-mono absolute -top-4 left-1/2 -translate-x-1/2 hidden sm:block">
                        {Math.round(d.hoursNum)}h
                      </span>
                    )}
                  </div>

                  {/* Day Label */}
                  <div className="text-center mt-0.5">
                    <p className="text-[10px] sm:text-xs font-bold leading-tight truncate">{d.dayName}</p>
                    <p className="text-[9px] sm:text-[10px] text-[var(--md-sys-color-on-surface-variant)] leading-tight truncate">{d.dateStr}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* 2. Target Progress & Performance Stats Card */}
      <Card variant="outlined" className="flex flex-col gap-4 border border-[var(--md-sys-color-outline-variant)] justify-between">
        <div className="pb-3 border-b border-[var(--md-sys-color-outline-variant)] flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold">40-Hour Weekly Goal</h3>
            <p className="text-[11px] sm:text-xs text-[var(--md-sys-color-on-surface-variant)]">Your goal progress this week</p>
          </div>
        </div>

        {/* Progress Circle / Bar Container */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--md-sys-color-primary)]">
              {formattedWeeklyTotal}
            </span>
            <span className="text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
              {percentOfWeeklyTarget}% Reached
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full bg-[var(--md-sys-color-surface-container-highest)] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--md-sys-color-primary)] to-[var(--md-sys-color-tertiary)] rounded-full transition-all duration-500"
              style={{ width: `${percentOfWeeklyTarget}%` }}
            />
          </div>

          <p className="text-[11px] sm:text-xs text-[var(--md-sys-color-on-surface-variant)]">
            Target: 40h 00m per week (Mon – Fri, 8h/day)
          </p>
        </div>

        {/* Monthly Summary Badges */}
        <div className="pt-3 border-t border-[var(--md-sys-color-outline-variant)] grid grid-cols-2 gap-3">
          <div className="p-2.5 sm:p-3 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)] flex flex-col gap-1 border border-[var(--md-sys-color-outline-variant)]">
            <span className="text-[9px] sm:text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-semibold uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-[var(--md-sys-color-primary)]" /> Monthly Total
            </span>
            <span className="text-sm sm:text-base font-bold font-mono truncate">{formattedMonthTotal}</span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)] flex flex-col gap-1 border border-[var(--md-sys-color-outline-variant)]">
            <span className="text-[9px] sm:text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-semibold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Shifts Done
            </span>
            <span className="text-sm sm:text-base font-bold truncate">{completedShiftsCount} Shifts</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
