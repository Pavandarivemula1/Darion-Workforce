'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { ShieldCheck, QrCode as QrCodeIcon, Smartphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import QRCode from 'react-qr-code'

export function MfaSetup() {
  const supabase = createClient()
  const [factorId, setFactorId] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [checkingEnrollment, setCheckingEnrollment] = useState(true)
  const [showDisablePrompt, setShowDisablePrompt] = useState(false)
  const [disableCode, setDisableCode] = useState('')
  const [disableChallengeId, setDisableChallengeId] = useState<string | null>(null)

  useEffect(() => {
    checkMfaStatus()
  }, [])

  const checkMfaStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) throw error
      
      const totpFactor = data.totp.find(f => f.status === 'verified')
      setIsEnrolled(!!totpFactor)
    } catch (err: any) {
      console.error('Error checking MFA status', err)
    } finally {
      setCheckingEnrollment(false)
    }
  }

  const handleEnroll = async () => {
    setLoading(true)
    setError(null)
    try {
      // Clean up any unverified factors first to prevent "already exists" errors
      const { data: factorsData } = await supabase.auth.mfa.listFactors()
      if (factorsData?.totp) {
        const unverifiedFactors = factorsData.totp.filter(f => f.status !== 'verified')
        for (const factor of unverifiedFactors) {
          await supabase.auth.mfa.unenroll({ factorId: factor.id })
        }
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App'
      })
      if (error) throw error

      setFactorId(data.id)
      setQrCode(data.totp.uri)
    } catch (err: any) {
      setError(err.message || 'Failed to enroll MFA')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!factorId || !verifyCode) return

    setLoading(true)
    setError(null)
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId })
      if (challenge.error) throw challenge.error

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      })

      if (verify.error) throw verify.error

      setIsEnrolled(true)
      setFactorId(null)
      setQrCode(null)
      setVerifyCode('')
    } catch (err: any) {
      setError(err.message || 'Invalid code or verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleUnenrollClick = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) throw error

      const totpFactor = data.totp.find(f => f.status === 'verified')
      if (!totpFactor) throw new Error('No verified factor found')
      
      const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id })
      if (challenge.error) throw challenge.error
      
      setDisableChallengeId(challenge.data.id)
      setFactorId(totpFactor.id)
      setShowDisablePrompt(true)
    } catch (err: any) {
      setError(err.message || 'Failed to initiate disable')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDisable = async () => {
    if (!factorId || !disableChallengeId || !disableCode) return
    
    setLoading(true)
    setError(null)
    try {
      // 1. Verify code to upgrade to AAL2
      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: disableChallengeId,
        code: disableCode,
      })
      if (verify.error) throw verify.error

      // 2. Unenroll factor
      const unenrollRes = await supabase.auth.mfa.unenroll({ factorId })
      if (unenrollRes.error) throw unenrollRes.error

      setIsEnrolled(false)
      setShowDisablePrompt(false)
      setDisableCode('')
      setDisableChallengeId(null)
      setFactorId(null)
    } catch (err: any) {
      setError(err.message || 'Invalid code or failed to disable MFA')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelDisable = () => {
    setShowDisablePrompt(false)
    setDisableCode('')
    setDisableChallengeId(null)
    setError(null)
    setFactorId(null)
  }

  const handleCancelSetup = async () => {
    if (!factorId) {
      setQrCode(null)
      return
    }
    
    setLoading(true)
    try {
      await supabase.auth.mfa.unenroll({ factorId })
    } catch (err) {
      console.error('Failed to cancel factor', err)
    } finally {
      setFactorId(null)
      setQrCode(null)
      setVerifyCode('')
      setError(null)
      setLoading(false)
    }
  }

  if (checkingEnrollment) {
    return (
      <Card variant="outlined" className="border border-[var(--md-sys-color-outline-variant)]">
        <div className="p-4 flex items-center justify-center">
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">Checking MFA status...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card variant="outlined" className="border border-[var(--md-sys-color-outline-variant)]">
      <div className="p-4 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-5 h-5 ${isEnrolled ? 'text-emerald-500' : 'text-[var(--md-sys-color-on-surface-variant)]'}`} />
          <div>
            <h3 className="text-base font-bold">Multi-Factor Authentication</h3>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
              Secure your account using an Authenticator app
            </p>
          </div>
        </div>
        {isEnrolled ? (
          <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-emerald-100 text-emerald-700">
            Enabled
          </span>
        ) : (
          <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
            Disabled
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded text-xs font-medium border border-red-200">
            {error}
          </div>
        )}

        {isEnrolled ? (
          <div className="flex flex-col gap-4 items-start">
            <p className="text-sm">Your account is currently protected by MFA. You will be prompted to enter a code from your authenticator app when you log in.</p>
            
            {showDisablePrompt ? (
              <div className="bg-[var(--md-sys-color-surface-container-lowest)] p-4 rounded-lg border border-[var(--md-sys-color-outline-variant)] w-full max-w-sm flex flex-col gap-3">
                <h4 className="font-semibold text-sm text-red-600">Disable MFA</h4>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                  To securely disable MFA, please enter the current 6-digit code from your authenticator app.
                </p>
                <div className="flex gap-2 items-start mt-1">
                  <TextField
                    id="disableCode"
                    name="disableCode"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="filled" 
                    onClick={handleConfirmDisable}
                    disabled={disableCode.length < 6}
                    isLoading={loading}
                    className="bg-red-600 hover:bg-red-700 text-white mt-0.5"
                  >
                    Confirm
                  </Button>
                </div>
                <div className="mt-1">
                  <Button 
                    variant="text" 
                    size="sm"
                    onClick={handleCancelDisable}
                    disabled={loading}
                    className="text-[var(--md-sys-color-on-surface-variant)] p-0 h-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="outlined" 
                onClick={handleUnenrollClick}
                isLoading={loading}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Disable MFA
              </Button>
            )}
          </div>
        ) : qrCode ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex-shrink-0 flex items-center justify-center">
                <QRCode
                  value={qrCode}
                  size={160}
                  level="M"
                  className="w-[160px] h-[160px]"
                />
              </div>
              <div className="flex flex-col gap-4 flex-1 w-full pt-1">
                <div>
                  <h4 className="font-semibold text-sm">1. Scan the QR Code</h4>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
                    Open your authenticator app (like Google Authenticator or Authy) and scan the QR code to the left.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">2. Enter the Code</h4>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 mb-3">
                    Enter the 6-digit code generated by the app to verify setup.
                  </p>
                  <div className="flex gap-2 items-start">
                    <TextField
                      id="mfaCode"
                      name="mfaCode"
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      className="max-w-[150px]"
                    />
                    <Button 
                      variant="filled" 
                      onClick={handleVerify}
                      disabled={verifyCode.length < 6}
                      isLoading={loading}
                      className="mt-0.5"
                    >
                      Verify
                    </Button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[var(--md-sys-color-outline-variant)]">
                    <Button 
                      variant="outlined" 
                      size="sm"
                      onClick={handleCancelSetup}
                      disabled={loading}
                      className="text-[var(--md-sys-color-on-surface-variant)]"
                    >
                      Cancel Setup
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 items-start">
            <p className="text-sm">Add an extra layer of security to your account by enabling Multi-Factor Authentication.</p>
            <Button 
              variant="filled" 
              onClick={handleEnroll}
              isLoading={loading}
              icon={<QrCodeIcon className="w-4 h-4" />}
            >
              Setup Authenticator App
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
