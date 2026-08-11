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

  // Fetch user profile to determine role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle()

  if (profileError) {
    return {
      error:
        'Database setup required. Please run the SQL migration scripts in your Supabase SQL Editor.',
    }
  }

  // Fallback to user metadata if profile row isn't found yet
  const role = profile?.role || data.user.user_metadata?.role || 'candidate'

  if (role === 'admin') {
    redirect('/admin')
  } else {
    redirect('/candidate')
  }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
