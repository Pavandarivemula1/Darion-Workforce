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
    const authCookie = allCookies.find(
      (c) => (c.name.startsWith('sb-') && c.name.endsWith('-auth-token')) || c.name === 'sb-access-token'
    )

    if (!authCookie || !authCookie.value) return null

    let rawVal = authCookie.value
    if (rawVal.startsWith('[')) {
      const parsed = JSON.parse(rawVal)
      rawVal = Array.isArray(parsed) ? parsed[0] : ''
    }

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
  const session = parseJwtFromCookies(request)

  // 1. Unauthenticated users trying to access protected routes
  if (!session && (pathname.startsWith('/admin') || pathname.startsWith('/candidate'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // 2. Authenticated users checks
  if (session) {
    const { role } = session

    // Redirect logged-in users away from /login or /
    if (pathname === '/login' || pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'admin' ? '/admin' : '/candidate'
      return NextResponse.redirect(url)
    }

    // Role-based access control
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

  return NextResponse.next({ request })
}
