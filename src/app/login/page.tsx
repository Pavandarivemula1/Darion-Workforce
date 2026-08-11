'use client'

import React, { useActionState, useState } from 'react'
import { loginAction } from '@/app/actions/auth'
import { Card } from '@/components/ui/Card'
import { TextField } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { Snackbar } from '@/components/ui/Snackbar'
import { Mail, Lock, Clock } from 'lucide-react'

const initialState = {
  error: '',
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState)
  const [dismissedError, setDismissedError] = useState<string | null>(null)

  const activeError = state?.error && state.error !== dismissedError ? state.error : null

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shadow-[var(--md-sys-elevation-1)]">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
            Candidate Time Tracker
          </h1>
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
            Sign in to access your attendance workspace
          </p>
        </div>

        {/* Login Card */}
        <Card variant="elevated" className="w-full border border-[var(--md-sys-color-outline-variant)]">
          <form action={formAction} className="flex flex-col gap-5">
            <TextField
              name="email"
              type="email"
              label="Email Address"
              required
              autoComplete="email"
              disabled={isPending}
              startIcon={<Mail className="w-5 h-5" />}
            />

            <TextField
              name="password"
              type="password"
              label="Password"
              required
              autoComplete="current-password"
              disabled={isPending}
              startIcon={<Lock className="w-5 h-5" />}
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
              Sign In
            </Button>
          </form>
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
