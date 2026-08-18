'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  MessageSquare,
  Lightbulb,
  Bug,
  Building2,
  Clock,
  Star,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
} from 'lucide-react'
import { FeedbackWithCandidate } from '@/components/admin/feedback/AdminFeedbackClient'

export interface MobileAdminFeedbackProps {
  feedbacks: FeedbackWithCandidate[]
  onOpenReview: (feedback: FeedbackWithCandidate) => void
  onDeleteConfirm: (id: string) => void
}

export const MobileAdminFeedback: React.FC<MobileAdminFeedbackProps> = ({
  feedbacks,
  onOpenReview,
  onDeleteConfirm,
}) => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in_review' | 'resolved'>('all')

  const totalSubmissions = feedbacks.length
  const newCount = feedbacks.filter((f) => f.status === 'new').length
  const resolvedCount = feedbacks.filter((f) => f.status === 'resolved').length
  const ratingsList = feedbacks.map((f) => f.rating).filter((r): r is number => typeof r === 'number' && r > 0)
  const avgRating = ratingsList.length > 0
    ? (ratingsList.reduce((a, b) => a + b, 0) / ratingsList.length).toFixed(1)
    : 'N/A'

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (statusFilter !== 'all' && f.status !== statusFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        f.candidateName.toLowerCase().includes(q) ||
        f.message.toLowerCase().includes(q) ||
        (f.title ? f.title.toLowerCase().includes(q) : false)
      )
    }
    return true
  })

  return (
    <div className="flex flex-col gap-2.5">
      {/* 1. Executive Feedback Command Strip */}
      <div className="p-3 rounded-2xl bg-slate-900 dark:bg-slate-950 text-slate-100 border border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Feedback Hub</span>
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
            {avgRating !== 'N/A' ? `${avgRating} ★ Rating` : 'Staff Feedback'} • {newCount} New
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700">
          {totalSubmissions} Total
        </span>
      </div>

      {/* 2. 2x2 Bento Matrix */}
      <div className="grid grid-cols-2 gap-2">
        {/* Metric 1: Avg Rating */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Avg Rating
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {avgRating} {avgRating !== 'N/A' && <span className="text-xs font-sans text-[var(--md-sys-color-on-surface-variant)]">/ 5.0</span>}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Staff Satisfaction</span>
          </div>
        </div>

        {/* Metric 2: New Submissions */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              New Tickets
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {newCount}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Needs Attention</span>
          </div>
        </div>

        {/* Metric 3: Resolved */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Resolved
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {resolvedCount}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Closed Feedback</span>
          </div>
        </div>

        {/* Metric 4: Total Reviews */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Total Feedbacks
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {totalSubmissions}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">All-Time Entries</span>
          </div>
        </div>
      </div>

      {/* 3. Feedback Feed */}
      <div className="flex flex-col gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-xl text-xs bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] focus:outline-none"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-[10px] font-bold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]'
            }`}
          >
            All ({feedbacks.length})
          </button>
          <button
            onClick={() => setStatusFilter('new')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'new'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]'
            }`}
          >
            New ({newCount})
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'resolved'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]'
            }`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-2">
          {filteredFeedbacks.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
              No feedback records found.
            </div>
          ) : (
            filteredFeedbacks.map((f) => {
              const isNew = f.status === 'new'
              const isResolved = f.status === 'resolved'

              return (
                <Card
                  key={f.id}
                  variant="outlined"
                  className="p-2.5 rounded-2xl flex flex-col gap-2 relative overflow-hidden transition-all border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] shadow-2xs"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] font-bold text-[11px] flex items-center justify-center shrink-0">
                        {f.candidateName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[var(--md-sys-color-on-surface)] truncate">{f.candidateName}</p>
                        <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] capitalize">
                          {f.type.replace('_', ' ')} • {new Date(f.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {f.rating && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono">
                          {f.rating} ★
                        </span>
                      )}

                      {isResolved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
                          Resolved
                        </span>
                      ) : isNew ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40">
                          New
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
                          In Review
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="p-2 rounded-xl bg-[var(--md-sys-color-surface-container-low)] text-xs text-[var(--md-sys-color-on-surface)] leading-relaxed">
                    {f.title && <h5 className="font-bold text-[11px] mb-0.5">{f.title}</h5>}
                    <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] line-clamp-3">
                      {f.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-1 border-t border-[var(--md-sys-color-outline-variant)]">
                    <button
                      onClick={() => onOpenReview(f)}
                      className="flex-1 h-7 rounded-lg bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Review / Note</span>
                    </button>

                    <button
                      onClick={() => onDeleteConfirm(f.id)}
                      className="px-2 h-7 rounded-lg bg-[var(--md-sys-color-surface-container-high)] hover:bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
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
