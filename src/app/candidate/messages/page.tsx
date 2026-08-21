import { createClient, createAdminClient, getCurrentUserFast } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CandidateMessagesPage() {
  const user = await getCurrentUserFast()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // 1. Try Supabase Auth Admin Single Sign-On link to chat.darion.in
  try {
    const adminClient = createAdminClient()
    const { data: userData } = await adminClient.auth.admin.getUserById(user.id)

    if (userData?.user?.email) {
      const { data: linkData, error } = await adminClient.auth.admin.generateLink({
        type: 'magiclink',
        email: userData.user.email,
        options: {
          redirectTo: 'https://chat.darion.in',
        },
      })

      if (!error && linkData?.properties?.action_link) {
        redirect(linkData.properties.action_link)
      }
    }
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.message?.includes('NEXT_REDIRECT')) {
      throw err
    }
  }

  // 2. Fallback: Hash Fragment / Bearer Token redirection
  if (session?.access_token) {
    redirect(
      `https://chat.darion.in/#access_token=${session.access_token}&refresh_token=${session.refresh_token || ''}&token_type=bearer`
    )
  }

  // 3. Fallback direct redirect
  redirect('https://chat.darion.in')
}
