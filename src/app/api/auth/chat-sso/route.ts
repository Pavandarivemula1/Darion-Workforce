import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient, getCurrentUserFast } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFast()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // 1. Primary: Generate Supabase Auth Admin Single Sign-On link to chat.darion.in
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
          return NextResponse.redirect(linkData.properties.action_link)
        }
      }
    } catch (adminErr) {
      console.warn('SSO magic link generation fallback:', adminErr)
    }

    // 2. Fallback: Hash Fragment / Bearer Token redirection to chat.darion.in
    if (session?.access_token) {
      const targetUrl = `https://chat.darion.in/#access_token=${encodeURIComponent(
        session.access_token
      )}&refresh_token=${encodeURIComponent(session.refresh_token || '')}&token_type=bearer`
      return NextResponse.redirect(targetUrl)
    }

    // 3. Fallback direct redirect
    return NextResponse.redirect('https://chat.darion.in')
  } catch (err) {
    console.error('Chat SSO route error:', err)
    return NextResponse.redirect('https://chat.darion.in')
  }
}
