'use client'

import React from 'react'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import { LoginPunctuality, LogoutPunctuality } from '@/lib/utils/punctuality'

export interface PunctualityBadgeProps {
  loginStatus?: LoginPunctuality
  loginText?: string
  logoutStatus?: LogoutPunctuality
  logoutText?: string
  isAutoCutoff?: boolean
  isStale?: boolean
  staleHours?: number
  className?: string
}

export const PunctualityBadge: React.FC<PunctualityBadgeProps> = ({
  loginStatus,
  loginText,
  logoutStatus,
  logoutText,
  isAutoCutoff,
  isStale,
  staleHours,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      {/* Auto-Cutoff Badge */}
      {isAutoCutoff && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs">
          <AlertTriangle className="w-3 h-3" /> Auto-Cutoff
        </span>
      )}

      {/* Stale Warning for running sessions */}
      {isStale && !isAutoCutoff && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse shadow-xs">
          <Clock className="w-3 h-3" /> Exceeded {staleHours || 12}h
        </span>
      )}

      {/* Login Punctuality */}
      {loginStatus && (
        <>
          {loginStatus === 'on_time' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              {loginText || 'On Time'}
            </span>
          )}

          {loginStatus === 'late' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <Clock className="w-3 h-3 text-amber-500" />
              {loginText || 'Late'}
            </span>
          )}

          {loginStatus === 'early' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30">
              <Clock className="w-3 h-3 text-sky-500" />
              {loginText || 'Early'}
            </span>
          )}
        </>
      )}

      {/* Logout Punctuality (if completed) */}
      {logoutStatus && (
        <>
          {logoutStatus === 'left_early' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
              <AlertCircle className="w-3 h-3 text-rose-500" />
              {logoutText || 'Left Early'}
            </span>
          )}

          {logoutStatus === 'overtime' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              <TrendingUp className="w-3 h-3 text-purple-500" />
              {logoutText || 'Overtime'}
            </span>
          )}
        </>
      )}
    </div>
  )
}
