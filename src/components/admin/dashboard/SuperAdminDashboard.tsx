'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import {
  Crown,
  Server,
  Activity,
  ShieldAlert,
  Sliders,
  Users,
  CheckCircle2,
  ArrowRight,
  CheckSquare,
  Banknote,
} from 'lucide-react'
import { ROLE_METADATA, UserRole } from '@/lib/auth/permissions'

export interface SuperAdminDashboardProps {
  telemetry: any
  recentAuditLogs: any[]
  diagnosticsHealthy: boolean
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  telemetry,
  recentAuditLogs,
  diagnosticsHealthy,
}) => {
  const roleCounts: Record<string, number> = telemetry?.roleCounts || {}
  const totalUsers = telemetry?.totalUsers || 0

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* 1. TOP EXECUTIVE ACTION & STATUS BAR */}
      <Card
        variant="elevated"
        className="p-4 sm:p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0 shadow-2xs">
              <Crown className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] truncate">
                  Platform Telemetry & Governance
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-primary)]/20">
                  SuperAdmin Mode
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Systems Operational
                </span>
              </div>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5 truncate">
                Multi-tier account directory, real-time database load, and audit trail stream
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin/superadmin"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/90 text-[var(--md-sys-color-on-primary)] shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>SuperAdmin Console</span>
            </Link>
          </div>
        </div>
      </Card>

      {/* 2. UNIFIED 4-METRIC EXECUTIVE KPI ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Registered Accounts */}
        <Card
          variant="elevated"
          className="p-4 sm:p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              Registered Accounts
            </span>
            <div className="w-8 h-8 rounded-lg bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--md-sys-color-on-surface)] tracking-tight">
              {totalUsers.toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">
              Across 6 role tiers
            </span>
          </div>
        </Card>

        {/* Active Clocked-in Sessions */}
        <Card
          variant="elevated"
          className="p-4 sm:p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              Live Working Sessions
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--md-sys-color-on-surface)] tracking-tight">
                {(telemetry?.activeSessionsCount ?? 0).toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">
              Currently on shift
            </span>
          </div>
        </Card>

        {/* Daily Tasks Submitted */}
        <Card
          variant="elevated"
          className="p-4 sm:p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              Daily Tasks Logged
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--md-sys-color-on-surface)] tracking-tight">
              {(telemetry?.totalTasksCount ?? 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">
              Submitted deliverables
            </span>
          </div>
        </Card>

        {/* Gross Payroll Volume */}
        <Card
          variant="elevated"
          className="p-4 sm:p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              Gross Payroll Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--md-sys-color-on-surface)] tracking-tight">
              ₹{(telemetry?.totalPayoutAmount ?? 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block mt-0.5">
              Settled & calculated
            </span>
          </div>
        </Card>
      </div>

      {/* 3. TIER DISTRIBUTION BREAKDOWN MATRIX */}
      <Card
        variant="elevated"
        className="p-5 sm:p-6 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] shadow-xs"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
              Administrative & Workforce Tier Distribution
            </h3>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
              Breakdown of registered user identities mapped to enterprise role authorizations
            </p>
          </div>
          <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container-high)] px-2.5 py-1 rounded-lg">
            {totalUsers} Total
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(Object.keys(ROLE_METADATA) as UserRole[]).map((rKey) => {
            const meta = ROLE_METADATA[rKey]
            const count = roleCounts[rKey] ?? 0
            const percentage = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0

            return (
              <div
                key={rKey}
                className="p-3.5 rounded-xl border border-[var(--md-sys-color-outline-variant)]/80 bg-[var(--md-sys-color-surface-container-low)] flex flex-col justify-between transition-all hover:bg-[var(--md-sys-color-surface-container)]"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] block truncate">
                    {meta.label}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl font-extrabold font-mono text-[var(--md-sys-color-on-surface)]">
                    {count}
                  </span>
                  <span className="text-[10px] font-medium text-[var(--md-sys-color-on-surface-variant)]">
                    {percentage}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* 4. TWO-COLUMN BALANCED TELEMETRY & AUDIT QUICK VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Database Storage Volume Card */}
        <Card
          variant="elevated"
          className="p-5 sm:p-6 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--md-sys-color-outline-variant)]/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] flex items-center justify-center">
                  <Server className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
                  Database Records & Storage
                </h3>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Live Connection
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/50">
                <span className="text-[11px] font-medium text-[var(--md-sys-color-on-surface-variant)] block">
                  Attendance Records
                </span>
                <p className="text-lg font-bold font-mono text-[var(--md-sys-color-on-surface)] mt-1">
                  {(telemetry?.totalAttendanceRecords ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/50">
                <span className="text-[11px] font-medium text-[var(--md-sys-color-on-surface-variant)] block">
                  Daily Tasks
                </span>
                <p className="text-lg font-bold font-mono text-[var(--md-sys-color-on-surface)] mt-1">
                  {(telemetry?.totalTasksCount ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/50">
                <span className="text-[11px] font-medium text-[var(--md-sys-color-on-surface-variant)] block">
                  Leave Applications
                </span>
                <p className="text-lg font-bold font-mono text-[var(--md-sys-color-on-surface)] mt-1">
                  {(telemetry?.totalLeavesCount ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/50">
                <span className="text-[11px] font-medium text-[var(--md-sys-color-on-surface-variant)] block">
                  Auto-Cutoffs
                </span>
                <p className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                  {(telemetry?.autoCutoffCount ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--md-sys-color-outline-variant)] flex items-center justify-between text-xs">
            <span className="text-[var(--md-sys-color-on-surface-variant)]">Auth Sync Integrity:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Healthy
            </span>
          </div>
        </Card>

        {/* Live Security & Audit Activity Stream Card */}
        <Card
          variant="elevated"
          className="p-5 sm:p-6 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--md-sys-color-outline-variant)]/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
                  Live Security & Audit Stream
                </h3>
              </div>
              <Link
                href="/admin/security"
                className="text-xs font-semibold text-[var(--md-sys-color-primary)] hover:underline flex items-center gap-1"
              >
                <span>View Full Trail</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              {recentAuditLogs.length === 0 ? (
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] italic p-6 text-center">
                  No recent audit events recorded.
                </p>
              ) : (
                recentAuditLogs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)] shrink-0" />
                      <div className="min-w-0">
                        <span className="font-semibold text-[var(--md-sys-color-on-surface)] truncate block">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] truncate block">
                          By {log.actor_name} ({log.actor_role})
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--md-sys-color-on-surface-variant)] shrink-0">
                      {new Date(log.created_at).toLocaleTimeString('en-US', {
                        timeZone: 'Asia/Kolkata',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--md-sys-color-outline-variant)]">
            <Link
              href="/admin/superadmin"
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-all flex items-center justify-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-[var(--md-sys-color-on-surface-variant)]" />
              <span>Manage System Configuration & Broadcasts</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
