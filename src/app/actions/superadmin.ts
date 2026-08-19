'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isSuperAdmin, UserRole } from '@/lib/auth/permissions'

export type SuperAdminActionState = {
  error?: string
  success?: boolean
  message?: string
  data?: any
}

/**
 * Internal helper to verify the caller is strictly a super_admin
 */
async function verifySuperAdminCaller() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, user: null, profile: null, error: 'Unauthorized. Please sign in.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single()

  if (!isSuperAdmin(profile?.role)) {
    return { supabase, user: null, profile: null, error: 'Access denied. SuperAdmin privileges required.' }
  }

  return { supabase, user, profile, error: null }
}

/**
 * Log an immutable audit event to audit_logs
 */
export async function logAuditEvent(params: {
  actorId?: string
  actorName?: string
  actorRole?: string
  action: string
  targetId?: string | null
  targetName?: string | null
  details?: Record<string, any>
  ipAddress?: string | null
}) {
  try {
    const adminClient = createAdminClient()
    await adminClient.from('audit_logs').insert({
      actor_id: params.actorId || null,
      actor_name: params.actorName || 'System',
      actor_role: params.actorRole || 'system',
      action: params.action,
      target_id: params.targetId || null,
      target_name: params.targetName || null,
      details: params.details || {},
      ip_address: params.ipAddress || null,
    })
  } catch (err) {
    console.error('Failed to write audit log:', err)
  }
}

/**
 * Fetch Platform Telemetry & Live Volume Counts
 */
export async function getPlatformTelemetryAction(): Promise<{
  error?: string
  telemetry?: {
    totalUsers: number
    roleCounts: Record<string, number>
    totalAttendanceRecords: number
    activeSessionsCount: number
    autoCutoffCount: number
    totalTasksCount: number
    totalLeavesCount: number
    totalFeedbacksCount: number
    totalPayoutAmount: number
    systemUptimeIso: string
  }
}> {
  const { error: authErr } = await verifySuperAdminCaller()
  if (authErr) return { error: authErr }

  const adminClient = createAdminClient()

  // Concurrently fetch counts across primary tables
  const [
    { data: profiles },
    { data: activeAttendance },
    { count: totalAttendanceCount },
    { data: autoCutoffs },
    { count: totalTasksCount },
    { count: totalLeavesCount },
    { count: totalFeedbacksCount },
    { data: attendancePayouts },
  ] = await Promise.all([
    adminClient.from('profiles').select('id, role'),
    adminClient.from('attendance').select('id').is('logout_time', null),
    adminClient.from('attendance').select('id', { count: 'exact', head: true }),
    adminClient.from('attendance').select('id').eq('is_auto_cutoff', true),
    adminClient.from('daily_tasks').select('id', { count: 'exact', head: true }),
    adminClient.from('leaves').select('id', { count: 'exact', head: true }),
    adminClient.from('feedbacks').select('id', { count: 'exact', head: true }),
    adminClient.from('attendance').select('payout_amount'),
  ])

  const roleCounts: Record<string, number> = {
    super_admin: 0,
    admin: 0,
    hr_manager: 0,
    supervisor: 0,
    candidate: 0,
    auditor: 0,
  }

  if (profiles) {
    profiles.forEach((p) => {
      const r = p.role || 'candidate'
      roleCounts[r] = (roleCounts[r] || 0) + 1
    })
  }

  let totalPayout = 0
  if (attendancePayouts) {
    totalPayout = attendancePayouts.reduce((acc, curr) => acc + (Number(curr.payout_amount) || 0), 0)
  }

  return {
    telemetry: {
      totalUsers: profiles?.length || 0,
      roleCounts,
      totalAttendanceRecords: totalAttendanceCount || 0,
      activeSessionsCount: activeAttendance?.length || 0,
      autoCutoffCount: autoCutoffs?.length || 0,
      totalTasksCount: totalTasksCount || 0,
      totalLeavesCount: totalLeavesCount || 0,
      totalFeedbacksCount: totalFeedbacksCount || 0,
      totalPayoutAmount: Math.round(totalPayout * 100) / 100,
      systemUptimeIso: new Date().toISOString(),
    },
  }
}

/**
 * Fetch all system settings
 */
export async function getSystemSettingsAction(): Promise<{
  error?: string
  settings?: Record<string, any>
}> {
  const { error: authErr } = await verifySuperAdminCaller()
  if (authErr) return { error: authErr }

  const adminClient = createAdminClient()
  const { data: rows, error } = await adminClient
    .from('system_settings')
    .select('key, value, description, updated_at')

  if (error) {
    return { error: error.message }
  }

  const settingsMap: Record<string, any> = {}
  if (rows) {
    rows.forEach((r) => {
      settingsMap[r.key] = r.value
    })
  }

  return { settings: settingsMap }
}

