// Limiteur de débit en mémoire (fenêtre fixe), par clé (IP + action).
// Adapté à un déploiement mono-instance (un conteneur). Pour plusieurs instances,
// utiliser un store partagé (Redis). Les compteurs sont remis à zéro au redémarrage.

interface Entry {
  count: number
  reset: number
}

const buckets = new Map<string, Entry>()

export interface RateResult {
  ok: boolean
  retryAfter: number // secondes avant réinitialisation
}

export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now()

  // Nettoyage opportuniste des entrées expirées
  if (buckets.size > 1000) {
    buckets.forEach((v, k) => {
      if (v.reset < now) buckets.delete(k)
    })
  }

  const entry = buckets.get(key)
  if (!entry || entry.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }
  if (entry.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((entry.reset - now) / 1000) }
  }
  entry.count++
  return { ok: true, retryAfter: 0 }
}

/** Extrait l'IP cliente (derrière reverse proxy : X-Forwarded-For). */
export function clientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim() || 'unknown'
  return request.headers.get('x-real-ip') ?? 'unknown'
}

/** Réponse 429 standardisée. */
export function tooMany(retryAfter: number) {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Trop de tentatives. Réessayez plus tard.',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      },
    },
  )
}
