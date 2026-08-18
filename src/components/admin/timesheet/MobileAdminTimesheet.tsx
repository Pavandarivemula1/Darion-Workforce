'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Clock,
  Users,
  TrendingUp,
  Search,
} from 'lucide-react'
import Link from 'next/link'
import { CandidateWeeklyRow } from '@/lib/utils/timesheet'

export interface MobileAdminTimesheetProps {
  timesheetRows: CandidateWeeklyRow[]
  daysHeader: { dayName: string; dateStr: string; dateIso: string }[]
  weekLabel: string
  currentDateIso: string
  onExportCsv: () => void
}

export const MobileAdminTimesheet: React.FC<MobileAdminTimesheetProps> = ({
  timesheetRows,
  daysHeader,
  weekLabel,
  currentDateIso,
  onExportCsv,
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const currentDate = currentDateIso ? new Date(currentDateIso) : new Date()

  const getPreviousWeekIso = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 7)
    return d.toISOString()
  }

  const getNextWeekIso = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 7)
    return d.toISOString()
  }

  const totalTeamMs = timesheetRows.reduce((sum, r) => sum + r.weeklyTotalMs, 0)
  const activeContributors = timesheetRows.filter((r) => r.weeklyTotalMs > 0).length
  const totalTeamHours = totalTeamMs / (1000 * 60 * 60)
  const avgHours = activeContributors > 0 ? (totalTeamHours / activeContributors).toFixed(1) : '0.0'

  const filteredRows = timesheetRows.filter((r) => {
    if (searchQuery.trim()) {
      return r.candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  return (
    <div className="flex flex-col gap-2.5">
      {/* 1. Executive Timesheet Command Strip */}
      <div className="p-3 rounded-2xl bg-slate-900 dark:bg-slate-950 text-slate-100 border border-slate-800 shadow-xs flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Weekly Timesheet</span>
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
            {weekLabel}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Link
            href={`/admin/timesheet?week=${encodeURIComponent(getPreviousWeekIso())}`}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
            title="Previous Week"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>

          <Link
            href={`/admin/timesheet?week=${encodeURIComponent(getNextWeekIso())}`}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
            title="Next Week"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={onExportCsv}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. 2x2 Bento Matrix */}
      <div className="grid grid-cols-2 gap-2">
        {/* Metric 1: Total Team Hours */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Total Output
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {totalTeamHours.toFixed(1)} <span className="text-xs font-sans font-medium text-[var(--md-sys-color-on-surface-variant)]">hrs</span>
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Total Billed Hours</span>
          </div>
        </div>

        {/* Metric 2: Active Contributors */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Active Staff
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {activeContributors} / {timesheetRows.length}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Submitted Hours</span>
          </div>
        </div>

        {/* Metric 3: Avg Hours per Staff */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Avg per Person
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {avgHours} <span className="text-xs font-sans font-medium text-[var(--md-sys-color-on-surface-variant)]">hrs</span>
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Weekly Utilization</span>
          </div>
        </div>

        {/* Metric 4: Days Count */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Period Cycle
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              7 Days
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Mon – Sun Window</span>
          </div>
        </div>
      </div>

      {/* 3. Candidate Breakdown Feed */}
      <div className="flex flex-col gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]" />
          <input
            type="text"
            placeholder="Search candidate name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-xl text-xs bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] focus:outline-none"
          />
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-2">
          {filteredRows.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
              No candidate records for this week.
            </div>
          ) : (
            filteredRows.map((r) => {
              const hours = (r.weeklyTotalMs / (1000 * 60 * 60)).toFixed(1)
              const hasHours = r.weeklyTotalMs > 0

              return (
                <Card
                  key={r.candidate.id}
                  variant="outlined"
                  className="p-2.5 rounded-2xl flex flex-col gap-2 relative overflow-hidden transition-all border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] shadow-2xs"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] font-bold text-[11px] flex items-center justify-center shrink-0">
                        {r.candidate.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[var(--md-sys-color-on-surface)] truncate">{r.candidate.full_name}</p>
                        <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-mono">
                          {r.formattedWeeklyTotal} total
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {hasHours ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-black bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-mono">
                          {hours}h
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
                          0h Logged
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 7-Day Micro Grid */}
                  <div className="grid grid-cols-7 gap-1 pt-1 border-t border-[var(--md-sys-color-outline-variant)]">
                    {r.days.map((day, idx) => {
                      const dayHours = (day.totalMs / (1000 * 60 * 60)).toFixed(1)
                      const hasDayHours = day.totalMs > 0

                      return (
                        <div
                          key={day.dateIso || idx}
                          className={`p-1 rounded-lg flex flex-col items-center justify-center text-center transition-all ${
                            hasDayHours
                              ? 'bg-slate-900/5 dark:bg-slate-100/5 border border-slate-700/20'
                              : 'bg-[var(--md-sys-color-surface-container-low)]'
                          }`}
                        >
                          <span className="text-[8px] uppercase font-bold text-[var(--md-sys-color-on-surface-variant)]">
                            {day.dayName.slice(0, 1)}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-bold mt-0.5 ${
                              hasDayHours
                                ? 'text-[var(--md-sys-color-on-surface)]'
                                : 'text-[var(--md-sys-color-on-surface-variant)]/60'
                            }`}
                          >
                            {hasDayHours ? `${dayHours}h` : '—'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
