'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(
  prevState: { error?: string; requiresMfa?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; requiresMfa?: boolean }> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message || 'Invalid email or password.' }
  }

  if (!data.user) {
    return { error: 'Authentication failed. Please try again.' }
  }

  // Check MFA status
  const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (mfaData?.nextLevel === 'aal2' && mfaData?.currentLevel === 'aal1') {
    return { requiresMfa: true }
  }

  // Fast role check from user_metadata first, fallback to DB if missing
  let role = data.user.user_metadata?.role || data.user.app_metadata?.role

  if (!role) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, password_changed')
      .eq('id', data.user.id)
      .maybeSingle()
    role = profile?.role || 'candidate'
    const isManagement = ['admin', 'super_admin', 'hr_manager', 'supervisor', 'auditor'].includes(role)
    const password_changed = profile?.password_changed ?? isManagement

    // Update user metadata in Supabase Auth so future proxy checks & logins read role directly from JWT (0ms DB cost)
    supabase.auth.updateUser({ data: { role, password_changed } }).catch(() => {})
  }

  const isManagement = ['admin', 'super_admin', 'hr_manager', 'supervisor', 'auditor'].includes(role)
  if (isManagement) {
    redirect('/admin')
  } else {
    redirect('/candidate')
  }
}

export async function verifyMfaLoginAction(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const code = formData.get('mfaCode') as string
  if (!code || code.length < 6) {
    return { error: 'Invalid authenticator code.' }
  }

  const supabase = await createClient()

  // User must already be logged in (AAL1)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Session expired. Please log in again.' }
  }

  const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
  if (factorsError) return { error: factorsError.message }

  const totpFactor = factors?.totp.find(f => f.status === 'verified')
  if (!totpFactor) return { error: 'No verified authenticator app found on this account.' }

  const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id })
  if (challenge.error) return { error: challenge.error.message }

  const verify = await supabase.auth.mfa.verify({
    factorId: totpFactor.id,
    challengeId: challenge.data.id,
    code,
  })

  if (verify.error) return { error: verify.error.message }

  // MFA verified successfully (session is now AAL2). Check roles & redirect.
  let role = user.user_metadata?.role || user.app_metadata?.role

  if (!role) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, password_changed')
      .eq('id', user.id)
      .maybeSingle()
    role = profile?.role || 'candidate'
    const isManagement = ['admin', 'super_admin', 'hr_manager', 'supervisor', 'auditor'].includes(role)
    const password_changed = profile?.password_changed ?? isManagement

    supabase.auth.updateUser({ data: { role, password_changed } }).catch(() => {})
  }

  const isManagement = ['admin', 'super_admin', 'hr_manager', 'supervisor', 'auditor'].includes(role)
  if (isManagement) {
    redirect('/admin')
  } else {
    redirect('/candidate')
  }
}

export async function updateCandidatePasswordAction(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All password fields are required.' }
  }

  if (newPassword.length < 6) {
    return { error: 'New password must be at least 6 characters.' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New password and confirm password do not match.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return { error: 'Unauthorized. Please sign in.' }
  }

  // Verify current password by attempting signInWithPassword
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (verifyError) {
    return { error: 'Current password is incorrect. Please verify your current password.' }
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
    data: { password_changed: true }
  })

  if (updateError) {
    return { error: updateError.message || 'Failed to update password.' }
  }

  return { success: true }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function magicLinkLoginAction(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const email = formData.get('email') as string
  if (!email) {
    return { error: 'Email is required.' }
  }

  const supabase = await createClient()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'production' ? 'https://workforce.darion.in' : 'http://localhost:3000')
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/login`,
    }
  })

  if (error) {
    return { error: error.message || 'Failed to send magic link.' }
  }

  return { success: true }
}

export async function requestMfaResetAction(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const email = formData.get('email') as string
  if (!email) {
    return { error: 'Email is required.' }
  }

  const supabase = await createClient()

  // Find the user by email
  const { data: userProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (profileError || !userProfile) {
    // Return success to prevent email enumeration
    return { success: true }
  }

  // Insert into mfa_reset_requests table
  const { error: insertError } = await supabase
    .from('mfa_reset_requests')
    .insert({
      user_id: userProfile.id,
      email: email,
      status: 'pending'
    })

  if (insertError) {
    return { error: 'Failed to submit request. Please try again.' }
  }

  return { success: true }
}
