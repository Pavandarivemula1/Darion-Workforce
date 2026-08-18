'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Copy,
  Check,
  X,
  Search,
} from 'lucide-react'

type RequestRecord = {
  id: string
  user_id: string
  email: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface MobileAdminResetRequestsProps {
  requests: RequestRecord[]
  tempPasswords: Record<string, string>
  loadingId: string | null
  onApprove: (id: string, userId: string) => void
  onReject: (id: string) => void
}

export const MobileAdminResetRequests: React.FC<MobileAdminResetRequestsProps> = ({
  requests,
  tempPasswords,
  loadingId,
  onApprove,
  onReject,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'activity'>('pending')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const pendingRequests = requests.filter((r) => r.status === 'pending')
  const completedRequests = requests.filter((r) => r.status !== 'pending')
  const approvedCount = requests.filter((r) => r.status === 'approved').length

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* 1. Executive Reset Command Strip */}
      <div className="p-3 rounded-2xl bg-slate-900 dark:bg-slate-950 text-slate-100 border border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Dispatches</span>
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
            {pendingRequests.length} Pending Tickets • {approvedCount} Resolved
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700">
          {requests.length} Total
        </span>
      </div>

      {/* 2. 2x2 Bento Matrix */}
      <div className="grid grid-cols-2 gap-2">
        {/* Metric 1: Pending Tickets */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Pending Tickets
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {pendingRequests.length}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Awaiting Dispatch</span>
          </div>
        </div>

        {/* Metric 2: Resolved */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Resolved
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {approvedCount}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Temporary Pass Issued</span>
          </div>
        </div>

        {/* Metric 3: Total Requests */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              All Tickets
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black font-mono text-[var(--md-sys-color-on-surface)]">
              {requests.length}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Lifetime Requests</span>
          </div>
        </div>

        {/* Metric 4: Security Status */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              2FA Security
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] block">
              Active Enforced
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Admin Verified</span>
          </div>
        </div>
      </div>

      {/* 3. Section Switcher Pill */}
      <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'pending'
              ? 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] shadow-2xs border border-[var(--md-sys-color-outline-variant)]'
              : 'text-[var(--md-sys-color-on-surface-variant)]'
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>Pending ({pendingRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'activity'
              ? 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] shadow-2xs border border-[var(--md-sys-color-outline-variant)]'
              : 'text-[var(--md-sys-color-on-surface-variant)]'
          }`}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>Resolved ({completedRequests.length})</span>
        </button>
      </div>

      {/* 4. Tab Content */}
      {activeTab === 'pending' && (
        <div className="flex flex-col gap-2">
          {pendingRequests.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
              No pending reset requests.
            </div>
          ) : (
            pendingRequests.map((req) => {
              const isLoading = loadingId === req.id

              return (
                <Card
                  key={req.id}
                  variant="outlined"
                  className="p-2.5 rounded-2xl flex flex-col gap-2 relative overflow-hidden transition-all border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] shadow-2xs"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[var(--md-sys-color-on-surface)] truncate">{req.email}</p>
                        <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-mono">
                          Requested: {new Date(req.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
                      Pending
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-1 border-t border-[var(--md-sys-color-outline-variant)]">
                    <Button
                      variant="filled"
                      size="xs"
                      className="flex-1 h-7 text-[11px]"
                      onClick={() => onApprove(req.id, req.user_id)}
                      disabled={isLoading}
                      isLoading={isLoading}
                      icon={<Check className="w-3 h-3" />}
                    >
                      Approve & Reset
                    </Button>

                    <button
                      onClick={() => onReject(req.id)}
                      disabled={isLoading}
                      className="flex-1 h-7 rounded-lg bg-[var(--md-sys-color-surface-container-high)] hover:bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-3 h-3" />
                      <span>Reject</span>
                    </button>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="flex flex-col gap-2">
          {completedRequests.length === 0 ? (
            <div className="py-6 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
              No recent activity.
            </div>
          ) : (
            completedRequests.map((req) => {
              const isApproved = req.status === 'approved'
              const tempPass = tempPasswords[req.id]

              return (
                <Card
                  key={req.id}
                  variant="outlined"
                  className="p-2.5 rounded-2xl flex flex-col gap-2 relative overflow-hidden transition-all border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[var(--md-sys-color-on-surface)] truncate">{req.email}</p>
                      <p className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-mono">
                        {new Date(req.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/60 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/40">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {tempPass && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-[10px] uppercase">Temp Pass:</span>
                        <span className="font-bold">{tempPass}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(tempPass, req.id)}
                        className="p-1 rounded hover:bg-amber-500/20 cursor-pointer"
                        title="Copy Password"
                      >
                        {copiedKey === req.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}
                </Card>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
