'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FeedbackModal } from './FeedbackModal'
import {
  MessageSquare,
  Lightbulb,
  Bug,
  Building2,
  Clock,
  Star,
  Plus,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Sparkles,
} from 'lucide-react'

export interface FeedbackItem {
  id: string
  type: string
  rating: number | null
  mood: string | null
  tags: string[] | null
  title: string | null
  message: string
  status: string
  admin_notes: string | null
  created_at: string
}

export interface CandidateFeedbackClientProps {
  feedbacks: FeedbackItem[]
}

const CATEGORY_MAP: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  suggestion: { label: 'Suggestion', icon: Lightbulb, color: 'text-amber-500 bg-amber-500/10' },
  bug: { label: 'Bug Report', icon: Bug, color: 'text-red-500 bg-red-500/10' },
  workplace: { label: 'Workplace', icon: Building2, color: 'text-blue-500 bg-blue-500/10' },
  shift_feedback: { label: 'Shift Mood', icon: Clock, color: 'text-purple-500 bg-purple-500/10' },
  general: { label: 'General', icon: MessageSquare, color: 'text-emerald-500 bg-emerald-500/10' },
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  new: { label: 'Submitted', bg: 'bg-[var(--md-sys-color-surface-container-highest)]', text: 'text-[var(--md-sys-color-on-surface-variant)]' },
  in_review: { label: 'Under Review', bg: 'bg-[var(--md-sys-color-warning-container)]', text: 'text-[var(--md-sys-color-on-warning-container)]' },
  resolved: { label: 'Resolved', bg: 'bg-[var(--md-sys-color-success-container)]', text: 'text-[var(--md-sys-color-on-success-container)]' },
  dismissed: { label: 'Closed', bg: 'bg-[var(--md-sys-color-surface-container)]', text: 'text-[var(--md-sys-color-outline)]' },
}

export const CandidateFeedbackClient: React.FC<CandidateFeedbackClientProps> = ({ feedbacks }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (filterType === 'all') return true
    return f.type === filterType
  })

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-primary)] flex items-center justify-center shrink-0 shadow-sm">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Feedback & Suggestions</h1>
            <p className="text-xs opacity-85 mt-0.5">
              Voice your ideas, workplace questions, and shift experiences directly with the team.
            </p>
          </div>
        </div>
        <Button
          variant="filled"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setModalOpen(true)}
          className="shrink-0 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90"
        >
          New Feedback
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Feedback' },
          { id: 'shift_feedback', label: 'Shift Moods' },
          { id: 'suggestion', label: 'Suggestions' },
          { id: 'bug', label: 'Bugs' },
          { id: 'workplace', label: 'Workplace' },
          { id: 'general', label: 'General' },
        ].map((tab) => {
          const isActive = filterType === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                  : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Feedback List */}
      {filteredFeedbacks.length === 0 ? (
        <Card variant="outlined" className="py-12 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)]">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
            No feedback found
          </h3>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-xs">
            {filterType === 'all'
              ? 'You have not submitted any feedback yet. Share your thoughts or ideas anytime!'
              : `No ${filterType.replace('_', ' ')} entries found.`}
          </p>
          <Button
            variant="filled"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setModalOpen(true)}
            className="mt-2"
          >
            Submit Feedback
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredFeedbacks.map((item) => {
            const cat = CATEGORY_MAP[item.type] || CATEGORY_MAP.general
            const Icon = cat.icon
            const statusStyle = STATUS_MAP[item.status] || STATUS_MAP.new

            return (
              <Card
                key={item.id}
                variant="elevated"
                className="border border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-primary)]/40 transition-all p-5"
              >
                <div className="flex flex-col gap-3">
                  {/* Top Meta Row */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cat.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {cat.label}
                      </span>

                      {item.rating && (
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[...Array(item.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      )}

                      {item.mood && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[var(--md-sys-color-surface-container-highest)]">
                          Mood: {item.mood}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.label}
                      </span>
                      <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                        {new Date(item.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Title & Body */}
                  {item.title && (
                    <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
                      {item.title}
                    </h3>
                  )}
                  <p className="text-xs leading-relaxed text-[var(--md-sys-color-on-surface-variant)] whitespace-pre-wrap">
                    {item.message}
                  </p>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Admin Resolution / Response */}
                  {item.admin_notes && (
                    <div className="mt-2 p-3 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex items-start gap-2.5">
                      <MessageCircle className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-[var(--md-sys-color-primary)]">
                          Management Response:
                        </span>
                        <p className="text-xs text-[var(--md-sys-color-on-surface)]">
                          {item.admin_notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Submission Modal */}
      <FeedbackModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
