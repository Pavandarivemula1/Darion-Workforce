'use client'

import React, { useActionState, useState } from 'react'
import Link from 'next/link'
import { loginAction, verifyMfaLoginAction, magicLinkLoginAction, requestMfaResetAction } from '@/app/actions/auth'
import { Card } from '@/components/ui/Card'
import { TextField } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { Snackbar } from '@/components/ui/Snackbar'
import { Mail, Lock, Clock, ShieldCheck, ArrowLeft, Send } from 'lucide-react'

const initialLoginState: { error?: string; requiresMfa?: boolean } = {
  error: '',
  requiresMfa: false,
}

const initialMfaState: { error?: string } = {
  error: '',
}

const initialMagicLinkState: { error?: string; success?: boolean } = {
  error: '',
  success: false,
}

const initialMfaResetState: { error?: string; success?: boolean } = {
  error: '',
  success: false,
}

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<'password' | 'magic_link'>('password')
  const [showMfaReset, setShowMfaReset] = useState(false)

  const [loginState, loginFormAction, isLoginPending] = useActionState(loginAction, initialLoginState)
  const [mfaState, mfaFormAction, isMfaPending] = useActionState(verifyMfaLoginAction, initialMfaState)
  const [magicLinkState, magicLinkFormAction, isMagicLinkPending] = useActionState(magicLinkLoginAction, initialMagicLinkState)
  const [mfaResetState, mfaResetFormAction, isMfaResetPending] = useActionState(requestMfaResetAction, initialMfaResetState)
  
  const [dismissedError, setDismissedError] = useState<string | null>(null)

  const requiresMfa = loginState?.requiresMfa
  const activeError = showMfaReset
    ? (mfaResetState?.error && mfaResetState.error !== dismissedError ? mfaResetState.error : null)
    : requiresMfa 
      ? (mfaState?.error && mfaState.error !== dismissedError ? mfaState.error : null)
      : loginMethod === 'magic_link'
        ? (magicLinkState?.error && magicLinkState.error !== dismissedError ? magicLinkState.error : null)
        : (loginState?.error && loginState.error !== dismissedError ? loginState.error : null)

  const handleDismissError = () => {
    setDismissedError(showMfaReset ? (mfaResetState?.error || null) : requiresMfa ? (mfaState?.error || null) : loginMethod === 'magic_link' ? (magicLinkState?.error || null) : (loginState?.error || null))
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)]">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">

          <h1 className="text-3xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
            {showMfaReset ? 'Reset MFA' : requiresMfa ? 'Verify Identity' : 'Darion Workforce'}
          </h1>
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] px-4">
            {showMfaReset
              ? 'Request an admin to disable your Authenticator App'
              : requiresMfa 
                ? 'Enter the 6-digit code from your authenticator app' 
                : 'Darion Workforce \u2022 Sign in to access your workspace'
            }
          </p>
        </div>

        {/* Card */}
        <Card variant="elevated" className="w-full border border-[var(--md-sys-color-outline-variant)]">
          {showMfaReset ? (
            mfaResetState?.success ? (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="w-12 h-12 rounded-full bg-[var(--md-sys-color-primary-container)] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-[var(--md-sys-color-primary)]" />
                </div>
                <h2 className="text-xl font-bold">Request Sent</h2>
                <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] px-4">
                  An admin will review your request. Once approved, your MFA will be disabled and you will receive further instructions.
                </p>
                <Button variant="text" onClick={() => window.location.reload()} className="mt-2">
                  Return to Login
                </Button>
              </div>
            ) : (
              <form action={mfaResetFormAction} className="flex flex-col gap-5">
                <TextField
                  name="email"
                  type="email"
                  label="Registered Email Address"
                  required
                  autoComplete="email"
                  disabled={isMfaResetPending}
                  startIcon={<Mail className="w-5 h-5" />}
                />
                <Button
                  type="submit"
                  variant="filled"
                  size="lg"
                  className="w-full mt-2"
                  isLoading={isMfaResetPending}
                >
                  Submit Request
                </Button>
                <div className="mt-2 text-center">
                   <button
                     type="button"
                     onClick={() => setShowMfaReset(false)}
                     disabled={isMfaResetPending}
                     className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] flex items-center justify-center gap-1 w-full"
                   >
                     <ArrowLeft className="w-4 h-4" /> Back to MFA Verification
                   </button>
                </div>
              </form>
            )
          ) : requiresMfa ? (
            <form action={mfaFormAction} className="flex flex-col gap-5">
              <TextField
                name="mfaCode"
                type="text"
                label="6-Digit Authenticator Code"
                placeholder="000000"
                maxLength={6}
                required
                autoComplete="one-time-code"
                disabled={isMfaPending}
                startIcon={<ShieldCheck className="w-5 h-5" />}
              />

              {mfaState?.error && (
                <div
                  className="p-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs font-medium flex items-center gap-2"
                  role="alert"
                >
                  <span>{mfaState.error}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="filled"
                size="lg"
                className="w-full mt-2"
                isLoading={isMfaPending}
              >
                Verify Code
              </Button>
              
              <div className="mt-2 flex flex-col gap-4">
                 <button
                   type="button"
                   onClick={() => setShowMfaReset(true)}
                   disabled={isMfaPending}
                   className="text-sm font-medium text-[var(--md-sys-color-primary)] hover:underline flex items-center justify-center w-full"
                 >
                   Lost your Authenticator App?
                 </button>
                 <button
                   type="button"
                   onClick={() => window.location.reload()}
                   disabled={isMfaPending}
                   className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] flex items-center justify-center gap-1 w-full"
                 >
                   <ArrowLeft className="w-4 h-4" /> Back to Login
                 </button>
              </div>
            </form>
          ) : loginMethod === 'magic_link' ? (
            magicLinkState?.success ? (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="w-12 h-12 rounded-full bg-[var(--md-sys-color-primary-container)] flex items-center justify-center">
                  <Send className="w-6 h-6 text-[var(--md-sys-color-primary)]" />
                </div>
                <h2 className="text-xl font-bold">Check your email</h2>
                <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] px-4">
                  We sent a magic link to your email address. Click the link to log in.
                </p>
                <Button variant="text" onClick={() => setLoginMethod('password')} className="mt-2">
                  Return to Login
                </Button>
              </div>
            ) : (
              <form action={magicLinkFormAction} className="flex flex-col gap-5">
                <div className="flex gap-2 p-1 bg-[var(--md-sys-color-surface-container-highest)] rounded-[var(--md-sys-shape-corner-medium)] mb-2">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('password')}
                    className="flex-1 py-2 text-sm font-medium rounded-[var(--md-sys-shape-corner-small)] transition-colors text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-2 text-sm font-medium rounded-[var(--md-sys-shape-corner-small)] transition-colors bg-[var(--md-sys-color-surface)] shadow-sm text-[var(--md-sys-color-on-surface)]"
                  >
                    Magic Link
                  </button>
                </div>

                <TextField
                  name="email"
                  type="email"
                  label="Email Address"
                  required
                  autoComplete="email"
                  disabled={isMagicLinkPending}
                  startIcon={<Mail className="w-5 h-5" />}
                />

                <Button
                  type="submit"
                  variant="filled"
                  size="lg"
                  className="w-full mt-2"
                  isLoading={isMagicLinkPending}
                >
                  Send Magic Link
                </Button>
              </form>
            )
          ) : (
            <form action={loginFormAction} className="flex flex-col gap-5">
              <div className="flex gap-2 p-1 bg-[var(--md-sys-color-surface-container-highest)] rounded-[var(--md-sys-shape-corner-medium)] mb-2">
                <button
                  type="button"
                  className="flex-1 py-2 text-sm font-medium rounded-[var(--md-sys-shape-corner-small)] transition-colors bg-[var(--md-sys-color-surface)] shadow-sm text-[var(--md-sys-color-on-surface)]"
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('magic_link')}
                  className="flex-1 py-2 text-sm font-medium rounded-[var(--md-sys-shape-corner-small)] transition-colors text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]"
                >
                  Magic Link
                </button>
              </div>

              <TextField
                name="email"
                type="email"
                label="Email Address"
                required
                autoComplete="email"
                disabled={isLoginPending}
                startIcon={<Mail className="w-5 h-5" />}
              />

              <div className="flex flex-col gap-2">
                <TextField
                  name="password"
                  type="password"
                  label="Password"
                  required
                  autoComplete="current-password"
                  disabled={isLoginPending}
                  startIcon={<Lock className="w-5 h-5" />}
                />
                <div className="flex justify-end">
                  <Link 
                    href="/forgot-password" 
                    className="text-sm font-medium text-[var(--md-sys-color-primary)] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                variant="filled"
                size="lg"
                className="w-full mt-2"
                isLoading={isLoginPending}
              >
                Sign In
              </Button>
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
        onClose={handleDismissError}
      />
    </main>
  )
}
