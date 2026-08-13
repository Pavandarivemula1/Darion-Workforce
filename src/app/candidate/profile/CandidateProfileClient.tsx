'use client'

import React, { useActionState, useRef } from 'react'
import { updateCandidatePasswordAction } from '@/app/actions/auth'
import { Card } from '@/components/ui/Card'
import { TextField } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { Snackbar } from '@/components/ui/Snackbar'
import { User, Mail, ShieldCheck, Calendar, KeyRound, Lock, IndianRupee, Phone, MapPin, FileText, IdCard } from 'lucide-react'
import { MfaSetup } from './MfaSetup'
import { ProfileAvatarZoom } from '@/components/ui/ProfileAvatarZoom'

export interface CandidateProfileClientProps {
  profile: {
    id: string
    full_name: string
    role: string
    created_at: string
    hourly_rate?: number
    avatar_url?: string
    phone_number?: string
    address?: string
    id_number?: string
  }
  email: string
}

export const CandidateProfileClient: React.FC<CandidateProfileClientProps> = ({
  profile,
  email,
}) => {
  const [state, formAction, isPending] = useActionState(updateCandidatePasswordAction, null)
  const [dismissed, setDismissed] = React.useState<boolean>(false)
  const formRef = useRef<HTMLFormElement>(null)

  const formattedDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const isSuccess = !!state?.success
  const errorMsg = !dismissed && state?.error ? state.error : null
  const successMsg = !dismissed && isSuccess ? 'Password updated successfully!' : null

  const handleSubmit = () => {
    setDismissed(false)
  }

  const rate = profile.hourly_rate || 0

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">Candidate Profile</h2>
        <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
          View your personal details, hourly payment rate, and update your password
        </p>
      </div>

      {/* Account Info Card */}
      <Card variant="elevated" className="border border-[var(--md-sys-color-outline-variant)]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-[var(--md-sys-color-outline-variant)]">
            <div className="flex items-center gap-3">
              <ProfileAvatarZoom 
                avatarUrl={profile.avatar_url} 
                altText={profile.full_name} 
                fallbackInitials={profile.full_name.charAt(0).toUpperCase()} 
              />
              <div className="flex flex-col justify-center">
                <h3 className="text-lg font-bold leading-tight">{profile.full_name}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                  <span>Candidate Account</span>
                  {profile.id_number && (
                    <>
                      <span className="text-[var(--md-sys-color-outline)]">•</span>
                      <a 
                        href={`/api/verify-redirect?idNumber=${profile.id_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono font-medium text-[var(--md-sys-color-primary)] hover:underline flex items-center gap-1"
                        title="Verify ID Card"
                      >
                        {profile.id_number}
                        <ShieldCheck className="w-3 h-3" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {profile.id_number && (
              <a
                href={`/api/verify-redirect?idNumber=${profile.id_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 hidden sm:inline-flex items-center justify-center gap-2 px-5 h-10 rounded-full text-sm font-semibold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:bg-[var(--md-sys-color-primary)]/90 transition-colors shadow-sm"
              >
                <IdCard className="w-4 h-4" />
                View ID Card
              </a>
            )}
          </div>
          
          {profile.id_number && (
            <div className="sm:hidden -mt-1 mb-2">
              <a
                href={`/api/verify-redirect?idNumber=${profile.id_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full gap-2 px-4 h-10 rounded-full text-sm font-semibold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:bg-[var(--md-sys-color-primary)]/90 transition-colors shadow-sm"
              >
                <IdCard className="w-4 h-4" />
                View ID Card
              </a>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)] flex items-center gap-3 border border-[var(--md-sys-color-outline-variant)]">
              <Mail className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-[var(--md-sys-color-on-surface-variant)]">Email Address</p>
                <p className="text-xs font-bold font-mono">{email || 'Not provided'}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)] flex items-center gap-3 border border-[var(--md-sys-color-outline-variant)]">
              <ShieldCheck className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-[var(--md-sys-color-on-surface-variant)]">Account Role</p>
                <p className="text-xs font-bold capitalize">{profile.role}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)] flex items-center gap-3 border border-[var(--md-sys-color-outline-variant)]">
              <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-[var(--md-sys-color-on-surface-variant)]">Assigned Hourly Rate</p>
                <p className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ₹{rate.toFixed(2)} / hr
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)] flex items-center gap-3 border border-[var(--md-sys-color-outline-variant)]">
              <Calendar className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-[var(--md-sys-color-on-surface-variant)]">Member Since</p>
                <p className="text-xs font-bold">{formattedDate}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)] flex items-center gap-3 border border-[var(--md-sys-color-outline-variant)]">
              <Phone className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-[var(--md-sys-color-on-surface-variant)]">Phone Number</p>
                <p className="text-xs font-bold">{profile.phone_number || 'Not provided'}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-surface-container)] flex items-center gap-3 border border-[var(--md-sys-color-outline-variant)]">
              <MapPin className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-[var(--md-sys-color-on-surface-variant)]">Address</p>
                <p className="text-xs font-bold">{profile.address || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Change Password Card */}
      <Card variant="outlined" className="border border-[var(--md-sys-color-outline-variant)]">
        <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="pb-3 border-b border-[var(--md-sys-color-outline-variant)] flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
            <div>
              <h3 className="text-base font-bold">Update Password</h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                Enter the password given by your Admin, then set your new password of choice.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <TextField
              id="currentPassword"
              name="currentPassword"
              type="password"
              label="Current Password (given by Admin)"
              placeholder="Enter current password"
              required
            />

            <TextField
              id="newPassword"
              name="newPassword"
              type="password"
              label="New Password"
              placeholder="Enter new password (min. 6 chars)"
              required
            />

            <TextField
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm New Password"
              placeholder="Re-enter new password"
              required
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="filled"
              size="md"
              icon={<Lock className="w-4 h-4" />}
              isLoading={isPending}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      <MfaSetup />

      <Snackbar
        message={errorMsg}
        variant="error"
        onClose={() => setDismissed(true)}
      />

      <Snackbar
        message={successMsg}
        variant="success"
        onClose={() => setDismissed(true)}
      />
    </div>
  )
}
