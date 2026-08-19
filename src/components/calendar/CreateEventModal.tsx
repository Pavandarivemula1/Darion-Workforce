'use client'

import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, Video, MapPin, Users, Tag, Loader2, Sparkles, ShieldCheck } from 'lucide-react'
import { createCalendarEventAction } from '@/app/actions/calendar'
import { getUserDirectoryAction, ChatParticipantInfo } from '@/app/actions/messages'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated: () => void
  defaultDate?: string // YYYY-MM-DD
  defaultStartTime?: string // HH:mm
}

const COLOR_PALETTE = [
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Cyan', hex: '#06B6D4' },
]

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
  defaultDate,
  defaultStartTime,
}) => {
  const todayStr = defaultDate || new Date().toISOString().split('T')[0]
  const defaultHour = defaultStartTime || '10:00'

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventType, setEventType] = useState<'meeting' | 'company_event' | 'training' | 'review'>('meeting')
  const [startDate, setStartDate] = useState(todayStr)
  const [startTime, setStartTime] = useState(defaultHour)
  const [endDate, setEndDate] = useState(todayStr)
  const [endTime, setEndTime] = useState('11:00')
  const [isAllDay, setIsAllDay] = useState(false)
  const [location, setLocation] = useState('')
  const [autoMeet, setAutoMeet] = useState(true)
  const [selectedColor, setSelectedColor] = useState('#3B82F6')
  const [visibility, setVisibility] = useState<'public' | 'team' | 'private'>('public')

  const [users, setUsers] = useState<ChatParticipantInfo[]>([])
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    getUserDirectoryAction().then((u) => setUsers(u))
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please provide an event title')
      return
    }

    try {
      setLoading(true)
      setError('')

      const startIso = isAllDay
        ? `${startDate}T00:00:00.000Z`
        : new Date(`${startDate}T${startTime}:00`).toISOString()
      const endIso = isAllDay
        ? `${endDate}T23:59:59.000Z`
        : new Date(`${endDate}T${endTime}:00`).toISOString()

      await createCalendarEventAction({
        title: title.trim(),
        description: description.trim(),
        eventType,
        startTime: startIso,
        endTime: endIso,
        isAllDay,
        location: location.trim(),
        colorTag: selectedColor,
        visibility,
        autoCreateMeetRoom: autoMeet,
        attendeeIds: selectedAttendees,
      })

      onEventCreated()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  const toggleAttendee = (userId: string) => {
    setSelectedAttendees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--md-sys-color-primary)]/15 text-[var(--md-sys-color-primary)] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">Schedule New Event</h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Add to unified workforce calendar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1">
              Event Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly All-Hands, Team Sync, Project Review"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-sm text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-on-surface-variant)] focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/40 transition-all"
            />
          </div>

          {/* Event Type & Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1">
                Category
              </label>
              <select
                value={eventType}
                onChange={(e: any) => setEventType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/40"
              >
                <option value="meeting">Video Meeting</option>
                <option value="company_event">Company Event</option>
                <option value="training">Training / Workshop</option>
                <option value="review">Performance Review</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1">
                Color Tag
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      selectedColor === c.hex ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="p-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--md-sys-color-primary)]" />
                Schedule Timing
              </span>
              <label className="flex items-center gap-1.5 text-xs text-[var(--md-sys-color-on-surface-variant)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  className="rounded text-[var(--md-sys-color-primary)]"
                />
                <span>All Day</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-[var(--md-sys-color-on-surface-variant)] mb-1">Start</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface)]"
                />
                {!isAllDay && (
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full mt-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface)]"
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] text-[var(--md-sys-color-on-surface-variant)] mb-1">End</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface)]"
                />
                {!isAllDay && (
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full mt-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface)]"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Auto Video Meet Option */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-emerald-400">Generate Video Meet Room</h5>
                <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
                  Creates 1-click HD video call link (/meet/...)
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoMeet}
              onChange={(e) => setAutoMeet(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400"
            />
          </div>

          {/* Location / Room */}
          {!autoMeet && (
            <div>
              <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1">
                Location / Conference Room
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Conference Room A, HQ Main Floor"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface)]"
                />
              </div>
            </div>
          )}

          {/* Attendees Selection */}
          <div>
            <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1">
              Invite Team Members ({selectedAttendees.length} selected)
            </label>
            <div className="max-h-28 overflow-y-auto p-2 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] space-y-1">
              {users.map((u) => {
                const isSelected = selectedAttendees.includes(u.userId)
                return (
                  <button
                    key={u.userId}
                    type="button"
                    onClick={() => toggleAttendee(u.userId)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                      isSelected
                        ? 'bg-[var(--md-sys-color-primary)]/20 text-[var(--md-sys-color-primary)] font-bold'
                        : 'text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                    }`}
                  >
                    <span>{u.fullName}</span>
                    <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] uppercase">
                      {u.role.replace('_', ' ')}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1">
              Description / Agenda
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline objectives, talking points, or preparation notes..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface)] resize-none"
            />
          </div>

          {/* Submit Footer */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[var(--md-sys-color-outline-variant)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-[var(--md-sys-color-primary)] text-black hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <span>Save & Schedule</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