/**
 * Update a specific system setting (e.g. maintenance mode, broadcast announcement)
 */
export async function updateSystemSettingsAction(
  prevState?: SuperAdminActionState | null,
  formData?: FormData
): Promise<SuperAdminActionState> {
  if (!formData) return { error: 'FormData is required.' }
  const { user, profile, error: authErr } = await verifySuperAdminCaller()
  if (authErr) return { error: authErr }

  const settingKey = formData.get('settingKey') as string
  const settingValueJson = formData.get('settingValue') as string

  if (!settingKey || !settingValueJson) {
    return { error: 'Setting key and value are required.' }
  }

  let parsedValue: any
  try {
    parsedValue = JSON.parse(settingValueJson)
  } catch {
    return { error: 'Invalid JSON formatted setting value.' }
  }

  const adminClient = createAdminClient()
  const { error: upsertErr } = await adminClient
    .from('system_settings')
    .upsert({
      key: settingKey,
      value: parsedValue,
      updated_by: user?.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' })

  if (upsertErr) {
    return { error: upsertErr.message || 'Failed to update system setting.' }
  }

  // Write audit trail
  await logAuditEvent({
    actorId: user?.id,
    actorName: profile?.full_name || 'Super Admin',
    actorRole: 'super_admin',
    action: 'SYSTEM_SETTING_UPDATED',
    details: { settingKey, newValue: parsedValue },
  })

  revalidatePath('/admin')
  revalidatePath('/admin/superadmin')
  revalidatePath('/candidate')
  return { success: true, message: `System setting "${settingKey}" updated successfully.` }
}

/**
 * Fetch filterable System Audit Logs
 */
export async function getAuditLogsAction(params?: {
  action?: string
  actorRole?: string
  limit?: number
}): Promise<{
  error?: string
  logs?: any[]
}> {
  const { error: authErr } = await verifySuperAdminCaller()
  if (authErr) return { error: authErr }

  const adminClient = createAdminClient()
  let query = adminClient
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(params?.limit || 50)

  if (params?.action && params.action !== 'all') {
    query = query.eq('action', params.action)
  }

  if (params?.actorRole && params.actorRole !== 'all') {
    query = query.eq('actor_role', params.actorRole)
  }

  const { data: logs, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { logs: logs || [] }
}

/**
 * Run Auth & Profile Diagnostics Tool
 */
export async function runAuthDiagnosticsAction(autoRepair: boolean = false): Promise<{
  error?: string
  diagnostics?: {
    totalAuthUsers: number
    totalProfiles: number
    orphanedAuthUsers: Array<{ id: string; email?: string }>
    desyncedRoles: Array<{ id: string; authRole: string; profileRole: string; email?: string }>
    repairedCount: number
  }
}> {
  const { user, profile, error: authErr } = await verifySuperAdminCaller()
  if (authErr) return { error: authErr }

  const adminClient = createAdminClient()

  // 1. Fetch all Auth users
  const { data: authList, error: authListErr } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (authListErr) {
    return { error: authListErr.message }
  }

  // 2. Fetch all public.profiles
  const { data: profiles, error: profErr } = await adminClient
    .from('profiles')
    .select('id, full_name, role, hourly_rate')

  if (profErr) {
    return { error: profErr.message }
  }

  const profileMap = new Map<string, any>()
  if (profiles) {
    profiles.forEach((p) => profileMap.set(p.id, p))
  }

  const orphanedAuthUsers: Array<{ id: string; email?: string }> = []
  const desyncedRoles: Array<{ id: string; authRole: string; profileRole: string; email?: string }> = []
  let repairedCount = 0

  if (authList?.users) {
    for (const u of authList.users) {
      const p = profileMap.get(u.id)
      const authRole = u.user_metadata?.role || u.app_metadata?.role || 'candidate'

      if (!p) {
        orphanedAuthUsers.push({ id: u.id, email: u.email })
        if (autoRepair) {
          // Repair: Insert missing profile
          const fullName = u.user_metadata?.full_name || u.email?.split('@')[0] || 'User'
          await adminClient.from('profiles').insert({
            id: u.id,
            full_name: fullName,
            role: authRole,
            hourly_rate: 0,
            created_at: u.created_at,
          })
          repairedCount++
        }
      } else if (p.role !== authRole) {
        desyncedRoles.push({
          id: u.id,
          authRole,
          profileRole: p.role,
          email: u.email,
        })
        if (autoRepair) {
          // Align auth metadata with database profile role (ground truth)
          await adminClient.auth.admin.updateUserById(u.id, {
            user_metadata: { ...u.user_metadata, role: p.role },
            app_metadata: { ...u.app_metadata, role: p.role },
          })
          repairedCount++
        }
      }
    }
  }

  if (autoRepair && repairedCount > 0) {
    await logAuditEvent({
      actorId: user?.id,
      actorName: profile?.full_name || 'Super Admin',
      actorRole: 'super_admin',
      action: 'AUTH_DIAGNOSTICS_REPAIRED',
      details: { repairedCount, fixedOrphans: orphanedAuthUsers.length, fixedDesyncs: desyncedRoles.length },
    })
    revalidatePath('/admin/superadmin')
    revalidatePath('/admin/candidates')
  }

  return {
    diagnostics: {
      totalAuthUsers: authList?.users?.length || 0,
      totalProfiles: profiles?.length || 0,
      orphanedAuthUsers,
      desyncedRoles,
      repairedCount,
    },
  }
}

/**
 * SuperAdmin Direct User Role Override
 */
export async function superadminUpdateUserRoleAction(
  prevState?: SuperAdminActionState | null,
  formData?: FormData
): Promise<SuperAdminActionState> {
  if (!formData) return { error: 'FormData is required.' }
  const { user, profile, error: authErr } = await verifySuperAdminCaller()
  if (authErr) return { error: authErr }

  const targetUserId = formData.get('userId') as string
  const targetRole = formData.get('role') as UserRole

  if (!targetUserId || !targetRole) {
    return { error: 'User ID and Role are required.' }
  }

  const validRoles: UserRole[] = ['super_admin', 'admin', 'hr_manager', 'supervisor', 'candidate', 'auditor']
  if (!validRoles.includes(targetRole)) {
    return { error: `Invalid role "${targetRole}".` }
  }

  const adminClient = createAdminClient()

  // 1. Fetch current target profile
  const { data: targetProfile, error: fetchErr } = await adminClient
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', targetUserId)
    .single()

  if (fetchErr || !targetProfile) {
    return { error: 'Target user profile not found.' }
  }

  const previousRole = targetProfile.role

  // 2. Update Supabase Auth metadata
  const { error: authUpdateErr } = await adminClient.auth.admin.updateUserById(targetUserId, {
    user_metadata: { role: targetRole },
    app_metadata: { role: targetRole },
  })

  if (authUpdateErr) {
    return { error: authUpdateErr.message || 'Failed to update user auth metadata.' }
  }

  // 3. Update public.profiles
  const { error: profileUpdateErr } = await adminClient
    .from('profiles')
    .update({ role: targetRole, updated_at: new Date().toISOString() })
    .eq('id', targetUserId)

  if (profileUpdateErr) {
    return { error: profileUpdateErr.message || 'Failed to update database profile.' }
  }

  // 4. Log immutable audit entry
  await logAuditEvent({
    actorId: user?.id,
    actorName: profile?.full_name || 'Super Admin',
    actorRole: 'super_admin',
    action: 'ROLE_OVERRIDE_BY_SUPERADMIN',
    targetId: targetUserId,
    targetName: targetProfile.full_name,
    details: { previousRole, newRole: targetRole },
  })

  revalidatePath('/admin')
  revalidatePath('/admin/superadmin')
  revalidatePath('/admin/candidates')
  return {
    success: true,
    message: `User ${targetProfile.full_name} updated from "${previousRole}" to "${targetRole}".`,
  }
}

/**
 * SuperAdmin Emergency MFA Reset for any user/admin
 */
export async function superadminEmergencyMfaResetAction(
  prevState?: SuperAdminActionState | null,
  formData?: FormData
): Promise<SuperAdminActionState> {
  if (!formData) return { error: 'FormData is required.' }
  const { user, profile, error: authErr } = await verifySuperAdminCaller()
  if (authErr) return { error: authErr }

  const targetUserId = formData.get('userId') as string
  if (!targetUserId) {
    return { error: 'User ID is required.' }
  }

  const adminClient = createAdminClient()

  // List all factors
  const { data: factors, error: factorsErr } = await adminClient.auth.admin.mfa.listFactors({
    userId: targetUserId,
  })

  if (factorsErr) {
    return { error: factorsErr.message || 'Failed to fetch user MFA factors.' }
  }

  let deletedCount = 0
  if (factors?.factors) {
    for (const factor of factors.factors) {
      await adminClient.auth.admin.mfa.deleteFactor({
        userId: targetUserId,
        id: factor.id,
      })
      deletedCount++
    }
  }

  await logAuditEvent({
    actorId: user?.id,
    actorName: profile?.full_name || 'Super Admin',
    actorRole: 'super_admin',
    action: 'EMERGENCY_MFA_RESET_BY_SUPERADMIN',
    targetId: targetUserId,
    details: { deletedFactorsCount: deletedCount },
  })

  return { success: true, message: `Emergency MFA reset complete. (${deletedCount} factors removed).` }
}
