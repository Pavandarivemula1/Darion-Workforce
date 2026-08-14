'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  Video,
  ScreenShare,
  PenTool,
  Lock,
  ArrowRight,
  CheckCircle2,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

export interface CandidateBetaGateProps {
  candidateName: string
  candidateEmail?: string
}

export const CandidateBetaGate: React.FC<CandidateBetaGateProps> = ({
  candidateName,
  candidateEmail,
}) => {
  const [hasRequested, setHasRequested] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRequestAccess = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setHasRequested(true)
    }, 600)
  }

  return (
    <div className="w-full flex flex-col items-center justify-center py-10 px-4">
      <div className="max-w-2xl w-full bg-gradient-to-b from-[var(--md-sys-color-surface-container)] to-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col items-center text-center gap-6 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 font-bold text-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Private Beta Preview</span>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
            Darion Meets is in Private Beta
          </h2>
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-2 max-w-lg leading-relaxed">
            Welcome, <strong className="text-[var(--md-sys-color-on-surface)]">{candidateName}</strong>. We are rolling out our high-definition, encrypted video meeting platform to selected teams and candidates.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full my-2">
          <div className="p-4 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] flex flex-col items-center gap-2 text-center shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Video className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">HD Calls</span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">Zero setup, instant peer video</span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] flex flex-col items-center gap-2 text-center shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <ScreenShare className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">Screen Sharing</span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">Live reviews & presentations</span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] flex flex-col items-center gap-2 text-center shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <PenTool className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">Whiteboard & Cloud</span>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">Auto Google Drive archives</span>
          </div>
        </div>

        {/* Action / Request State */}
        {hasRequested ? (
          <div className="p-4 w-full rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center gap-2 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Your access request has been sent! You will be notified once activated.</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <button
              type="button"
              onClick={handleRequestAccess}
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending Request...' : 'Request Beta Access'}</span>
            </button>
          </div>
        )}

        <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]/60 flex items-center gap-1">
          <Lock className="w-3 h-3" /> Encrypted & Managed by Darion Academy Admin Team
        </span>
      </div>
    </div>
  )
}
