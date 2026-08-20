'use client'

import React, { useState } from 'react'
import {
  Lightbulb,
  CheckCircle2,
  User,
  ChevronRight,
  ChevronLeft,
  X,
  CalendarDays,
  Sparkles,
} from 'lucide-react'
import { CalendarPanel } from './CalendarPanel'

interface CompanionRailProps {
  currentUserId: string
  currentUserName: string
}

type CompanionTool = 'calendar' | 'keep' | 'tasks' | 'contacts' | null

export const CompanionRail: React.FC<CompanionRailProps> = ({
  currentUserId,
  currentUserName,
}) => {
  const [activeTool, setActiveTool] = useState<CompanionTool>(null)
  const [collapsed, setCollapsed] = useState(false)

  const toggleTool = (tool: CompanionTool) => {
    setActiveTool((prev) => (prev === tool ? null : tool))
  }

  return (
    <div className="flex h-full shrink-0 relative z-30 select-none">
      {/* Active Companion Tool Drawer (Slide-out panel) */}
      {activeTool && (
        <aside className="w-80 h-full bg-[var(--md-sys-color-surface-container-low)] border-l border-[var(--md-sys-color-outline-variant)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="px-4 py-3 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between bg-[var(--md-sys-color-surface-container)]">
            <div className="flex items-center gap-2">
              {activeTool === 'calendar' ? (
                <div className="w-6 h-6 rounded-md bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                  31
                </div>
              ) : activeTool === 'keep' ? (
                <div className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center">
                  <Lightbulb className="w-3.5 h-3.5" />
                </div>
              ) : activeTool === 'tasks' ? (
                <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
              <h4 className="text-xs font-bold text-[var(--md-sys-color-on-surface)] capitalize">
                {activeTool === 'calendar'
                  ? 'Calendar'
                  : activeTool === 'keep'
                  ? 'Keep Notes'
                  : activeTool === 'tasks'
                  ? 'Tasks'
                  : 'Contacts'}
              </h4>
            </div>
            <button
              onClick={() => setActiveTool(null)}
              className="p-1 rounded-lg text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto">
            {activeTool === 'calendar' ? (
              <CalendarPanel currentUserId={currentUserId} currentUserName={currentUserName} />
            ) : activeTool === 'keep' ? (
              <div className="p-4 space-y-3">
                <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
                  <input
                    type="text"
                    placeholder="Take a note..."
                    className="w-full text-xs bg-transparent border-0 focus:outline-none text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-on-surface-variant)]"
                  />
                </div>
                <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-xs">
                  <span className="font-bold text-[var(--md-sys-color-on-surface)] block mb-1">
                    Meeting Prep Checklist
                  </span>
                  <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                    Review Sprint 14 action items and update shift rosters before 10 AM.
                  </p>
                </div>
              </div>
            ) : activeTool === 'tasks' ? (
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
                  <input type="checkbox" className="rounded accent-[var(--md-sys-color-primary)] cursor-pointer" />
                  <span className="text-xs text-[var(--md-sys-color-on-surface)] flex-1">
                    Verify Darion Chat real-time status sync
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
                  <input type="checkbox" defaultChecked className="rounded accent-[var(--md-sys-color-primary)] cursor-pointer" />
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] line-through flex-1">
                    Design Google Chat 3-pane architecture
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
                Team directory and contacts sync active.
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Extreme Right 48px Companion Button Strip */}
      {!collapsed ? (
        <aside className="w-12 h-full bg-[var(--md-sys-color-surface-container-lowest)] border-l border-[var(--md-sys-color-outline-variant)] flex flex-col items-center py-3 justify-between">
          <div className="flex flex-col items-center gap-4 w-full">
            {/* 1. Google / Darion Calendar (31) */}
            <button
              type="button"
              onClick={() => toggleTool('calendar')}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeTool === 'calendar'
                  ? 'bg-blue-500/20 ring-2 ring-blue-500 shadow-xs'
                  : 'hover:bg-[var(--md-sys-color-surface-container-high)] hover:scale-105'
              }`}
              title="Calendar"
            >
              <div className="w-5 h-5 rounded-md bg-blue-500 text-white flex flex-col items-center justify-center shadow-2xs">
                <span className="text-[7px] font-black leading-none pt-0.5">31</span>
              </div>
            </button>

            {/* 2. Google Keep / Notes (Lightbulb) */}
            <button
              type="button"
              onClick={() => toggleTool('keep')}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeTool === 'keep'
                  ? 'bg-amber-500/20 ring-2 ring-amber-500 shadow-xs'
                  : 'hover:bg-[var(--md-sys-color-surface-container-high)] hover:scale-105'
              }`}
              title="Keep Notes"
            >
              <div className="w-5 h-5 rounded-md bg-amber-400 text-amber-950 flex items-center justify-center shadow-2xs">
                <Lightbulb className="w-3.5 h-3.5 fill-amber-950" />
              </div>
            </button>

            {/* 3. Google Tasks (Checkmark) */}
            <button
              type="button"
              onClick={() => toggleTool('tasks')}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeTool === 'tasks'
                  ? 'bg-blue-600/20 ring-2 ring-blue-600 shadow-xs'
                  : 'hover:bg-[var(--md-sys-color-surface-container-high)] hover:scale-105'
              }`}
              title="Tasks"
            >
              <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* 4. Google Contacts (User Circle) */}
            <button
              type="button"
              onClick={() => toggleTool('contacts')}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeTool === 'contacts'
                  ? 'bg-blue-500/20 ring-2 ring-blue-500 shadow-xs'
                  : 'hover:bg-[var(--md-sys-color-surface-container-high)] hover:scale-105'
              }`}
              title="Contacts"
            >
              <div className="w-5 h-5 rounded-md bg-blue-500 text-white flex items-center justify-center shadow-2xs">
                <User className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>

          {/* Bottom Collapse Toggle Arrow */}
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)] transition-all cursor-pointer"
            title="Collapse companion rail"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </aside>
      ) : (
        /* Collapsed minimal tab */
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="absolute right-0 bottom-3 w-5 h-8 bg-[var(--md-sys-color-surface-container)] border-l border-y border-[var(--md-sys-color-outline-variant)] rounded-l-md flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] shadow-xs transition-colors cursor-pointer"
          title="Expand companion rail"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
