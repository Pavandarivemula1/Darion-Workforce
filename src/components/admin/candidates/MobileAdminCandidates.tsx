'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  UserPlus,
  KeyRound,
  Users,
  Search,
  IndianRupee,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { CandidateUser } from '@/app/admin/candidates/CandidateManagementClient'
import { type ShiftConfig, formatShiftTime, DEFAULT_FALLBACK_SHIFT } from '@/lib/utils/shift'

export interface MobileAdminCandidatesProps {
  candidates: CandidateUser[]
  shifts?: ShiftConfig[]
  onOpenCreate: () => void
  onOpenEdit: (candidate: CandidateUser) => void
  onOpenDelete: (candidate: CandidateUser) => void
  onOpenResetPassword: (email: string) => void
}

export const MobileAdminCandidates: React.FC<MobileAdminCandidatesProps> = ({
  candidates,
  shifts = [],
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
  onOpenResetPassword,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const defaultShift = shifts.find((s) => s.is_default) || shifts[0] || DEFAULT_FALLBACK_SHIFT

  const workingCount = candidates.filter((c) => c.isWorking).length
  const avgHourlyRate = candidates.length > 0
    ? Math.round(candidates.reduce((sum, c) => sum + (c.hourly_rate || 0), 0) / candidates.length)
    : 0

  const filteredCandidates = candidates.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = c.full_name.toLowerCase().includes(q)
      const matchEmail = (c.email || '').toLowerCase().includes(q)
      const matchPhone = (c.phone_number || '').toLowerCase().includes(q)
      return matchName || matchEmail || matchPhone
    }
    return true
  })

  return (
    <div className="flex flex-col gap-2.5">
      {/* 1. Executive Candidates Command Strip */}
      <div className="p-3 rounded-2xl bg-slate-900 dark:bg-slate-950 text-slate-100 border border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Roster Management</span>
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
            {candidates.length} Staff • {workingCount} Working Now
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs shrink-0 flex items-center gap-1 transition-all border border-slate-700 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Staff</span>
        </button>
      </div>

      {/* 2. 2x2 Bento Matrix */}
      <div className="grid grid-cols-2 gap-2">
        {/* Metric 1: Total Staff */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Total Roster
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {candidates.length}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Active Candidates</span>
          </div>
        </div>

        {/* Metric 2: Working Now */}
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
              {workingCount}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">On Shift</span>
          </div>
        </div>

        {/* Metric 3: Avg Hourly Rate */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Avg Base Rate
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-base font-black font-mono text-[var(--md-sys-color-on-surface)]">
              ₹{avgHourlyRate}/hr
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Team Average</span>
          </div>
        </div>

        {/* Metric 4: Assigned Shifts */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Templates
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {shifts.length}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Configured Shifts</span>
          </div>
        </div>
      </div>

      {/* 3. Candidate Directory Feed */}
      <div className="flex flex-col gap-2">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]" />
          <input
            type="text"
            placeholder="Search candidate by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-xl text-xs bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] focus:outline-none"
          />
        </div>

        {/* Candidate Cards */}
        <div className="flex flex-col gap-2">
          {filteredCandidates.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
              No candidates found matching criteria.
            </div>
          ) : (
            filteredCandidates.map((c) => {
              const assignedShift = shifts.find((s) => s.id === c.shift_id) || defaultShift

              return (
                <Card
                  key={c.id}
                  variant="outlined"
                  className="p-2.5 rounded-2xl flex flex-col gap-2 relative overflow-hidden transition-all border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] shadow-2xs"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] font-bold text-[11px] flex items-center justify-center shrink-0">
                        {c.avatar_url ? (
                          <img src={c.avatar_url} alt={c.full_name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          c.full_name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[var(--md-sys-color-on-surface)] truncate">{c.full_name}</p>
                        <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-mono truncate">
                          {c.email || 'No email'}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {c.isWorking ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Working
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
                          Off Shift
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info Strip */}
                  <div className="grid grid-cols-2 gap-1.5 p-2 rounded-xl bg-[var(--md-sys-color-surface-container-low)] text-[11px] text-[var(--md-sys-color-on-surface)]">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[var(--md-sys-color-on-surface-variant)] block">
                        Hourly Rate
                      </span>
                      <span className="font-bold font-mono text-xs text-[var(--md-sys-color-on-surface)]">
                        ₹{(c.hourly_rate || 0).toFixed(2)}/hr
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-[var(--md-sys-color-on-surface-variant)] block">
                        Assigned Shift
                      </span>
                      <span className="font-semibold text-[10px] truncate block text-[var(--md-sys-color-on-surface-variant)]">
                        {assignedShift.name} ({formatShiftTime(assignedShift.start_time)})
                      </span>
                    </div>
                  </div>

                  {/* 1-Tap Action Dock */}
                  <div className="flex items-center gap-1 pt-1 border-t border-[var(--md-sys-color-outline-variant)]">
                    <button
                      onClick={() => onOpenEdit(c)}
                      className="flex-1 h-7 rounded-lg bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    {c.email && (
                      <button
                        onClick={() => onOpenResetPassword(c.email!)}
                        className="px-2.5 h-7 rounded-lg bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Reset Password"
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>Pass</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenDelete(c)}
                      className="px-2 h-7 rounded-lg bg-[var(--md-sys-color-surface-container-high)] hover:bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="Delete Candidate"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
