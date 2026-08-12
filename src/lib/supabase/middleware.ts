import { NextResponse, type NextRequest } from 'next/server'

interface JwtPayload {
  sub?: string
  exp?: number
  user_metadata?: { role?: string }
  app_metadata?: { role?: string }
}

/**
 * Parse the Supabase session cookie locally (0ms, zero network calls).
 * 
 * Cookie format from @supabase/ssr:
 *   Cookie name: sb-<ref>-auth-token (may be chunked: .0, .1, .2 etc.)
 *   Cookie value: base64-<base64 encoded JSON>
 *   Decoded JSON: {"access_token":"<JWT>","refresh_token":"...","expires_at":...,...}
 *   
 * We extract the access_token JWT and parse its payload for sub + user_metadata.role.
 */
function parseSessionFromCookies(request: NextRequest): { userId: string; role: string } | null {
  try {
    const allCookies = request.cookies.getAll()

    // Find auth token cookies (including chunked cookies like .0, .1)
    const authChunks = allCookies
      .filter((c) => {
        const name = c.name
        return (
          (name.startsWith('sb-') && (name.endsWith('-auth-token') || /-auth-token\.\d+$/.test(name))) ||
          name === 'sb-access-token'
        )
      })
      .sort((a, b) => a.name.localeCompare(b.name))

    if (authChunks.length === 0) return null

    // Join chunked cookie values
    let rawVal = authChunks.map((c) => c.value).join('')
    if (!rawVal) return null

    // Strip "base64-" prefix
    if (rawVal.startsWith('base64-')) {
      rawVal = rawVal.slice(7) // Remove "base64-"
    }

    // Decode the base64 to get the session JSON
    const sessionJson = Buffer.from(rawVal, 'base64').toString('utf8')
    const session = JSON.parse(sessionJson)

    // Extract the access_token JWT from the session
    const accessToken: string | undefined = session?.access_token
    if (!accessToken || !accessToken.includes('.')) return null

    // Parse the JWT payload (header.payload.signature)
    const jwtParts = accessToken.split('.')
    if (jwtParts.length < 2) return null

    const payloadJson = Buffer.from(jwtParts[1], 'base64url').toString('utf8')
    const payload: JwtPayload = JSON.parse(payloadJson)

    if (!payload?.sub) return null

    // Check expiration (with 30-second buffer)
    if (payload.exp && Date.now() / 1000 > payload.exp - 30) {
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
  const session = parseSessionFromCookies(request)

  const requestHeaders = new Headers(request.headers)

  if (session) {
    requestHeaders.set('x-user-id', session.userId)
    requestHeaders.set('x-user-role', session.role)
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // 1. Protected routes — redirect unauthenticated users to login
  if (!session && (pathname.startsWith('/admin') || pathname.startsWith('/candidate'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // 2. Authenticated user redirects & role-based access control
  if (session) {
    const { role } = session

    // Redirect logged-in users away from /login or /
    if (pathname === '/login' || pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'admin' ? '/admin' : '/candidate'
      return NextResponse.redirect(url)
    }

    // Admin-only routes
    if (pathname.startsWith('/admin') && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/candidate'
      return NextResponse.redirect(url)
    }

    // Candidate-only routes
    if (pathname.startsWith('/candidate') && role === 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  return response
}
