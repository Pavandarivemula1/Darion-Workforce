'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type AdminActionState = {
  error?: string
  success?: boolean
}

export async function createCandidateAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const supabase = await createClient()

  // 1. Verify admin authorization
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized.' }
  }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    return { error: 'Access denied. Admin privileges required.' }
  }



  const email = formData.get('email') as string
  const fullName = formData.get('fullName') as string
  const password = formData.get('password') as string

  if (!email || !fullName || !password) {
    return { error: 'All fields (Full Name, Email, Password) are required.' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' }
  }

  // 3. Create candidate user via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'candidate',
      },
    },
  })

  if (authError) {
    return { error: authError.message || 'Failed to create candidate user.' }
  }

  if (authData.user) {
    // Explicitly insert or upsert into profiles to ensure consistency
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      full_name: fullName,
      role: 'candidate',
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      return { error: profileError.message || 'Candidate user created, but profile update failed.' }
    }
  }

  revalidatePath('/admin/candidates')
  revalidatePath('/admin')
  return { success: true }
}

export async function resetCandidatePasswordAction(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const supabase = await createClient()

  // Verify admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized.' }
  }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    return { error: 'Access denied.' }
  }

  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Candidate email is required.' }
  }

  // Send password reset email via Supabase Auth
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'http://localhost:3000' : ''}/login`,
  })

  if (error) {
    return { error: error.message || 'Failed to send password reset email.' }
  }

  return { success: true }
}
