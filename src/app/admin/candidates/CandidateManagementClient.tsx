'use client'

import React, { useState, useActionState } from 'react'
import {
  createCandidateAction,
  resetCandidatePasswordAction,
  updateCandidateProfileAction,
  deleteCandidateAction,
  type AdminActionState,
} from '@/app/actions/admin'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { Snackbar } from '@/components/ui/Snackbar'
import Link from 'next/link'
import {
  UserPlus,
  KeyRound,
  History,
  UserCheck,
  X,
  Mail,
  Lock,
  User,
  IndianRupee,
  Edit2,
  Calendar,
  Trash2,
  Image as ImageIcon,
  Phone,
  MapPin,
  IdCard,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import { type ShiftConfig, formatShiftTime, DEFAULT_FALLBACK_SHIFT } from '@/lib/utils/shift'
import { MobileAdminCandidates } from '@/components/admin/candidates/MobileAdminCandidates'
import { ROLE_METADATA, getRoleDisplayName, UserRole } from '@/lib/auth/permissions'

export interface CandidateUser {
  id: string
  full_name: string
  role: string
  created_at: string
  email?: string
  isWorking?: boolean
  hourly_rate?: number
  avatar_url?: string
  phone_number?: string
  address?: string
  id_number?: string
  shift_id?: string | null
}

export interface CandidateManagementClientProps {
  candidates: CandidateUser[]
  shifts?: ShiftConfig[]
}

const initialState: AdminActionState = { error: '', success: false }

export const CandidateManagementClient: React.FC<CandidateManagementClientProps> = ({
  candidates,
  shifts = [],
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const defaultShift = shifts.find((s) => s.is_default) || shifts[0] || DEFAULT_FALLBACK_SHIFT
  const [resetEmail, setResetEmail] = useState<string | null>(null)
  const [editCandidate, setEditCandidate] = useState<CandidateUser | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<CandidateUser | null>(null)
  const [dismissedKey, setDismissedKey] = useState<string | null>(null)

  const [createState, createFormAction, isCreating] = useActionState(
    createCandidateAction,
    initialState
  )
  const [resetState, resetFormAction, isResetting] = useActionState(
    resetCandidatePasswordAction,
    initialState
  )
  const [editState, editFormAction, isEditing] = useActionState(
    updateCandidateProfileAction,
    initialState
  )
  const [deleteState, deleteFormAction, isDeleting] = useActionState(
    deleteCandidateAction,
    initialState
  )

  let snackbarMessage: string | null = null
  let snackbarVariant: 'success' | 'error' = 'success'

  if (createState?.success && dismissedKey !== 'create-success') {
    snackbarMessage = 'Candidate created successfully.'
    snackbarVariant = 'success'
  } else if (createState?.error && dismissedKey !== `create-error-${createState.error}`) {
    snackbarMessage = createState.error
    snackbarVariant = 'error'
  } else if (editState?.success && dismissedKey !== 'edit-success') {
    snackbarMessage = 'Candidate profile updated successfully.'
    snackbarVariant = 'success'
  } else if (editState?.error && dismissedKey !== `edit-error-${editState.error}`) {
    snackbarMessage = editState.error
    snackbarVariant = 'error'
  } else if (resetState?.success && dismissedKey !== 'reset-success') {
    snackbarMessage = 'Password reset email sent.'
    snackbarVariant = 'success'
  } else if (resetState?.error && dismissedKey !== `reset-error-${resetState.error}`) {
    snackbarMessage = resetState.error
    snackbarVariant = 'error'
  } else if (deleteState?.success && dismissedKey !== 'delete-success') {
    snackbarMessage = 'Candidate deleted successfully.'
    snackbarVariant = 'success'
  } else if (deleteState?.error && dismissedKey !== `delete-error-${deleteState.error}`) {
    snackbarMessage = deleteState.error
    snackbarVariant = 'error'
  }

  const handleDismissSnackbar = () => {
    setDismissedKey('dismissed')
  }

  return (
    <div className="flex flex-col gap-2.5 sm:gap-6 max-w-7xl mx-auto w-full">
      {/* DEDICATED PURPOSE-BUILT MOBILE VIEW (< 768px) */}
      <div className="md:hidden">
        <MobileAdminCandidates
          candidates={candidates}
          shifts={shifts}
          onOpenCreate={() => setIsCreateOpen(true)}
          onOpenEdit={(c) => setEditCandidate(c)}
          onOpenDelete={(c) => setDeleteCandidate(c)}
          onOpenResetPassword={(email) => setResetEmail(email)}
        />
      </div>

      {/* DESKTOP VIEW (>= 768px) - 100% UNTOUCHED ORIGINAL LAYOUT */}
      <div className="hidden md:flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Candidate Roster</h2>
            <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
              Manage system candidates, hourly payment rates (₹/hr), and account security
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]">
              {candidates.length} Candidate{candidates.length === 1 ? '' : 's'}
            </span>

            <Button
              variant="filled"
              size="md"
              icon={<UserPlus className="w-4 h-4" />}
              onClick={() => setIsCreateOpen(true)}
            >
              Create Candidate
            </Button>
          </div>
        </div>

        {/* 2. Desktop Candidate Table */}
        <Card variant="outlined" className="p-0 border border-[var(--md-sys-color-outline-variant)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] text-xs font-semibold uppercase tracking-wider border-b border-[var(--md-sys-color-outline-variant)]">
                <th className="py-3.5 px-4 sm:px-6">Candidate Name</th>
                <th className="py-3.5 px-4">Hourly Rate (₹/hr)</th>
                <th className="py-3.5 px-4">Assigned Shift</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
              {candidates.length > 0 ? (
                candidates.map((c) => {
                  const rate = c.hourly_rate || 0
                  const assignedShift = shifts.find((s) => s.id === c.shift_id) || defaultShift
                  return (
                    <tr key={c.id} className="hover:bg-[var(--md-sys-color-surface-container-low)] transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-semibold flex items-center gap-3">
                        {c.avatar_url ? (
                          <img src={c.avatar_url} alt={c.full_name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-xs font-bold shrink-0">
                            {c.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span>{c.full_name}</span>
                            {(() => {
                              const roleMeta = ROLE_METADATA[(c.role in ROLE_METADATA ? c.role : 'candidate') as UserRole] || ROLE_METADATA.candidate
                              return (
                                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${roleMeta.badgeBg} ${roleMeta.badgeText}`}>
                                  {roleMeta.label}
                                </span>
                              )
                            })()}
                          </div>
                          {c.email && (
                            <span className="text-xs font-mono text-[var(--md-sys-color-on-surface-variant)]">
                              {c.email}
                            </span>
                          )}
                          {c.id_number && (
                            <a 
                              href={`/api/verify-redirect?idNumber=${c.id_number}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-mono font-medium text-[var(--md-sys-color-primary)] hover:underline flex items-center gap-1 mt-0.5 w-fit"
                              title="Verify ID Card"
                            >
                              <IdCard className="w-3 h-3" />
                              {c.id_number}
                              <ShieldCheck className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{rate.toFixed(2)} / hr
                          </span>
                          <button
                            onClick={() => setEditCandidate(c)}
                            className="p-1 rounded hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] transition-colors cursor-pointer"
                            title="Edit Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs flex items-center gap-1 text-[var(--md-sys-color-on-surface)]">
                            <Clock className="w-3 h-3 text-[var(--md-sys-color-primary)]" />
                            {assignedShift.name}
                          </span>
                          <span className="text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)]">
                            {formatShiftTime(assignedShift.start_time)} – {formatShiftTime(assignedShift.end_time)}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        {c.isWorking ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            Working Now
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)]">
                            <UserCheck className="w-3.5 h-3.5" />
                            Off Shift
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-xs font-mono text-[var(--md-sys-color-on-surface-variant)]">
                        {new Date(c.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/attendance?candidateId=${c.id}`}
                            className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-primary)] transition-colors cursor-pointer"
                            title="View Attendance & Approvals"
                          >
                            <History className="w-4 h-4" />
                          </Link>

                          {c.email && (
                            <button
                              onClick={() => setResetEmail(c.email || null)}
                              className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] transition-colors cursor-pointer"
                              title="Reset Password"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => setDeleteCandidate(c)}
                            className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-error)] transition-colors cursor-pointer"
                            title="Delete Candidate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    No candidates registered yet. Click &quot;Create Candidate&quot; to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>

      {/* Create Candidate Modal Dialog */}

      {isCreateOpen && !createState?.success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] rounded-[var(--md-sys-shape-corner-extra-large)] p-6 border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-4 my-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
                Register New Candidate
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={createFormAction} className="flex flex-col gap-4">
              <TextField
                name="fullName"
                label="Full Name"
                required
                disabled={isCreating}
                startIcon={<User className="w-4 h-4" />}
              />

              <TextField
                name="email"
                type="email"
                label="Email Address"
                required
                disabled={isCreating}
                startIcon={<Mail className="w-4 h-4" />}
              />

              <TextField
                name="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                label="Hourly Payment Rate (₹/hr)"
                placeholder="25.00"
                required
                disabled={isCreating}
                startIcon={<IndianRupee className="w-4 h-4" />}
              />

              <TextField
                name="password"
                type="password"
                label="Initial Password"
                required
                disabled={isCreating}
                startIcon={<Lock className="w-4 h-4" />}
                supportingText="At least 6 characters"
              />

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" /> System Role
                </label>
                <select
                  name="role"
                  defaultValue="candidate"
                  disabled={isCreating}
                  className="h-10 px-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-sm focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
                >
                  <option value="candidate">Candidate / Employee (Workforce)</option>
                  <option value="supervisor">Shift Supervisor / Team Lead</option>
                  <option value="hr_manager">HR &amp; Payroll Manager</option>
                  <option value="admin">Organization Admin</option>
                  <option value="auditor">Auditor (Read-Only Observer)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" /> Assigned Shift Preset
                </label>
                <select
                  name="shiftId"
                  defaultValue={defaultShift.id}
                  disabled={isCreating}
                  className="h-10 px-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-sm focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
                >
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({formatShiftTime(s.start_time)} – {formatShiftTime(s.end_time)}) {s.is_default ? '★ (Default)' : ''}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                  Candidates start and auto-stop within their assigned shift hours
                </span>
              </div>

              {createState?.error && (
                <div className="p-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs font-medium">
                  {createState.error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isCreating}
                  className="px-4 h-10 rounded-full text-sm font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 cursor-pointer"
                >
                  Cancel
                </button>
                <Button type="submit" variant="filled" size="md" isLoading={isCreating}>
                  Create Staff Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Dialog */}
      {editCandidate && !editState?.success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] rounded-[var(--md-sys-shape-corner-extra-large)] p-6 border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-4 my-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
                Edit Profile
              </h3>
              <button
                onClick={() => setEditCandidate(null)}
                className="p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
              Update information for <strong>{editCandidate.full_name}</strong>.
            </p>

            <form action={editFormAction} className="flex flex-col gap-3">
              <input type="hidden" name="candidateId" value={editCandidate.id} />

              <TextField
                name="fullName"
                label="Full Name"
                defaultValue={editCandidate.full_name}
                required
                disabled={isEditing}
                startIcon={<User className="w-4 h-4" />}
              />

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" /> System Role
                </label>
                <select
                  name="role"
                  defaultValue={editCandidate.role || 'candidate'}
                  disabled={isEditing}
                  className="h-10 px-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-sm focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
                >
                  <option value="candidate">Candidate / Employee (Workforce)</option>
                  <option value="supervisor">Shift Supervisor / Team Lead</option>
                  <option value="hr_manager">HR &amp; Payroll Manager</option>
                  <option value="admin">Organization Admin</option>
                  <option value="auditor">Auditor (Read-Only Observer)</option>
                </select>
              </div>

              <TextField
                name="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                label="Hourly Payment Rate (₹/hr)"
                defaultValue={editCandidate.hourly_rate || 0}
                required
                disabled={isEditing}
                startIcon={<IndianRupee className="w-4 h-4" />}
              />

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" /> Assigned Shift
                </label>
                <select
                  name="shiftId"
                  defaultValue={editCandidate.shift_id || 'none'}
                  disabled={isEditing}
                  className="h-10 px-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-sm focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
                >
                  <option value="none">Company Default ({defaultShift.name})</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({formatShiftTime(s.start_time)} – {formatShiftTime(s.end_time)}) {s.is_default ? '★ (Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <TextField
                name="phoneNumber"
                label="Phone Number"
                defaultValue={editCandidate.phone_number || ''}
                disabled={isEditing}
                startIcon={<Phone className="w-4 h-4" />}
              />

              <TextField
                name="address"
                label="Address"
                defaultValue={editCandidate.address || ''}
                disabled={isEditing}
                startIcon={<MapPin className="w-4 h-4" />}
              />
              
              <TextField
                name="idNumber"
                label="ID Number"
                defaultValue={editCandidate.id_number || ''}
                disabled={isEditing}
                startIcon={<IdCard className="w-4 h-4" />}
              />

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Profile Picture
                </label>
                <input
                  type="file"
                  name="avatarFile"
                  accept="image/*"
                  disabled={isEditing}
                  className="text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[var(--md-sys-color-primary-container)] file:text-[var(--md-sys-color-on-primary-container)] hover:file:bg-[var(--md-sys-color-primary-container)]/80 cursor-pointer"
                />
              </div>

              {editState?.error && (
                <div className="p-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs font-medium">
                  {editState.error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setEditCandidate(null)}
                  disabled={isEditing}
                  className="px-4 h-10 rounded-full text-sm font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 cursor-pointer"
                >
                  Cancel
                </button>
                <Button type="submit" variant="filled" size="md" isLoading={isEditing}>
                  Save Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Dialog */}
      {resetEmail && !resetState?.success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] rounded-[var(--md-sys-shape-corner-extra-large)] p-6 border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-4 my-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
                Reset Candidate Password
              </h3>
              <button
                onClick={() => setResetEmail(null)}
                className="p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
              Dispatch password reset instructions for candidate <strong>{resetEmail}</strong> via Supabase Auth.
            </p>

            <form action={resetFormAction} className="flex flex-col gap-4">
              <input type="hidden" name="email" value={resetEmail} />

              {resetState?.error && (
                <div className="p-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs font-medium">
                  {resetState.error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResetEmail(null)}
                  disabled={isResetting}
                  className="px-4 h-10 rounded-full text-sm font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 cursor-pointer"
                >
                  Cancel
                </button>
                <Button type="submit" variant="filled" size="md" isLoading={isResetting}>
                  Send Password Reset
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Candidate Dialog */}
      {deleteCandidate && !deleteState?.success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] rounded-[var(--md-sys-shape-corner-extra-large)] p-6 border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-4 my-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
              <h3 className="text-lg font-bold flex items-center gap-2 text-[var(--md-sys-color-error)]">
                <Trash2 className="w-5 h-5" />
                Delete Candidate
              </h3>
              <button
                onClick={() => setDeleteCandidate(null)}
                className="p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
              Are you sure you want to delete <strong>{deleteCandidate.full_name}</strong>? This will permanently delete their account and all associated attendance records. This action cannot be undone.
            </p>

            <form action={deleteFormAction} className="flex flex-col gap-4">
              <input type="hidden" name="candidateId" value={deleteCandidate.id} />

              {deleteState?.error && (
                <div className="p-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs font-medium">
                  {deleteState.error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setDeleteCandidate(null)}
                  disabled={isDeleting}
                  className="px-4 h-10 rounded-full text-sm font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 cursor-pointer"
                >
                  Cancel
                </button>
                <Button type="submit" className="bg-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error)]/90 text-[var(--md-sys-color-on-error)]" size="md" isLoading={isDeleting}>
                  Delete Candidate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Snackbar Notifications */}
      <Snackbar
        message={snackbarMessage}
        variant={snackbarVariant}
        onClose={handleDismissSnackbar}
      />
    </div>
  )
}
