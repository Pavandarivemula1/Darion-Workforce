'use client'

import React, { useState, useEffect } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { createTaskAction, updateTaskAction } from '@/app/actions/tasks'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Link as LinkIcon,
  Tag,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

export interface TaskRecord {
  id: string
  user_id: string
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

export interface TaskEntryModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: TaskRecord | null
  defaultDate?: string
  attendanceId?: string | null
  onSuccess?: () => void
}

const COMMON_PROJECTS = [
  'Frontend',
  'Backend',
  'Bugfix',
  'UI/UX Design',
  'QA & Testing',
  'Database',
  'Documentation',
  'Code Review',
]

const STATUS_OPTIONS = [
  {
    id: 'completed',
    label: 'Completed',
    desc: 'Work finished today',
    icon: CheckCircle2,
    color: 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    activeColor: 'bg-emerald-600 text-white border-emerald-600 shadow-xs',
  },
  {
    id: 'in_progress',
    label: 'In Progress',
    desc: 'Still working on this',
    icon: Clock,
    color: 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300',
    activeColor: 'bg-blue-600 text-white border-blue-600 shadow-xs',
  },
  {
    id: 'blocked',
    label: 'Blocked',
    desc: 'Need help / roadblock',
    icon: AlertTriangle,
    color: 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    activeColor: 'bg-rose-600 text-white border-rose-600 shadow-xs',
  },
] as const

const PRIORITY_OPTIONS = [
  { id: 'low', label: 'Low', color: 'text-zinc-600 dark:text-zinc-400' },
  { id: 'medium', label: 'Medium', color: 'text-blue-600 dark:text-blue-400' },
  { id: 'high', label: 'High', color: 'text-amber-600 dark:text-amber-400' },
  { id: 'urgent', label: 'Urgent', color: 'text-rose-600 dark:text-rose-400' },
] as const

const QUICK_HOURS = [0.5, 1, 2, 3, 4, 6, 8]

