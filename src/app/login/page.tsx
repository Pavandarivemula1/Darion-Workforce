import { createClient } from '@/lib/supabase/server'
import { LoginClient } from './LoginClient'

export const metadata = {
  title: 'Login | Workforce',
  description: 'Sign in to access your workspace',
}

export default async function LoginPage() {
  const supabase = await createClient()

  let initialRequiresMfa = false
  
  // Check if there is an active session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    // Check if MFA is required for this session
    const { data: mfaData, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (!error && mfaData?.nextLevel === 'aal2' && mfaData?.currentLevel === 'aal1') {
      initialRequiresMfa = true
    }
  }

  return <LoginClient initialRequiresMfa={initialRequiresMfa} />
}
