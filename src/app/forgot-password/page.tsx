'use client'

import React, { useActionState, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { TextField } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { Snackbar } from '@/components/ui/Snackbar'
import { Mail, Clock, ShieldCheck } from 'lucide-react'
import { requestPasswordResetAction } from '@/app/actions/forgot-password'

const initialState: { error?: string; success?: boolean } = {
  error: '',
  success: false
}

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, initialState)
  const [dismissedError, setDismissedError] = useState<string | null>(null)
  
  // State for toggling between Admin Approval and Email Reset
  const [resetMethod, setResetMethod] = useState<'admin' | 'email_reset'>('admin')

  const activeError = state?.error && state.error !== dismissedError ? state.error : null

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)]">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shadow-[var(--md-sys-elevation-1)]">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
            Reset Password
          </h1>
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
            Darion Workforce &bull; Recover your account
          </p>
        </div>

        {/* Reset Card */}
        <Card variant="elevated" className="w-full border border-[var(--md-sys-color-outline-variant)]">
          {state?.success ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-12 h-12 rounded-full bg-[var(--md-sys-color-primary-container)] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[var(--md-sys-color-primary)]" />
              </div>
              <h2 className="text-xl font-bold">Request Sent</h2>
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] px-4">
                {resetMethod === 'email_reset' 
                  ? "Check your email for a secure password reset link. Once you click it, you will be prompted for your Authenticator App code if you have MFA enabled."
                  : "If the email is registered, an admin will review your request. Once approved, you will receive further instructions."}
              </p>
              <Link href="/login" className="mt-2">
                <Button variant="filled">Return to Login</Button>
              </Link>
            </div>
          ) : (
            <form action={formAction} className="flex flex-col gap-5">
              
              <input type="hidden" name="method" value={resetMethod} />

              <div className="flex gap-2 p-1 bg-[var(--md-sys-color-surface-container-highest)] rounded-[var(--md-sys-shape-corner-medium)]">
                <button
                  type="button"
                  onClick={() => setResetMethod('admin')}
                  className={`flex-1 py-2 text-sm font-medium rounded-[var(--md-sys-shape-corner-small)] transition-colors ${
                    resetMethod === 'admin' 
                      ? 'bg-[var(--md-sys-color-surface)] shadow-sm text-[var(--md-sys-color-on-surface)]' 
                      : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                  }`}
                >
                  Admin Approval
                </button>
                <button
                  type="button"
                  onClick={() => setResetMethod('email_reset')}
                  className={`flex-1 py-2 text-sm font-medium rounded-[var(--md-sys-shape-corner-small)] transition-colors ${
                    resetMethod === 'email_reset' 
                      ? 'bg-[var(--md-sys-color-surface)] shadow-sm text-[var(--md-sys-color-on-surface)]' 
                      : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                  }`}
                >
                  Email Reset
                </button>
              </div>

              <TextField
                name="email"
                type="email"
                label="Email Address"
                required
                autoComplete="email"
                disabled={isPending}
                startIcon={<Mail className="w-5 h-5" />}
              />

              {state?.error && (
                <div
                  className="p-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs font-medium flex items-center gap-2"
                  role="alert"
                >
                  <span>{state.error}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="filled"
                size="lg"
                className="w-full mt-2"
                isLoading={isPending}
              >
                {resetMethod === 'admin' ? 'Request Admin Reset' : 'Send Reset Link'}
              </Button>

              <div className="text-center mt-2">
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-[var(--md-sys-color-primary)] hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </Card>

        {/* Footer info */}
        <div className="text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
          Protected by Supabase Auth & Row Level Security
        </div>
      </div>

      <Snackbar
        message={activeError}
        variant="error"
        onClose={() => setDismissedError(state?.error || null)}
      />
    </main>
  )
}
