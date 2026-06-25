import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, SESSION_MAX_AGE, createToken } from '@/lib/auth'
import { rateLimit, clientIp, tooMany } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// POST /api/admin/login → vérifie le mot de passe et pose le cookie de session
export async function POST(request: NextRequest) {
  // Anti brute-force : 5 tentatives / 15 min par IP
  const limite = rateLimit(`login:${clientIp(request)}`, 5, 15 * 60 * 1000)
  if (!limite.ok) return tooMany(limite.retryAfter)

  const password = process.env.ADMIN_PASSWORD
  const secret = process.env.NEXTAUTH_SECRET
  if (!password || !secret) {
    return NextResponse.json(
      { success: false, error: "Authentification non configurée sur le serveur" },
      { status: 500 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Corps de requête JSON invalide' },
      { status: 400 },
    )
  }

  const fourni = typeof body === 'object' && body !== null ? (body as { password?: unknown }).password : undefined
  if (typeof fourni !== 'string' || !safeEqual(fourni, password)) {
    return NextResponse.json(
      { success: false, error: 'Mot de passe incorrect' },
      { status: 401 },
    )
  }

  const token = await createToken(secret)
  const res = NextResponse.json({ success: true })
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  return res
}
