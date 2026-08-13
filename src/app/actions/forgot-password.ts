'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requestPasswordResetAction(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const email = formData.get('email') as string
  const method = formData.get('method') as string

  if (!email) {
    return { error: 'Email is required.' }
  }

  const supabase = await createClient()

  if (method === 'email_reset') {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    })
    
    if (error) {
      return { error: error.message || 'Failed to send reset email.' }
    }
    
    return { success: true }
  }

  // Admin Approval flow
  const { data: result, error } = await supabase.rpc('request_password_reset', {
    user_email: email,
  })

  if (error) {
    return { error: 'Failed to request password reset. Please try again later.' }
  }

  if (!result) {
    // Return success anyway to prevent email enumeration
    return { success: true }
  }

  return { success: true }
}
