'use client'

import React, { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { submitFeedbackAction } from '@/app/actions/feedback'
import {
  Lightbulb,
  Bug,
  Building2,
  Clock,
  MessageSquare,
  Star,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

export interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const CATEGORIES = [
  { id: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
  { id: 'bug', label: 'Report Bug', icon: Bug, color: 'text-red-500 bg-red-500/10 border-red-500/30' },
  { id: 'workplace', label: 'Workplace', icon: Building2, color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' },
  { id: 'shift_feedback', label: 'Shift & Hours', icon: Clock, color: 'text-purple-500 bg-purple-500/10 border-purple-500/30' },
  { id: 'general', label: 'General', icon: MessageSquare, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' },
] as const

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [category, setCategory] = useState<'suggestion' | 'bug' | 'workplace' | 'shift_feedback' | 'general'>('suggestion')
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      setErrorMsg('Please enter your feedback message.')
      return
    }

    setIsPending(true)
    setErrorMsg(null)

    const res = await submitFeedbackAction({
      type: category,
      rating,
      title: title.trim() || undefined,
      message: message.trim(),
    })

    setIsPending(false)

    if (res?.error) {
      setErrorMsg(res.error)
    } else {
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setTitle('')
        setMessage('')
        setRating(5)
        setCategory('suggestion')
        onClose()
        if (onSuccess) onSuccess()
      }, 1500)
    }
  }

  const handleClose = () => {
    if (!isPending) {
      setErrorMsg(null)
      onClose()
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      title="Share Your Feedback"
      onClose={handleClose}
    >
      {submitted ? (
        <div className="py-8 flex flex-col items-center justify-center text-center gap-3 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-[var(--md-sys-color-success-container)] text-[var(--md-sys-color-success)] flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">
            Thank You!
          </h3>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-xs">
            Your feedback has been submitted successfully to the team.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
            Help us improve your work experience. Your feedback is reviewed directly by management.
          </p>

          {/* Category Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon
                const isSelected = category === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold shadow-xs'
                        : 'border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Star Rating */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">
              Overall Experience Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hoverRating !== null ? hoverRating : rating) >= star
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(star)}
                    className="p-1 rounded-md hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                    aria-label={`${star} star`}
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        filled
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-[var(--md-sys-color-outline-variant)]'
                      }`}
                    />
                  </button>
                )
              })}
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] ml-2 font-medium">
                {rating === 5 && 'Excellent'}
                {rating === 4 && 'Good'}
                {rating === 3 && 'Average'}
                {rating === 2 && 'Poor'}
                {rating === 1 && 'Very Poor'}
              </span>
            </div>
          </div>

          {/* Subject / Title */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="feedback-title" className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">
              Title <span className="font-normal text-[var(--md-sys-color-on-surface-variant)]">(Optional)</span>
            </label>
            <input
              id="feedback-title"
              type="text"
              placeholder="e.g. Need better lighting in Station 3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="h-10 px-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs focus:outline-none focus:border-[var(--md-sys-color-primary)]"
            />
          </div>

          {/* Message Area */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="feedback-message" className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="feedback-message"
              rows={3}
              required
              placeholder="Describe your suggestion, concern, or experience in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs focus:outline-none focus:border-[var(--md-sys-color-primary)] resize-none"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
            <Button
              type="button"
              variant="outlined"
              size="sm"
              disabled={isPending}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="filled"
              size="sm"
              isLoading={isPending}
            >
              Submit Feedback
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  )
}
