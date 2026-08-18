'use client'

import React, { useState, useTransition } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Snackbar } from '@/components/ui/Snackbar'
import {
  updateFeedbackStatusAction,
  deleteFeedbackAction,
} from '@/app/actions/feedback'
import {
  MessageSquare,
  Lightbulb,
  Bug,
  Building2,
  Clock,
  Star,
  Search,
  Filter,
  CheckCircle2,
  Clock3,
  AlertCircle,
  MessageCircle,
  Trash2,
  Send,
  Users,
  Smile,
  XCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'
import { MobileAdminFeedback } from './MobileAdminFeedback'


export interface FeedbackWithCandidate {
  id: string
  user_id: string
  type: string
  rating: number | null
  mood: string | null
  tags: string[] | null
  title: string | null
  message: string
  status: 'new' | 'in_review' | 'resolved' | 'dismissed'
  admin_notes: string | null
  attendance_id: string | null
  created_at: string
  candidateName: string
  candidateEmail: string
  candidateAvatarUrl?: string | null
}

export interface AdminFeedbackClientProps {
  feedbacks: FeedbackWithCandidate[]
}

const CATEGORY_MAP: Record<string, { label: string; icon: React.ElementType; color: string; badge: string }> = {
  suggestion: { label: 'Suggestion', icon: Lightbulb, color: 'text-amber-500', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  bug: { label: 'Bug Report', icon: Bug, color: 'text-red-500', badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' },
  workplace: { label: 'Workplace', icon: Building2, color: 'text-blue-500', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  shift_feedback: { label: 'Shift Mood', icon: Clock, color: 'text-purple-500', badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  general: { label: 'General', icon: MessageSquare, color: 'text-emerald-500', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  new: { label: 'New', bg: 'bg-blue-500/15 border-blue-500/30', text: 'text-blue-700 dark:text-blue-300' },
  in_review: { label: 'In Review', bg: 'bg-amber-500/15 border-amber-500/30', text: 'text-amber-700 dark:text-amber-300' },
  resolved: { label: 'Resolved', bg: 'bg-emerald-500/15 border-emerald-500/30', text: 'text-emerald-700 dark:text-emerald-300' },
  dismissed: { label: 'Dismissed', bg: 'bg-zinc-500/15 border-zinc-500/30', text: 'text-zinc-600 dark:text-zinc-400' },
}

const MOOD_EMOJIS: Record<string, string> = {
  great: '🤩 Great',
  good: '😊 Good',
  neutral: '😐 Okay',
  rough: '😕 Rough',
  bad: '😫 Bad',
}

export const AdminFeedbackClient: React.FC<AdminFeedbackClientProps> = ({ feedbacks }) => {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')

  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackWithCandidate | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [targetStatus, setTargetStatus] = useState<'new' | 'in_review' | 'resolved' | 'dismissed'>('new')
  const [isPending, startTransition] = useTransition()
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Metrics Calculations
  const totalSubmissions = feedbacks.length
  const newCount = feedbacks.filter((f) => f.status === 'new').length
  const resolvedCount = feedbacks.filter((f) => f.status === 'resolved').length
  const inReviewCount = feedbacks.filter((f) => f.status === 'in_review').length
  
  const ratingsList = feedbacks.map((f) => f.rating).filter((r): r is number => typeof r === 'number' && r > 0)
  const avgRating = ratingsList.length > 0
    ? (ratingsList.reduce((a, b) => a + b, 0) / ratingsList.length).toFixed(1)
    : 'N/A'

  // Filtered List
  const filteredList = feedbacks.filter((item) => {
    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchesCandidate = item.candidateName.toLowerCase().includes(q) || item.candidateEmail.toLowerCase().includes(q)
      const matchesTitle = item.title ? item.title.toLowerCase().includes(q) : false
      const matchesMessage = item.message.toLowerCase().includes(q)
      if (!matchesCandidate && !matchesTitle && !matchesMessage) return false
    }

    // Type
    if (typeFilter !== 'all' && item.type !== typeFilter) return false

    // Status
    if (statusFilter !== 'all' && item.status !== statusFilter) return false

    // Rating
    if (ratingFilter !== 'all') {
      if (ratingFilter === '5' && item.rating !== 5) return false
      if (ratingFilter === '4' && item.rating !== 4) return false
      if (ratingFilter === '3' && item.rating !== 3) return false
      if (ratingFilter === 'low' && (item.rating === null || item.rating > 2)) return false
    }

    return true
  })

  const openReviewModal = (item: FeedbackWithCandidate) => {
    setSelectedFeedback(item)
    setAdminNotes(item.admin_notes || '')
    setTargetStatus(item.status)
  }

  const handleSaveStatusAndNotes = () => {
    if (!selectedFeedback) return
    setErrorMsg(null)

    startTransition(async () => {
      const res = await updateFeedbackStatusAction(selectedFeedback.id, targetStatus, adminNotes)
      if (res?.error) {
        setErrorMsg(res.error)
      } else {
        setSuccessMsg('Feedback updated successfully.')
        setSelectedFeedback(null)
      }
    })
  }

  const handleDeleteFeedback = (id: string) => {
    setErrorMsg(null)
    setDeleteConfirmId(null)

    startTransition(async () => {
      const res = await deleteFeedbackAction(id)
      if (res?.error) {
        setErrorMsg(res.error)
      } else {
        setSuccessMsg('Feedback deleted.')
        if (selectedFeedback?.id === id) {
          setSelectedFeedback(null)
        }
      }
    })
  }

  return (
    <div className="flex flex-col gap-2.5 sm:gap-6 w-full pb-16">
      {/* DEDICATED PURPOSE-BUILT MOBILE VIEW (< 768px) */}
      <div className="md:hidden">
        <MobileAdminFeedback
          feedbacks={feedbacks}
          onOpenReview={(f) => openReviewModal(f)}
          onDeleteConfirm={(id) => setDeleteConfirmId(id)}
        />
      </div>

      {/* DESKTOP VIEW (>= 768px) - 100% UNTOUCHED ORIGINAL LAYOUT */}
      <div className="hidden md:flex flex-col gap-6">
        {/* Top Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
              Worker Feedback & Sentiments
            </h1>
            <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
              Monitor shift satisfaction, address candidate suggestions, and resolve workplace concerns.
            </p>
          </div>
        </div>


      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card variant="elevated" className="p-4 border border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Total Feedbacks
            </span>
            <div className="w-8 h-8 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black mt-2">{totalSubmissions}</p>
          <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Across all categories
          </p>
        </Card>

        <Card variant="elevated" className="p-4 border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Avg Satisfaction
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <p className="text-2xl font-black text-amber-700 dark:text-amber-300">{avgRating}</p>
            {avgRating !== 'N/A' && <span className="text-xs font-semibold text-amber-600">/ 5.0</span>}
          </div>
          <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
            From {ratingsList.length} rated entries
          </p>
        </Card>

        <Card variant="elevated" className="p-4 border border-blue-500/30 bg-blue-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Needs Attention
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-2">{newCount + inReviewCount}</p>
          <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
            {newCount} new, {inReviewCount} in review
          </p>
        </Card>

        <Card variant="elevated" className="p-4 border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Resolved Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-2">
            {totalSubmissions > 0 ? `${Math.round((resolvedCount / totalSubmissions) * 100)}%` : '100%'}
          </p>
          <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
            {resolvedCount} marked resolved
          </p>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card variant="outlined" className="p-4 flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]" />
            <input
              type="text"
              placeholder="Search candidate, title, message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] text-xs border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)]"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] text-xs border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="shift_feedback">🕒 Shift Moods</option>
            <option value="suggestion">💡 Suggestions</option>
            <option value="bug">🐛 Bug Reports</option>
            <option value="workplace">🏢 Workplace</option>
            <option value="general">💬 General</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] text-xs border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="new">🔵 New (Needs Action)</option>
            <option value="in_review">🟡 In Review</option>
            <option value="resolved">🟢 Resolved</option>
            <option value="dismissed">⚪ Dismissed</option>
          </select>

          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] text-xs border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
          >
            <option value="all">All Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
            <option value="4">⭐⭐⭐⭐ 4 Stars</option>
            <option value="3">⭐⭐⭐ 3 Stars</option>
            <option value="low">⚠️ 1 - 2 Stars (Needs Attention)</option>
          </select>
        </div>
      </Card>

      {/* Feedbacks List Table / Cards */}
      {filteredList.length === 0 ? (
        <Card variant="outlined" className="py-16 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)]">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
            No feedback found
          </h3>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-xs">
            {feedbacks.length === 0
              ? 'No feedback entries have been submitted yet.'
              : 'Try changing your search or filter criteria.'}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredList.map((item) => {
            const cat = CATEGORY_MAP[item.type] || CATEGORY_MAP.general
            const Icon = cat.icon
            const statusStyle = STATUS_MAP[item.status] || STATUS_MAP.new
            const moodText = item.mood ? MOOD_EMOJIS[item.mood] || item.mood : null

            return (
              <Card
                key={item.id}
                variant="elevated"
                className={`border transition-all p-5 ${
                  item.status === 'new'
                    ? 'border-blue-500/40 bg-blue-500/[0.02]'
                    : 'border-[var(--md-sys-color-outline-variant)]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left Main Content */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Candidate Avatar */}
                    {item.candidateAvatarUrl ? (
                      <img
                        src={item.candidateAvatarUrl}
                        alt={item.candidateName}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-[var(--md-sys-color-outline-variant)]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0 font-bold text-xs">
                        {item.candidateName.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      {/* Name & Date Row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
                          {item.candidateName}
                        </span>
                        <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                          ({item.candidateEmail})
                        </span>
                        <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] ml-auto sm:ml-0">
                          • {new Date(item.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Category, Rating, Mood Badges */}
                      <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cat.badge}`}>
                          <Icon className="w-3 h-3" />
                          {cat.label}
                        </span>

                        {item.rating && (
                          <div className="flex items-center gap-0.5 text-amber-500 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10">
                            {[...Array(item.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                            <span className="ml-1 text-[11px]">{item.rating}/5</span>
                          </div>
                        )}

                        {moodText && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-highest)]">
                            {moodText}
                          </span>
                        )}

                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.text}`}>
                          {statusStyle.label}
                        </span>
                      </div>

                      {/* Subject / Title */}
                      {item.title && (
                        <h4 className="text-sm font-bold text-[var(--md-sys-color-on-surface)] mt-1">
                          {item.title}
                        </h4>
                      )}

                      {/* Message */}
                      <p className="text-xs leading-relaxed text-[var(--md-sys-color-on-surface)] whitespace-pre-wrap mt-0.5">
                        {item.message}
                      </p>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Admin Notes / Reply */}
                      {item.admin_notes && (
                        <div className="mt-2 p-2.5 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex items-start gap-2">
                          <MessageCircle className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)] shrink-0 mt-0.5" />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold text-[var(--md-sys-color-primary)] uppercase tracking-wider">
                              Admin Notes:
                            </span>
                            <p className="text-xs text-[var(--md-sys-color-on-surface)]">
                              {item.admin_notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center sm:flex-col gap-2 shrink-0 self-end sm:self-start pt-2 sm:pt-0">
                    <Button
                      variant="filled"
                      size="sm"
                      onClick={() => openReviewModal(item)}
                      className="text-xs whitespace-nowrap"
                    >
                      Review & Reply
                    </Button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete Feedback"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>

      {/* Review & Reply Modal */}

      {selectedFeedback && (
        <Dialog
          isOpen={!!selectedFeedback}
          title="Review Feedback"
          onClose={() => !isPending && setSelectedFeedback(null)}
        >
          <div className="flex flex-col gap-4 pt-1">
            {/* Worker Summary */}
            <div className="p-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] flex items-center gap-3">
              {selectedFeedback.candidateAvatarUrl ? (
                <img
                  src={selectedFeedback.candidateAvatarUrl}
                  alt={selectedFeedback.candidateName}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center font-bold text-xs shrink-0">
                  {selectedFeedback.candidateName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] truncate">
                  {selectedFeedback.candidateName}
                </span>
                <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] truncate">
                  {selectedFeedback.candidateEmail}
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
                  {selectedFeedback.type.replace('_', ' ')}
                </span>
                {selectedFeedback.rating && (
                  <span className="text-xs font-semibold text-amber-500">
                    ⭐ {selectedFeedback.rating} / 5
                  </span>
                )}
              </div>

              {selectedFeedback.title && (
                <h4 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
                  {selectedFeedback.title}
                </h4>
              )}

              <p className="text-xs text-[var(--md-sys-color-on-surface)] whitespace-pre-wrap">
                {selectedFeedback.message}
              </p>
            </div>

            {/* Status Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">
                Update Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['new', 'in_review', 'resolved', 'dismissed'] as const).map((st) => {
                  const isSelected = targetStatus === st
                  const style = STATUS_MAP[st]
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTargetStatus(st)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? `${style.bg} ${style.text} border-current shadow-xs`
                          : 'border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)]'
                      }`}
                    >
                      {style.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Admin Response / Notes Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-reply-notes" className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">
                Admin Response / Resolution Remarks
              </label>
              <textarea
                id="admin-reply-notes"
                rows={3}
                placeholder="Write resolution notes (visible to the candidate if resolved)..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] text-xs text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] focus:outline-none focus:border-[var(--md-sys-color-primary)] resize-none"
              />
            </div>

            {/* Dialog Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(selectedFeedback.id)}
                className="text-xs text-red-500 hover:underline cursor-pointer"
              >
                Delete Feedback
              </button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outlined"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setSelectedFeedback(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="filled"
                  size="sm"
                  isLoading={isPending}
                  onClick={handleSaveStatusAndNotes}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!deleteConfirmId}
        title="Delete Feedback?"
        description="Are you sure you want to delete this feedback? This action cannot be undone."
        confirmLabel="Delete"
        variant="error"
        isLoading={isPending}
        onConfirm={() => deleteConfirmId && handleDeleteFeedback(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
      />

      <Snackbar message={errorMsg} variant="error" onClose={() => setErrorMsg(null)} />
      <Snackbar message={successMsg} variant="success" onClose={() => setSuccessMsg(null)} />
    </div>
  )
}
