import { NextResponse } from 'next/server'
import { ADMIN_COOKIE } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/admin/logout → supprime le cookie de session
export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}
