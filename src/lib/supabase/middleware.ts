import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

interface JwtPayload {
  sub?: string
  exp?: number
  user_metadata?: { role?: string }
  app_metadata?: { role?: string }
}

function parseJwtFromCookies(request: NextRequest): { userId: string; role: string } | null {
  try {
    const allCookies = request.cookies.getAll()

    // 1. Find matching auth cookies (including chunked cookies like .0, .1)
    const authChunks = allCookies
      .filter((c) => c.name.includes('-auth-token') || c.name.includes('sb-access-token'))
      .sort((a, b) => a.name.localeCompare(b.name))

    if (authChunks.length === 0) return null

    // Join chunked cookie values
    let rawVal = authChunks.map((c) => c.value).join('')

    if (!rawVal) return null

    // Strip base64- prefix or JSON array wrapper from @supabase/ssr
    rawVal = rawVal.trim().replace(/^\[?"?(?:base64-)?/, '').replace(/"?\]?$/, '')

    if (!rawVal || typeof rawVal !== 'string' || !rawVal.includes('.')) return null

    const parts = rawVal.split('.')
    if (parts.length < 2) return null

    const payloadBase64 = parts[1]
    const jsonStr = Buffer.from(payloadBase64, 'base64url').toString('utf8')
    const payload: JwtPayload = JSON.parse(jsonStr)

    if (!payload || !payload.sub) return null

    // Check expiration (with 10-second buffer)
    if (payload.exp && Date.now() / 1000 > payload.exp - 10) {
      return null
    }

    const role = payload.user_metadata?.role || payload.app_metadata?.role || 'candidate'
    return { userId: payload.sub, role }
  } catch {
    return null
  }
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  let session = parseJwtFromCookies(request)

  let supabaseResponse = NextResponse.next({ request })

  // Fallback to Supabase SSR client if local cookie parse didn't find session
  if (!session) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      let role = user.user_metadata?.role || user.app_metadata?.role
      if (!role) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        role = profile?.role || 'candidate'
      }
      session = { userId: user.id, role }
    }
  }

  // 1. Protected routes check for unauthenticated users
  if (!session && (pathname.startsWith('/admin') || pathname.startsWith('/candidate'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // 2. Authenticated user redirects & protection
  if (session) {
    const { role } = session

    if (pathname === '/login' || pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'admin' ? '/admin' : '/candidate'
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith('/admin') && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/candidate'
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith('/candidate') && role === 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
