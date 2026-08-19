'use client'

import React, { useState } from 'react'
import { X, Hash, Lock, Globe, Loader2, Sparkles } from 'lucide-react'
import { createChannelAction } from '@/app/actions/messages'

interface NewChannelModalProps {
  isOpen: boolean
  onClose: () => void
  onChannelCreated: (convId: string) => void
}

export const NewChannelModal: React.FC<NewChannelModalProps> = ({ isOpen, onClose, onChannelCreated }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please provide a channel name')
      return
    }

    try {
      setLoading(true)
      setError('')
      const convId = await createChannelAction({
        name: name.trim(),
        description: description.trim(),
        isPrivate,
      })
      onChannelCreated(convId)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create channel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--md-sys-color-surface-container)] dark:bg-[#0e1424] border border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[var(--md-sys-color-on-surface)] dark:text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]/80 flex items-center justify-between bg-[var(--md-sys-color-surface)] dark:bg-[#141b2b]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shadow-xs">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] dark:text-white">Create Channel</h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400">Organize team conversations & topics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-[var(--md-sys-color-surface-container-lowest)] dark:bg-[#0c111d]">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface)] dark:text-slate-200 mb-1.5">
              Channel Name
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-500 font-bold text-sm">
                #
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="e.g. shift-updates, announcements"
                required
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-high)] dark:bg-[#141b2b] border border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] text-sm text-[var(--md-sys-color-on-surface)] dark:text-slate-100 placeholder-[var(--md-sys-color-on-surface-variant)] dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/40 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface)] dark:text-slate-200 mb-1.5">
              Description <span className="text-[var(--md-sys-color-on-surface-variant)] dark:text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this channel about?"
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-high)] dark:bg-[#141b2b] border border-[var(--md-sys-color-outline-variant)] dark:border-[#24324c] text-sm text-[var(--md-sys-color-on-surface)] dark:text-slate-100 placeholder-[var(--md-sys-color-on-surface-variant)] dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/40 transition-all resize-none"
            />
          </div>

          {/* Privacy Toggle */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface)] dark:text-slate-200 mb-2">
              Privacy Setting
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`p-3 rounded-xl border flex flex-col items-start gap-1.5 text-left transition-all ${
                  !isPrivate
                    ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold'
                    : 'border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] dark:border-[#24324c] dark:bg-[#141b2b] dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Globe className="w-4 h-4" />
                  <span>Public</span>
                </div>
                <span className="text-[11px] leading-tight opacity-80">Anyone in the team can view & join</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`p-3 rounded-xl border flex flex-col items-start gap-1.5 text-left transition-all ${
                  isPrivate
                    ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold'
                    : 'border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] dark:border-[#24324c] dark:bg-[#141b2b] dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Lock className="w-4 h-4" />
                  <span>Private</span>
                </div>
                <span className="text-[11px] leading-tight opacity-80">Only invited members can view</span>
              </button>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[var(--md-sys-color-outline-variant)] dark:border-[#1e293b]/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[var(--md-sys-color-primary)]/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Channel</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
