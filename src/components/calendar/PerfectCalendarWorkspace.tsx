'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  Filter,
  Video,
  Clock,
  Palmtree,
  CheckSquare,
  Sparkles,
  Layers,
  Check,
  ExternalLink,
  ChevronDown,
} from 'lucide-react'
import {
  UnifiedCalendarItem,
  CalendarFilterOptions,
  getUnifiedCalendarFeedAction,
  exportICSFeedAction,
} from '@/app/actions/calendar'
import { CreateEventModal } from './CreateEventModal'
import { EventDetailModal } from './EventDetailModal'

interface PerfectCalendarWorkspaceProps {
  currentUserId: string
  currentUserRole: string
  initialEvents: UnifiedCalendarItem[]
}

type CalendarViewMode = 'month' | 'week' | 'work_week' | 'day' | 'agenda'

export const PerfectCalendarWorkspace: React.FC<PerfectCalendarWorkspaceProps> = ({
  currentUserId,
  currentUserRole,
  initialEvents,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month')
  const [events, setEvents] = useState<UnifiedCalendarItem[]>(initialEvents)
  const [loading, setLoading] = useState(false)

  // Layer filter states
  const [layerShifts, setLayerShifts] = useState(true)
  const [layerMeets, setLayerMeets] = useState(true)
  const [layerLeaves, setLayerLeaves] = useState(true)
  const [layerTasks, setLayerTasks] = useState(true)
  const [layerEvents, setLayerEvents] = useState(true)

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createDefaultDate, setCreateDefaultDate] = useState<string | undefined>()
  const [createDefaultTime, setCreateDefaultTime] = useState<string | undefined>()
  const [selectedItem, setSelectedItem] = useState<UnifiedCalendarItem | null>(null)

  // Calculate current date range bounds
  const dateRange = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    if (viewMode === 'month') {
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      // Extend to full weeks
      firstDay.setDate(firstDay.getDate() - firstDay.getDay())
      lastDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()))
      return { start: firstDay, end: lastDay }
    } else if (viewMode === 'week' || viewMode === 'work_week') {
      const cur = new Date(currentDate)
      const first = cur.getDate() - cur.getDay() + (viewMode === 'work_week' ? 1 : 0)
      const start = new Date(cur.setDate(first))
      const end = new Date(start)
      end.setDate(start.getDate() + (viewMode === 'work_week' ? 4 : 6))
      return { start, end }
    } else if (viewMode === 'day') {
      const start = new Date(currentDate)
      const end = new Date(currentDate)
      return { start, end }
    } else {
      // Agenda: 30 days window
      const start = new Date(currentDate)
      const end = new Date(currentDate)
      end.setDate(end.getDate() + 30)
      return { start, end }
    }
  }, [currentDate, viewMode])

  // Fetch unified calendar feed when dateRange changes
  const fetchEvents = async () => {
    setLoading(true)
    try {
      const feed = await getUnifiedCalendarFeedAction({
        startDate: dateRange.start.toISOString().split('T')[0],
        endDate: dateRange.end.toISOString().split('T')[0],
        layers: {
          shifts: layerShifts,
          meetings: layerMeets,
          leaves: layerLeaves,
          tasks: layerTasks,
          customEvents: layerEvents,
        },
      })
      setEvents(feed)
    } catch (err) {
      console.error('Failed to load unified calendar feed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [dateRange, layerShifts, layerMeets, layerLeaves, layerTasks, layerEvents])

  // Date Navigation handlers
  const handlePrev = () => {
    const next = new Date(currentDate)
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() - 1)
    } else if (viewMode === 'week' || viewMode === 'work_week') {
      next.setDate(next.getDate() - 7)
    } else if (viewMode === 'day') {
      next.setDate(next.getDate() - 1)
    } else {
      next.setDate(next.getDate() - 14)
    }
    setCurrentDate(next)
  }

  const handleNext = () => {
    const next = new Date(currentDate)
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() + 1)
    } else if (viewMode === 'week' || viewMode === 'work_week') {
      next.setDate(next.getDate() + 7)
    } else if (viewMode === 'day') {
      next.setDate(next.getDate() + 1)
    } else {
      next.setDate(next.getDate() + 14)
    }
    setCurrentDate(next)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Export iCal (.ics)
  const handleExportICS = async () => {
    try {
      const icsString = await exportICSFeedAction(
        dateRange.start.toISOString().split('T')[0],
        dateRange.end.toISOString().split('T')[0]
      )
      const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.setAttribute('download', `workforce-calendar-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}.ics`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err: any) {
      alert(err.message || 'Failed to export calendar')
    }
  }

  // Open create modal with slot defaults
  const handleSlotClick = (dateStr: string, timeStr?: string) => {
    setCreateDefaultDate(dateStr)
    setCreateDefaultTime(timeStr || '09:00')
    setIsCreateOpen(true)
  }

  // Header Title Formatter
  const getHeaderTitle = () => {
    const monthName = currentDate.toLocaleDateString([], { month: 'long' })
    const year = currentDate.getFullYear()
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
    }
    return `${monthName} ${year}`
  }

  // Generate Month Grid Days
  const monthDays = useMemo(() => {
    if (viewMode !== 'month') return []
    const days: Array<{ date: Date; dateStr: string; isCurrentMonth: boolean; isToday: boolean }> = []
    const start = new Date(dateRange.start)
    const end = new Date(dateRange.end)

    const cur = new Date(start)
    const todayStr = new Date().toISOString().split('T')[0]

    while (cur <= end) {
      const dateStr = cur.toISOString().split('T')[0]
      days.push({
        date: new Date(cur),
        dateStr,
        isCurrentMonth: cur.getMonth() === currentDate.getMonth(),
        isToday: dateStr === todayStr,
      })
      cur.setDate(cur.getDate() + 1)
    }
    return days
  }, [dateRange, currentDate, viewMode])

  // Generate Week Grid Columns
  const weekDays = useMemo(() => {
    if (viewMode !== 'week' && viewMode !== 'work_week') return []
    const days: Array<{ date: Date; dateStr: string; dayName: string; isToday: boolean }> = []
    const cur = new Date(dateRange.start)
    const todayStr = new Date().toISOString().split('T')[0]

    while (cur <= dateRange.end) {
      const dateStr = cur.toISOString().split('T')[0]
      days.push({
        date: new Date(cur),
        dateStr,
        dayName: cur.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' }),
        isToday: dateStr === todayStr,
      })
      cur.setDate(cur.getDate() + 1)
    }
    return days
  }, [dateRange, viewMode])

  const hoursList = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="flex flex-col h-full w-full rounded-none overflow-hidden border-0 bg-[var(--md-sys-color-surface-container-lowest)] dark:bg-[#070a12] text-[var(--md-sys-color-on-surface)] dark:text-slate-100 font-sans">
      {/* 1. TOP CONTROL BAR */}
      <header className="p-3 sm:p-4 border-b border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]/70 bg-[var(--md-sys-color-surface)] dark:bg-[#0c111d] flex flex-wrap items-center justify-between gap-3">
        {/* Navigation & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center flex-shrink-0 border border-[var(--md-sys-color-outline-variant)]/60 dark:border-slate-700 shadow-2xs">
            <CalendarIcon className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
          </div>

          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[var(--md-sys-color-on-surface)] dark:text-white">
              {getHeaderTitle()}
            </h2>

            <div className="flex items-center rounded-xl bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] border border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] p-0.5 ml-2 shadow-2xs">
              <button
                onClick={handlePrev}
                title="Previous period"
                className="p-1 rounded-lg hover:bg-[var(--md-sys-color-surface-container-high)] dark:hover:bg-slate-800 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-2.5 py-0.5 rounded-lg text-xs font-bold text-[var(--md-sys-color-on-surface)] dark:text-white hover:bg-[var(--md-sys-color-surface-container-high)] dark:hover:bg-slate-800 transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                title="Next period"
                className="p-1 rounded-lg hover:bg-[var(--md-sys-color-surface-container-high)] dark:hover:bg-slate-800 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* View Switcher Pills & Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* View selector pills */}
          <div className="flex items-center rounded-xl bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] border border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] p-1 text-xs shadow-2xs">
            {(['month', 'week', 'work_week', 'day', 'agenda'] as CalendarViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg transition-all capitalize text-xs ${
                  viewMode === mode
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-semibold shadow-xs'
                    : 'text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 hover:text-[var(--md-sys-color-on-surface)] dark:hover:text-white hover:bg-[var(--md-sys-color-surface-container-high)] dark:hover:bg-slate-800 font-medium'
                }`}
              >
                {mode.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Export iCal */}
          <button
            onClick={handleExportICS}
            title="Download .ics for Google / Outlook / Apple Calendar"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] border border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] text-xs font-semibold text-[var(--md-sys-color-on-surface)] dark:text-slate-200 hover:bg-[var(--md-sys-color-surface-container-high)] dark:hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export iCal</span>
          </button>

          {/* Schedule Event CTA */}
          <button
            onClick={() => {
              setCreateDefaultDate(new Date().toISOString().split('T')[0])
              setCreateDefaultTime('10:00')
              setIsCreateOpen(true)
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-semibold text-xs hover:opacity-90 active:scale-95 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Event</span>
          </button>
        </div>
      </header>

      {/* 2. LAYER FILTER CHIPS BAR */}
      <div className="px-4 py-2.5 border-b border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]/70 bg-[var(--md-sys-color-surface-container-low)] dark:bg-[#0c111d]/60 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-[var(--md-sys-color-primary)]" />
            Layers:
          </span>

          <button
            onClick={() => setLayerShifts(!layerShifts)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all border ${
              layerShifts
                ? 'bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] text-[var(--md-sys-color-on-surface)] dark:text-slate-100 font-semibold shadow-2xs'
                : 'bg-transparent border-transparent text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500 opacity-40 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
            <span>Shifts</span>
          </button>

          <button
            onClick={() => setLayerMeets(!layerMeets)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all border ${
              layerMeets
                ? 'bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] text-[var(--md-sys-color-on-surface)] dark:text-slate-100 font-semibold shadow-2xs'
                : 'bg-transparent border-transparent text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500 opacity-40 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            <span>Video Meets</span>
          </button>

          <button
            onClick={() => setLayerLeaves(!layerLeaves)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all border ${
              layerLeaves
                ? 'bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] text-[var(--md-sys-color-on-surface)] dark:text-slate-100 font-semibold shadow-2xs'
                : 'bg-transparent border-transparent text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500 opacity-40 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
            <span>Leaves & Offs</span>
          </button>

          <button
            onClick={() => setLayerTasks(!layerTasks)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all border ${
              layerTasks
                ? 'bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] text-[var(--md-sys-color-on-surface)] dark:text-slate-100 font-semibold shadow-2xs'
                : 'bg-transparent border-transparent text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500 opacity-40 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
            <span>Tasks</span>
          </button>

          <button
            onClick={() => setLayerEvents(!layerEvents)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all border ${
              layerEvents
                ? 'bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] text-[var(--md-sys-color-on-surface)] dark:text-slate-100 font-semibold shadow-2xs'
                : 'bg-transparent border-transparent text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500 opacity-40 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
            <span>Events</span>
          </button>
        </div>

        {loading && (
          <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 animate-pulse">
            Syncing calendar feed...
          </span>
        )}
      </div>

      {/* 3. CALENDAR CONTENT AREA */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-[var(--md-sys-color-surface-container-lowest)]">
        {/* MONTH VIEW */}
        {viewMode === 'month' && (
          <div className="h-full flex flex-col min-w-[700px]">
            {/* Weekday Header Row */}
            <div className="grid grid-cols-7 border-b border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]/70 bg-[var(--md-sys-color-surface)] dark:bg-[#0c111d] text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 py-2.5">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Day Cells Grid */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[var(--md-sys-color-outline-variant)]/60 dark:divide-[#1e293b]/60">
              {monthDays.map((cell) => {
                const dayEvents = events.filter((e) => e.startTime.startsWith(cell.dateStr))

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => handleSlotClick(cell.dateStr)}
                    className={`min-h-[100px] p-1.5 transition-colors flex flex-col justify-between group cursor-pointer ${
                      cell.isCurrentMonth
                        ? 'bg-[var(--md-sys-color-surface-container-lowest)] dark:bg-[#070a12] hover:bg-[var(--md-sys-color-surface-container-high)]/40 dark:hover:bg-[#0f1626]'
                        : 'bg-[var(--md-sys-color-surface-container)]/20 dark:bg-black/20 opacity-35'
                    }`}
                  >
                    {/* Date number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          cell.isToday
                            ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                            : 'text-[var(--md-sys-color-on-surface)] dark:text-slate-200'
                        }`}
                      >
                        {cell.date.getDate()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSlotClick(cell.dateStr)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-highest)] dark:hover:bg-slate-800 transition-opacity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Day Events Pills */}
                    <div className="flex-1 space-y-1 overflow-hidden">
                      {dayEvents.slice(0, 3).map((evt) => (
                        <button
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedItem(evt)
                          }}
                          style={{
                            borderLeftColor: evt.color,
                          }}
                          className="w-full text-left px-2 py-0.5 rounded text-[11px] font-medium border-l-2 truncate flex items-center justify-between gap-1 transition-all text-[var(--md-sys-color-on-surface)] dark:text-slate-200 bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] border border-[var(--md-sys-color-outline-variant)]/60 dark:border-[#24324c] hover:border-[var(--md-sys-color-primary)] shadow-2xs"
                        >
                          <span className="truncate">{evt.title}</span>
                          {evt.meetUrl && <Video className="w-2.5 h-2.5 text-emerald-500 flex-shrink-0" />}
                        </button>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] font-bold text-[var(--md-sys-color-primary)] pl-1">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* WEEK & WORK-WEEK TIME-GRID VIEW */}
        {(viewMode === 'week' || viewMode === 'work_week') && (
          <div className="flex flex-col h-full min-w-[750px] overflow-y-auto">
            {/* Header Columns */}
            <div className={`grid ${viewMode === 'work_week' ? 'grid-cols-6' : 'grid-cols-8'} border-b border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b] bg-[var(--md-sys-color-surface)] dark:bg-[#0c111d] text-center py-2 sticky top-0 z-10`}>
              <div className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 py-1">Time</div>
              {weekDays.map((col) => (
                <div
                  key={col.dateStr}
                  className={`py-1 rounded-xl mx-1 ${
                    col.isToday
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold'
                      : 'text-[var(--md-sys-color-on-surface)] dark:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">{col.dayName}</div>
                </div>
              ))}
            </div>

            {/* Time Grid Rows */}
            <div className="flex-1 divide-y divide-[var(--md-sys-color-outline-variant)]/40 dark:divide-[#1e293b]/50">
              {hoursList.map((hour) => {
                const hourLabel = `${hour.toString().padStart(2, '0')}:00`
                return (
                  <div key={hour} className={`grid ${viewMode === 'work_week' ? 'grid-cols-6' : 'grid-cols-8'} min-h-[48px] divide-x divide-[var(--md-sys-color-outline-variant)]/40 dark:divide-[#1e293b]/50`}>
                    <div className="p-2 text-[10px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500 font-mono text-center">
                      {hourLabel}
                    </div>

                    {weekDays.map((col) => {
                      const curSlotEvents = events.filter((e) => {
                        const start = new Date(e.startTime)
                        return (
                          e.startTime.startsWith(col.dateStr) &&
                          start.getHours() === hour
                        )
                      })

                      return (
                        <div
                          key={col.dateStr}
                          onClick={() => handleSlotClick(col.dateStr, hourLabel)}
                          className="p-1 hover:bg-[var(--md-sys-color-surface-container-high)]/40 dark:hover:bg-slate-800/30 transition-colors cursor-pointer relative group"
                        >
                          {curSlotEvents.map((evt) => (
                            <button
                              key={evt.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedItem(evt)
                              }}
                              style={{
                                borderLeftColor: evt.color,
                              }}
                              className="w-full text-left p-1.5 rounded-lg border-l-2 text-[11px] font-semibold text-[var(--md-sys-color-on-surface)] dark:text-slate-100 bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] border border-[var(--md-sys-color-outline-variant)]/60 dark:border-[#24324c] truncate shadow-2xs hover:border-[var(--md-sys-color-primary)] transition-all mb-1 block"
                            >
                              <div className="truncate font-semibold">{evt.title}</div>
                              <div className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400">{evt.badgeText}</div>
                            </button>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* DAY TIMELINE VIEW */}
        {viewMode === 'day' && (
          <div className="p-4 max-w-3xl mx-auto space-y-3">
            <div className="p-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] border border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] flex items-center justify-between shadow-2xs">
              <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)] dark:text-white">
                {currentDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <button
                onClick={() => handleSlotClick(currentDate.toISOString().split('T')[0])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-semibold text-xs hover:opacity-90 active:scale-95 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Event</span>
              </button>
            </div>

            <div className="divide-y divide-[var(--md-sys-color-outline-variant)]/60 dark:divide-[#1e293b] bg-[var(--md-sys-color-surface-container-low)] dark:bg-[#0c111d] rounded-2xl border border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]">
              {hoursList.map((hour) => {
                const dateStr = currentDate.toISOString().split('T')[0]
                const hourLabel = `${hour.toString().padStart(2, '0')}:00`
                const slotEvents = events.filter((e) => {
                  const start = new Date(e.startTime)
                  return e.startTime.startsWith(dateStr) && start.getHours() === hour
                })

                return (
                  <div
                    key={hour}
                    onClick={() => handleSlotClick(dateStr, hourLabel)}
                    className="p-3 flex items-start gap-4 hover:bg-[var(--md-sys-color-surface-container-high)]/30 dark:hover:bg-slate-800/20 transition-colors cursor-pointer group"
                  >
                    <span className="w-14 text-xs font-mono font-bold text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500 flex-shrink-0">
                      {hourLabel}
                    </span>

                    <div className="flex-1 space-y-2">
                      {slotEvents.length === 0 ? (
                        <div className="h-6 opacity-0 group-hover:opacity-100 text-[11px] text-[var(--md-sys-color-primary)] font-semibold flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Click to schedule
                        </div>
                      ) : (
                        slotEvents.map((evt) => (
                          <div
                            key={evt.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedItem(evt)
                            }}
                            style={{ borderLeftColor: evt.color }}
                            className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] border border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] border-l-4 shadow-2xs flex items-center justify-between gap-3 cursor-pointer hover:border-[var(--md-sys-color-primary)] transition-all"
                          >
                            <div>
                              <span
                                className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mb-1"
                                style={{ backgroundColor: `${evt.color}15`, color: evt.color }}
                              >
                                {evt.badgeText}
                              </span>
                              <h4 className="text-sm font-bold text-[var(--md-sys-color-on-surface)] dark:text-white">{evt.title}</h4>
                              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400">{evt.description}</p>
                            </div>
                            {evt.meetUrl && (
                              <a
                                href={evt.meetUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-semibold text-xs hover:opacity-90 active:scale-95 transition-all shadow-xs"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Join</span>
                              </a>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* AGENDA LIST VIEW */}
        {viewMode === 'agenda' && (
          <div className="p-4 max-w-4xl mx-auto space-y-3">
            {events.length === 0 ? (
              <div className="py-16 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500">
                No events scheduled for the selected period.
              </div>
            ) : (
              events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedItem(evt)}
                  style={{ borderLeftColor: evt.color }}
                  className="p-4 rounded-2xl bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] border border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] border-l-4 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                        style={{ backgroundColor: `${evt.color}15`, color: evt.color }}
                      >
                        {evt.badgeText}
                      </span>
                      <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400">
                        {new Date(evt.startTime).toLocaleDateString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        •{' '}
                        {new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(evt.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[var(--md-sys-color-on-surface)] dark:text-white">{evt.title}</h4>
                    {evt.description && (
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400">{evt.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {evt.meetUrl && (
                      <a
                        href={evt.meetUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-semibold text-xs hover:opacity-90 active:scale-95 transition-all shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Call</span>
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onEventCreated={fetchEvents}
        defaultDate={createDefaultDate}
        defaultStartTime={createDefaultTime}
      />

      <EventDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onEventUpdated={fetchEvents}
      />
    </div>
  )
}