export const TaskEntryModal: React.FC<TaskEntryModalProps> = ({
  isOpen,
  onClose,
  initialData,
  defaultDate,
  attendanceId,
  onSuccess,
}) => {
  const isEditing = !!initialData

  const [title, setTitle] = useState('')
  const [projectName, setProjectName] = useState('Frontend')
  const [customProject, setCustomProject] = useState('')
  const [isCustomProject, setIsCustomProject] = useState(false)
  const [status, setStatus] = useState<'completed' | 'in_progress' | 'blocked'>('completed')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [hoursSpent, setHoursSpent] = useState<number>(2)
  const [proofUrl, setProofUrl] = useState('')
  const [description, setDescription] = useState('')
  const [blockerDescription, setBlockerDescription] = useState('')
  const [taskDate, setTaskDate] = useState('')

  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      if (COMMON_PROJECTS.includes(initialData.project_name)) {
        setProjectName(initialData.project_name)
        setIsCustomProject(false)
        setCustomProject('')
      } else {
        setIsCustomProject(true)
        setCustomProject(initialData.project_name || '')
      }
      setStatus(initialData.status || 'completed')
      setPriority(initialData.priority || 'medium')
      setHoursSpent(Number(initialData.hours_spent || 0))
      setProofUrl(initialData.proof_url || '')
      setDescription(initialData.description || '')
      setBlockerDescription(initialData.blocker_description || '')
      setTaskDate(initialData.task_date)
    } else {
      setTitle('')
      setProjectName('Frontend')
      setIsCustomProject(false)
      setCustomProject('')
      setStatus('completed')
      setPriority('medium')
      setHoursSpent(2)
      setProofUrl('')
      setDescription('')
      setBlockerDescription('')
      setTaskDate(defaultDate || new Date().toISOString().split('T')[0])
    }
    setErrorMessage(null)
  }, [initialData, defaultDate, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setErrorMessage('Please enter a task title.')
      return
    }

    const resolvedProject = isCustomProject ? customProject.trim() || 'General' : projectName

    setIsPending(true)
    setErrorMessage(null)

    try {
      if (isEditing && initialData) {
        const res = await updateTaskAction(initialData.id, {
          title: title.trim(),
          project_name: resolvedProject,
          status,
          priority,
          hours_spent: hoursSpent,
          proof_url: proofUrl.trim() || undefined,
          description: description.trim() || undefined,
          blocker_description: status === 'blocked' ? blockerDescription.trim() : undefined,
          task_date: taskDate,
        })

        if (res.error) {
          setErrorMessage(res.error)
        } else {
          onClose()
          if (onSuccess) onSuccess()
        }
      } else {
        const res = await createTaskAction({
          title: title.trim(),
          project_name: resolvedProject,
          status,
          priority,
          hours_spent: hoursSpent,
          proof_url: proofUrl.trim() || undefined,
          description: description.trim() || undefined,
          blocker_description: status === 'blocked' ? blockerDescription.trim() : undefined,
          task_date: taskDate,
          attendance_id: attendanceId || null,
        })

        if (res.error) {
          setErrorMessage(res.error)
        } else {
          onClose()
          if (onSuccess) onSuccess()
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      title={isEditing ? 'Edit Daily Task' : 'Log Daily Task Report'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Task Title */}
        <div>
          <label className="text-xs font-bold text-[var(--md-sys-color-on-surface)] block mb-1">
            Task Summary / What did you work on? <span className="text-rose-500">*</span>
          </label>
          <TextField
            placeholder="e.g. Implemented responsive navigation menu in candidate portal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Project / Category Tag Picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[var(--md-sys-color-on-surface)] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
              Project / Category
            </span>
            <button
              type="button"
              onClick={() => setIsCustomProject(!isCustomProject)}
              className="text-[11px] font-semibold text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
            >
              {isCustomProject ? 'Pick standard project' : '+ Custom Project'}
            </button>
          </label>

          {isCustomProject ? (
            <TextField
              placeholder="Type custom project / module name"
              value={customProject}
              onChange={(e) => setCustomProject(e.target.value)}
            />
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {COMMON_PROJECTS.map((proj) => {
                const isSelected = projectName === proj && !isCustomProject
                return (
                  <button
                    key={proj}
                    type="button"
                    onClick={() => {
                      setProjectName(proj)
                      setIsCustomProject(false)
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold shadow-xs'
                        : 'border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                    }`}
                  >
                    {proj}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Status Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">
            Task Status <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon
              const isSelected = status === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStatus(opt.id as any)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all cursor-pointer text-center ${
                    isSelected ? opt.activeColor : `${opt.color} hover:opacity-80`
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1 shrink-0" />
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span className="text-[10px] opacity-80 line-clamp-1">{opt.desc}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Blocker Description if Blocked */}
        {status === 'blocked' && (
          <div className="p-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 flex flex-col gap-1.5 animate-fade-in">
            <label className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              What is blocking you? Describe the roadblock:
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Waiting on API credentials, merge conflicts in repo, unclear Figma specs..."
              value={blockerDescription}
              onChange={(e) => setBlockerDescription(e.target.value)}
              required={status === 'blocked'}
              className="w-full p-2.5 rounded-xl bg-[var(--md-sys-color-surface)] border border-rose-400 text-xs text-[var(--md-sys-color-on-surface)] focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        )}

        {/* Hours Spent & Priority Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Hours Spent */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">
              Hours Spent on this Task
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.25"
                min="0.1"
                max="24"
                value={hoursSpent}
                onChange={(e) => setHoursSpent(Math.max(0, Number(e.target.value)))}
                className="w-20 h-10 px-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] text-xs font-mono font-bold text-[var(--md-sys-color-on-surface)] focus:outline-none focus:border-[var(--md-sys-color-primary)]"
              />
              <div className="flex flex-wrap gap-1">
                {QUICK_HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHoursSpent(h)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                      hoursSpent === h
                        ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-[var(--md-sys-color-primary)]'
                        : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">
              Priority Level
            </label>
            <div className="grid grid-cols-4 gap-1">
              {PRIORITY_OPTIONS.map((p) => {
                const isSelected = priority === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id as any)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shadow-2xs'
                        : 'border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)]'
                    }`}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Proof / Work Deliverable Link */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
            Deliverable / Proof Link (Optional)
          </label>
          <TextField
            placeholder="https://github.com/pull/123 or Figma / Loom / Drive link"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
          />
        </div>

        {/* Detailed Notes / Bullet Points */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
            Details / Additional Notes (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Key accomplishments, files edited, edge cases tested, or next steps for tomorrow..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface)] focus:outline-none focus:border-[var(--md-sys-color-primary)]"
          />
        </div>

        {/* Date Selector */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-[var(--md-sys-color-on-surface-variant)] font-semibold">
            Task Date:
          </span>
          <input
            type="date"
            value={taskDate}
            onChange={(e) => setTaskDate(e.target.value)}
            className="h-8 px-2.5 rounded-lg bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface)] focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--md-sys-color-outline-variant)]">
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
            {isEditing ? 'Save Changes' : 'Submit Daily Task'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
