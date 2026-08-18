'use client'

import React, { useActionState, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Snackbar } from '@/components/ui/Snackbar'
import { ShieldCheck, XCircle, CheckCircle, Clock } from 'lucide-react'
import { approveMfaResetAction } from '@/app/actions/admin'
import { MobileAdminSecurity } from '@/components/admin/security/MobileAdminSecurity'

const initialState = {
  error: '',
  success: false
}

export function SecurityManagementClient({ initialRequests }: { initialRequests: any[] }) {
  const [state, formAction, isPending] = useActionState(approveMfaResetAction, initialState)
  const [activeRequest, setActiveRequest] = useState<string | null>(null)
  
  return (
    <div className="flex flex-col gap-2.5 sm:gap-6">
      {/* DEDICATED PURPOSE-BUILT MOBILE VIEW (< 768px) */}
      <div className="md:hidden">
        <MobileAdminSecurity
          initialRequests={initialRequests}
          formAction={formAction}
          isPending={isPending}
          activeRequest={activeRequest}
          setActiveRequest={setActiveRequest}
        />
      </div>

      {/* DESKTOP VIEW (>= 768px) - 100% UNTOUCHED ORIGINAL LAYOUT */}
      <div className="hidden md:flex flex-col gap-6">
        {initialRequests.length === 0 ? (
          <Card variant="outlined" className="p-12 flex flex-col items-center justify-center text-center gap-4 border-dashed">
            <div className="w-16 h-16 rounded-full bg-[var(--md-sys-color-surface-container-high)] flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)]">
              <ShieldCheck className="w-8 h-8 opacity-50" />
            </div>
            <div>
              <h3 className="text-lg font-bold">No Pending Requests</h3>
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                There are currently no MFA reset requests.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {initialRequests.map((request) => (
              <Card key={request.id} variant="elevated" className="flex flex-col border border-[var(--md-sys-color-outline-variant)]">
                <div className="p-4 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center shrink-0">
                      <span className="font-bold uppercase">
                        {request.profiles?.full_name?.charAt(0) || request.email.charAt(0)}
                      </span>
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-semibold text-sm truncate" title={request.profiles?.full_name || request.email}>
                        {request.profiles?.full_name || request.email}
                      </h3>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate" title={request.email}>
                        {request.email}
                      </p>
                    </div>
                  </div>
                  {request.status === 'pending' ? (
                    <div className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pending
                    </div>
                  ) : request.status === 'approved' ? (
                    <div className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Approved
                    </div>
                  ) : (
                    <div className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Rejected
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                  <div className="text-sm">
                    <p className="text-[var(--md-sys-color-on-surface-variant)]">Role: <span className="text-[var(--md-sys-color-on-surface)] capitalize">{request.profiles?.role || 'Unknown'}</span></p>
                    <p className="text-[var(--md-sys-color-on-surface-variant)]">Requested: <span className="text-[var(--md-sys-color-on-surface)]">{new Date(request.created_at).toLocaleDateString()}</span></p>
                  </div>
                  
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <form action={formAction} className="flex-1" onSubmit={() => setActiveRequest(request.id)}>
                        <input type="hidden" name="requestId" value={request.id} />
                        <input type="hidden" name="userId" value={request.user_id} />
                        <input type="hidden" name="actionType" value="reject" />
                        <Button
                          type="submit"
                          variant="outlined"
                          size="sm"
                          className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                          isLoading={isPending && activeRequest === request.id}
                        >
                          Reject
                        </Button>
                      </form>
                      
                      <form action={formAction} className="flex-1" onSubmit={() => setActiveRequest(request.id)}>
                        <input type="hidden" name="requestId" value={request.id} />
                        <input type="hidden" name="userId" value={request.user_id} />
                        <input type="hidden" name="actionType" value="approve" />
                        <Button
                          type="submit"
                          variant="filled"
                          size="sm"
                          className="w-full"
                          isLoading={isPending && activeRequest === request.id}
                        >
                          Approve (Disable MFA)
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Snackbar 
        message={state?.error || null} 
        variant="error" 
      />
      {state?.success && (
        <Snackbar 
          message="Request processed successfully" 
          variant="success" 
        />
      )}
    </div>
  )
}
