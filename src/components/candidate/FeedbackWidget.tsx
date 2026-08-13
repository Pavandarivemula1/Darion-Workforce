'use client'

import React, { useState } from 'react'
import { MessageSquarePlus } from 'lucide-react'
import { FeedbackModal } from './FeedbackModal'

export const FeedbackWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-18 sm:bottom-6 right-5 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        aria-label="Give Feedback"
      >
        <MessageSquarePlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline text-xs font-semibold tracking-wide">
          Feedback
        </span>
      </button>

      <FeedbackModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
