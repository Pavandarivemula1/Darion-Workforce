'use client'

import React, { useState, useEffect } from 'react'
import {
  Settings,
  Volume2,
  VolumeX,
  Bell,
  Moon,
  Sun,
  Keyboard,
  Sparkles,
  CheckCircle2,
  Play,
} from 'lucide-react'
import { soundEffects } from '@/lib/utils/soundEffects'

export const SettingsPanel: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [toastAlertsEnabled, setToastAlertsEnabled] = useState(true)

  useEffect(() => {
    setSoundEnabled(soundEffects.isSoundEnabled())
    setIsDarkMode(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleSound = () => {
    const next = soundEffects.toggleSound()
    setSoundEnabled(next)
  }

  const toggleTheme = () => {
    const next = !isDarkMode
    setIsDarkMode(next)
    if (next) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleTestSentSound = () => {
    soundEffects.unlockAudio()
    soundEffects.playMessageSentSound()
  }

  const handleTestIncomingSound = () => {
    soundEffects.unlockAudio()
    soundEffects.playMeetingAlertSound()
  }

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 bg-[var(--md-sys-color-surface)] dark:bg-[#0c111d] flex flex-col justify-between max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--md-sys-color-on-surface)] dark:text-white flex items-center gap-2">
              Chat & Audio Preferences
              <Sparkles className="w-4 h-4 text-blue-400" />
            </h2>
            <p className="text-xs text-slate-400">
              Customize sound effects, appearance, notifications and shortcuts
            </p>
          </div>
        </div>

        {/* 1. Audio & Sound Effects */}
        <div className="p-5 rounded-3xl bg-[var(--md-sys-color-surface-container)] dark:bg-[#101726] border border-[var(--md-sys-color-outline-variant)] dark:border-[#202d46] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/15 text-blue-400 flex items-center justify-center">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">Synthesized Audio Effects</h3>
                <p className="text-[11px] text-slate-400">
                  Zero-latency Web Audio pops, chimes and ringing alerts
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleSound}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>

          {soundEnabled && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-3">
              <span className="text-[11px] text-slate-400">Test Chimes:</span>
              <button
                type="button"
                onClick={handleTestSentSound}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
              >
                <Play className="w-3 h-3 text-blue-400" />
                <span>Message Sent Pop</span>
              </button>
              <button
                type="button"
                onClick={handleTestIncomingSound}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
              >
                <Play className="w-3 h-3 text-emerald-400" />
                <span>Join Chime</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Theme & Appearance */}
        <div className="p-5 rounded-3xl bg-[var(--md-sys-color-surface-container)] dark:bg-[#101726] border border-[var(--md-sys-color-outline-variant)] dark:border-[#202d46] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">Color Theme</h3>
              <p className="text-[11px] text-slate-400">
                {isDarkMode ? 'Dark Enterprise Mode (High Contrast)' : 'Light Clean Mode'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>

        {/* 3. Keyboard Shortcuts */}
        <div className="p-5 rounded-3xl bg-[var(--md-sys-color-surface-container)] dark:bg-[#101726] border border-[var(--md-sys-color-outline-variant)] dark:border-[#202d46] space-y-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">Pro Keyboard Shortcuts</h3>
              <p className="text-[11px] text-slate-400">Speed up your daily workflow</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Send Message</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono text-[10px]">Enter</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">New Line</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono text-[10px]">Shift + Enter</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Cancel Reply / Modal</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono text-[10px]">Escape</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Emoji / GIF Picker</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono text-[10px]">😊 Icon</kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 text-center text-[11px] text-slate-500">
        Preferences saved locally in your browser
      </div>
    </div>
  )
}
