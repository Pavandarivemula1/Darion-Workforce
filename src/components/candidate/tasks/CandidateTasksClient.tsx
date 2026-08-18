'use client'

import React, { useState, useTransition } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Snackbar } from '@/components/ui/Snackbar'
import { TaskEntryModal, TaskRecord } from './TaskEntryModal'
import { deleteTaskAction, updateTaskStatusAction } from '@/app/actions/tasks'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Edit2,
  Trash2,
  MessageSquare,
  Tag,
  AlertCircle,
  Hourglass,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { getKolkataDateKey } from '@/lib/utils/timesheet'

export interface CandidateTasksClientProps {
  initialTasks: TaskRecord[]
  candidateName?: string
  activeAttendanceId?: string | null
  todayAttendanceHours?: number
}

const STATUS_MAP = {
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

const PRIORITY_MAP = {
  low: { label: 'Low', color: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400' },
  medium: { label: 'Medium', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  high: { label: 'High', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  urgent: { label: 'Urgent', color: 'bg-rose-500/10 text-rose-700 dark:text-rose-300' },
}

export const CandidateTasksClient: React.FC<CandidateTasksClientProps> = ({
  initialTasks,
  candidateName,
  activeAttendanceId,
  todayAttendanceHours = 0,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    getKolkataDateKey(new Date().toISOString())
  )
  const [tasks, setTasks] = useState<TaskRecord[]>(initialTasks)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<TaskRecord | null>(null)
  const [filterProject, setFilterProject] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; isError?: boolean }>({
    open: false,
    message: '',
  })

  const [isPending, startTransition] = useTransition()

  // Filter tasks for selected date
  const dateTasks = tasks.filter((t) => t.task_date === selectedDate)

  // Filtered by project / status dropdowns
  const displayedTasks = dateTasks.filter((t) => {
    if (filterProject !== 'all' && t.project_name !== filterProject) return false
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    return true
  })

  // Date metrics
  const totalHoursLogged = dateTasks.reduce((acc, t) => acc + Number(t.hours_spent || 0), 0)
  const completedCount = dateTasks.filter((t) => t.status === 'completed').length
  const inProgressCount = dateTasks.filter((t) => t.status === 'in_progress').length
  const blockedCount = dateTasks.filter((t) => t.status === 'blocked').length

  // Unique projects in selected date
  const uniqueProjects = Array.from(new Set(dateTasks.map((t) => t.project_name)))

  // Quick Date Navigation
  const changeDateByDays = (days: number) => {
    const cur = new Date(selectedDate)
    cur.setDate(cur.getDate() + days)
    setSelectedDate(cur.toISOString().split('T')[0])
  }

  const isToday = selectedDate === getKolkataDateKey(new Date().toISOString())

  const handleOpenAdd = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (task: TaskRecord) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleQuickStatusChange = (taskId: string, newStatus: 'completed' | 'in_progress' | 'blocked') => {
    startTransition(async () => {
      const res = await updateTaskStatusAction(taskId, newStatus)
      if (res.error) {
        setSnackbar({ open: true, message: res.error, isError: true })
      } else {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        )
        setSnackbar({ open: true, message: `Task status updated to ${newStatus}.` })
      }
    })
  }

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return
    startTransition(async () => {
      const res = await deleteTaskAction(taskToDelete.id)
      if (res.error) {
        setSnackbar({ open: true, message: res.error, isError: true })
      } else {
        setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id))
        setSnackbar({ open: true, message: 'Task deleted successfully.' })
        setTaskToDelete(null)
      }
    })
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6 animate-fade-in">
      {/* Top Header Card & Date Navigation Bar */}
      <Card variant="elevated" className="border border-[var(--md-sys-color-outline-variant)] p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Title & Date Controls */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
                Daily Task Log
              </span>
              {isToday && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                  Today
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeDateByDays(-1)}
                className="p-1.5 rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] active:scale-95 transition-all cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4 text-[var(--md-sys-color-on-surface)]" />
              </button>

              <div className="relative flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-9 px-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] text-xs font-bold text-[var(--md-sys-color-on-surface)] focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => changeDateByDays(1)}
                className="p-1.5 rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] active:scale-95 transition-all cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4 text-[var(--md-sys-color-on-surface)]" />
              </button>

              {!isToday && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(getKolkataDateKey(new Date().toISOString()))}
                  className="text-xs font-bold text-[var(--md-sys-color-primary)] hover:underline ml-1 cursor-pointer"
                >
                  Jump to Today
                </button>
              )}
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-2">
            <Button
              variant="filled"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleOpenAdd}
              className="w-full sm:w-auto shadow-xs"
            >
              Log Daily Task
            </Button>
          </div>
        </div>
      </Card>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Completed Tasks */}
        <Card variant="outlined" className="p-4 border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Completed
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
              {completedCount}
            </span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block">
              Tasks finished
            </span>
          </div>
        </Card>

        {/* Card 2: In Progress */}
        <Card variant="outlined" className="p-4 border border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
              In Progress
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-blue-700 dark:text-blue-300">
              {inProgressCount}
            </span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block">
              Active tasks
            </span>
          </div>
        </Card>

        {/* Card 3: Blockers */}
        <Card variant="outlined" className={`p-4 border ${blockedCount > 0 ? 'border-rose-500/30 bg-rose-500/10' : 'border-[var(--md-sys-color-outline-variant)]'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
              Blockers
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-rose-700 dark:text-rose-300">
              {blockedCount}
            </span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block">
              Needs manager input
            </span>
          </div>
        </Card>

        {/* Card 4: Hours Logged */}
        <Card variant="outlined" className="p-4 border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Task Hours Logged
            </span>
            <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-[var(--md-sys-color-on-surface)]">
              {totalHoursLogged.toFixed(1)}h
            </span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block">
              Across {dateTasks.length} {dateTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
        </Card>
      </div>

      {/* Filter / Filter Chips Bar */}
      {dateTasks.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] mr-1">
              Filter by:
            </span>
            {/* Status filters */}
            {(['all', 'completed', 'in_progress', 'blocked'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  filterStatus === st
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-[var(--md-sys-color-primary)] shadow-2xs'
                    : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                }`}
              >
                {st === 'all' ? 'All Status' : st === 'in_progress' ? 'In Progress' : st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>

          {/* Project dropdown */}
          {uniqueProjects.length > 1 && (
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="h-8 px-2.5 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface)] focus:outline-none"
            >
              <option value="all">All Projects ({dateTasks.length})</option>
              {uniqueProjects.map((proj) => (
                <option key={proj} value={proj}>
                  {proj}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Task List / Empty State */}
      {displayedTasks.length > 0 ? (
        <div className="flex flex-col gap-3">
          {displayedTasks.map((task) => {
            const statusConfig = STATUS_MAP[task.status] || STATUS_MAP.completed
            const StatusIcon = statusConfig.icon
            const priorityConfig = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium

            return (
              <Card
                key={task.id}
                variant="elevated"
                className="p-4 sm:p-5 border border-[var(--md-sys-color-outline-variant)] shadow-2xs hover:shadow-xs transition-all flex flex-col gap-3"
              >
                {/* Header: Project, Priority, Status, Hours */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Project Tag */}
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {task.project_name}
                    </span>

                    {/* Priority Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${priorityConfig.color}`}>
                      {priorityConfig.label} Priority
                    </span>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusConfig.badgeBg}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Hours & Actions */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)]">
                      {Number(task.hours_spent || 0).toFixed(1)} hrs
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(task)}
                      className="p-1.5 rounded-lg text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)] active:scale-95 transition-all cursor-pointer"
                      title="Edit Task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setTaskToDelete(task)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-500/10 active:scale-95 transition-all cursor-pointer"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Task Title & Description */}
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-[var(--md-sys-color-on-surface)] leading-snug">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1.5 whitespace-pre-wrap leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Blocker Callout if Blocked */}
                {task.status === 'blocked' && task.blocker_description && (
                  <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
                        Roadblock / Impediment:
                      </p>
                      <p className="text-xs text-rose-900 dark:text-rose-200 mt-0.5">
                        {task.blocker_description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Admin Feedback Callout if Present */}
                {task.admin_feedback && (
                  <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-start gap-2.5">
                    <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-blue-800 dark:text-blue-300">
                        Manager Feedback:
                      </p>
                      <p className="text-xs text-blue-900 dark:text-blue-200 mt-0.5">
                        {task.admin_feedback}
                      </p>
                    </div>
                  </div>
                )}

                {/* Footer: Proof Link & Quick Status Toggles */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                  {task.proof_url ? (
                    <a
                      href={task.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--md-sys-color-primary)] hover:underline truncate max-w-[280px] sm:max-w-md"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{task.proof_url}</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] italic">
                      No proof URL attached
                    </span>
                  )}

                  {/* Quick Status Shift */}
                  <div className="flex items-center gap-1.5">
                    {task.status !== 'completed' && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(task.id, 'completed')}
                        className="text-[11px] font-semibold px-2 py-1 rounded-lg text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Mark Completed
                      </button>
                    )}
                    {task.status !== 'in_progress' && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(task.id, 'in_progress')}
                        className="text-[11px] font-semibold px-2 py-1 rounded-lg text-blue-700 dark:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Clock className="w-3 h-3" />
                        In Progress
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <Card variant="outlined" className="py-12 px-4 border border-[var(--md-sys-color-outline-variant)] flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">
              No tasks logged for {selectedDate}
            </h3>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-sm mt-1">
              Record what you worked on, milestones achieved, time spent, and any blockers so your team stays aligned.
            </p>
          </div>
          <Button
            variant="filled"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
            className="mt-2"
          >
            Log First Task for this Date
          </Button>
        </Card>
      )}

      {/* Task Modal (Create / Edit) */}
      <TaskEntryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
        }}
        initialData={editingTask}
        defaultDate={selectedDate}
        attendanceId={activeAttendanceId}
        onSuccess={() => {
          setSnackbar({
            open: true,
            message: editingTask ? 'Task updated successfully!' : 'Daily task reported successfully!',
          })
          window.location.reload()
        }}
      />

      {/* Delete Confirmation Dialog */}
      {taskToDelete && (
        <Dialog
          isOpen={true}
          title="Delete Task Report"
          onClose={() => setTaskToDelete(null)}
        >
          <div className="flex flex-col gap-4 pt-1">
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
              Are you sure you want to delete <strong className="text-[var(--md-sys-color-on-surface)]">&quot;{taskToDelete.title}&quot;</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
              <Button
                variant="text"
                size="sm"
                onClick={() => setTaskToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                size="sm"
                isLoading={isPending}
                onClick={handleDeleteConfirm}
                className="!bg-rose-600 hover:!bg-rose-700 !text-white"
              >
                Delete Task
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Feedback Snackbar */}
      <Snackbar
        message={snackbar.open ? snackbar.message : null}
        variant={snackbar.isError ? 'error' : 'success'}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </div>
  )
}
