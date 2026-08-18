'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import {
  Users,
  Clock,
  CalendarCheck,
  TrendingUp,
  Award,
  PieChart,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  History,
  FileSpreadsheet,
  AlertCircle,
  ChevronRight,
} from 'lucide-react'
import { DailyBarData, CandidateBreakdown } from './DashboardAnalyticsCharts'

export interface MobileActiveSession {
  id: string
  user_id: string
  login_time: string
  break_start_time: string | null
  profiles: { full_name?: string } | { full_name?: string }[] | null
}

export interface MobileAdminDashboardProps {
  totalCandidates: number
  workingNowCount: number
  todayRecordsCount: number
  thisWeekDuration: string
  dailyData: DailyBarData[]
  candidateBreakdowns: CandidateBreakdown[]
  completedCount: number
  incompleteCount: number
  activeSessions: MobileActiveSession[] | null
}

export const MobileAdminDashboard: React.FC<MobileAdminDashboardProps> = ({
  totalCandidates,
  workingNowCount,
  todayRecordsCount,
  thisWeekDuration,
  dailyData,
  candidateBreakdowns,
  completedCount,
  incompleteCount,
  activeSessions,
}) => {
  const [analyticsTab, setAnalyticsTab] = useState<'chart' | 'leaderboard' | 'status'>('chart')

  const totalSessions = completedCount + workingNowCount + incompleteCount
  const completedPercent = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0
  const workingPercent = totalSessions > 0 ? Math.round((workingNowCount / totalSessions) * 100) : 0
  const incompletePercent = totalSessions > 0 ? Math.round((incompleteCount / totalSessions) * 100) : 0

  const maxHours = Math.max(...dailyData.map((d) => d.hoursNum), 8)

  return (
    <div className="flex flex-col gap-2.5">
      {/* 1. Mobile Live Executive Command Strip (Executive Slate) */}
      <div className="p-3 rounded-2xl bg-slate-900 dark:bg-slate-950 text-slate-100 border border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Executive Radar</span>
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
            {workingNowCount} Active Staff • {todayRecordsCount} Logs Today
          </p>
        </div>

        <Link
          href="/admin/candidates"
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs shrink-0 flex items-center gap-1 transition-all border border-slate-700"
        >
          <span>Roster</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2. 2x2 Ultra-Dense Bento KPI Deck (Unified Enterprise Elevated Surfaces) */}
      <div className="grid grid-cols-2 gap-2">
        {/* KPI 1: Working Now */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Working Now
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {workingNowCount}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Active Shifts</span>
          </div>
        </div>

        {/* KPI 2: Today's Logs */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Today&apos;s Logs
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <CalendarCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {todayRecordsCount}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Check-Ins</span>
          </div>
        </div>

        {/* KPI 3: Combined Output */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              This Week
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-base font-black font-mono text-[var(--md-sys-color-on-surface)] truncate block">
              {thisWeekDuration}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Combined Output</span>
          </div>
        </div>

        {/* KPI 4: Registered Candidates */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Candidates
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {totalCandidates}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Total Roster</span>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Live Shifts Pulse Reel */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-xs font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Active Staff Sessions ({workingNowCount})</span>
          </h3>
          {workingNowCount > 0 ? (
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Live
            </span>
          ) : null}
        </div>

        {activeSessions && activeSessions.length > 0 ? (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 px-0.5">
            {activeSessions.map((session) => {
              const profileObj = Array.isArray(session.profiles) ? session.profiles[0] : session.profiles
              const fullName = profileObj?.full_name || 'Candidate'
              const isOnBreak = !!session.break_start_time
              const loginD = new Date(session.login_time)

              return (
                <div
                  key={session.id}
                  className="flex items-center gap-2 p-2 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs shrink-0 w-[190px]"
                >
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center text-xs font-bold">
                      {fullName.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--md-sys-color-surface-container)] ${
                        isOnBreak ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[var(--md-sys-color-on-surface)] truncate">{fullName}</p>
                    <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-mono truncate" suppressHydrationWarning>
                      In: {loginD.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-3 px-3 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-center text-xs text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 opacity-40 shrink-0" />
            <span>No candidates currently on shift</span>
          </div>
        )}
      </div>

      {/* 4. Tabbed Micro-Analytics Hub */}
      <Card variant="outlined" className="p-2.5 flex flex-col gap-2.5 border border-[var(--md-sys-color-outline-variant)] shadow-2xs">
        {/* Segmented Control Pill */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]">
          <button
            onClick={() => setAnalyticsTab('chart')}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              analyticsTab === 'chart'
                ? 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] shadow-2xs border border-[var(--md-sys-color-outline-variant)]'
                : 'text-[var(--md-sys-color-on-surface-variant)]'
            }`}
          >
            <BarChart3 className="w-3 h-3" />
            <span>Week</span>
          </button>

          <button
            onClick={() => setAnalyticsTab('leaderboard')}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              analyticsTab === 'leaderboard'
                ? 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] shadow-2xs border border-[var(--md-sys-color-outline-variant)]'
                : 'text-[var(--md-sys-color-on-surface-variant)]'
            }`}
          >
            <Award className="w-3 h-3" />
            <span>Staff</span>
          </button>

          <button
            onClick={() => setAnalyticsTab('status')}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              analyticsTab === 'status'
                ? 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] shadow-2xs border border-[var(--md-sys-color-outline-variant)]'
                : 'text-[var(--md-sys-color-on-surface-variant)]'
            }`}
          >
            <PieChart className="w-3 h-3" />
            <span>Split</span>
          </button>
        </div>

        {/* Tab 1: Weekly Output Bar Chart */}
        {analyticsTab === 'chart' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] uppercase font-bold text-[var(--md-sys-color-on-surface-variant)]">
                Daily Hours (Mon – Sun)
              </span>
              <span className="text-xs font-bold font-mono text-[var(--md-sys-color-on-surface)]">
                {thisWeekDuration}
              </span>
            </div>

            <div className="h-24 flex items-end justify-between gap-1 border-b border-[var(--md-sys-color-outline-variant)] pb-1 pt-1">
              {dailyData.map((d) => {
                const heightPercent = Math.min(100, Math.max(10, (d.hoursNum / maxHours) * 100))
                const isZero = d.hoursNum === 0

                return (
                  <div key={d.dateIso} className="flex-1 min-w-0 flex flex-col items-center justify-end h-full group">
                    <div
                      className={`w-full max-w-[22px] rounded-t-sm transition-all duration-300 ${
                        isZero
                          ? 'bg-[var(--md-sys-color-surface-container-high)] border-t border-[var(--md-sys-color-outline-variant)]'
                          : 'bg-slate-800 dark:bg-slate-200'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[9px] font-semibold text-[var(--md-sys-color-on-surface-variant)] mt-1 truncate">
                      {d.dayName.substring(0, 1)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Staff Leaderboard */}
        {analyticsTab === 'leaderboard' && (
          <div className="flex flex-col divide-y divide-[var(--md-sys-color-outline-variant)] max-h-[160px] overflow-y-auto">
            {candidateBreakdowns.length === 0 ? (
              <div className="py-4 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
                No candidate hours logged this week.
              </div>
            ) : (
              candidateBreakdowns.map((c, idx) => (
                <div key={c.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-slate-500 w-3.5">
                        #{idx + 1}
                      </span>
                      <span className="font-bold truncate text-[var(--md-sys-color-on-surface)]">{c.name}</span>
                    </div>
                    {/* Compact Micro Progress */}
                    <div className="w-full h-1.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] overflow-hidden mt-1">
                      <div
                        className="h-full bg-slate-800 dark:bg-slate-200 rounded-full"
                        style={{ width: `${Math.min(100, c.percentOfTarget)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-xs text-[var(--md-sys-color-on-surface)] block">
                      {c.formattedDuration}
                    </span>
                    <span className="text-[9px] text-[var(--md-sys-color-on-surface-variant)]">
                      {c.percentOfTarget}% of 40h
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Shift Status Distribution Split */}
        {analyticsTab === 'status' && (
          <div className="flex flex-col gap-2.5 py-1">
            {/* Slim 10px Segmented Progress Bar */}
            <div className="w-full h-3 rounded-full bg-[var(--md-sys-color-surface-container-highest)] overflow-hidden flex">
              <div
                className="h-full bg-slate-700 dark:bg-slate-300 transition-all duration-300"
                style={{ width: `${completedPercent}%` }}
              />
              <div
                className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-300"
                style={{ width: `${workingPercent}%` }}
              />
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${incompletePercent}%` }}
              />
            </div>

            {/* 3-Chip Single Row Summary */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="p-1.5 rounded-lg bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)]">
                <span className="text-[9px] uppercase font-bold block text-[var(--md-sys-color-on-surface-variant)]">Completed</span>
                <span className="text-xs font-black font-mono">{completedCount} ({completedPercent}%)</span>
              </div>

              <div className="p-1.5 rounded-lg bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)]">
                <span className="text-[9px] uppercase font-bold block text-[var(--md-sys-color-on-surface-variant)]">Active</span>
                <span className="text-xs font-black font-mono">{workingNowCount} ({workingPercent}%)</span>
              </div>

              <div className="p-1.5 rounded-lg bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)]">
                <span className="text-[9px] uppercase font-bold block text-[var(--md-sys-color-on-surface-variant)]">Incomplete</span>
                <span className="text-xs font-black font-mono">{incompleteCount} ({incompletePercent}%)</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 5. 4-Tile Bento Quick Command Grid */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-xs font-bold text-[var(--md-sys-color-on-surface)] px-0.5">
          Quick Admin Actions
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/admin/candidates"
            className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs hover:bg-[var(--md-sys-color-surface-container-high)] active:scale-[0.97] transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--md-sys-color-on-surface)] truncate">Roster</p>
                <p className="text-[9px] text-[var(--md-sys-color-on-surface-variant)] truncate">Rates & Staff</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--md-sys-color-outline)] shrink-0" />
          </Link>

          <Link
            href="/admin/attendance"
            className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs hover:bg-[var(--md-sys-color-surface-container-high)] active:scale-[0.97] transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center shrink-0">
                <History className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--md-sys-color-on-surface)] truncate">Attendance</p>
                <p className="text-[9px] text-[var(--md-sys-color-on-surface-variant)] truncate">Shift Logs</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--md-sys-color-outline)] shrink-0" />
          </Link>

          <Link
            href="/admin/timesheet"
            className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs hover:bg-[var(--md-sys-color-surface-container-high)] active:scale-[0.97] transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--md-sys-color-on-surface)] truncate">Timesheet</p>
                <p className="text-[9px] text-[var(--md-sys-color-on-surface-variant)] truncate">Weekly Matrix</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--md-sys-color-outline)] shrink-0" />
          </Link>

          <Link
            href="/admin/reset-requests"
            className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs hover:bg-[var(--md-sys-color-surface-container-high)] active:scale-[0.97] transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--md-sys-color-on-surface)] truncate">Security</p>
                <p className="text-[9px] text-[var(--md-sys-color-on-surface-variant)] truncate">Password Resets</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--md-sys-color-outline)] shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  )
}
