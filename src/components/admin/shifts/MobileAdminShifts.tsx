'use client'

import React, { useState } from 'react'
import {
  type ShiftConfig,
  type ShiftWithCandidateCount,
  formatShiftTime,
  calculateShiftDurationHours,
} from '@/lib/utils/shift'
import { Card } from '@/components/ui/Card'
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
  Search,
  UserCheck,
} from 'lucide-react'
import { CandidateShiftUser } from './AdminShiftsClient'

export interface MobileAdminShiftsProps {
  shifts: ShiftWithCandidateCount[]
  candidates: CandidateShiftUser[]
  defaultShift: ShiftConfig
  totalAssignedCandidates: number
  isSettingDefault: boolean
  isAssigning: boolean
  onOpenCreate: () => void
  onOpenEdit: (shift: ShiftConfig) => void
  onOpenDelete: (shift: ShiftConfig) => void
  setDefaultFormAction: (payload: FormData) => void
  assignFormAction: (payload: FormData) => void
}

export const MobileAdminShifts: React.FC<MobileAdminShiftsProps> = ({
  shifts,
  candidates,
  defaultShift,
  totalAssignedCandidates,
  isSettingDefault,
  isAssigning,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
  setDefaultFormAction,
  assignFormAction,
}) => {
  const [candidateSearch, setCandidateSearch] = useState('')
  const [viewTab, setViewTab] = useState<'presets' | 'allocation'>('presets')

  const filteredCandidates = candidates.filter(
    (c) =>
      c.full_name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(candidateSearch.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-2.5">
      {/* 1. Mobile Executive Shift Command Strip (Executive Slate) */}
      <div className="p-3 rounded-2xl bg-slate-900 dark:bg-slate-950 text-slate-100 border border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shift Operations</span>
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
            {shifts.length} Presets • Default: {defaultShift.name}
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs shrink-0 flex items-center gap-1 transition-all border border-slate-700 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Shift</span>
        </button>
      </div>

      {/* 2. 2x2 Ultra-Dense Bento Shift Matrix (Unified Enterprise Neutral Surfaces) */}
      <div className="grid grid-cols-2 gap-2">
        {/* Metric 1: Presets */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Shift Presets
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Sliders className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {shifts.length}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Active Templates</span>
          </div>
        </div>

        {/* Metric 2: Default Shift */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Default Shift
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
          <div className="mt-1.5 overflow-hidden">
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] block truncate" title={defaultShift.name}>
              {defaultShift.name}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block font-mono">
              {formatShiftTime(defaultShift.start_time)} – {formatShiftTime(defaultShift.end_time)}
            </span>
          </div>
        </div>

        {/* Metric 3: Assigned Staff */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Assigned Staff
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-base font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {totalAssignedCandidates} / {candidates.length}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Staff Allocated</span>
          </div>
        </div>

        {/* Metric 4: Overnight */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Overnight
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Moon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {shifts.filter((s) => s.is_overnight).length}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Night Schedules</span>
          </div>
        </div>
      </div>

      {/* 3. Section Switcher Pill */}
      <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]">
        <button
          onClick={() => setViewTab('presets')}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            viewTab === 'presets'
              ? 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] shadow-2xs border border-[var(--md-sys-color-outline-variant)]'
              : 'text-[var(--md-sys-color-on-surface-variant)]'
          }`}
        >
          <Sliders className="w-3 h-3" />
          <span>Shift Presets ({shifts.length})</span>
        </button>

        <button
          onClick={() => setViewTab('allocation')}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            viewTab === 'allocation'
              ? 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] shadow-2xs border border-[var(--md-sys-color-outline-variant)]'
              : 'text-[var(--md-sys-color-on-surface-variant)]'
          }`}
        >
          <UserCheck className="w-3 h-3" />
          <span>Staff Allocation ({candidates.length})</span>
        </button>
      </div>

      {/* 4. Tab A: Shift Presets Deck */}
      {viewTab === 'presets' && (
        <div className="flex flex-col gap-2">
          {shifts.map((shift) => {
            const duration = calculateShiftDurationHours(shift.start_time, shift.end_time, shift.is_overnight)
            const isDefault = shift.is_default

            return (
              <Card
                key={shift.id}
                variant="outlined"
                className="p-3 rounded-2xl flex flex-col gap-2 relative overflow-hidden transition-all border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] shadow-2xs"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center shrink-0">
                      {shift.is_overnight ? (
                        <Moon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                      ) : (
                        <Sun className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-[var(--md-sys-color-on-surface)] truncate">{shift.name}</h4>
                      <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-mono">
                        {duration} Hours • {shift.grace_period_mins || 15}m grace
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isDefault ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs">
                        <Star className="w-2.5 h-2.5 fill-current" /> Default
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container-high)] px-2 py-0.5 rounded-full">
                        {shift.candidate_count || 0} Staff
                      </span>
                    )}
                  </div>
                </div>

                {/* Timing Bar */}
                <div className="py-1.5 px-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase font-bold text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    Window
                  </span>
                  <span className="font-mono font-bold text-xs text-[var(--md-sys-color-on-surface)]">
                    {formatShiftTime(shift.start_time)} – {formatShiftTime(shift.end_time)}
                  </span>
                </div>

                {/* Action Row */}
                <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-[var(--md-sys-color-outline-variant)]">
                  <div>
                    {!isDefault ? (
                      <form action={setDefaultFormAction}>
                        <input type="hidden" name="shiftId" value={shift.id} />
                        <button
                          type="submit"
                          disabled={isSettingDefault}
                          className="text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Star className="w-3 h-3" /> Set Default
                        </button>
                      </form>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEdit(shift)}
                      className="px-2.5 py-1 rounded-lg bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    {!isDefault && (
                      <button
                        onClick={() => onOpenDelete(shift)}
                        className="px-2 py-1 rounded-lg bg-[var(--md-sys-color-surface-container-high)] hover:bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* 5. Tab B: Candidate Shift Allocation Hub */}
      {viewTab === 'allocation' && (
        <div className="flex flex-col gap-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]" />
            <input
              type="text"
              placeholder="Search candidate..."
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-xl text-xs bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:border-[var(--md-sys-color-outline)]"
            />
          </div>

          {/* Allocation List */}
          <div className="flex flex-col divide-y divide-[var(--md-sys-color-outline-variant)] rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] overflow-hidden shadow-2xs">
            {filteredCandidates.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
                No candidates found.
              </div>
            ) : (
              filteredCandidates.map((cand) => {
                const assignedShift = shifts.find((s) => s.id === cand.shift_id) || defaultShift

                return (
                  <div key={cand.id} className="p-2.5 flex flex-col gap-2 text-xs">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] font-bold text-[11px] flex items-center justify-center shrink-0">
                          {cand.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-[var(--md-sys-color-on-surface)] truncate">{cand.full_name}</p>
                          <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-mono">
                            ₹{(cand.hourly_rate || 0).toFixed(2)}/hr
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {cand.isWorking ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Working
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
                            Off Shift
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Shift Dropdown Selector */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--md-sys-color-outline-variant)]/60">
                      <span className="text-[10px] uppercase font-bold text-[var(--md-sys-color-on-surface-variant)]">
                        Assigned:
                      </span>
                      <form action={assignFormAction} className="flex-1 max-w-[200px]">
                        <input type="hidden" name="candidateId" value={cand.id} />
                        <select
                          name="shiftId"
                          defaultValue={cand.shift_id || 'none'}
                          onChange={(e) => {
                            e.target.form?.requestSubmit()
                          }}
                          disabled={isAssigning}
                          className="w-full h-7 px-2 rounded-lg text-[11px] font-semibold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] focus:outline-none cursor-pointer"
                        >
                          <option value="none">Default ({defaultShift.name})</option>
                          {shifts.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({formatShiftTime(s.start_time)})
                            </option>
                          ))}
                        </select>
                      </form>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
