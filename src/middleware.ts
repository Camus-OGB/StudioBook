import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, verifyToken } from '@/lib/auth'

// Protège /admin (pages) et /api/admin/* (API), sauf les routes d'authentification.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isLoginPage = pathname === '/admin/login'
  const isAuthApi =
    pathname === '/api/admin/login' || pathname === '/api/admin/logout'
  if (isLoginPage || isAuthApi) return NextResponse.next()

  const token = request.cookies.get(ADMIN_COOKIE)?.value
  const secret = process.env.NEXTAUTH_SECRET ?? ''
  const authorized = await verifyToken(token, secret)
  if (authorized) return NextResponse.next()

  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { success: false, error: 'Non autorisé' },
      { status: 401 },
    )
  }

  const url = request.nextUrl.clone()
  url.pathname = '/admin/login'
  url.searchParams.set('from', pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
