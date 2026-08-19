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
    <div className="flex flex-col h-full w-full rounded-none overflow-hidden border-0 bg-[var(--md-sys-color-surface-container-low)]">
      {/* 1. TOP CONTROL BAR */}
      <header className="p-3 sm:p-4 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] flex flex-wrap items-center justify-between gap-3">
        {/* Navigation & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--md-sys-color-primary)] text-black flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[var(--md-sys-color-on-surface)]">
              {getHeaderTitle()}
            </h2>

            <div className="flex items-center rounded-xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] p-0.5 ml-2">
              <button
                onClick={handlePrev}
                className="p-1 rounded-lg hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-2.5 py-0.5 rounded-lg text-xs font-bold text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-1 rounded-lg hover:bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* View Switcher Pills & Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* View selector pills */}
          <div className="flex items-center rounded-xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] p-1 text-xs font-semibold">
            {(['month', 'week', 'work_week', 'day', 'agenda'] as CalendarViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1 rounded-lg transition-all capitalize ${
                  viewMode === mode
                    ? 'bg-[var(--md-sys-color-primary)] text-black font-bold shadow-sm'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
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
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-xs font-semibold text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors shadow-sm"
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
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--md-sys-color-primary)] text-black font-bold text-xs tracking-wide hover:opacity-90 active:scale-95 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </button>
        </div>
      </header>

      {/* 2. LAYER FILTER CHIPS BAR */}
      <div className="px-4 py-2 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)]/40 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3" />
            Layers:
          </span>

          <button
            onClick={() => setLayerShifts(!layerShifts)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              layerShifts
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                : 'bg-[var(--md-sys-color-surface-container)] border-transparent text-[var(--md-sys-color-on-surface-variant)] opacity-50'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Shifts</span>
          </button>

          <button
            onClick={() => setLayerMeets(!layerMeets)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              layerMeets
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-[var(--md-sys-color-surface-container)] border-transparent text-[var(--md-sys-color-on-surface-variant)] opacity-50'
            }`}
          >
            <Video className="w-3 h-3" />
            <span>Video Meets</span>
          </button>

          <button
            onClick={() => setLayerLeaves(!layerLeaves)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              layerLeaves
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-[var(--md-sys-color-surface-container)] border-transparent text-[var(--md-sys-color-on-surface-variant)] opacity-50'
            }`}
          >
            <Palmtree className="w-3 h-3" />
            <span>Leaves & Offs</span>
          </button>

          <button
            onClick={() => setLayerTasks(!layerTasks)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              layerTasks
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-400'
                : 'bg-[var(--md-sys-color-surface-container)] border-transparent text-[var(--md-sys-color-on-surface-variant)] opacity-50'
            }`}
          >
            <CheckSquare className="w-3 h-3" />
            <span>Tasks</span>
          </button>

          <button
            onClick={() => setLayerEvents(!layerEvents)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              layerEvents
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                : 'bg-[var(--md-sys-color-surface-container)] border-transparent text-[var(--md-sys-color-on-surface-variant)] opacity-50'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Events</span>
          </button>
        </div>

        {loading && (
          <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] animate-pulse">
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
            <div className="grid grid-cols-7 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] text-center text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] py-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Day Cells Grid */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[var(--md-sys-color-outline-variant)]/60">
              {monthDays.map((cell) => {
                const dayEvents = events.filter((e) => e.startTime.startsWith(cell.dateStr))

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => handleSlotClick(cell.dateStr)}
                    className={`min-h-[100px] p-1.5 transition-colors flex flex-col justify-between group cursor-pointer ${
                      cell.isCurrentMonth
                        ? 'bg-[var(--md-sys-color-surface-container-lowest)] hover:bg-[var(--md-sys-color-surface-container-high)]/40'
                        : 'bg-[var(--md-sys-color-surface-container)]/30 opacity-40'
                    }`}
                  >
                    {/* Date number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          cell.isToday
                            ? 'bg-[var(--md-sys-color-primary)] text-black shadow-md'
                            : 'text-[var(--md-sys-color-on-surface)]'
                        }`}
                      >
                        {cell.date.getDate()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSlotClick(cell.dateStr)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-opacity"
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
                            backgroundColor: `${evt.color}15`,
                          }}
                          className="w-full text-left px-2 py-0.5 rounded text-[11px] font-semibold border-l-2 truncate flex items-center justify-between gap-1 hover:brightness-125 transition-all text-[var(--md-sys-color-on-surface)] shadow-2xs"
                        >
                          <span className="truncate">{evt.title}</span>
                          {evt.meetUrl && <Video className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" />}
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
            <div className={`grid ${viewMode === 'work_week' ? 'grid-cols-6' : 'grid-cols-8'} border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] text-center py-2 sticky top-0 z-10`}>
              <div className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] py-1">Time</div>
              {weekDays.map((col) => (
                <div
                  key={col.dateStr}
                  className={`py-1 rounded-xl mx-1 ${
                    col.isToday ? 'bg-[var(--md-sys-color-primary)]/15 text-[var(--md-sys-color-primary)] font-bold' : 'text-[var(--md-sys-color-on-surface)]'
                  }`}
                >
                  <div className="text-xs font-bold">{col.dayName}</div>
                </div>
              ))}
            </div>

            {/* Time Grid Rows */}
            <div className="flex-1 divide-y divide-[var(--md-sys-color-outline-variant)]/40">
              {hoursList.map((hour) => {
                const hourLabel = `${hour.toString().padStart(2, '0')}:00`
                return (
                  <div key={hour} className={`grid ${viewMode === 'work_week' ? 'grid-cols-6' : 'grid-cols-8'} min-h-[48px] divide-x divide-[var(--md-sys-color-outline-variant)]/40`}>
                    <div className="p-2 text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-mono text-center">
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
                          className="p-1 hover:bg-[var(--md-sys-color-surface-container-high)]/40 transition-colors cursor-pointer relative group"
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
                                backgroundColor: `${evt.color}20`,
                              }}
                              className="w-full text-left p-1.5 rounded-lg border-l-3 text-[11px] font-bold text-[var(--md-sys-color-on-surface)] truncate shadow-sm hover:brightness-125 transition-all mb-1 block"
                            >
                              <div className="truncate font-semibold">{evt.title}</div>
                              <div className="text-[10px] opacity-75">{evt.badgeText}</div>
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
            <div className="p-3 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">
                {currentDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <button
                onClick={() => handleSlotClick(currentDate.toISOString().split('T')[0])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--md-sys-color-primary)] text-black font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Event</span>
              </button>
            </div>

            <div className="divide-y divide-[var(--md-sys-color-outline-variant)]/60 bg-[var(--md-sys-color-surface-container-low)] rounded-2xl border border-[var(--md-sys-color-outline-variant)]">
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
                    className="p-3 flex items-start gap-4 hover:bg-[var(--md-sys-color-surface-container-high)]/30 transition-colors cursor-pointer group"
                  >
                    <span className="w-14 text-xs font-mono font-bold text-[var(--md-sys-color-on-surface-variant)] flex-shrink-0">
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
                            className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] border-l-4 shadow-sm flex items-center justify-between gap-3 cursor-pointer hover:shadow-md transition-all"
                          >
                            <div>
                              <span
                                className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mb-1"
                                style={{ backgroundColor: `${evt.color}25`, color: evt.color }}
                              >
                                {evt.badgeText}
                              </span>
                              <h4 className="text-sm font-bold text-[var(--md-sys-color-on-surface)]">{evt.title}</h4>
                              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{evt.description}</p>
                            </div>
                            {evt.meetUrl && (
                              <a
                                href={evt.meetUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs"
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
          <div className="p-4 max-w-4xl mx-auto space-y-4">
            {events.length === 0 ? (
              <div className="py-16 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
                No events scheduled for the selected period.
              </div>
            ) : (
              events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedItem(evt)}
                  style={{ borderLeftColor: evt.color }}
                  className="p-4 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] border-l-4 shadow-sm hover:shadow-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                        style={{ backgroundColor: `${evt.color}25`, color: evt.color }}
                      >
                        {evt.badgeText}
                      </span>
                      <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
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

                    <h4 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">{evt.title}</h4>
                    {evt.description && (
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{evt.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {evt.meetUrl && (
                      <a
                        href={evt.meetUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-wide transition-all shadow-md"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Video Call</span>
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
