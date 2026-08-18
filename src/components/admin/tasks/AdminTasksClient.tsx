'use client'

import React, { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { TaskFeedbackModal, AdminTaskItem } from './TaskFeedbackModal'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Search,
  Download,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  Tag,
  MessageSquare,
  Hourglass,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  Eye,
  Check,
} from 'lucide-react'
import { getKolkataDateKey } from '@/lib/utils/timesheet'

export interface CandidateInfo {
  id: string
  full_name: string
  avatar_url?: string | null
  email?: string | null
  role: string
}

export interface AdminTasksClientProps {
  initialTasks: AdminTaskItem[]
  candidates: CandidateInfo[]
  activeShiftUserIds?: string[]
}

const STATUS_CONFIG = {
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    badgeBg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    color: 'text-blue-600 dark:text-blue-400',
  },
  blocked: {
    label: 'Blocked',
    icon: AlertTriangle,
    badgeBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    color: 'text-rose-600 dark:text-rose-400',
  },
}

export const AdminTasksClient: React.FC<AdminTasksClientProps> = ({
  initialTasks,
  candidates,
  activeShiftUserIds = [],
}) => {
  const [tasks, setTasks] = useState<AdminTaskItem[]>(initialTasks)
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    getKolkataDateKey(new Date().toISOString())
  )
  const [dateMode, setDateMode] = useState<'single' | 'all'>('single')
  const [selectedCandidate, setSelectedCandidate] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grouped' | 'table'>('grouped')

  // Selected task for feedback modal
  const [activeTaskForModal, setActiveTaskForModal] = useState<AdminTaskItem | null>(null)
  const [expandedCandidates, setExpandedCandidates] = useState<Record<string, boolean>>({})

  const todayKey = getKolkataDateKey(new Date().toISOString())
  const isToday = selectedDate === todayKey

  const changeDateByDays = (days: number) => {
    const cur = new Date(selectedDate)
    cur.setDate(cur.getDate() + days)
    setSelectedDate(cur.toISOString().split('T')[0])
  }

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (dateMode === 'single' && task.task_date !== selectedDate) return false
      if (selectedCandidate !== 'all' && task.user_id !== selectedCandidate) return false
      if (selectedStatus !== 'all' && task.status !== selectedStatus) return false
      if (selectedProject !== 'all' && task.project_name !== selectedProject) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = task.title.toLowerCase().includes(q)
        const matchDesc = task.description?.toLowerCase().includes(q)
        const matchCand = task.candidate_name.toLowerCase().includes(q)
        const matchProj = task.project_name.toLowerCase().includes(q)
        const matchBlocker = task.blocker_description?.toLowerCase().includes(q)
        if (!matchTitle && !matchDesc && !matchCand && !matchProj && !matchBlocker) {
          return false
        }
      }

      return true
    })
  }, [tasks, selectedDate, dateMode, selectedCandidate, selectedStatus, selectedProject, searchQuery])

  // Metric Computations based on current date scope
  const metrics = useMemo(() => {
    const scopeTasks = dateMode === 'single'
      ? tasks.filter((t) => t.task_date === selectedDate)
      : tasks

    const completed = scopeTasks.filter((t) => t.status === 'completed').length
    const inProgress = scopeTasks.filter((t) => t.status === 'in_progress').length
    const blocked = scopeTasks.filter((t) => t.status === 'blocked').length
    const totalHours = scopeTasks.reduce((acc, t) => acc + Number(t.hours_spent || 0), 0)

    // Distinct reporting candidates
    const reportingCandidateIds = new Set(scopeTasks.map((t) => t.user_id))

    return {
      completed,
      inProgress,
      blocked,
      totalHours,
      reportingCount: reportingCandidateIds.size,
      totalCandidates: candidates.length,
    }
  }, [tasks, selectedDate, dateMode, candidates])

  // Unique project names for dropdown
  const uniqueProjects = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.project_name))).filter(Boolean)
  }, [tasks])

  // Group filtered tasks by candidate
  const candidateGroups = useMemo(() => {
    const map = new Map<string, { candidate: CandidateInfo; tasks: AdminTaskItem[]; totalHours: number }>()

    // Initialize all candidate slots if filtering for single date and no candidate filter applied
    if (selectedCandidate === 'all') {
      candidates.forEach((cand) => {
        map.set(cand.id, { candidate: cand, tasks: [], totalHours: 0 })
      })
    } else {
      const cand = candidates.find((c) => c.id === selectedCandidate)
      if (cand) {
        map.set(cand.id, { candidate: cand, tasks: [], totalHours: 0 })
      }
    }

    // Populate tasks
    filteredTasks.forEach((t) => {
      let group = map.get(t.user_id)
      if (!group) {
        const cand = candidates.find((c) => c.id === t.user_id) || {
          id: t.user_id,
          full_name: t.candidate_name,
          avatar_url: t.candidate_avatar,
          email: t.candidate_email,
          role: 'candidate',
        }
        group = { candidate: cand, tasks: [], totalHours: 0 }
        map.set(t.user_id, group)
      }
      group.tasks.push(t)
      group.totalHours += Number(t.hours_spent || 0)
    })

    return Array.from(map.values())
  }, [filteredTasks, candidates, selectedCandidate])

  // Toggle candidate accordion
  const toggleCandidateExpand = (candidateId: string) => {
    setExpandedCandidates((prev) => ({
      ...prev,
      [candidateId]: prev[candidateId] === undefined ? false : !prev[candidateId],
    }))
  }

  // CSV Export Handler
  const exportToCSV = () => {
    if (filteredTasks.length === 0) return

    const headers = [
      'Task ID',
      'Candidate Name',
      'Date',
      'Project',
      'Task Title',
      'Status',
      'Priority',
      'Hours Spent',
      'Proof URL',
      'Blocker Details',
      'Admin Feedback',
      'Logged At',
    ]

    const rows = filteredTasks.map((t) => [
      `"${t.id}"`,
      `"${t.candidate_name.replace(/"/g, '""')}"`,
      `"${t.task_date}"`,
      `"${t.project_name.replace(/"/g, '""')}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.status}"`,
      `"${t.priority}"`,
      t.hours_spent,
      `"${(t.proof_url || '').replace(/"/g, '""')}"`,
      `"${(t.blocker_description || '').replace(/"/g, '""')}"`,
      `"${(t.admin_feedback || '').replace(/"/g, '""')}"`,
      `"${t.created_at}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `daily_task_reports_${dateMode === 'single' ? selectedDate : 'all'}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Header Card with Date Bar & Export */}
      <Card variant="elevated" className="border border-[var(--md-sys-color-outline-variant)] p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Title & Date Selector */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
                Workforce Daily Task Reports
              </span>
              <div className="flex items-center rounded-lg bg-[var(--md-sys-color-surface-container)] p-0.5 border border-[var(--md-sys-color-outline-variant)]">
                <button
                  type="button"
                  onClick={() => setDateMode('single')}
                  className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    dateMode === 'single'
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-2xs'
                      : 'text-[var(--md-sys-color-on-surface-variant)]'
                  }`}
                >
                  By Date
                </button>
                <button
                  type="button"
                  onClick={() => setDateMode('all')}
                  className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    dateMode === 'all'
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-2xs'
                      : 'text-[var(--md-sys-color-on-surface-variant)]'
                  }`}
                >
                  All Dates
                </button>
              </div>
            </div>

            {dateMode === 'single' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeDateByDays(-1)}
                  className="p-1.5 rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] active:scale-95 transition-all cursor-pointer"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4 text-[var(--md-sys-color-on-surface)]" />
                </button>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-9 px-3 rounded-xl bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] text-xs font-bold text-[var(--md-sys-color-on-surface)] focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
                />

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
                    onClick={() => setSelectedDate(todayKey)}
                    className="text-xs font-bold text-[var(--md-sys-color-primary)] hover:underline ml-1 cursor-pointer"
                  >
                    Jump to Today
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: View Mode Toggle & CSV Export */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Switcher */}
            <div className="flex items-center rounded-xl bg-[var(--md-sys-color-surface-container)] p-1 border border-[var(--md-sys-color-outline-variant)]">
              <button
                type="button"
                onClick={() => setViewMode('grouped')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'grouped'
                    ? 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-primary)] shadow-xs'
                    : 'text-[var(--md-sys-color-on-surface-variant)]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                By Candidate
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-primary)] shadow-xs'
                    : 'text-[var(--md-sys-color-on-surface-variant)]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                List / Table
              </button>
            </div>

            {/* CSV Export Button */}
            <Button
              variant="outlined"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={exportToCSV}
              disabled={filteredTasks.length === 0}
            >
              Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Completed Tasks */}
        <Card variant="outlined" className="p-4 border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Completed
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
              {metrics.completed}
            </span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block">
              Finished tasks
            </span>
          </div>
        </Card>

        {/* Card 2: In Progress */}
        <Card variant="outlined" className="p-4 border border-blue-500/30 bg-blue-500/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
              In Progress
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-blue-700 dark:text-blue-300">
              {metrics.inProgress}
            </span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block">
              Ongoing tasks
            </span>
          </div>
        </Card>

        {/* Card 3: Active Blockers */}
        <Card
          variant="outlined"
          className={`p-4 border ${
            metrics.blocked > 0
              ? 'border-rose-500/40 bg-rose-500/10 shadow-xs ring-1 ring-rose-500/20'
              : 'border-[var(--md-sys-color-outline-variant)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              {metrics.blocked > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
              Blockers
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-rose-700 dark:text-rose-300">
              {metrics.blocked}
            </span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block">
              Needs intervention
            </span>
          </div>
        </Card>

        {/* Card 4: Submission Coverage */}
        <Card variant="outlined" className="p-4 border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Reporting Rate
            </span>
            <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[var(--md-sys-color-on-surface)]">
              {metrics.reportingCount}
              <span className="text-sm font-normal text-[var(--md-sys-color-on-surface-variant)] font-sans">
                /{metrics.totalCandidates}
              </span>
            </span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block">
              Candidates reported
            </span>
          </div>
        </Card>

        {/* Card 5: Total Task Hours */}
        <Card variant="outlined" className="col-span-2 lg:col-span-1 p-4 border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Total Logged
            </span>
            <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[var(--md-sys-color-on-surface)]">
              {metrics.totalHours.toFixed(1)}h
            </span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] block">
              Cumulative hours
            </span>
          </div>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <Card variant="outlined" className="p-3.5 border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]" />
            <input
              type="text"
              placeholder="Search by task, candidate, project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface)] focus:outline-none focus:border-[var(--md-sys-color-primary)]"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Candidate Filter */}
            <select
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
              className="h-9 px-3 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface)] focus:outline-none cursor-pointer"
            >
              <option value="all">All Candidates ({candidates.length})</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-3 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface)] focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="blocked">Blocked</option>
            </select>

            {/* Project Filter */}
            {uniqueProjects.length > 0 && (
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="h-9 px-3 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface)] focus:outline-none cursor-pointer"
              >
                <option value="all">All Projects</option>
                {uniqueProjects.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            )}

            {(selectedCandidate !== 'all' || selectedStatus !== 'all' || selectedProject !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCandidate('all')
                  setSelectedStatus('all')
                  setSelectedProject('all')
                  setSearchQuery('')
                }}
                className="text-xs font-bold text-[var(--md-sys-color-primary)] hover:underline px-2 py-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      {viewMode === 'grouped' ? (
        /* ================= GROUPED VIEW: BY CANDIDATE ================= */
        <div className="flex flex-col gap-4">
          {candidateGroups.length > 0 ? (
            candidateGroups.map(({ candidate, tasks: cTasks, totalHours }) => {
              const isExpanded = expandedCandidates[candidate.id] !== false // Default open
              const hasCompleted = cTasks.filter((t) => t.status === 'completed').length
              const hasBlocked = cTasks.filter((t) => t.status === 'blocked').length
              const hasInProgress = cTasks.filter((t) => t.status === 'in_progress').length
              const isWorkingRightNow = activeShiftUserIds.includes(candidate.id)

              return (
                <Card
                  key={candidate.id}
                  variant="elevated"
                  className={`border transition-all overflow-hidden shadow-2xs ${
                    hasBlocked > 0
                      ? 'border-rose-500/40 bg-rose-500/[0.02]'
                      : 'border-[var(--md-sys-color-outline-variant)]'
                  }`}
                >
                  {/* Candidate Header Row */}
                  <div
                    onClick={() => toggleCandidateExpand(candidate.id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-[var(--md-sys-color-surface-container-high)]/40 transition-colors"
                  >
                    {/* Left: Avatar & Candidate Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        {candidate.avatar_url ? (
                          <img
                            src={candidate.avatar_url}
                            alt={candidate.full_name}
                            className="w-11 h-11 rounded-full object-cover border border-[var(--md-sys-color-outline-variant)]"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold text-base flex items-center justify-center">
                            {candidate.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {isWorkingRightNow && (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[var(--md-sys-color-surface)]"
                            title="Currently Clocked In"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-[var(--md-sys-color-on-surface)] truncate">
                            {candidate.full_name}
                          </h3>
                          {isWorkingRightNow && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                              Active Shift
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                          {cTasks.length === 0 ? (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              No tasks logged for this date
                            </span>
                          ) : (
                            <span>
                              {cTasks.length} {cTasks.length === 1 ? 'task' : 'tasks'} • {totalHours.toFixed(1)} hrs logged
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Right: Badges & Chevron */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {cTasks.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          {hasCompleted > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {hasCompleted} Done
                            </span>
                          )}
                          {hasInProgress > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {hasInProgress} Active
                            </span>
                          )}
                          {hasBlocked > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1 font-bold animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> {hasBlocked} Blocked
                            </span>
                          )}
                        </div>
                      )}

                      <div className="p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)]">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Task List */}
                  {isExpanded && (
                    <div className="border-t border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] p-4 sm:p-5 flex flex-col gap-3">
                      {cTasks.length > 0 ? (
                        cTasks.map((t) => {
                          const statusObj = STATUS_CONFIG[t.status] || STATUS_CONFIG.completed
                          const StatusIcon = statusObj.icon

                          return (
                            <div
                              key={t.id}
                              className="p-3.5 sm:p-4 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-primary)] transition-all flex flex-col gap-2.5 group"
                            >
                              {/* Task Sub-Header */}
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    {t.project_name}
                                  </span>

                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${statusObj.badgeBg}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {statusObj.label}
                                  </span>

                                  {dateMode === 'all' && (
                                    <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1 font-mono">
                                      <Calendar className="w-3 h-3" />
                                      {t.task_date}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)]">
                                    {Number(t.hours_spent || 0).toFixed(1)}h
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => setActiveTaskForModal(t)}
                                    className="p-1.5 rounded-lg text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Review
                                  </button>
                                </div>
                              </div>

                              {/* Task Title & Description */}
                              <div>
                                <h4 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
                                  {t.title}
                                </h4>
                                {t.description && (
                                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 whitespace-pre-wrap leading-relaxed">
                                    {t.description}
                                  </p>
                                )}
                              </div>

                              {/* Blocker Callout */}
                              {t.status === 'blocked' && t.blocker_description && (
                                <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-start gap-2">
                                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                  <div className="text-xs">
                                    <strong className="text-rose-800 dark:text-rose-300">Blocker: </strong>
                                    <span className="text-rose-900 dark:text-rose-200">{t.blocker_description}</span>
                                  </div>
                                </div>
                              )}

                              {/* Manager Feedback */}
                              {t.admin_feedback && (
                                <div className="p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-start gap-2">
                                  <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                  <div className="text-xs">
                                    <strong className="text-blue-800 dark:text-blue-300">Manager Note: </strong>
                                    <span className="text-blue-900 dark:text-blue-200">{t.admin_feedback}</span>
                                  </div>
                                </div>
                              )}

                              {/* Proof Deliverable URL */}
                              {t.proof_url && (
                                <div className="pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                                  <a
                                    href={t.proof_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--md-sys-color-primary)] hover:underline truncate max-w-full"
                                  >
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{t.proof_url}</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          )
                        })
                      ) : (
                        <div className="py-4 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] flex flex-col items-center gap-1">
                          <AlertCircle className="w-5 h-5 opacity-40" />
                          No tasks recorded by {candidate.full_name} for this date.
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )
            })
          ) : (
            <Card variant="outlined" className="py-12 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
              No task entries match the selected filters.
            </Card>
          )}
        </div>
      ) : (
        /* ================= TABLE / LIST VIEW ================= */
        <Card variant="elevated" className="border border-[var(--md-sys-color-outline-variant)] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Task Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Hours</th>
                  <th className="py-3 px-4 text-center">Deliverable</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((t) => {
                    const statusObj = STATUS_CONFIG[t.status] || STATUS_CONFIG.completed
                    const StatusIcon = statusObj.icon

                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-[var(--md-sys-color-surface-container)] transition-colors"
                      >
                        {/* Candidate */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {t.candidate_avatar ? (
                              <img
                                src={t.candidate_avatar}
                                alt={t.candidate_name}
                                className="w-7 h-7 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold text-xs flex items-center justify-center">
                                {t.candidate_name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="font-bold text-[var(--md-sys-color-on-surface)]">
                              {t.candidate_name}
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-[var(--md-sys-color-on-surface-variant)]">
                          {t.task_date}
                        </td>

                        {/* Project */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                            {t.project_name}
                          </span>
                        </td>

                        {/* Title & Notes */}
                        <td className="py-3 px-4 max-w-xs sm:max-w-md">
                          <div className="font-bold text-[var(--md-sys-color-on-surface)] line-clamp-1">
                            {t.title}
                          </div>
                          {t.description && (
                            <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] line-clamp-1 mt-0.5">
                              {t.description}
                            </p>
                          )}
                          {t.status === 'blocked' && t.blocker_description && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 mt-1">
                              <AlertTriangle className="w-3 h-3" /> Blocker: {t.blocker_description}
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border inline-flex items-center gap-1 ${statusObj.badgeBg}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusObj.label}
                          </span>
                        </td>

                        {/* Hours */}
                        <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold">
                          {Number(t.hours_spent || 0).toFixed(1)}h
                        </td>

                        {/* Deliverable Link */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {t.proof_url ? (
                            <a
                              href={t.proof_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 inline-flex items-center"
                              title={t.proof_url}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="text-[var(--md-sys-color-on-surface-variant)] opacity-40">—</span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setActiveTaskForModal(t)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 transition-colors cursor-pointer"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
                      No daily tasks found matching the criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Admin Task Review Modal */}
      {activeTaskForModal && (
        <TaskFeedbackModal
          isOpen={true}
          task={activeTaskForModal}
          onClose={() => setActiveTaskForModal(null)}
          onSuccess={() => {
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
