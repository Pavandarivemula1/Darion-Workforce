'use client'

import React, { useState, useTransition, useId } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { adminStartWorkAction } from '@/app/actions/admin'
import { Play, Clock, User, AlertCircle } from 'lucide-react'

export interface CandidateOption {
  id: string
  full_name: string
  hourly_rate?: number
}

export interface StartTimerModalProps {
  isOpen: boolean
  onClose: () => void
  candidates: CandidateOption[]
  activeUserIds: string[]
  preselectedCandidateId?: string
  onSuccess?: () => void
  onError?: (err: string) => void
}

function getLocalDatetimeInputValue(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const yyyy = date.getFullYear()
  const MM = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const hh = pad(date.getHours())
  const mm = pad(date.getMinutes())
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`
}

export const StartTimerModal: React.FC<StartTimerModalProps> = ({
  isOpen,
  onClose,
  candidates,
  activeUserIds,
  preselectedCandidateId,
  onSuccess,
  onError,
}) => {
  const candidateSelectId = useId()
  const [selectedCandidate, setSelectedCandidate] = useState<string>(
    preselectedCandidateId || ''
  )
  const [mode, setMode] = useState<'now' | 'custom'>('now')
  const [customTime, setCustomTime] = useState<string>(getLocalDatetimeInputValue())
  const [adminNotes, setAdminNotes] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Reset when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      if (preselectedCandidateId) {
        setSelectedCandidate(preselectedCandidateId)
      } else {
        const firstAvailable = candidates.find((c) => !activeUserIds.includes(c.id))
        setSelectedCandidate(firstAvailable ? firstAvailable.id : '')
      }
      setMode('now')
      setCustomTime(getLocalDatetimeInputValue())
      setAdminNotes('')
      setErrorMsg(null)
    }
  }, [isOpen, preselectedCandidateId, candidates, activeUserIds])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCandidate) {
      setErrorMsg('Please select a candidate.')
      return
    }

    setErrorMsg(null)
    const formData = new FormData()
    formData.append('candidateId', selectedCandidate)
    if (mode === 'custom' && customTime) {
      formData.append('startTime', new Date(customTime).toISOString())
    }
    if (adminNotes.trim()) {
      formData.append('adminNotes', adminNotes.trim())
    }

    startTransition(async () => {
      const res = await adminStartWorkAction({ error: '', success: false }, formData)
      if (res.success) {
        onSuccess?.()
        onClose()
      } else if (res.error) {
        setErrorMsg(res.error)
        onError?.(res.error)
      }
    })
  }

  const activeSet = new Set(activeUserIds)

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Start Work Timer"
      description="Start an active work session for a candidate (clock-in now or backdate start time)."
      hideFooter
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Candidate Selector */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={candidateSelectId} className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Candidate
          </label>
          <select
            id={candidateSelectId}
            value={selectedCandidate}
            onChange={(e) => setSelectedCandidate(e.target.value)}
            disabled={isPending}
            className="w-full h-11 px-3 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs font-medium focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
            required
          >
            <option value="" disabled>
              Select a Candidate...
            </option>
            {candidates.map((c) => {
              const isWorking = activeSet.has(c.id)
              return (
                <option key={c.id} value={c.id} disabled={isWorking}>
                  {c.full_name} {isWorking ? '(Already Working)' : ''}
                </option>
              )
            })}
          </select>
        </div>

        {/* Start Time Mode (Live Now vs Custom) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Start Timing
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('now')}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'now'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'bg-[var(--md-sys-color-surface-container)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Now
            </button>
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'custom'
                  ? 'bg-[var(--md-sys-color-primary-container)] border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary-container)] font-bold'
                  : 'bg-[var(--md-sys-color-surface-container)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Custom Time
            </button>
          </div>
        </div>

        {/* Custom Start Time Input */}
        {mode === 'custom' && (
          <div className="flex flex-col gap-1.5 animate-fade-in">
            <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)]">
              Specify Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              max={getLocalDatetimeInputValue()}
              disabled={isPending}
              className="w-full h-11 px-3 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs font-mono focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
              required
            />
            <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
              The shift timer will begin counting from this chosen past time.
            </p>
          </div>
        )}

        {/* Admin Notes */}
        <TextField
          label="Admin Note / Reason (Optional)"
          placeholder="e.g., Started on candidate request due to phone issue"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          disabled={isPending}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--md-sys-color-outline-variant)] mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 h-10 rounded-full text-xs sm:text-sm font-semibold text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            type="submit"
            variant="filled"
            size="md"
            icon={<Play className="w-4 h-4 fill-current" />}
            isLoading={isPending}
          >
            Start Timer
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
