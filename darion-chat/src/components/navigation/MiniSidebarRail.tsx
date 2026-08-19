'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  MessageSquare,
  Video,
  CalendarDays,
  Settings,
  LogOut,
  Moon,
  Sun,
  Shield,
  Volume2,
  Bell,
  CheckCircle2,
  CircleDot,
  Clock,
  MinusCircle,
  HelpCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export type ChatNavTab = 'chat' | 'meetings' | 'calendar' | 'settings'
export type UserPresenceStatus = 'available' | 'busy' | 'away' | 'dnd'

interface MiniSidebarRailProps {
  activeTab: ChatNavTab
  setActiveTab: (tab: ChatNavTab) => void
  unreadCount?: number
  currentUserId?: string
  currentUserName?: string
  currentUserRole?: string
  currentUserAvatar?: string
  onSignOut?: () => void
}

export const MiniSidebarRail: React.FC<MiniSidebarRailProps> = ({
  activeTab,
  setActiveTab,
  unreadCount = 0,
  currentUserId,
  currentUserName = 'Team Member',
  currentUserRole = 'member',
  currentUserAvatar,
  onSignOut,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [presenceStatus, setPresenceStatus] = useState<UserPresenceStatus>('available')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync dark mode class
  const toggleTheme = () => {
    const next = !isDarkMode
    setIsDarkMode(next)
    if (next) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleSignOut = async () => {
    if (onSignOut) {
      onSignOut()
    } else {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/login'
    }
  }

  const getStatusColor = (status: UserPresenceStatus) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-500 ring-emerald-400'
      case 'busy':
        return 'bg-rose-500 ring-rose-400'
      case 'away':
        return 'bg-amber-500 ring-amber-400'
      case 'dnd':
        return 'bg-purple-500 ring-purple-400'
    }
  }

  const getStatusLabel = (status: UserPresenceStatus) => {
    switch (status) {
      case 'available':
        return 'Available'
      case 'busy':
        return 'Busy / In Call'
      case 'away':
        return 'Away'
      case 'dnd':
        return 'Do Not Disturb'
    }
  }

  return (
    <>
      {/* ============================================================ */}
      {/* DESKTOP LEFT MINI RAIL (Hidden on mobile < md)                 */}
      {/* ============================================================ */}
      <aside className="hidden md:flex w-16 flex-shrink-0 flex-col items-center justify-between py-3.5 bg-[var(--md-sys-color-surface-container-low)] dark:bg-[#070a12] border-r border-[var(--md-sys-color-outline-variant)] dark:border-[#192237] select-none z-30">
        {/* TOP: Brand Logo & Main Nav Tabs */}
        <div className="w-full flex flex-col items-center gap-4">
          {/* App Logo Mark */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-600/30 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" title="Darion Chat Workspace">
            <MessageSquare className="w-5 h-5 fill-white/20" />
          </div>

          <div className="w-8 h-px bg-[var(--md-sys-color-outline-variant)] dark:bg-[#1e293b] my-0.5" />

          {/* Navigation Action Icons */}
          <nav className="flex flex-col items-center gap-2 w-full px-2">
            {/* 1. CHATS TAB */}
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`relative group w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                  : 'text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Chats & Channels"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-[9px] font-medium tracking-tight mt-0.5">Chat</span>

              {/* Active Indicator Bar */}
              {activeTab === 'chat' && (
                <div className="absolute -left-2 top-2.5 bottom-2.5 w-1 rounded-r-full bg-blue-500 shadow-sm" />
              )}

              {/* Unread Counter Badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-md animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* 2. MEETINGS TAB */}
            <button
              type="button"
              onClick={() => setActiveTab('meetings')}
              className={`relative group w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                activeTab === 'meetings'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                  : 'text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Instant Meetings & Video Calls"
            >
              <Video className="w-5 h-5" />
              <span className="text-[9px] font-medium tracking-tight mt-0.5">Meet</span>

              {activeTab === 'meetings' && (
                <div className="absolute -left-2 top-2.5 bottom-2.5 w-1 rounded-r-full bg-blue-500 shadow-sm" />
              )}
            </button>

            {/* 3. CALENDAR TAB */}
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`relative group w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                  : 'text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Team Schedule & Upcoming Calls"
            >
              <CalendarDays className="w-5 h-5" />
              <span className="text-[9px] font-medium tracking-tight mt-0.5">Calendar</span>

              {activeTab === 'calendar' && (
                <div className="absolute -left-2 top-2.5 bottom-2.5 w-1 rounded-r-full bg-blue-500 shadow-sm" />
              )}
            </button>

            {/* 4. SETTINGS TAB */}
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`relative group w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                  : 'text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Preferences & Audio Settings"
            >
              <Settings className="w-5 h-5" />
              <span className="text-[9px] font-medium tracking-tight mt-0.5">Settings</span>

              {activeTab === 'settings' && (
                <div className="absolute -left-2 top-2.5 bottom-2.5 w-1 rounded-r-full bg-blue-500 shadow-sm" />
              )}
            </button>
          </nav>
        </div>

        {/* BOTTOM: Profile Avatar & Status Switcher */}
        <div className="relative w-full flex flex-col items-center gap-2" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="relative p-0.5 rounded-full hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
            title={`${currentUserName} (${getStatusLabel(presenceStatus)})`}
          >
            {currentUserAvatar ? (
              <img
                src={currentUserAvatar}
                alt={currentUserName}
                className="w-10 h-10 rounded-full object-cover border border-slate-700 shadow-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-sm flex items-center justify-center border border-slate-700 shadow-md">
                {currentUserName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Status Dot */}
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-[#070a12] ${getStatusColor(
                presenceStatus
              )} shadow-sm`}
            />
          </button>

          {/* Profile & Presence Popover Drawer */}
          {showProfileMenu && (
            <div className="absolute bottom-2 left-16 ml-2 w-64 rounded-2xl bg-[var(--md-sys-color-surface-container)] dark:bg-[#101726] border border-[var(--md-sys-color-outline-variant)] dark:border-[#202d46] shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-left-2 duration-150">
              {/* User Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--md-sys-color-outline-variant)] dark:border-slate-800">
                {currentUserAvatar ? (
                  <img
                    src={currentUserAvatar}
                    alt={currentUserName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                    {currentUserName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[var(--md-sys-color-on-surface)] dark:text-white truncate">
                    {currentUserName}
                  </div>
                  <div className="inline-flex items-center gap-1 text-[10px] text-blue-400 capitalize font-medium">
                    <Shield className="w-3 h-3" />
                    <span>{currentUserRole.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Status Switcher */}
              <div className="py-2.5 border-b border-[var(--md-sys-color-outline-variant)] dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                  Set Presence Status
                </div>
                <div className="space-y-0.5">
                  {(['available', 'busy', 'away', 'dnd'] as UserPresenceStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setPresenceStatus(st)
                        setShowProfileMenu(false)
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        presenceStatus === st
                          ? 'bg-blue-600/15 text-blue-400'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(st)}`} />
                        <span>{getStatusLabel(st)}</span>
                      </div>
                      {presenceStatus === st && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 space-y-1">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Visible on mobile < md only)     */}
      {/* ============================================================ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--md-sys-color-surface-container)] dark:bg-[#090d16]/95 backdrop-blur-xl border-t border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b] flex items-center justify-around px-2 z-40 select-none">
        {/* Chat */}
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
            activeTab === 'chat'
              ? 'text-blue-500 dark:text-blue-400 font-bold'
              : 'text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1">Chat</span>
        </button>

        {/* Meet */}
        <button
          type="button"
          onClick={() => setActiveTab('meetings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
            activeTab === 'meetings'
              ? 'text-blue-500 dark:text-blue-400 font-bold'
              : 'text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400'
          }`}
        >
          <Video className="w-5 h-5" />
          <span className="text-[10px] mt-1">Meet</span>
        </button>

        {/* Calendar */}
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
            activeTab === 'calendar'
              ? 'text-blue-500 dark:text-blue-400 font-bold'
              : 'text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px] mt-1">Calendar</span>
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
            activeTab === 'settings'
              ? 'text-blue-500 dark:text-blue-400 font-bold'
              : 'text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] mt-1">Settings</span>
        </button>

        {/* Profile */}
        <button
          type="button"
          onClick={() => setShowProfileMenu(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 relative transition-colors text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400"
        >
          <div className="relative">
            {currentUserAvatar ? (
              <img
                src={currentUserAvatar}
                alt={currentUserName}
                className="w-5 h-5 rounded-full object-cover border border-slate-700"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center">
                {currentUserName.charAt(0).toUpperCase()}
              </div>
            )}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-[#090d16] ${getStatusColor(
                presenceStatus
              )}`}
            />
          </div>
          <span className="text-[10px] mt-1">Profile</span>
        </button>
      </nav>

      {/* Mobile Profile Modal */}
      {showProfileMenu && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--md-sys-color-surface-container)] dark:bg-[#101726] border border-[var(--md-sys-color-outline-variant)] dark:border-[#202d46] p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--md-sys-color-outline-variant)] dark:border-slate-800">
              {currentUserAvatar ? (
                <img
                  src={currentUserAvatar}
                  alt={currentUserName}
                  className="w-12 h-12 rounded-full object-cover border border-slate-700"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-base flex items-center justify-center">
                  {currentUserName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{currentUserName}</div>
                <div className="text-xs text-blue-400 capitalize">{currentUserRole.replace('_', ' ')}</div>
              </div>
            </div>

            <div className="py-3 border-b border-[var(--md-sys-color-outline-variant)] dark:border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Presence Status</div>
              <div className="grid grid-cols-2 gap-1.5">
                {(['available', 'busy', 'away', 'dnd'] as UserPresenceStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setPresenceStatus(st)
                      setShowProfileMenu(false)
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-colors ${
                      presenceStatus === st
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'bg-slate-900/60 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(st)}`} />
                    <span>{getStatusLabel(st)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex-1 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowProfileMenu(false)}
              className="w-full mt-3 py-2 text-center text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
