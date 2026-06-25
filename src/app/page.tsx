import Link from 'next/link'
import StudioImage from '@/components/ui/StudioImage'

const OFFRES = [
  { src: '/images/photo.jpg', label: '📷', titre: 'Photo', texte: 'Studio fond blanc, éclairage pro, reflex & objectifs.' },
  { src: '/images/video.jpg', label: '🎬', titre: 'Vidéo', texte: 'Fond vert, caméras, stabilisateurs, salle de montage.' },
  { src: '/images/podcast.jpg', label: '🎙️', titre: 'Podcast', texte: 'Cabine son, micros, casques, table de mixage.' },
]

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1280px] px-5">
      {/* Hero : texte + visuel */}
      <section className="grid items-center gap-10 pt-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-ima-lilac px-3.5 py-1.5 text-[12.5px] font-semibold text-ima-primary">
            <span className="h-[7px] w-[7px] rounded-full bg-ima-accent" />
            Studio multimédia · Photo · Vidéo · Podcast
          </div>
          <h1 className="mt-5 font-sora text-[clamp(34px,5vw,58px)] font-extrabold leading-[1.06] tracking-[-1.5px] text-balance">
            Là où naissent vos projets <span className="text-ima-primary">créatifs</span>.
          </h1>
          <p className="mt-4 max-w-[560px] text-[clamp(16px,2vw,19px)] leading-relaxed text-ima-muted">
            Le studio multimédia de Sème City à Cotonou. Inscrivez-vous, puis réservez le
            matériel et les espaces dont vous avez besoin pour donner vie à vos idées.
          </p>
        </div>

        <StudioImage
          src="/images/hero.jpg"
          alt="L'IMA Studio — studio multimédia de Sème City"
          label="🎬"
          className="aspect-[4/3] w-full rounded-[28px] shadow-[0_20px_50px_rgba(69,39,160,0.18)]"
        />
      </section>

      {/* Actions principales */}
      <section className="mt-10 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
        <Link
          href="/inscription"
          className="group relative overflow-hidden rounded-[20px] bg-ima-primary p-[26px] text-white shadow-[0_14px_34px_rgba(69,39,160,0.28)] transition-transform hover:-translate-y-1"
        >
          <span className="absolute -right-8 -top-8 h-[130px] w-[130px] rounded-full bg-ima-accent/20" />
          <span className="relative block">
            <span className="text-[13px] font-semibold tracking-wide opacity-80">PREMIÈRE VISITE</span>
            <span className="mt-2 block font-sora text-2xl font-bold">M&apos;inscrire</span>
            <span className="mt-1.5 block text-sm leading-relaxed opacity-85">
              Créez votre identifiant usager en 4 étapes.
            </span>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
              Commencer <span className="text-[17px]">→</span>
            </span>
          </span>
        </Link>

        <Link
          href="/reservation"
          className="group relative overflow-hidden rounded-[20px] border border-ima-line bg-white p-[26px] shadow-[0_8px_24px_rgba(40,20,80,0.06)] transition-all hover:-translate-y-1 hover:border-ima-accent"
        >
          <span className="absolute -right-8 -top-8 h-[130px] w-[130px] rounded-full bg-ima-accent/10" />
          <span className="relative block">
            <span className="text-[13px] font-semibold tracking-wide text-[#C77800]">DÉJÀ INSCRIT</span>
            <span className="mt-2 block font-sora text-2xl font-bold text-ima-ink">Réserver</span>
            <span className="mt-1.5 block text-sm leading-relaxed text-ima-muted">
              Matériel &amp; espaces, selon vos dates.
            </span>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ima-primary">
              Réserver <span className="text-[17px]">→</span>
            </span>
          </span>
        </Link>
      </section>

      {/* Offres avec visuels */}
      <section className="mt-14">
        <h2 className="font-sora text-[22px] font-extrabold text-ima-ink">Découvrez nos univers</h2>
        <p className="mt-1 text-[14.5px] text-ima-muted">Trois pôles pour tous vos projets multimédias.</p>
        <div className="mt-5 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {OFFRES.map((o) => (
            <div
              key={o.titre}
              className="overflow-hidden rounded-2xl border border-ima-line bg-white shadow-[0_8px_24px_rgba(40,20,80,0.05)]"
            >
              <StudioImage src={o.src} alt={`IMA Studio — ${o.titre}`} label={o.label} className="aspect-[16/10] w-full" />
              <div className="p-5">
                <div className="font-sora text-[20px] font-extrabold text-ima-primary">{o.titre}</div>
                <div className="mt-1 text-[13.5px] leading-relaxed text-ima-muted">{o.texte}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-ima-line px-1 py-8">
        <div className="text-[13px] text-ima-faint">
          © 2026 IMA Studio — Sème City, Cotonou (Bénin)
        </div>
      </footer>
    </div>
  )
}
