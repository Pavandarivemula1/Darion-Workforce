'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { TextField } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { Snackbar } from '@/components/ui/Snackbar'
import { Lock, ShieldCheck } from 'lucide-react'

export function ResetPasswordClient() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // MFA States
  const [needsMfa, setNeedsMfa] = useState(false)
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null)
  const [mfaCode, setMfaCode] = useState('')
  const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null)
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false)

  // Password Reset States
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  useEffect(() => {
    // 1. Listen for auth state change (PASSWORD_RECOVERY or SIGNED_IN)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        await checkSession()
      }
    })

    // 2. Initial session check (including code param exchange if needed)
    checkSession()

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const checkSession = async () => {
    setLoading(true)
    try {
      // Exchange code if landed directly with ?code=
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search)
        const code = searchParams.get('code')
        if (code) {
          await supabase.auth.exchangeCodeForSession(code)
        }
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('No active session found. The reset link may be invalid or expired.')
      }

      // Check if MFA is required
      const { data: mfaData, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (mfaError) throw mfaError

      if (mfaData.currentLevel === 'aal1' && mfaData.nextLevel === 'aal2') {
        setNeedsMfa(true)
        
        // Find the verified TOTP factor
        const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors()
        if (factorsError) throw factorsError
        
        const totpFactor = factorsData.totp.find(f => f.status === 'verified')
        if (!totpFactor) throw new Error('No verified authenticator app found.')
        
        setMfaFactorId(totpFactor.id)
        
        // Initiate challenge
        const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id })
        if (challenge.error) throw challenge.error
        
        setMfaChallengeId(challenge.data.id)
      } else {
        setNeedsMfa(false)
      }

    } catch (err: any) {
      setError(err.message || 'Failed to initialize password reset.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mfaFactorId || !mfaChallengeId || !mfaCode) return

    setIsVerifyingMfa(true)
    setError(null)
    
    try {
      const verify = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: mfaChallengeId,
        code: mfaCode,
      })

      if (verify.error) throw verify.error

      setNeedsMfa(false)
    } catch (err: any) {
      setError(err.message || 'Invalid code or verification failed')
    } finally {
      setIsVerifyingMfa(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsUpdatingPassword(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        data: { password_changed: true }
      })

      if (error) throw error

      // Update the user profile as well to keep DB in sync
      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user?.id) {
         await supabase.from('profiles').update({ password_changed: true }).eq('id', userData.user.id)
      }

      // Password updated successfully
      router.push('/login?reset_success=true')
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[var(--md-sys-color-surface)]">
        <p className="text-[var(--md-sys-color-on-surface-variant)] text-sm">Verifying reset link...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
            {needsMfa ? <ShieldCheck className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
            {needsMfa ? 'Verify Authenticator' : 'Set New Password'}
          </h1>
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
            {needsMfa 
              ? 'Please enter your 6-digit Authenticator App code to continue.'
              : 'Enter a strong new password for your account.'}
          </p>
        </div>

        <Card variant="elevated" className="w-full border border-[var(--md-sys-color-outline-variant)]">
          {needsMfa ? (
            <form onSubmit={handleVerifyMfa} className="flex flex-col gap-5">
              <TextField
                name="mfaCode"
                type="text"
                label="6-Digit Code"
                placeholder="000000"
                required
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                disabled={isVerifyingMfa}
                startIcon={<ShieldCheck className="w-5 h-5" />}
              />
              
              <Button
                type="submit"
                variant="filled"
                size="lg"
                className="w-full mt-2"
                isLoading={isVerifyingMfa}
                disabled={mfaCode.length < 6}
              >
                Verify Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5">
              <TextField
                name="newPassword"
                type="password"
                label="New Password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isUpdatingPassword}
                startIcon={<Lock className="w-5 h-5" />}
              />
              
              <TextField
                name="confirmPassword"
                type="password"
                label="Confirm New Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isUpdatingPassword}
                startIcon={<Lock className="w-5 h-5" />}
              />
              
              <Button
                type="submit"
                variant="filled"
                size="lg"
                className="w-full mt-2"
                isLoading={isUpdatingPassword}
                disabled={!newPassword || !confirmPassword}
              >
                Update Password
              </Button>
            </form>
          )}
        </Card>
      </div>

      <Snackbar
        message={error}
        variant="error"
        onClose={() => setError(null)}
      />
    </main>
  )
}
