'use client'

import React, { useState, useActionState } from 'react'
import {
  createCandidateAction,
  resetCandidatePasswordAction,
  updateCandidateHourlyRateAction,
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
  DollarSign,
  Edit2,
  Calendar,
} from 'lucide-react'

export interface CandidateUser {
  id: string
  full_name: string
  role: string
  created_at: string
  email?: string
  isWorking?: boolean
  hourly_rate?: number
}

export interface CandidateManagementClientProps {
  candidates: CandidateUser[]
}

const initialState: AdminActionState = { error: '', success: false }

export const CandidateManagementClient: React.FC<CandidateManagementClientProps> = ({
  candidates,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState<string | null>(null)
  const [rateCandidate, setRateCandidate] = useState<CandidateUser | null>(null)
  const [dismissedKey, setDismissedKey] = useState<string | null>(null)

  const [createState, createFormAction, isCreating] = useActionState(
    createCandidateAction,
    initialState
  )
  const [resetState, resetFormAction, isResetting] = useActionState(
    resetCandidatePasswordAction,
    initialState
  )
  const [rateState, rateFormAction, isUpdatingRate] = useActionState(
    updateCandidateHourlyRateAction,
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
  } else if (rateState?.success && dismissedKey !== 'rate-success') {
    snackbarMessage = 'Candidate hourly rate updated successfully.'
    snackbarVariant = 'success'
  } else if (rateState?.error && dismissedKey !== `rate-error-${rateState.error}`) {
    snackbarMessage = rateState.error
    snackbarVariant = 'error'
  } else if (resetState?.success && dismissedKey !== 'reset-success') {
    snackbarMessage = 'Password reset email sent.'
    snackbarVariant = 'success'
  } else if (resetState?.error && dismissedKey !== `reset-error-${resetState.error}`) {
    snackbarMessage = resetState.error
    snackbarVariant = 'error'
  }

  const handleDismissSnackbar = () => {
    setDismissedKey('dismissed')
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Candidate Roster</h2>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
            Manage system candidates, hourly payment rates ($/hr), and account security
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

      {/* 1. Mobile Candidate Cards (< 768px) */}
      <div className="flex flex-col gap-4 md:hidden">
        {candidates.length > 0 ? (
          candidates.map((c) => {
            const rate = c.hourly_rate || 0
            return (
              <Card
                key={c.id}
                variant="outlined"
                className="p-4 flex flex-col gap-3 border border-[var(--md-sys-color-outline-variant)]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-sm font-bold shrink-0">
                      {c.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-base font-bold">{c.full_name}</h4>
                      {c.email && (
                        <p className="text-xs font-mono text-[var(--md-sys-color-on-surface-variant)]">
                          {c.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {c.isWorking ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Working
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)]">
                      Off Shift
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container)] flex flex-col gap-0.5 border border-[var(--md-sys-color-outline-variant)]">
                    <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] uppercase font-semibold">
                      Hourly Rate
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        ${rate.toFixed(2)}/hr
                      </span>
                      <button
                        onClick={() => setRateCandidate(c)}
                        className="p-1 rounded hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container)] flex flex-col gap-0.5 border border-[var(--md-sys-color-outline-variant)]">
                    <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] uppercase font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Registered
                    </span>
                    <span className="font-mono text-xs text-[var(--md-sys-color-on-surface)]">
                      {new Date(c.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                  <Link
                    href={`/admin/attendance?candidateId=${c.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-semibold"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>View Attendance</span>
                  </Link>

                  {c.email && (
                    <button
                      onClick={() => setResetEmail(c.email || null)}
                      className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]"
                      title="Reset Password"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Card>
            )
          })
        ) : (
          <Card variant="outlined" className="py-8 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
            No candidates registered yet. Click &quot;Create Candidate&quot; to add one.
          </Card>
        )}
      </div>

      {/* 2. Desktop Candidate Table (>= 768px) */}
      <Card variant="outlined" className="hidden md:block p-0 border border-[var(--md-sys-color-outline-variant)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] text-xs font-semibold uppercase tracking-wider border-b border-[var(--md-sys-color-outline-variant)]">
                <th className="py-3.5 px-4 sm:px-6">Candidate Name</th>
                <th className="py-3.5 px-4">Hourly Rate ($/hr)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
              {candidates.length > 0 ? (
                candidates.map((c) => {
                  const rate = c.hourly_rate || 0
                  return (
                    <tr key={c.id} className="hover:bg-[var(--md-sys-color-surface-container-low)] transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-semibold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-xs font-bold shrink-0">
                          {c.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span>{c.full_name}</span>
                          {c.email && (
                            <span className="text-xs font-mono text-[var(--md-sys-color-on-surface-variant)]">
                              {c.email}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ${rate.toFixed(2)} / hr
                          </span>
                          <button
                            onClick={() => setRateCandidate(c)}
                            className="p-1 rounded hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] transition-colors cursor-pointer"
                            title="Edit Hourly Rate"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Create Candidate Modal Dialog */}
      {isCreateOpen && !createState?.success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] rounded-[var(--md-sys-shape-corner-extra-large)] p-6 shadow-[var(--md-sys-elevation-3)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-4 my-auto">
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
                label="Hourly Payment Rate ($/hr)"
                placeholder="25.00"
                required
                disabled={isCreating}
                startIcon={<DollarSign className="w-4 h-4" />}
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
                  Create Candidate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Hourly Rate Dialog */}
      {rateCandidate && !rateState?.success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] rounded-[var(--md-sys-shape-corner-extra-large)] p-6 shadow-[var(--md-sys-elevation-3)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-4 my-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
                Update Hourly Payment Rate
              </h3>
              <button
                onClick={() => setRateCandidate(null)}
                className="p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
              Set the hourly rate ($/hr) for candidate <strong>{rateCandidate.full_name}</strong>.
            </p>

            <form action={rateFormAction} className="flex flex-col gap-4">
              <input type="hidden" name="candidateId" value={rateCandidate.id} />

              <TextField
                name="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                label="Hourly Payment Rate ($/hr)"
                defaultValue={rateCandidate.hourly_rate || 0}
                required
                disabled={isUpdatingRate}
                startIcon={<DollarSign className="w-4 h-4" />}
              />

              {rateState?.error && (
                <div className="p-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs font-medium">
                  {rateState.error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setRateCandidate(null)}
                  disabled={isUpdatingRate}
                  className="px-4 h-10 rounded-full text-sm font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 cursor-pointer"
                >
                  Cancel
                </button>
                <Button type="submit" variant="filled" size="md" isLoading={isUpdatingRate}>
                  Save Hourly Rate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Dialog */}
      {resetEmail && !resetState?.success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] rounded-[var(--md-sys-shape-corner-extra-large)] p-6 shadow-[var(--md-sys-elevation-3)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-4 my-auto">
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

      {/* Snackbar Notifications */}
      <Snackbar
        message={snackbarMessage}
        variant={snackbarVariant}
        onClose={handleDismissSnackbar}
      />
    </div>
  )
}
