'use client'

import React, { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { submitShiftFeedbackAction } from '@/app/actions/feedback'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export interface ShiftFeedbackDialogProps {
  isOpen: boolean
  attendanceId?: string | null
  onClose: () => void
  onCompleted?: () => void
}

const MOODS = [
  { id: 'great', label: 'Great', emoji: '🤩', rating: 5, color: 'hover:border-emerald-500 hover:bg-emerald-500/10' },
  { id: 'good', label: 'Good', emoji: '😊', rating: 4, color: 'hover:border-blue-500 hover:bg-blue-500/10' },
  { id: 'neutral', label: 'Okay', emoji: '😐', rating: 3, color: 'hover:border-amber-500 hover:bg-amber-500/10' },
  { id: 'rough', label: 'Rough', emoji: '😕', rating: 2, color: 'hover:border-orange-500 hover:bg-orange-500/10' },
  { id: 'bad', label: 'Bad', emoji: '😫', rating: 1, color: 'hover:border-red-500 hover:bg-red-500/10' },
] as const

const COMMON_TAGS = [
  'Smooth shift',
  'Great teamwork',
  'High workload',
  'Equipment issue',
  'Break delayed',
  'Helpful supervisor',
  'Safe environment',
]

export const ShiftFeedbackDialog: React.FC<ShiftFeedbackDialogProps> = ({
  isOpen,
  attendanceId,
  onClose,
  onCompleted,
}) => {
  const [selectedMood, setSelectedMood] = useState<string>('good')
  const [selectedRating, setSelectedRating] = useState<number>(4)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [note, setNote] = useState<string>('')
  const [isPending, setIsPending] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isDone, setIsDone] = useState<boolean>(false)

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleSelectMood = (moodId: string, rating: number) => {
    setSelectedMood(moodId)
    setSelectedRating(rating)
  }

  const handleSubmit = async () => {
    setIsPending(true)
    setErrorMsg(null)

    const res = await submitShiftFeedbackAction({
      rating: selectedRating,
      mood: selectedMood,
      tags: selectedTags,
      message: note.trim() || undefined,
      attendance_id: attendanceId || null,
    })

    setIsPending(false)

    if (res?.error) {
      setErrorMsg(res.error)
    } else {
      setIsDone(true)
      setTimeout(() => {
        setIsDone(false)
        onClose()
        if (onCompleted) onCompleted()
      }, 1200)
    }
  }

  const handleSkip = () => {
    onClose()
    if (onCompleted) onCompleted()
  }

  return (
    <Dialog
      isOpen={isOpen}
      title="How was your shift today?"
      onClose={handleSkip}
    >
      {isDone ? (
        <div className="py-6 flex flex-col items-center justify-center text-center gap-2 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-[var(--md-sys-color-success-container)] text-[var(--md-sys-color-success)] flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
            Shift Feedback Saved!
          </p>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
            Have a great rest of your day.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 pt-1">
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
            Take 5 seconds to share how your day went.
          </p>

          {/* Mood Emojis */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
            {MOODS.map((m) => {
              const isSelected = selectedMood === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectMood(m.id, m.rating)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-1 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold scale-105 shadow-xs'
                      : `border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface-variant)] ${m.color}`
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">{m.emoji}</span>
                  <span className="text-[11px]">{m.label}</span>
                </button>
              )
            })}
          </div>

          {/* Quick Tag Chips */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Quick Highlights
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold'
                        : 'border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                    }`}
                  >
                    {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Optional Note */}
          <div className="flex flex-col gap-1">
            <input
              type="text"
              placeholder="Any optional notes or comments about today..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-9 px-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs focus:outline-none focus:border-[var(--md-sys-color-primary)]"
            />
          </div>

          {errorMsg && (
            <div className="p-2 rounded-lg bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
            <Button
              variant="text"
              size="sm"
              disabled={isPending}
              onClick={handleSkip}
            >
              Skip
            </Button>
            <Button
              variant="filled"
              size="sm"
              isLoading={isPending}
              onClick={handleSubmit}
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}
