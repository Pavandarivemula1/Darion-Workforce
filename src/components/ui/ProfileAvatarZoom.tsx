'use client'

import React, { useState } from 'react'
import { X, User } from 'lucide-react'

export interface ProfileAvatarZoomProps {
  avatarUrl?: string | null
  altText: string
  fallbackInitials: string
}

export const ProfileAvatarZoom: React.FC<ProfileAvatarZoomProps> = ({ avatarUrl, altText, fallbackInitials }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div 
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-[var(--md-sys-shape-corner-medium)] flex items-center justify-center font-bold text-xl shrink-0 ${
          avatarUrl ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
        }`}
        onClick={() => {
          if (avatarUrl) setIsOpen(true)
        }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={altText} className="w-full h-full object-cover rounded-[var(--md-sys-shape-corner-medium)]" />
        ) : (
          <span>{fallbackInitials}</span>
        )}
      </div>

      {isOpen && avatarUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={avatarUrl} 
              alt={altText} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  )
}
