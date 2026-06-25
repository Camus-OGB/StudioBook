// Session admin : cookie signé HMAC-SHA256 (Web Crypto → compatible middleware edge).
// Aucune dépendance externe ; la clé est le NEXTAUTH_SECRET.

export const ADMIN_COOKIE = 'ima_admin_session'
export const SESSION_MAX_AGE = 60 * 60 * 12 // 12 heures (en secondes)

function b64url(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes)
  let s = ''
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i])
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return b64url(sig)
}

/** Compare deux chaînes en temps constant. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Crée un jeton `${exp}.${signature}` valable SESSION_MAX_AGE secondes. */
export async function createToken(secret: string): Promise<string> {
  const exp = Date.now() + SESSION_MAX_AGE * 1000
  const sig = await sign(String(exp), secret)
  return `${exp}.${sig}`
}

/** Vérifie la signature et l'expiration d'un jeton. */
export async function verifyToken(
  token: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!token || !secret) return false
  const [expStr, sig] = token.split('.')
  if (!expStr || !sig) return false
  const exp = Number(expStr)
  if (!Number.isFinite(exp) || exp < Date.now()) return false
  const expected = await sign(expStr, secret)
  return safeEqual(sig, expected)
}
