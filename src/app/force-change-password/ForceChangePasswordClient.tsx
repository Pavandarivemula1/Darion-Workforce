'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { TextField } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { Snackbar } from '@/components/ui/Snackbar'
import { Lock, ShieldAlert } from 'lucide-react'

export function ForceChangePasswordClient() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
        data: { password_changed: true }
      })

      if (updateError) throw updateError
      
      // Update the user profile as well to keep DB in sync just in case
      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user?.id) {
         await supabase.from('profiles').update({ password_changed: true }).eq('id', userData.user.id)
      }

      // Force a session refresh to ensure the new JWT (with password_changed: true) is stored in cookies
      await supabase.auth.refreshSession()

      setSuccess('Password updated successfully! Redirecting...')
      
      // Short delay so they see the success message
      setTimeout(() => {
        // Hard redirect to clear Next.js client-side router cache
        window.location.href = '/candidate'
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-surface)] flex items-center justify-center p-4">
      <Card variant="elevated" className="w-full max-w-md border border-[var(--md-sys-color-outline-variant)]">
        <div className="p-6 sm:p-8 flex flex-col gap-6">
          <div className="text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] rounded-full flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">Action Required</h1>
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">
                For security reasons, you must change your default password before accessing the system.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading || !!success}
              startIcon={<Lock className="w-4 h-4" />}
            />

            <TextField
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading || !!success}
              startIcon={<Lock className="w-4 h-4" />}
            />

            <Button type="submit" disabled={isLoading || !!success} className="w-full mt-2">
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </div>
      </Card>

      <Snackbar
        message={error || ''}
        isOpen={!!error}
        onClose={() => setError(null)}
        type="error"
      />
      <Snackbar
        message={success || ''}
        isOpen={!!success}
        onClose={() => setSuccess(null)}
        type="success"
      />
    </div>
  )
}
