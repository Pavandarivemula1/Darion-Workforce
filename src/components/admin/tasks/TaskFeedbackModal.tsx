'use client'

import React, { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import {
  submitAdminTaskFeedbackAction,
  updateTaskStatusAction,
  deleteTaskAction,
} from '@/app/actions/tasks'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  Tag,
  User,
  Trash2,
  Calendar,
  Hourglass,
  AlertCircle,
  MessageSquare,
} from 'lucide-react'

export interface AdminTaskItem {
  id: string
  user_id: string
  candidate_name: string
  candidate_avatar?: string | null
  candidate_email?: string | null
  attendance_id?: string | null
  task_date: string
  title: string
  description?: string | null
  project_name: string
  status: 'completed' | 'in_progress' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  hours_spent: number
  proof_url?: string | null
  blocker_description?: string | null
  admin_feedback?: string | null
  created_at: string
  updated_at: string
}

export interface TaskFeedbackModalProps {
  isOpen: boolean
  task: AdminTaskItem | null
  onClose: () => void
  onSuccess?: () => void
}

const STATUS_CONFIG = {
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    badgeBg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  },
  blocked: {
    label: 'Blocked',
    icon: AlertTriangle,
    badgeBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  },
}

export const TaskFeedbackModal: React.FC<TaskFeedbackModalProps> = ({
  isOpen,
  task,
  onClose,
  onSuccess,
}) => {
  if (!task) return null

  const [feedback, setFeedback] = useState(task.admin_feedback || '')
  const [selectedStatus, setSelectedStatus] = useState<'completed' | 'in_progress' | 'blocked'>(task.status)
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const statusObj = STATUS_CONFIG[selectedStatus] || STATUS_CONFIG.completed
  const StatusIcon = statusObj.icon

  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setErrorMessage(null)

    try {
      // 1. If status changed, update status
      if (selectedStatus !== task.status) {
        const res = await updateTaskStatusAction(task.id, selectedStatus)
        if (res.error) {
          setErrorMessage(res.error)
          setIsPending(false)
          return
        }
      }

      // 2. Update feedback
      const fbRes = await submitAdminTaskFeedbackAction(task.id, feedback)
      if (fbRes.error) {
        setErrorMessage(fbRes.error)
      } else {
        onClose()
        if (onSuccess) onSuccess()
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save review feedback.')
    } finally {
      setIsPending(false)
    }
  }

  const handleDelete = async () => {
    setIsPending(true)
    setErrorMessage(null)
    try {
      const res = await deleteTaskAction(task.id)
      if (res.error) {
        setErrorMessage(res.error)
      } else {
        setShowDeleteConfirm(false)
        onClose()
        if (onSuccess) onSuccess()
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete task.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      title="Task Review & Feedback"
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 pt-1">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Candidate Info Header */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-center gap-3 min-w-0">
            {task.candidate_avatar ? (
              <img
                src={task.candidate_avatar}
                alt={task.candidate_name}
                className="w-10 h-10 rounded-full object-cover border border-[var(--md-sys-color-outline-variant)]"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold text-sm flex items-center justify-center">
                {task.candidate_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-[var(--md-sys-color-on-surface)] truncate">
                {task.candidate_name}
              </h4>
              <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {task.task_date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Hourglass className="w-3 h-3" />
                  {Number(task.hours_spent || 0).toFixed(1)} hrs
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {task.project_name}
            </span>
          </div>
        </div>

        {/* Task Details Card */}
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-[var(--md-sys-color-on-surface)]">
              {task.title}
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 shrink-0 ${statusObj.badgeBg}`}>
              <StatusIcon className="w-3 h-3" />
              {statusObj.label}
            </span>
          </div>

          {task.description && (
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] whitespace-pre-wrap leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Proof URL */}
          {task.proof_url && (
            <div className="pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
              <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] block mb-1">
                Deliverable / Proof Link:
              </span>
              <a
                href={task.proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--md-sys-color-primary)] hover:underline truncate max-w-full"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{task.proof_url}</span>
              </a>
            </div>
          )}

          {/* Blocker Callout */}
          {task.status === 'blocked' && task.blocker_description && (
            <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-start gap-2.5 mt-1">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
                  Reported Blocker / Issue:
                </p>
                <p className="text-xs text-rose-900 dark:text-rose-200 mt-0.5">
                  {task.blocker_description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Form: Status Modifier & Admin Notes */}
        <form onSubmit={handleSaveFeedback} className="flex flex-col gap-3">
          {/* Status Override */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">
              Update Status / Resolution
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['completed', 'in_progress', 'blocked'] as const).map((st) => {
                const conf = STATUS_CONFIG[st]
                const Icon = conf.icon
                const isSelected = selectedStatus === st
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? st === 'completed'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : st === 'in_progress'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {conf.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Admin Feedback Box */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
              Manager Review & Guidance Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Reviewed PR, looks great! Or: Blocker resolved, API keys sent in Slack."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface)] focus:outline-none focus:border-[var(--md-sys-color-primary)]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Task
            </button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="text"
                size="sm"
                disabled={isPending}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="filled"
                size="sm"
                isLoading={isPending}
              >
                Save Review Notes
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Dialog
          isOpen={true}
          title="Delete Candidate Task?"
          onClose={() => setShowDeleteConfirm(false)}
        >
          <div className="flex flex-col gap-4 pt-1">
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
              Are you sure you want to permanently delete this task report entry?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
              <Button
                variant="text"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                size="sm"
                isLoading={isPending}
                onClick={handleDelete}
                className="!bg-rose-600 hover:!bg-rose-700 !text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </Dialog>
  )
}
