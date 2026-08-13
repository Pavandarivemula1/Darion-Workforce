'use client'

import React, { useState, useActionState, useTransition } from 'react'
import {
  createShiftAction,
  updateShiftAction,
  deleteShiftAction,
  setDefaultShiftAction,
  assignCandidateShiftAction,
  type ShiftActionState,
} from '@/app/actions/shift'
import {
  type ShiftConfig,
  type ShiftWithCandidateCount,
  formatShiftTime,
  calculateShiftDurationHours,
  DEFAULT_FALLBACK_SHIFT,
} from '@/lib/utils/shift'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { Snackbar } from '@/components/ui/Snackbar'
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  Star,
  Users,
  Moon,
  Sun,
  Sliders,
  Check,
  X,
  Search,
  UserCheck,
} from 'lucide-react'

export interface CandidateShiftUser {
  id: string
  full_name: string
  email?: string
  shift_id?: string | null
  hourly_rate?: number
  avatar_url?: string | null
  isWorking?: boolean
}

export interface AdminShiftsClientProps {
  shifts: ShiftWithCandidateCount[]
  candidates: CandidateShiftUser[]
}

const initialState: ShiftActionState = { error: '', success: false }

export const AdminShiftsClient: React.FC<AdminShiftsClientProps> = ({
  shifts: initialShifts,
  candidates,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editShift, setEditShift] = useState<ShiftConfig | null>(null)
  const [deleteShift, setDeleteShift] = useState<ShiftConfig | null>(null)
  const [candidateSearch, setCandidateSearch] = useState('')
  const [dismissedKey, setDismissedKey] = useState<string | null>(null)

  const [createStartTime, setCreateStartTime] = useState('09:00')
  const [createEndTime, setCreateEndTime] = useState('17:00')
  const [editStartTime, setEditStartTime] = useState('09:00')
  const [editEndTime, setEditEndTime] = useState('17:00')

  const [createState, createFormAction, isCreating] = useActionState(
    createShiftAction,
    initialState
  )
  const [editState, editFormAction, isEditing] = useActionState(
    updateShiftAction,
    initialState
  )
  const [deleteState, deleteFormAction, isDeleting] = useActionState(
    deleteShiftAction,
    initialState
  )
  const [setDefaultState, setDefaultFormAction, isSettingDefault] = useActionState(
    setDefaultShiftAction,
    initialState
  )
  const [assignState, assignFormAction, isAssigning] = useActionState(
    assignCandidateShiftAction,
    initialState
  )

  // Display toast feedback
  let snackbarMessage: string | null = null
  let snackbarVariant: 'success' | 'error' = 'success'

  if (createState?.success && dismissedKey !== 'create-success') {
    snackbarMessage = 'Shift template created successfully.'
    snackbarVariant = 'success'
  } else if (createState?.error && dismissedKey !== `create-error-${createState.error}`) {
    snackbarMessage = createState.error
    snackbarVariant = 'error'
  } else if (editState?.success && dismissedKey !== 'edit-success') {
    snackbarMessage = 'Shift template updated successfully.'
    snackbarVariant = 'success'
  } else if (editState?.error && dismissedKey !== `edit-error-${editState.error}`) {
    snackbarMessage = editState.error
    snackbarVariant = 'error'
  } else if (deleteState?.success && dismissedKey !== 'delete-success') {
    snackbarMessage = 'Shift template deleted successfully.'
    snackbarVariant = 'success'
  } else if (deleteState?.error && dismissedKey !== `delete-error-${deleteState.error}`) {
    snackbarMessage = deleteState.error
    snackbarVariant = 'error'
  } else if (setDefaultState?.success && dismissedKey !== 'set-default-success') {
    snackbarMessage = 'System default shift updated.'
    snackbarVariant = 'success'
  } else if (setDefaultState?.error && dismissedKey !== `set-default-error-${setDefaultState.error}`) {
    snackbarMessage = setDefaultState.error
    snackbarVariant = 'error'
  } else if (assignState?.success && dismissedKey !== 'assign-success') {
    snackbarMessage = 'Candidate shift assignment updated.'
    snackbarVariant = 'success'
  } else if (assignState?.error && dismissedKey !== `assign-error-${assignState.error}`) {
    snackbarMessage = assignState.error
    snackbarVariant = 'error'
  }

  const defaultShift = initialShifts.find((s) => s.is_default) || initialShifts[0] || DEFAULT_FALLBACK_SHIFT
  const totalAssignedCandidates = initialShifts.reduce((acc, s) => acc + (s.candidate_count || 0), 0)

  const filteredCandidates = candidates.filter(
    (c) =>
      c.full_name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(candidateSearch.toLowerCase()))
  )

  const handleOpenEdit = (shift: ShiftConfig) => {
    setEditShift(shift)
    setEditStartTime(shift.start_time.substring(0, 5))
    setEditEndTime(shift.end_time.substring(0, 5))
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Shift Timing Management</h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Configure preferred work shifts, automated auto-logout rules, and assign schedules to candidates
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <Button
            variant="filled"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setCreateStartTime('09:00')
              setCreateEndTime('17:00')
              setIsCreateOpen(true)
            }}
          >
            Create New Shift
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="outlined" className="border border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                Total Shift Presets
              </span>
              <p className="text-xl font-bold font-mono leading-tight mt-0.5">
                {initialShifts.length}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="outlined" className="border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Default Shift
              </span>
              <p className="text-sm font-bold truncate leading-tight mt-0.5" title={defaultShift.name}>
                {defaultShift.name}
              </p>
              <p className="text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)]">
                {formatShiftTime(defaultShift.start_time)} – {formatShiftTime(defaultShift.end_time)}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="outlined" className="border border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-primary)] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                Assigned Candidates
              </span>
              <p className="text-xl font-bold font-mono leading-tight mt-0.5">
                {totalAssignedCandidates} / {candidates.length}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="outlined" className="border border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                Overnight Shifts
              </span>
              <p className="text-xl font-bold font-mono leading-tight mt-0.5">
                {initialShifts.filter((s) => s.is_overnight).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 1. Shift Templates Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
            Configured Shift Presets
          </h3>
          <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] font-medium">
            Candidates start within shift hours + grace period
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {initialShifts.map((shift) => {
            const duration = calculateShiftDurationHours(shift.start_time, shift.end_time, shift.is_overnight)
            const isDefault = shift.is_default

            return (
              <Card
                key={shift.id}
                variant="outlined"
                className={`flex flex-col justify-between relative overflow-hidden transition-all border ${
                  isDefault
                    ? 'border-emerald-500/50 shadow-sm bg-[var(--md-sys-color-surface-container)]/40'
                    : 'border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-primary)]/40'
                }`}
              >
                {/* Default Banner */}
                {isDefault && (
                  <div className="absolute top-0 right-0">
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold bg-emerald-500 text-white rounded-bl-xl uppercase tracking-wider shadow-xs">
                      <Star className="w-3 h-3 fill-current" />
                      Default Shift
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {/* Title & Type */}
                  <div className="flex flex-col gap-1 pr-16">
                    <h4 className="text-base font-bold flex items-center gap-2">
                      {shift.is_overnight ? (
                        <Moon className="w-4 h-4 text-indigo-500 shrink-0" />
                      ) : (
                        <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <span className="truncate">{shift.name}</span>
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] font-semibold">
                        {duration} Hours
                      </span>
                      {shift.is_overnight && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold">
                          Overnight
                        </span>
                      )}
                      {shift.auto_logout_enabled ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold">
                          Auto-Logout On
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold">
                          Manual Logout
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Timing Box */}
                  <div className="p-3.5 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
                        Shift Hours:
                      </span>
                      <span className="font-mono font-bold text-sm text-[var(--md-sys-color-primary)]">
                        {formatShiftTime(shift.start_time)} – {formatShiftTime(shift.end_time)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[var(--md-sys-color-on-surface-variant)] pt-1 border-t border-[var(--md-sys-color-outline-variant)]">
                      <span>Early Clock-in Grace:</span>
                      <span className="font-semibold">{shift.grace_period_mins || 15} mins before</span>
                    </div>
                  </div>

                  {/* Candidate Count */}
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Assigned Candidates:
                    </span>
                    <span className="font-bold px-2.5 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-highest)] font-mono text-xs">
                      {shift.candidate_count || 0}
                    </span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-[var(--md-sys-color-outline-variant)]">
                  <div>
                    {!isDefault ? (
                      <form action={setDefaultFormAction}>
                        <input type="hidden" name="shiftId" value={shift.id} />
                        <button
                          type="submit"
                          disabled={isSettingDefault}
                          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Star className="w-3.5 h-3.5" /> Set as Default
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Active Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(shift)}
                      className="p-2 rounded-lg hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
                      title="Edit Shift"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!isDefault && (
                      <button
                        onClick={() => setDeleteShift(shift)}
                        className="p-2 rounded-lg hover:bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-error)] transition-colors cursor-pointer"
                        title="Delete Shift"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* 2. Candidate Shift Assignment Table */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
              Candidate Shift Allocation
            </h3>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
              Assign or change the designated shift for each candidate
            </p>
          </div>

          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]" />
            <input
              type="text"
              placeholder="Search candidate..."
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-full text-xs bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)]"
            />
          </div>
        </div>

        <Card variant="outlined" className="p-0 overflow-hidden border border-[var(--md-sys-color-outline-variant)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 sm:px-6">Candidate</th>
                  <th className="py-3 px-4">Hourly Rate</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Shift</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((cand) => {
                    const assignedShift = initialShifts.find((s) => s.id === cand.shift_id) || defaultShift
                    const isCustomAssigned = !!cand.shift_id

                    return (
                      <tr
                        key={cand.id}
                        className="hover:bg-[var(--md-sys-color-surface-container-highest)]/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold flex items-center justify-center shrink-0">
                              {cand.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-sm leading-tight">{cand.full_name}</p>
                              <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-mono">
                                {cand.email || 'No email'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{(cand.hourly_rate || 0).toFixed(2)}/hr
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {cand.isWorking ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                              Working
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)]">
                              Off Shift
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-xs flex items-center gap-1.5">
                              {assignedShift.name}
                              {!isCustomAssigned && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-500/15 text-[var(--md-sys-color-on-surface-variant)] font-bold uppercase">
                                  Default
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)]">
                              {formatShiftTime(assignedShift.start_time)} – {formatShiftTime(assignedShift.end_time)}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-right">
                          <form action={assignFormAction} className="inline-flex items-center gap-2">
                            <input type="hidden" name="candidateId" value={cand.id} />
                            <select
                              name="shiftId"
                              defaultValue={cand.shift_id || 'none'}
                              onChange={(e) => {
                                e.target.form?.requestSubmit()
                              }}
                              disabled={isAssigning}
                              className="h-8 px-2.5 rounded-lg text-xs bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
                            >
                              <option value="none">Use Default ({defaultShift.name})</option>
                              {initialShifts.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} ({formatShiftTime(s.start_time)} - {formatShiftTime(s.end_time)})
                                </option>
                              ))}
                            </select>
                          </form>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
                      No candidates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal: Create Shift Dialog */}
      {isCreateOpen && !createState?.success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] rounded-[var(--md-sys-shape-corner-extra-large)] p-6 border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-4 my-auto shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
                Create New Shift Preset
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
                name="name"
                label="Shift Name"
                placeholder="e.g., Morning Shift (7 AM - 3 PM)"
                required
                disabled={isCreating}
                startIcon={<Sliders className="w-4 h-4" />}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> Start Time (IST)
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    required
                    value={createStartTime}
                    onChange={(e) => setCreateStartTime(e.target.value)}
                    disabled={isCreating}
                    className="h-10 px-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-sm font-mono focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" /> End Time (IST)
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    required
                    value={createEndTime}
                    onChange={(e) => setCreateEndTime(e.target.value)}
                    disabled={isCreating}
                    className="h-10 px-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-sm font-mono focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
                  />
                </div>
              </div>

              {/* Live Duration Calculation */}
              <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex items-center justify-between text-xs">
                <span className="text-[var(--md-sys-color-on-surface-variant)]">Estimated Duration:</span>
                <span className="font-bold font-mono text-[var(--md-sys-color-primary)]">
                  {calculateShiftDurationHours(createStartTime, createEndTime)} Hours
                </span>
              </div>

              <TextField
                name="gracePeriodMins"
                type="number"
                min="0"
                max="120"
                label="Early Punch-In Grace Period (Minutes)"
                defaultValue="15"
                required
                disabled={isCreating}
                startIcon={<Clock className="w-4 h-4" />}
                supportingText="Allowed punch-in window before shift start time"
              />

              <div className="flex flex-col gap-2 pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
                  <input
                    type="checkbox"
                    name="autoLogoutEnabled"
                    defaultChecked={true}
                    disabled={isCreating}
                    className="w-4 h-4 rounded text-[var(--md-sys-color-primary)] cursor-pointer"
                  />
                  <span>Automatically end candidate shift when shift end time is reached</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
                  <input
                    type="checkbox"
                    name="isDefault"
                    disabled={isCreating}
                    className="w-4 h-4 rounded text-[var(--md-sys-color-primary)] cursor-pointer"
                  />
                  <span>Set as Company Default Shift for new candidates</span>
                </label>
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
                  Save Shift
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Shift Dialog */}
      {editShift && !editState?.success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] rounded-[var(--md-sys-shape-corner-extra-large)] p-6 border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-4 my-auto shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
                Edit Shift Preset
              </h3>
              <button
                onClick={() => setEditShift(null)}
                className="p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={editFormAction} className="flex flex-col gap-4">
              <input type="hidden" name="shiftId" value={editShift.id} />

              <TextField
                name="name"
                label="Shift Name"
                defaultValue={editShift.name}
                required
                disabled={isEditing}
                startIcon={<Sliders className="w-4 h-4" />}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> Start Time (IST)
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    required
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    disabled={isEditing}
                    className="h-10 px-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-sm font-mono focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" /> End Time (IST)
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    required
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    disabled={isEditing}
                    className="h-10 px-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-sm font-mono focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
                  />
                </div>
              </div>

              {/* Live Duration Calculation */}
              <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex items-center justify-between text-xs">
                <span className="text-[var(--md-sys-color-on-surface-variant)]">Estimated Duration:</span>
                <span className="font-bold font-mono text-[var(--md-sys-color-primary)]">
                  {calculateShiftDurationHours(editStartTime, editEndTime)} Hours
                </span>
              </div>

              <TextField
                name="gracePeriodMins"
                type="number"
                min="0"
                max="120"
                label="Early Punch-In Grace Period (Minutes)"
                defaultValue={editShift.grace_period_mins || 15}
                required
                disabled={isEditing}
                startIcon={<Clock className="w-4 h-4" />}
              />

              <div className="flex flex-col gap-2 pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
                  <input
                    type="checkbox"
                    name="autoLogoutEnabled"
                    defaultChecked={editShift.auto_logout_enabled}
                    disabled={isEditing}
                    className="w-4 h-4 rounded text-[var(--md-sys-color-primary)] cursor-pointer"
                  />
                  <span>Automatically end candidate shift when shift end time is reached</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
                  <input
                    type="checkbox"
                    name="isDefault"
                    defaultChecked={editShift.is_default}
                    disabled={isEditing}
                    className="w-4 h-4 rounded text-[var(--md-sys-color-primary)] cursor-pointer"
                  />
                  <span>Set as Company Default Shift</span>
                </label>
              </div>

              {editState?.error && (
                <div className="p-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs font-medium">
                  {editState.error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setEditShift(null)}
                  disabled={isEditing}
                  className="px-4 h-10 rounded-full text-sm font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 cursor-pointer"
                >
                  Cancel
                </button>
                <Button type="submit" variant="filled" size="md" isLoading={isEditing}>
                  Update Shift
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Shift Dialog */}
      {deleteShift && !deleteState?.success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] rounded-[var(--md-sys-shape-corner-extra-large)] p-6 border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-4 my-auto shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
              <h3 className="text-lg font-bold flex items-center gap-2 text-[var(--md-sys-color-error)]">
                <Trash2 className="w-5 h-5" />
                Delete Shift Preset
              </h3>
              <button
                onClick={() => setDeleteShift(null)}
                className="p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
              Are you sure you want to delete <strong>{deleteShift.name}</strong>? Any candidates currently assigned to this shift will be automatically reassigned to the default shift.
            </p>

            <form action={deleteFormAction} className="flex flex-col gap-4">
              <input type="hidden" name="shiftId" value={deleteShift.id} />

              {deleteState?.error && (
                <div className="p-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs font-medium">
                  {deleteState.error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setDeleteShift(null)}
                  disabled={isDeleting}
                  className="px-4 h-10 rounded-full text-sm font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  className="bg-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error)]/90 text-[var(--md-sys-color-on-error)]"
                  size="md"
                  isLoading={isDeleting}
                >
                  Delete Shift
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <Snackbar
        message={snackbarMessage}
        variant={snackbarVariant}
        onClose={() => setDismissedKey('dismissed')}
      />
    </div>
  )
}
