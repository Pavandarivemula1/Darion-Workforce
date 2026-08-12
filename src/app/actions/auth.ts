'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(
  prevState: { error?: string } | null,
  formData: FormData
) {
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

  // Fast role check from user_metadata first, fallback to DB if needed
  let role = data.user.user_metadata?.role || data.user.app_metadata?.role

  if (!role) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    role = profile?.role || 'candidate'
  }

  if (role === 'admin') {
    redirect('/admin')
  } else {
    redirect('/candidate')
  }
}

export async function updateCandidatePasswordAction(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
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
