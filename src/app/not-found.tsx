import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <span className="text-5xl" role="img" aria-label="Introuvable">🔍</span>
      <h1 className="mt-4 font-sora text-3xl font-extrabold text-ima-ink">404</h1>
      <p className="mt-2 max-w-md text-ima-muted">
        La page que vous recherchez est introuvable.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-ima-primary px-6 py-3 font-sora font-bold text-white transition hover:brightness-110"
      >
        Retour à l’accueil
      </Link>
    </div>
  )
}
