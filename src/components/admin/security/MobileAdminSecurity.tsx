'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle,
  XCircle,
  KeyRound,
  Lock,
  UserCheck,
  Check,
  X,
} from 'lucide-react'

export interface MobileAdminSecurityProps {
  initialRequests: any[]
  formAction: (payload: FormData) => void
  isPending: boolean
  activeRequest: string | null
  setActiveRequest: (id: string) => void
}

export const MobileAdminSecurity: React.FC<MobileAdminSecurityProps> = ({
  initialRequests,
  formAction,
  isPending,
  activeRequest,
  setActiveRequest,
}) => {
  const pendingRequests = initialRequests.filter((r) => r.status === 'pending')
  const approvedCount = initialRequests.filter((r) => r.status === 'approved').length

  return (
    <div className="flex flex-col gap-2.5">
      {/* 1. Executive Security Command Strip */}
      <div className="p-3 rounded-2xl bg-slate-900 dark:bg-slate-950 text-slate-100 border border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security & MFA Guard</span>
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
            {pendingRequests.length} MFA Resets Pending • 2FA Enforced
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700">
          {initialRequests.length} Total
        </span>
      </div>

      {/* 2. 2x2 Bento Matrix */}
      <div className="grid grid-cols-2 gap-2">
        {/* Metric 1: Pending MFA Resets */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Pending Resets
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {pendingRequests.length}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Awaiting Authorization</span>
          </div>
        </div>

        {/* Metric 2: Resolved Resets */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Resolved Resets
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {approvedCount}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">MFA Cleared</span>
          </div>
        </div>

        {/* Metric 3: Protocol */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Auth Guard
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] block truncate">
              TOTP / Authenticator
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Standard 2FA Protocol</span>
          </div>
        </div>

        {/* Metric 4: Access Level */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Admin Level
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] block truncate">
              Privileged Role
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Super Admin Active</span>
          </div>
        </div>
      </div>

      {/* 3. Requests Feed */}
      <div className="flex flex-col gap-2">
        {initialRequests.length === 0 ? (
          <div className="py-6 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
            No pending MFA reset requests.
          </div>
        ) : (
          initialRequests.map((request) => {
            const isPendingRequest = request.status === 'pending'
            const isApproved = request.status === 'approved'

            return (
              <Card
                key={request.id}
                variant="outlined"
                className="p-2.5 rounded-2xl flex flex-col gap-2 relative overflow-hidden transition-all border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] shadow-2xs"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] font-bold text-[11px] flex items-center justify-center shrink-0">
                      {(request.profiles?.full_name || request.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[var(--md-sys-color-on-surface)] truncate">
                        {request.profiles?.full_name || request.email}
                      </p>
                      <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-mono truncate">
                        {request.email}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isPendingRequest ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
                        Pending
                      </span>
                    ) : isApproved ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
                        <CheckCircle className="w-3 h-3" /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/60 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/40">
                        <XCircle className="w-3 h-3" /> Rejected
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Strip */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--md-sys-color-surface-container-low)] text-xs text-[var(--md-sys-color-on-surface)] font-mono text-[10px]">
                  <span>Role: {request.profiles?.role || 'candidate'}</span>
                  <span>{new Date(request.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                </div>

                {/* Actions */}
                {isPendingRequest && (
                  <div className="flex items-center gap-1 pt-1 border-t border-[var(--md-sys-color-outline-variant)]">
                    <form action={formAction} className="flex-1" onSubmit={() => setActiveRequest(request.id)}>
                      <input type="hidden" name="requestId" value={request.id} />
                      <input type="hidden" name="userId" value={request.user_id} />
                      <input type="hidden" name="actionType" value="approve" />
                      <Button
                        type="submit"
                        variant="filled"
                        size="xs"
                        className="w-full h-7 text-[11px]"
                        isLoading={isPending && activeRequest === request.id}
                        icon={<Check className="w-3 h-3" />}
                      >
                        Approve (Reset MFA)
                      </Button>
                    </form>

                    <form action={formAction} className="flex-1" onSubmit={() => setActiveRequest(request.id)}>
                      <input type="hidden" name="requestId" value={request.id} />
                      <input type="hidden" name="userId" value={request.user_id} />
                      <input type="hidden" name="actionType" value="reject" />
                      <button
                        type="submit"
                        disabled={isPending && activeRequest === request.id}
                        className="w-full h-7 rounded-lg bg-[var(--md-sys-color-surface-container-high)] hover:bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <X className="w-3 h-3" />
                        <span>Reject</span>
                      </button>
                    </form>
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
