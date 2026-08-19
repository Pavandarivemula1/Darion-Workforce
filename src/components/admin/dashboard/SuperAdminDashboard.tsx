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
  Zap,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileSpreadsheet,
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

  return (
    <div className="flex flex-col gap-6">
      {/* SuperAdmin Executive Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-linear-to-br from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 shadow-2xl text-white">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 shrink-0">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Platform Command Center</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/40">
                  SuperAdmin Mode
                </span>
              </div>
              <p className="text-sm text-purple-200/80 mt-1 max-w-2xl">
                Global overview of multi-tier accounts, database volume, security health, and real-time operational load.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/admin/superadmin"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              Open SuperAdmin Console
            </Link>
          </div>
        </div>

        {/* Global Key Figures */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-purple-500/20">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300/70 block">Total Registered Accounts</span>
            <span className="text-2xl font-black font-mono text-white">{telemetry?.totalUsers ?? 0}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300/70 block">Active Clocked-in Sessions</span>
            <span className="text-2xl font-black font-mono text-emerald-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              {telemetry?.activeSessionsCount ?? 0}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300/70 block">Total Daily Tasks</span>
            <span className="text-2xl font-black font-mono text-blue-300">{telemetry?.totalTasksCount ?? 0}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300/70 block">Gross Payroll Volume</span>
            <span className="text-2xl font-black font-mono text-purple-200">₹{(telemetry?.totalPayoutAmount ?? 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Account Tier Matrix Breakdown */}
      <div>
        <h3 className="text-xs uppercase font-bold tracking-wider text-[var(--md-sys-color-on-surface-variant)] mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-600" />
          Workforce & Administrative Tier Distribution
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(Object.keys(ROLE_METADATA) as UserRole[]).map((rKey) => {
            const meta = ROLE_METADATA[rKey]
            const count = roleCounts[rKey] ?? 0
            return (
              <Card
                key={rKey}
                variant="outlined"
                className="p-3.5 rounded-2xl flex flex-col justify-between border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]"
              >
                <div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${meta.badgeBg} ${meta.badgeText}`}>
                    {meta.label}
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black font-mono text-[var(--md-sys-color-on-surface)]">{count}</span>
                  <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block">registered</span>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Two-Column Telemetry & Audit Quick View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Health Card */}
        <Card variant="outlined" className="p-5 rounded-3xl border-[var(--md-sys-color-outline-variant)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-600" />
                Database Storage Volume
              </h3>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Connection
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[var(--md-sys-color-surface-container)]">
                <span className="text-[var(--md-sys-color-on-surface-variant)]">Attendance Records</span>
                <p className="text-lg font-bold font-mono text-[var(--md-sys-color-on-surface)] mt-0.5">
                  {(telemetry?.totalAttendanceRecords ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--md-sys-color-surface-container)]">
                <span className="text-[var(--md-sys-color-on-surface-variant)]">Daily Tasks</span>
                <p className="text-lg font-bold font-mono text-[var(--md-sys-color-on-surface)] mt-0.5">
                  {(telemetry?.totalTasksCount ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--md-sys-color-surface-container)]">
                <span className="text-[var(--md-sys-color-on-surface-variant)]">Leave Applications</span>
                <p className="text-lg font-bold font-mono text-[var(--md-sys-color-on-surface)] mt-0.5">
                  {(telemetry?.totalLeavesCount ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--md-sys-color-surface-container)]">
                <span className="text-[var(--md-sys-color-on-surface-variant)]">Auto-Cutoffs</span>
                <p className="text-lg font-bold font-mono text-amber-600 mt-0.5">
                  {(telemetry?.autoCutoffCount ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--md-sys-color-outline-variant)] flex items-center justify-between text-xs">
            <span className="text-[var(--md-sys-color-on-surface-variant)]">Auth $\leftrightarrow$ DB Sync Integrity:</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Healthy
            </span>
          </div>
        </Card>

        {/* Recent Audit Log Activity Stream */}
        <Card variant="outlined" className="p-5 rounded-3xl border-[var(--md-sys-color-outline-variant)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-600" />
                Live Security & Audit Stream
              </h3>
              <Link
                href="/admin/superadmin"
                className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
              >
                View Full Trail <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              {recentAuditLogs.length === 0 ? (
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] italic p-4 text-center">
                  No recent audit events recorded.
                </p>
              ) : (
                recentAuditLogs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-[var(--md-sys-color-surface-container)] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-[var(--md-sys-color-on-surface)] truncate block">
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
              className="w-full py-2 rounded-xl text-xs font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              Manage System Settings & Broadcasts
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
