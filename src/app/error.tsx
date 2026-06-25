'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <span className="text-5xl" role="img" aria-label="Erreur">⚠️</span>
      <h1 className="mt-4 font-sora text-2xl font-extrabold text-ima-ink">
        Une erreur est survenue
      </h1>
      <p className="mt-2 max-w-md text-ima-muted">
        Quelque chose s’est mal passé. Réessayez ou revenez à l’accueil.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="rounded-xl bg-ima-primary px-6 py-3 font-sora font-bold text-white transition hover:brightness-110"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="rounded-xl border border-ima-primary px-6 py-3 font-sora font-bold text-ima-primary transition hover:bg-ima-lilac"
        >
          Retour à l’accueil
        </Link>
      </div>
    </div>
  )
}
