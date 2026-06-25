'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const d = await res.json()
      if (res.ok && d.success) {
        const from = searchParams.get('from')
        router.replace(from && from.startsWith('/admin') ? from : '/admin')
        router.refresh()
      } else {
        setError(d.error ?? 'Connexion impossible')
      }
    } catch {
      setError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-[420px] flex-col px-5 pb-16 pt-16">
      <div className="rounded-[22px] border border-ima-line bg-white p-8 shadow-[0_14px_40px_rgba(40,20,80,0.08)]">
        <div className="text-xs font-semibold uppercase tracking-[1px] text-ima-faint">
          Espace administration
        </div>
        <h1 className="mt-1 font-sora text-2xl font-extrabold text-ima-ink">Connexion</h1>
        <p className="mt-2 text-sm text-ima-muted">
          Saisissez le mot de passe administrateur pour accéder au tableau de bord.
        </p>

        <form onSubmit={submit} className="mt-6 grid gap-3">
          <label>
            <span className="mb-1.5 block text-[13px] font-semibold text-[#3a3348]">
              Mot de passe
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full rounded-xl border-[1.5px] border-[#E4E1EE] px-3.5 py-3 text-sm outline-none transition focus:border-ima-primary focus:ring-[3px] focus:ring-ima-primary/15"
            />
          </label>
          {error && (
            <p className="rounded-xl bg-[#FBE4E4] px-4 py-2.5 text-sm text-[#C0392B]">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-ima-primary px-3 py-3.5 font-sora text-[14.5px] font-bold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            {loading && <span className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            Se connecter
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="px-5 py-16 text-center text-ima-muted">Chargement…</div>}>
      <LoginInner />
    </Suspense>
  )
}
