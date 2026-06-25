'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/inscription', label: "S'inscrire" },
  { href: '/reservation', label: 'Réserver' },
  { href: '/admin', label: 'Admin' },
]

export default function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-ima-line bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1140px] items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-3" aria-label="IMA Studio, accueil">
          <span className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-ima-primary font-sora text-base font-extrabold text-white shadow-[0_4px_12px_rgba(69,39,160,0.32)]">
            IS
          </span>
          <span className="leading-tight">
            <span className="block font-sora text-base font-bold text-ima-ink">
              IMA Studio
            </span>
            <span className="block text-[10px] font-medium tracking-[1.5px] text-ima-faint">
              SÈME CITY · COTONOU
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map((l) => {
            const active = pathname.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-ima-lilac',
                  active ? 'bg-ima-lilac text-ima-primary' : 'text-ima-muted',
                )}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
