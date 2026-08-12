'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { BarChart3, PieChart, Users, Award, TrendingUp } from 'lucide-react'

export interface DailyBarData {
  dayName: string
  dateStr: string
  dateIso: string
  totalMs: number
  formattedDuration: string
  hoursNum: number
}

export interface CandidateBreakdown {
  id: string
  name: string
  totalMs: number
  formattedDuration: string
  completedCount: number
  percentOfTarget: number // target 40h
}

export interface DashboardAnalyticsChartsProps {
  dailyData: DailyBarData[]
  candidateBreakdowns: CandidateBreakdown[]
  completedCount: number
  workingNowCount: number
  incompleteCount: number
}

export const DashboardAnalyticsCharts: React.FC<DashboardAnalyticsChartsProps> = ({
  dailyData,
  candidateBreakdowns,
  completedCount,
  workingNowCount,
  incompleteCount,
}) => {
  // Find maximum hours across the week for relative scaling
  const maxHours = Math.max(...dailyData.map((d) => d.hoursNum), 8) // minimum scale 8h

  const totalSessions = completedCount + workingNowCount + incompleteCount
  const completedPercent = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0
  const workingPercent = totalSessions > 0 ? Math.round((workingNowCount / totalSessions) * 100) : 0
  const incompletePercent = totalSessions > 0 ? Math.round((incompleteCount / totalSessions) * 100) : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Weekly Work Hours Bar Chart */}
      <Card variant="outlined" className="lg:col-span-2 flex flex-col gap-4 border border-[var(--md-sys-color-outline-variant)]">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">Weekly Hours Breakdown</h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                Daily cumulative candidate hours logged (Mon – Sun)
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
            This Week
          </span>
        </div>

        {/* Bar Graph Visual Container */}
        <div className="pt-4 pb-2 px-2">
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 border-b border-[var(--md-sys-color-outline-variant)] pb-2">
            {dailyData.map((d) => {
              const heightPercent = Math.min(100, Math.max(8, (d.hoursNum / maxHours) * 100))
              const isZero = d.hoursNum === 0

              return (
                <div key={d.dateIso} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[var(--md-sys-color-inverse-surface)] text-[var(--md-sys-color-inverse-on-surface)] whitespace-nowrap pointer-events-none shadow-xs">
                    {d.formattedDuration}
                  </div>

                  {/* Visual Bar */}
                  <div
                    className={`w-full max-w-[36px] rounded-t-md transition-all duration-500 relative ${
                      isZero
                        ? 'bg-[var(--md-sys-color-surface-container-high)] border-t border-[var(--md-sys-color-outline-variant)]'
                        : 'bg-gradient-to-t from-[var(--md-sys-color-primary)] to-[var(--md-sys-color-tertiary)] hover:brightness-110 shadow-xs'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {!isZero && (
                      <span className="text-[10px] font-bold text-white font-mono absolute -top-5 left-1/2 -translate-x-1/2 hidden sm:block">
                        {Math.round(d.hoursNum)}h
                      </span>
                    )}
                  </div>

                  {/* Day Label */}
                  <div className="text-center mt-1">
                    <p className="text-xs font-bold">{d.dayName}</p>
                    <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">{d.dateStr}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Candidate Target Progress Bars */}
        <div className="pt-2 flex flex-col gap-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
            Candidate Weekly Performance (40h Target)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {candidateBreakdowns.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
                    {c.name}
                  </span>
                  <span className="font-mono font-bold text-[var(--md-sys-color-primary)]">
                    {c.formattedDuration}
                  </span>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-2 rounded-full bg-[var(--md-sys-color-surface-container-highest)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--md-sys-color-primary)] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, c.percentOfTarget)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
                  <span>{c.completedCount} shifts completed</span>
                  <span className="font-semibold">{c.percentOfTarget}% of 40h target</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 2. Shift Status Distribution Card */}
      <Card variant="outlined" className="flex flex-col gap-4 border border-[var(--md-sys-color-outline-variant)]">
        <div className="pb-3 border-b border-[var(--md-sys-color-outline-variant)] flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center shrink-0">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold">Shift Status Distribution</h3>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
              Breakdown of system shift activity
            </p>
          </div>
        </div>

        {/* Visual Progress Stacked Segment Bar */}
        <div className="flex flex-col gap-4 py-2">
          <div className="w-full h-4 rounded-full bg-[var(--md-sys-color-surface-container-highest)] overflow-hidden flex shadow-inner">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${completedPercent}%` }}
              title={`Completed: ${completedPercent}%`}
            />
            <div
              className="h-full bg-[var(--md-sys-color-primary)] transition-all duration-500"
              style={{ width: `${workingPercent}%` }}
              title={`Working Now: ${workingPercent}%`}
            />
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${incompletePercent}%` }}
              title={`Incomplete: ${incompletePercent}%`}
            />
          </div>

          {/* Breakdown Legend Items */}
          <div className="flex flex-col gap-3">
            {/* Legend Item 1: Completed */}
            <div className="p-3 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)] flex items-center justify-between border border-[var(--md-sys-color-outline-variant)]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-semibold">Completed Shifts</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold block">{completedCount}</span>
                <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">{completedPercent}%</span>
              </div>
            </div>

            {/* Legend Item 2: Working Now */}
            <div className="p-3 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)] flex items-center justify-between border border-[var(--md-sys-color-outline-variant)]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--md-sys-color-primary)] shrink-0 animate-pulse" />
                <span className="text-xs font-semibold">Working Right Now</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold block">{workingNowCount}</span>
                <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">{workingPercent}%</span>
              </div>
            </div>

            {/* Legend Item 3: Incomplete */}
            <div className="p-3 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)] flex items-center justify-between border border-[var(--md-sys-color-outline-variant)]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <span className="text-xs font-semibold">Incomplete Sessions</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold block">{incompleteCount}</span>
                <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">{incompletePercent}%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
