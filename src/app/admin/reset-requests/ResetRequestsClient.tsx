'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { approvePasswordReset, rejectPasswordReset } from '@/app/actions/admin-reset'
import { Check, X, Clock, Mail } from 'lucide-react'
import { MobileAdminResetRequests } from '@/components/admin/reset-requests/MobileAdminResetRequests'

type RequestRecord = {
  id: string
  user_id: string
  email: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export function ResetRequestsClient({ initialRequests }: { initialRequests: RequestRecord[] }) {
  const [requests, setRequests] = useState(initialRequests)
  const [tempPasswords, setTempPasswords] = useState<Record<string, string>>({})
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const completedRequests = requests.filter(r => r.status !== 'pending')

  const handleApprove = async (id: string, userId: string) => {
    setLoadingId(id)
    const result = await approvePasswordReset(id, userId)
    if (result.success && result.tempPassword) {
      setTempPasswords(prev => ({ ...prev, [id]: result.tempPassword }))
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r))
    } else {
      alert(result.error || 'Approval failed')
    }
    setLoadingId(null)
  }

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this request?')) return
    
    setLoadingId(id)
    const result = await rejectPasswordReset(id)
    if (result.success) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
    } else {
      alert(result.error || 'Rejection failed')
    }
    setLoadingId(null)
  }

  return (
    <div className="flex flex-col gap-2.5 sm:gap-6">
      {/* DEDICATED PURPOSE-BUILT MOBILE VIEW (< 768px) */}
      <div className="md:hidden">
        <MobileAdminResetRequests
          requests={requests}
          tempPasswords={tempPasswords}
          loadingId={loadingId}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>

      {/* DESKTOP VIEW (>= 768px) - 100% UNTOUCHED ORIGINAL LAYOUT */}
      <div className="hidden md:flex flex-col gap-6">
        <Card variant="elevated" className="border border-[var(--md-sys-color-outline-variant)]">
          <div className="p-4 border-b border-[var(--md-sys-color-outline-variant)]">
            <h3 className="font-bold">Pending Requests</h3>
          </div>
          <div className="divide-y divide-[var(--md-sys-color-outline-variant)]">
            {pendingRequests.length === 0 ? (
              <div className="p-6 text-center text-sm text-[var(--md-sys-color-on-surface-variant)]">
                No pending reset requests.
              </div>
            ) : (
              pendingRequests.map(req => (
                <div key={req.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-secondary-container)] flex items-center justify-center">
                      <Mail className="w-5 h-5 text-[var(--md-sys-color-on-secondary-container)]" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{req.email}</p>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        Requested on {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button 
                      variant="outlined" 
                      size="sm" 
                      onClick={() => handleReject(req.id)}
                      disabled={loadingId === req.id}
                      className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button 
                      variant="filled" 
                      size="sm" 
                      onClick={() => handleApprove(req.id, req.user_id)}
                      disabled={loadingId === req.id}
                      className="flex-1 sm:flex-none"
                      isLoading={loadingId === req.id}
                    >
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {completedRequests.length > 0 && (
          <Card variant="outlined" className="border border-[var(--md-sys-color-outline-variant)]">
            <div className="p-4 border-b border-[var(--md-sys-color-outline-variant)]">
              <h3 className="font-bold">Recent Activity</h3>
            </div>
            <div className="divide-y divide-[var(--md-sys-color-outline-variant)]">
              {completedRequests.map(req => (
                <div key={req.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between opacity-80">
                  <div>
                    <p className="font-medium text-sm">{req.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                      <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                        {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {tempPasswords[req.id] && (
                    <div className="bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-200 text-sm">
                      <strong>Temp Password:</strong> <code className="bg-white px-1 ml-1 rounded">{tempPasswords[req.id]}</code>
                      <p className="text-xs mt-1">Share this with the candidate securely.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
