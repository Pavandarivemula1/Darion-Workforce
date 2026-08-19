'use client'

import React from 'react'
import Link from 'next/link'
import {
  X,
  Calendar,
  Clock,
  Video,
  MapPin,
  Users,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Palmtree,
  CheckSquare,
} from 'lucide-react'
import { UnifiedCalendarItem, deleteCalendarEventAction } from '@/app/actions/calendar'

interface EventDetailModalProps {
  item: UnifiedCalendarItem | null
  onClose: () => void
  onEventUpdated: () => void
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ item, onClose, onEventUpdated }) => {
  if (!item) return null

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return
    try {
      await deleteCalendarEventAction(item.rawId)
      onEventUpdated()
      onClose()
    } catch (err: any) {
      alert(err.message || 'Failed to delete event')
    }
  }

  const formatDateTimeRange = (startIso: string, endIso: string, isAllDay: boolean) => {
    const start = new Date(startIso)
    const end = new Date(endIso)

    if (isAllDay) {
      return start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
    }

    const datePart = start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
    const startTime = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const endTime = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    return `${datePart} • ${startTime} - ${endTime}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header with color strip */}
        <div className="h-3 w-full" style={{ backgroundColor: item.color }} />

        <div className="px-5 py-4 border-b border-[var(--md-sys-color-outline-variant)] flex items-start justify-between gap-3">
          <div>
            <span
              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase mb-1"
              style={{ backgroundColor: `${item.color}25`, color: item.color }}
            >
              {item.badgeText}
            </span>
            <h3 className="text-lg font-bold text-[var(--md-sys-color-on-surface)] leading-snug">{item.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content details */}
        <div className="p-5 space-y-4 text-xs">
          {/* Time */}
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-[var(--md-sys-color-primary)] mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-[var(--md-sys-color-on-surface)]">
                {formatDateTimeRange(item.startTime, item.endTime, item.isAllDay)}
              </p>
              <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                {item.isAllDay ? 'All Day Event' : 'Scheduled Duration'}
              </p>
            </div>
          </div>

          {/* Video Meet Call Banner */}
          {item.meetUrl && (
            <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container)] dark:bg-[#141b2b] border border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center font-bold">
                  <Video className="w-4 h-4 text-[var(--md-sys-color-primary)]" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[var(--md-sys-color-on-surface)] dark:text-white">Live Video Meeting</h4>
                  <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400">WebRTC HD Video & Screen Sharing</p>
                </div>
              </div>
              <Link
                href={item.meetUrl}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-semibold text-xs tracking-wide hover:opacity-90 active:scale-95 transition-all shadow-xs"
              >
                <span>Join Meet</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Location */}
          {item.location && !item.meetUrl && (
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[var(--md-sys-color-primary)] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-[var(--md-sys-color-on-surface)]">{item.location}</p>
                <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">Room / Physical Location</p>
              </div>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
              <p className="text-xs text-[var(--md-sys-color-on-surface)] leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            </div>
          )}

          {/* Organizer / Metadata */}
          {item.organizerName && (
            <div className="flex items-center justify-between text-[11px] text-[var(--md-sys-color-on-surface-variant)] pt-1 border-t border-[var(--md-sys-color-outline-variant)]">
              <span>Organized by:</span>
              <span className="font-semibold text-[var(--md-sys-color-on-surface)]">{item.organizerName}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] flex items-center justify-between">
          <div>
            {item.canEdit && item.source === 'custom_event' && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
