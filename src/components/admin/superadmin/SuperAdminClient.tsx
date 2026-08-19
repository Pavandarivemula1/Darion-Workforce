'use client'

import React, { useState, useTransition } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Crown,
  Activity,
  ShieldAlert,
  Sliders,
  Users,
  Building2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Radio,
  FileSpreadsheet,
  Download,
  Search,
  Sparkles,
  Zap,
  KeyRound,
  Eye,
  Server,
  Layers,
  ArrowUpDown,
  BellRing,
} from 'lucide-react'
import { ROLE_METADATA, UserRole } from '@/lib/auth/permissions'
import {
  updateSystemSettingsAction,
  runAuthDiagnosticsAction,
  superadminUpdateUserRoleAction,
  superadminEmergencyMfaResetAction,
  getAuditLogsAction,
  getPlatformTelemetryAction,
} from '@/app/actions/superadmin'

export interface SuperAdminClientProps {
  initialTelemetry?: any
  initialSettings?: Record<string, any>
  initialLogs?: any[]
  initialUsers?: any[]
  initialDepartments?: any[]
  adminId: string
  adminName: string
}

export const SuperAdminClient: React.FC<SuperAdminClientProps> = ({
  initialTelemetry,
  initialSettings = {},
  initialLogs = [],
  initialUsers = [],
  initialDepartments = [],
  adminId,
  adminName,
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'audit' | 'controls' | 'governance' | 'departments'>('telemetry')
  const [isPending, startTransition] = useTransition()
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Telemetry State
  const [telemetry, setTelemetry] = useState(initialTelemetry)
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState(false)

  // Diagnostics State
  const [diagnosticsResult, setDiagnosticsResult] = useState<any>(null)
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false)

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>(initialLogs)
  const [logFilterAction, setLogFilterAction] = useState('all')
  const [logFilterRole, setLogFilterRole] = useState('all')
  const [logSearchQuery, setLogSearchQuery] = useState('')
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)

  // System Settings State
  const [maintenanceEnabled, setMaintenanceEnabled] = useState<boolean>(
    initialSettings.maintenance_mode?.enabled ?? false
  )
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>(
    initialSettings.maintenance_mode?.message || 'System is undergoing scheduled maintenance. Timer punches are temporarily paused.'
  )

  const [announcementEnabled, setAnnouncementEnabled] = useState<boolean>(
    initialSettings.system_announcement?.enabled ?? false
  )
  const [announcementType, setAnnouncementType] = useState<'info' | 'warning' | 'urgent'>(
    initialSettings.system_announcement?.type || 'info'
  )
  const [announcementTitle, setAnnouncementTitle] = useState<string>(
    initialSettings.system_announcement?.title || ''
  )
  const [announcementMessage, setAnnouncementMessage] = useState<string>(
    initialSettings.system_announcement?.message || ''
  )

  const [enforceMfa, setEnforceMfa] = useState<boolean>(
    initialSettings.security_policies?.enforce_mfa_for_management ?? false
  )
  const [maxShiftHours, setMaxShiftHours] = useState<number>(
    initialSettings.security_policies?.max_consecutive_shift_hours ?? 16
  )

  // User Governance State
  const [usersList, setUsersList] = useState<any[]>(initialUsers)
  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  // 1. Refresh Telemetry
  const handleRefreshTelemetry = async () => {
    setIsRefreshingTelemetry(true)
    try {
      const res = await getPlatformTelemetryAction()
      if (res.telemetry) {
        setTelemetry(res.telemetry)
        showNotification('success', 'Platform telemetry refreshed successfully.')
      } else if (res.error) {
        showNotification('error', res.error)
      }
    } catch {
      showNotification('error', 'Failed to refresh telemetry.')
    } finally {
      setIsRefreshingTelemetry(false)
    }
  }

  // 2. Run Diagnostics / Auto-Repair
  const handleRunDiagnostics = async (autoRepair: boolean) => {
    setIsRunningDiagnostics(true)
    try {
      const res = await runAuthDiagnosticsAction(autoRepair)
      if (res.diagnostics) {
        setDiagnosticsResult(res.diagnostics)
        if (autoRepair) {
          showNotification('success', `Diagnostics complete. Repaired ${res.diagnostics.repairedCount} account(s).`)
          handleRefreshTelemetry()
        } else {
          showNotification('success', 'Auth & Profile sync analysis complete.')
        }
      } else if (res.error) {
        showNotification('error', res.error)
      }
    } catch {
      showNotification('error', 'Failed to execute diagnostics.')
    } finally {
      setIsRunningDiagnostics(false)
    }
  }

  // 3. Save Maintenance Mode
  const handleSaveMaintenance = () => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('settingKey', 'maintenance_mode')
      formData.append(
        'settingValue',
        JSON.stringify({
          enabled: maintenanceEnabled,
          message: maintenanceMessage,
        })
      )
      const res = await updateSystemSettingsAction(null, formData)
      if (res.success) {
        showNotification('success', 'Maintenance mode configuration saved.')
      } else {
        showNotification('error', res.error || 'Failed to save maintenance mode.')
      }
    })
  }

  // 4. Save Announcement
  const handleSaveAnnouncement = () => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('settingKey', 'system_announcement')
      formData.append(
        'settingValue',
        JSON.stringify({
          enabled: announcementEnabled,
          type: announcementType,
          title: announcementTitle,
          message: announcementMessage,
        })
      )
      const res = await updateSystemSettingsAction(null, formData)
      if (res.success) {
        showNotification('success', 'System announcement banner updated.')
      } else {
        showNotification('error', res.error || 'Failed to update announcement.')
      }
    })
  }

  // 5. Save Security Policies
  const handleSaveSecurityPolicies = () => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('settingKey', 'security_policies')
      formData.append(
        'settingValue',
        JSON.stringify({
          enforce_mfa_for_management: enforceMfa,
          max_consecutive_shift_hours: maxShiftHours,
        })
      )
      const res = await updateSystemSettingsAction(null, formData)
      if (res.success) {
        showNotification('success', 'Global security policies updated.')
      } else {
        showNotification('error', res.error || 'Failed to update security policies.')
      }
    })
  }

  // 6. Filter & Fetch Audit Logs
  const handleFetchAuditLogs = async (action = logFilterAction, role = logFilterRole) => {
    setIsLoadingLogs(true)
    try {
      const res = await getAuditLogsAction({ action, actorRole: role, limit: 100 })
      if (res.logs) {
        setAuditLogs(res.logs)
      } else if (res.error) {
        showNotification('error', res.error)
      }
    } catch {
      showNotification('error', 'Failed to fetch audit logs.')
    } finally {
      setIsLoadingLogs(false)
    }
  }

  // 7. Direct Role Switch
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('userId', userId)
      formData.append('role', newRole)
      const res = await superadminUpdateUserRoleAction(null, formData)
      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        )
        showNotification('success', res.message || `Role changed to ${newRole}`)
        handleRefreshTelemetry()
      } else {
        showNotification('error', res.error || 'Failed to update role.')
      }
    })
  }

  // 8. Emergency MFA Reset
  const handleEmergencyMfaReset = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to reset all MFA factors for ${userName}?`)) return
    startTransition(async () => {
      const formData = new FormData()
      formData.append('userId', userId)
      const res = await superadminEmergencyMfaResetAction(null, formData)
      if (res.success) {
        showNotification('success', res.message || 'MFA reset successful.')
      } else {
        showNotification('error', res.error || 'Failed to reset MFA.')
      }
    })
  }

  // 9. Export Audit Logs CSV
  const handleExportCsv = () => {
    if (auditLogs.length === 0) return
    const headers = ['Timestamp', 'Actor Name', 'Actor Role', 'Action', 'Target Name', 'Details', 'IP Address']
    const rows = auditLogs.map((l) => [
      `"${new Date(l.created_at).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}"`,
      `"${l.actor_name || ''}"`,
      `"${l.actor_role || ''}"`,
      `"${l.action || ''}"`,
      `"${l.target_name || ''}"`,
      `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`,
      `"${l.ip_address || ''}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filtered Users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      (u.full_name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearch.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  // Filtered Audit Logs
  const filteredLogs = auditLogs.filter((l) => {
    if (!logSearchQuery) return true
    const q = logSearchQuery.toLowerCase()
    return (
      (l.action || '').toLowerCase().includes(q) ||
      (l.actor_name || '').toLowerCase().includes(q) ||
      (l.target_name || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-2xl flex items-center gap-3 text-sm font-semibold border shadow-md animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
              : 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
          )}
          <span className="flex-1">{notification.message}</span>
        </div>
      )}

      {/* SuperAdmin Header Hero */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-linear-to-br from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 shadow-2xl text-white">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 shrink-0">
              <Crown className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">SuperAdmin System Console</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/40">
                  Platform Owner
                </span>
              </div>
              <p className="text-sm text-purple-200/80 mt-1 max-w-2xl">
                Global root platform governance, real-time database telemetry, immutable audit forensics, and security enforcement controls.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outlined"
              size="sm"
              onClick={handleRefreshTelemetry}
              disabled={isRefreshingTelemetry}
              className="text-purple-100 border-purple-400/40 hover:bg-purple-500/20"
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${isRefreshingTelemetry ? 'animate-spin' : ''}`} />
              Refresh Metrics
            </Button>
          </div>
        </div>

        {/* Global Status Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-purple-500/20">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300/70 block">Total Users</span>
            <span className="text-xl font-bold font-mono text-white">{telemetry?.totalUsers ?? 0}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300/70 block">Active Workers</span>
            <span className="text-xl font-bold font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {telemetry?.activeSessionsCount ?? 0}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300/70 block">Auto-Cutoffs</span>
            <span className="text-xl font-bold font-mono text-amber-300">{telemetry?.autoCutoffCount ?? 0}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300/70 block">Total Payout Volume</span>
            <span className="text-xl font-bold font-mono text-purple-200">₹{(telemetry?.totalPayoutAmount ?? 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Modern Pill Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[var(--md-sys-color-outline-variant)]">
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'telemetry'
              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm'
              : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)]'
          }`}
        >
          <Activity className="w-4 h-4" />
          Telemetry & Diagnostics
        </button>

        <button
          onClick={() => {
            setActiveTab('audit')
            handleFetchAuditLogs()
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'audit'
              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm'
              : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)]'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Audit Forensics Trail
        </button>

        <button
          onClick={() => setActiveTab('controls')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'controls'
              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm'
              : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Global Controls & Broadcast
        </button>

        <button
          onClick={() => setActiveTab('governance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'governance'
              ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm'
              : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)]'
          }`}
        >
          <Users className="w-4 h-4" />
          Global User Governance
        </button>
      </div>

      {/* TAB 1: TELEMETRY & DIAGNOSTICS */}
      {activeTab === 'telemetry' && (
        <div className="flex flex-col gap-6">
          {/* Role Distribution Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {(Object.keys(ROLE_METADATA) as UserRole[]).map((roleKey) => {
              const meta = ROLE_METADATA[roleKey]
              const count = telemetry?.roleCounts?.[roleKey] ?? 0
              return (
                <Card
                  key={roleKey}
                  variant="outlined"
                  className="p-3.5 rounded-2xl flex flex-col justify-between border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${meta.badgeBg} ${meta.badgeText}`}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black font-mono text-[var(--md-sys-color-on-surface)]">{count}</span>
                    <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] block">accounts</span>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Database Volume Statistics */}
          <Card variant="outlined" className="p-5 rounded-3xl border-[var(--md-sys-color-outline-variant)]">
            <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-600" />
              Database Tables Volume Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-2xl bg-[var(--md-sys-color-surface-container)]">
                <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Attendance Sessions</span>
                <p className="text-xl font-bold font-mono text-[var(--md-sys-color-on-surface)] mt-1">
                  {telemetry?.totalAttendanceRecords?.toLocaleString() ?? 0}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--md-sys-color-surface-container)]">
                <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Daily Tasks Logged</span>
                <p className="text-xl font-bold font-mono text-[var(--md-sys-color-on-surface)] mt-1">
                  {telemetry?.totalTasksCount?.toLocaleString() ?? 0}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--md-sys-color-surface-container)]">
                <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Leave Applications</span>
                <p className="text-xl font-bold font-mono text-[var(--md-sys-color-on-surface)] mt-1">
                  {telemetry?.totalLeavesCount?.toLocaleString() ?? 0}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--md-sys-color-surface-container)]">
                <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Feedbacks & Ratings</span>
                <p className="text-xl font-bold font-mono text-[var(--md-sys-color-on-surface)] mt-1">
                  {telemetry?.totalFeedbacksCount?.toLocaleString() ?? 0}
                </p>
              </div>
            </div>
          </Card>

          {/* Auth & Database Diagnostic Tool */}
          <Card variant="outlined" className="p-5 rounded-3xl border-purple-500/30 bg-purple-500/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  Auth & Profile Health Diagnostics
                </h3>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
                  Scan and cross-reference Supabase <code className="font-mono text-purple-600">auth.users</code> against <code className="font-mono text-purple-600">public.profiles</code> to detect missing rows, role discrepancies, or broken accounts.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => handleRunDiagnostics(false)}
                  disabled={isRunningDiagnostics}
                >
                  <Search className="w-4 h-4 mr-1.5" />
                  Scan Discrepancies
                </Button>
                <Button
                  variant="filled"
                  size="sm"
                  onClick={() => handleRunDiagnostics(true)}
                  disabled={isRunningDiagnostics}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Auto-Repair & Sync
                </Button>
              </div>
            </div>

            {/* Diagnostics Report View */}
            {diagnosticsResult && (
              <div className="mt-4 p-4 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                  <div>
                    <span className="text-[var(--md-sys-color-on-surface-variant)]">Auth Users:</span>{' '}
                    <span className="font-bold font-mono">{diagnosticsResult.totalAuthUsers}</span>
                  </div>
                  <div>
                    <span className="text-[var(--md-sys-color-on-surface-variant)]">Profiles:</span>{' '}
                    <span className="font-bold font-mono">{diagnosticsResult.totalProfiles}</span>
                  </div>
                  <div>
                    <span className="text-[var(--md-sys-color-on-surface-variant)]">Orphaned Accounts:</span>{' '}
                    <span className={`font-bold font-mono ${diagnosticsResult.orphanedAuthUsers.length > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {diagnosticsResult.orphanedAuthUsers.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--md-sys-color-on-surface-variant)]">Role Desyncs:</span>{' '}
                    <span className={`font-bold font-mono ${diagnosticsResult.desyncedRoles.length > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {diagnosticsResult.desyncedRoles.length}
                    </span>
                  </div>
                </div>

                {diagnosticsResult.orphanedAuthUsers.length === 0 && diagnosticsResult.desyncedRoles.length === 0 ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    All authentication records and database profiles are 100% synchronized and healthy.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 text-xs">
                    {diagnosticsResult.orphanedAuthUsers.length > 0 && (
                      <p className="text-red-600 font-medium">
                        ⚠️ {diagnosticsResult.orphanedAuthUsers.length} user(s) in Supabase Auth missing database profile rows. Click "Auto-Repair" to generate profiles.
                      </p>
                    )}
                    {diagnosticsResult.desyncedRoles.length > 0 && (
                      <p className="text-amber-600 font-medium">
                        ⚠️ {diagnosticsResult.desyncedRoles.length} user(s) have mismatching roles between auth metadata and database profile.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: AUDIT FORENSICS TRAIL */}
      {activeTab === 'audit' && (
        <div className="flex flex-col gap-4">
          <Card variant="outlined" className="p-4 rounded-3xl border-[var(--md-sys-color-outline-variant)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]" />
                  <input
                    type="text"
                    placeholder="Search by action, actor, target..."
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)]"
                  />
                </div>

                <select
                  value={logFilterAction}
                  onChange={(e) => {
                    setLogFilterAction(e.target.value)
                    handleFetchAuditLogs(e.target.value, logFilterRole)
                  }}
                  className="px-3 py-2 text-xs rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)]"
                >
                  <option value="all">All Actions</option>
                  <option value="ROLE_OVERRIDE_BY_SUPERADMIN">Role Overrides</option>
                  <option value="SYSTEM_SETTING_UPDATED">System Settings</option>
                  <option value="AUTH_DIAGNOSTICS_REPAIRED">Diagnostics Repairs</option>
                  <option value="EMERGENCY_MFA_RESET_BY_SUPERADMIN">MFA Resets</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={handleExportCsv}
                  disabled={auditLogs.length === 0}
                  className="text-xs"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Export CSV
                </Button>
                <Button
                  variant="filled"
                  size="sm"
                  onClick={() => handleFetchAuditLogs()}
                  disabled={isLoadingLogs}
                  className="text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="overflow-x-auto mt-4 rounded-2xl border border-[var(--md-sys-color-outline-variant)]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Timestamp (IST)</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Action Event</th>
                    <th className="p-3">Target</th>
                    <th className="p-3">Details / Forensics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[var(--md-sys-color-on-surface-variant)]">
                        No audit events recorded matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[var(--md-sys-color-surface-container)] transition-colors">
                        <td className="p-3 whitespace-nowrap font-mono text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                          {new Date(log.created_at).toLocaleString('en-US', {
                            timeZone: 'Asia/Kolkata',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="font-semibold text-[var(--md-sys-color-on-surface)]">{log.actor_name}</div>
                          <span className="text-[9px] uppercase font-bold text-purple-600 dark:text-purple-400">
                            {log.actor_role}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap text-[var(--md-sys-color-on-surface)]">
                          {log.target_name ? (
                            <span className="font-medium">{log.target_name}</span>
                          ) : (
                            <span className="text-[var(--md-sys-color-on-surface-variant)] italic">System-wide</span>
                          )}
                        </td>
                        <td className="p-3 text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)] max-w-xs truncate">
                          {JSON.stringify(log.details || {})}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: GLOBAL CONTROLS & BROADCAST */}
      {activeTab === 'controls' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Emergency Maintenance Mode */}
          <Card variant="outlined" className="p-5 rounded-3xl border-[var(--md-sys-color-outline-variant)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Platform Maintenance Mode
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maintenanceEnabled}
                    onChange={(e) => setMaintenanceEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-4">
                When enabled, active worker punches and timer sessions are paused globally. A maintenance notice banner is shown to candidates.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">
                  Maintenance Announcement Message
                </label>
                <textarea
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-xs rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--md-sys-color-outline-variant)] flex justify-end">
              <Button variant="filled" onClick={handleSaveMaintenance} disabled={isPending} className="bg-amber-600 hover:bg-amber-700 text-white">
                Save Maintenance Settings
              </Button>
            </div>
          </Card>

          {/* System Broadcast Announcement */}
          <Card variant="outlined" className="p-5 rounded-3xl border-[var(--md-sys-color-outline-variant)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                  <BellRing className="w-5 h-5 text-blue-500" />
                  System-Wide Announcement Banner
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementEnabled}
                    onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-4">
                Broadcast an alert banner across Candidate and Admin portals for important notices, payroll dates, or operational announcements.
              </p>

              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--md-sys-color-on-surface)] block mb-1">Banner Type</label>
                    <select
                      value={announcementType}
                      onChange={(e: any) => setAnnouncementType(e.target.value)}
                      className="w-full p-2 text-xs rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)]"
                    >
                      <option value="info">Info (Blue)</option>
                      <option value="warning">Warning (Amber)</option>
                      <option value="urgent">Urgent (Red)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--md-sys-color-on-surface)] block mb-1">Banner Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Office Holiday Notice"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      className="w-full p-2 text-xs rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[var(--md-sys-color-on-surface)] block mb-1">Announcement Content</label>
                  <textarea
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                    rows={2}
                    placeholder="Enter broadcast message text..."
                    className="w-full p-2.5 text-xs rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--md-sys-color-outline-variant)] flex justify-end">
              <Button variant="filled" onClick={handleSaveAnnouncement} disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                Publish Announcement
              </Button>
            </div>
          </Card>

          {/* Global Security Policies */}
          <Card variant="outlined" className="p-5 rounded-3xl border-[var(--md-sys-color-outline-variant)] lg:col-span-2">
            <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-purple-600" />
              Global Security Policies & Shift Cutoff Thresholds
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--md-sys-color-surface-container)]">
                <div>
                  <p className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">Enforce MFA for Management Roles</p>
                  <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">Require 2FA for Admin, HR, and Supervisor accounts.</p>
                </div>
                <input
                  type="checkbox"
                  checked={enforceMfa}
                  onChange={(e) => setEnforceMfa(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--md-sys-color-surface-container)]">
                <div>
                  <p className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">Max Shift Duration Cap</p>
                  <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">Hard session limit before automated cutoff kicks in.</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={4}
                    max={24}
                    value={maxShiftHours}
                    onChange={(e) => setMaxShiftHours(parseInt(e.target.value, 10) || 16)}
                    className="w-16 p-1.5 text-xs text-center font-bold rounded-lg bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]"
                  />
                  <span className="text-xs font-bold">hrs</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="filled" onClick={handleSaveSecurityPolicies} disabled={isPending}>
                Save Security Policies
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: GLOBAL USER GOVERNANCE & ROLE MATRIX */}
      {activeTab === 'governance' && (
        <Card variant="outlined" className="p-5 rounded-3xl border-[var(--md-sys-color-outline-variant)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Global User Governance & Direct Role Overrides
              </h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                SuperAdmin root authority: Promote/demote any account across all 6 roles or execute emergency account resets.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]" />
                <input
                  type="text"
                  placeholder="Filter users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)]"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)]"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Org Admin</option>
                <option value="hr_manager">HR Manager</option>
                <option value="supervisor">Supervisor</option>
                <option value="auditor">Auditor</option>
                <option value="candidate">Candidate</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto rounded-2xl border border-[var(--md-sys-color-outline-variant)]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Current Role</th>
                  <th className="p-3">Direct Role Switcher</th>
                  <th className="p-3 text-right">Emergency Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-[var(--md-sys-color-on-surface-variant)]">
                      No accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const roleMeta = ROLE_METADATA[(u.role in ROLE_METADATA ? u.role : 'candidate') as UserRole] || ROLE_METADATA.candidate
                    return (
                      <tr key={u.id} className="hover:bg-[var(--md-sys-color-surface-container)] transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-purple-500/15 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0">
                              {u.full_name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[var(--md-sys-color-on-surface)] truncate">{u.full_name}</p>
                              <p className="text-[10px] font-mono text-[var(--md-sys-color-on-surface-variant)] truncate">{u.email || u.id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${roleMeta.badgeBg} ${roleMeta.badgeText}`}>
                            {roleMeta.label}
                          </span>
                        </td>

                        <td className="p-3">
                          <select
                            value={u.role || 'candidate'}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                            disabled={isPending || u.id === adminId}
                            className="p-1.5 text-xs font-semibold rounded-lg bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] cursor-pointer"
                          >
                            <option value="super_admin">👑 Super Admin</option>
                            <option value="admin">🏢 Org Admin</option>
                            <option value="hr_manager">💼 HR Manager</option>
                            <option value="supervisor">📋 Supervisor</option>
                            <option value="auditor">📊 Auditor</option>
                            <option value="candidate">👷 Candidate</option>
                          </select>
                        </td>

                        <td className="p-3 text-right">
                          <Button
                            variant="outlined"
                            size="sm"
                            onClick={() => handleEmergencyMfaReset(u.id, u.full_name)}
                            disabled={isPending}
                            className="text-[11px] py-1 h-7 border-red-500/30 text-red-600 hover:bg-red-500/10"
                          >
                            <KeyRound className="w-3.5 h-3.5 mr-1" />
                            Reset MFA
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
