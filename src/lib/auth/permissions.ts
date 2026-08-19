export type UserRole = 
  | 'super_admin' 
  | 'admin' 
  | 'hr_manager' 
  | 'supervisor' 
  | 'candidate' 
  | 'auditor'

export type AppModule = 
  | 'dashboard'
  | 'superadmin_console'
  | 'tasks'
  | 'meets'
  | 'candidates'
  | 'shifts'
  | 'attendance'
  | 'timesheet'
  | 'leaves'
  | 'payroll'
  | 'feedback'
  | 'branding'
  | 'reset_requests'
  | 'security'
  | 'profile'

export interface RoleMetadata {
  label: string
  description: string
  badgeVariant: 'primary' | 'secondary' | 'warning' | 'info' | 'success' | 'outline'
  badgeBg: string
  badgeText: string
  level: number
}

export const ROLE_METADATA: Record<UserRole, RoleMetadata> = {
  super_admin: {
    label: 'Super Admin',
    description: 'Full cross-tenant platform owner with complete administrative access',
    badgeVariant: 'primary',
    badgeBg: 'bg-purple-500/15',
    badgeText: 'text-purple-700 dark:text-purple-300',
    level: 100,
  },
  admin: {
    label: 'Org Admin',
    description: 'Full administrative authority for organization, users, and branding',
    badgeVariant: 'primary',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-700 dark:text-blue-300',
    level: 80,
  },
  hr_manager: {
    label: 'HR & Payroll Manager',
    description: 'Manages candidate onboarding, hourly rates, payroll cycles, and leaves',
    badgeVariant: 'success',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    level: 60,
  },
  supervisor: {
    label: 'Shift Supervisor',
    description: 'Manages assigned teams, shift scheduling, live attendance, and task reviews',
    badgeVariant: 'warning',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-700 dark:text-amber-300',
    level: 40,
  },
  candidate: {
    label: 'Candidate / Employee',
    description: 'Standard workforce member with time tracking, task logging, and personal payslips',
    badgeVariant: 'secondary',
    badgeBg: 'bg-slate-500/15',
    badgeText: 'text-slate-700 dark:text-slate-300',
    level: 10,
  },
  auditor: {
    label: 'Auditor',
    description: 'Read-only compliance and financial observer across logs and reports',
    badgeVariant: 'info',
    badgeBg: 'bg-teal-500/15',
    badgeText: 'text-teal-700 dark:text-teal-300',
    level: 20,
  },
}

/**
 * Access Matrix defining module access per role
 */
export const ROLE_MODULE_ACCESS: Record<UserRole, AppModule[]> = {
  super_admin: [
    'dashboard',
    'superadmin_console',
    'tasks',
    'meets',
    'candidates',
    'shifts',
    'attendance',
    'timesheet',
    'leaves',
    'payroll',
    'feedback',
    'branding',
    'reset_requests',
    'security',
    'profile',
  ],
  admin: [
    'dashboard',
    'tasks',
    'meets',
    'candidates',
    'shifts',
    'attendance',
    'timesheet',
    'leaves',
    'payroll',
    'feedback',
    'branding',
    'reset_requests',
    'security',
    'profile',
  ],
  hr_manager: [
    'dashboard',
    'tasks',
    'meets',
    'candidates',
    'shifts',
    'attendance',
    'timesheet',
    'leaves',
    'payroll',
    'feedback',
    'profile',
  ],
  supervisor: [
    'dashboard',
    'tasks',
    'meets',
    'candidates',
    'shifts',
    'attendance',
    'timesheet',
    'leaves',
    'feedback',
    'profile',
  ],
  candidate: [
    'dashboard',
    'tasks',
    'meets',
    'attendance',
    'leaves',
    'payroll',
    'feedback',
    'profile',
  ],
  auditor: [
    'dashboard',
    'tasks',
    'candidates',
    'attendance',
    'timesheet',
    'leaves',
    'payroll',
    'feedback',
    'profile',
  ],
}

// Helper query functions
export function isSuperAdmin(role?: string | null): boolean {
  return role === 'super_admin'
}

export function isAdmin(role?: string | null): boolean {
  return role === 'admin' || role === 'super_admin'
}

export function isHR(role?: string | null): boolean {
  return role === 'hr_manager' || role === 'admin' || role === 'super_admin'
}

export function isSupervisor(role?: string | null): boolean {
  return role === 'supervisor' || role === 'hr_manager' || role === 'admin' || role === 'super_admin'
}

export function isManagementRole(role?: string | null): boolean {
  return role === 'supervisor' || role === 'hr_manager' || role === 'admin' || role === 'super_admin'
}

export function isCandidate(role?: string | null): boolean {
  return role === 'candidate' || !role
}

export function isAuditor(role?: string | null): boolean {
  return role === 'auditor'
}

export function canAccessAdminPortal(role?: string | null): boolean {
  return role === 'admin' || role === 'super_admin' || role === 'hr_manager' || role === 'supervisor' || role === 'auditor'
}

export function hasModuleAccess(role: string | undefined | null, module: AppModule): boolean {
  if (!role) return false
  const validRole = (role in ROLE_MODULE_ACCESS ? role : 'candidate') as UserRole
  return ROLE_MODULE_ACCESS[validRole]?.includes(module) ?? false
}

export function canManagePayroll(role?: string | null): boolean {
  return role === 'admin' || role === 'super_admin' || role === 'hr_manager'
}

export function canManageBranding(role?: string | null): boolean {
  return role === 'admin' || role === 'super_admin'
}

export function canManageSecurity(role?: string | null): boolean {
  return role === 'admin' || role === 'super_admin'
}

export function canAccessSuperAdminConsole(role?: string | null): boolean {
  return isSuperAdmin(role)
}

export function getRoleDisplayName(role?: string | null): string {
  if (!role) return 'Candidate'
  const validRole = (role in ROLE_METADATA ? role : 'candidate') as UserRole
  return ROLE_METADATA[validRole]?.label || 'Candidate'
}
