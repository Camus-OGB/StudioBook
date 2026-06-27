'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

// Calendrier de pilotage admin : visualise les réservations (non refusées) et les
// blocages d'un espace, avec trois vues commutables jour / semaine / mois.
// S'appuie sur l'API existante /api/availability (paramètres espace + from/to).

type Vue = 'jour' | 'semaine' | 'mois'

interface ResEvent {
  id: string
  debutAt: string
  finAt: string
  statut: string
  objetProjet: string
}
interface Blackout {
  id: string
  espace: string | null
  debutAt: string
  finAt: string
  motif: string | null
}
interface OpeningHours {
  id: string
  jour: number
  ouverture: string
  fermeture: string
}
interface AvailabilityData {
  reservations: ResEvent[]
  blackouts: Blackout[]
  openingHours: OpeningHours[]
}

// Bornes de l'axe horaire (le studio n'ouvre jamais hors de cette plage).
const DEBUT_H = 7
const FIN_H = 22
const HEURE_PX = 46
const JOURS_COURTS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

// ── Helpers de date (sans dépendance externe) ───────────────────────────────

function pad(n: number): string {
  return String(n).padStart(2, '0')
}
function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}
function memeJour(a: Date, b: Date): boolean {
  return ymd(a) === ymd(b)
}
// Lundi de la semaine contenant d.
function lundiDe(d: Date): Date {
  const r = new Date(d)
  const decalage = (r.getDay() + 6) % 7 // 0 = lundi
  r.setDate(r.getDate() - decalage)
  r.setHours(0, 0, 0, 0)
  return r
}
function minutesDe(iso: string): number {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}
function hhmm(iso: string): string {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const fmtJour = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const fmtJourCourt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })
const fmtMois = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })

// ── Bloc positionné sur l'axe horaire ───────────────────────────────────────

interface Bloc {
  id: string
  kind: 'res' | 'blackout'
  startMin: number
  endMin: number
  titre: string
  sousTitre: string
  statut?: string
}

function clamp(min: number): number {
  return Math.max(DEBUT_H * 60, Math.min(FIN_H * 60, min))
}

function blocsDuJour(date: Date, data: AvailabilityData): Bloc[] {
  const blocs: Bloc[] = []
  const debutJour = new Date(date)
  debutJour.setHours(0, 0, 0, 0)
  const finJour = addDays(debutJour, 1)

  for (const r of data.reservations) {
    const deb = new Date(r.debutAt)
    if (!memeJour(deb, date)) continue
    const s = clamp(minutesDe(r.debutAt))
    const e = clamp(minutesDe(r.finAt))
    if (e <= s) continue
    blocs.push({
      id: r.id,
      kind: 'res',
      startMin: s,
      endMin: e,
      titre: r.objetProjet,
      sousTitre: `${hhmm(r.debutAt)} – ${hhmm(r.finAt)}`,
      statut: r.statut,
    })
  }

  for (const b of data.blackouts) {
    const deb = new Date(b.debutAt)
    const fin = new Date(b.finAt)
    if (fin <= debutJour || deb >= finJour) continue // ne touche pas ce jour
    // Minutes relatives à CE jour (un blocage peut s'étendre sur plusieurs jours).
    const sMin = deb < debutJour ? DEBUT_H * 60 : clamp(minutesDe(b.debutAt))
    const eMin = fin > finJour ? FIN_H * 60 : clamp(minutesDe(b.finAt))
    if (eMin <= sMin) continue
    blocs.push({
      id: b.id,
      kind: 'blackout',
      startMin: sMin,
      endMin: eMin,
      titre: b.motif ?? 'Blocage',
      sousTitre: 'Indisponible',
    })
  }

  return blocs
}

// Fenêtre d'ouverture {ouv, ferm} en minutes pour un jour de semaine donné, ou null.
function fenetreOuverture(
  data: AvailabilityData,
  jourJS: number,
): { ouv: number; ferm: number } | null {
  const h = data.openingHours.find((o) => o.jour === jourJS)
  if (!h) return null
  const [oh, om] = h.ouverture.split(':').map(Number)
  const [fh, fm] = h.fermeture.split(':').map(Number)
  return { ouv: oh * 60 + om, ferm: fh * 60 + fm }
}

function blocClasses(b: Bloc): string {
  if (b.kind === 'blackout') return 'bg-rose-100 border-rose-300 text-rose-800'
  if (b.statut === 'Confirmée') return 'bg-emerald-100 border-emerald-300 text-emerald-900'
  return 'bg-amber-100 border-amber-300 text-amber-900' // En attente
}

// ── Colonne d'un jour (axe vertical partagé) ─────────────────────────────────

function ColonneJour({ date, data }: { date: Date; data: AvailabilityData }) {
  const blocs = blocsDuJour(date, data)
  const fen = fenetreOuverture(data, date.getDay())
  const hauteur = (FIN_H - DEBUT_H) * HEURE_PX

  return (
    <div className="relative flex-1" style={{ height: hauteur }}>
      {/* Jour entièrement fermé (aucun horaire défini) */}
      {!fen && <div className="absolute inset-0 bg-[#f4f3f8]" />}
      {/* Zones fermées (avant ouverture / après fermeture) */}
      {fen && fen.ouv > DEBUT_H * 60 && (
        <div
          className="absolute inset-x-0 top-0 bg-[#f4f3f8]"
          style={{ height: ((clamp(fen.ouv) - DEBUT_H * 60) / 60) * HEURE_PX }}
        />
      )}
      {fen && fen.ferm < FIN_H * 60 && (
        <div
          className="absolute inset-x-0 bg-[#f4f3f8]"
          style={{
            top: ((clamp(fen.ferm) - DEBUT_H * 60) / 60) * HEURE_PX,
            bottom: 0,
          }}
        />
      )}
      {/* Lignes horaires */}
      {Array.from({ length: FIN_H - DEBUT_H }, (_, i) => (
        <div
          key={i}
          className="absolute inset-x-0 border-t border-[#f1eff7]"
          style={{ top: i * HEURE_PX }}
        />
      ))}
      {/* Blocs */}
      {blocs.map((b) => {
        const top = ((b.startMin - DEBUT_H * 60) / 60) * HEURE_PX
        const h = Math.max(20, ((b.endMin - b.startMin) / 60) * HEURE_PX)
        return (
          <div
            key={`${b.kind}-${b.id}`}
            title={`${b.titre} · ${b.sousTitre}`}
            className={cn(
              'absolute left-1 right-1 overflow-hidden rounded-lg border px-2 py-1',
              blocClasses(b),
            )}
            style={{ top: top + 1, height: h - 2 }}
          >
            <div className="truncate text-[11.5px] font-semibold leading-tight">{b.titre}</div>
            <div className="truncate text-[10.5px] opacity-80">{b.sousTitre}</div>
          </div>
        )
      })}
    </div>
  )
}

// Axe des heures (libellés à gauche).
function AxeHeures() {
  return (
    <div className="relative w-12 shrink-0" style={{ height: (FIN_H - DEBUT_H) * HEURE_PX }}>
      {Array.from({ length: FIN_H - DEBUT_H + 1 }, (_, i) => (
        <div
          key={i}
          className="absolute right-1.5 -translate-y-1/2 text-[11px] text-ima-faint"
          style={{ top: i * HEURE_PX }}
        >
          {pad(DEBUT_H + i)}:00
        </div>
      ))}
    </div>
  )
}

// ── Composant principal ──────────────────────────────────────────────────────

export default function PlanningCalendar({ espaces }: { espaces: string[] }) {
  const [vue, setVue] = useState<Vue>('semaine')
  const [espace, setEspace] = useState('')
  const [curseur, setCurseur] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [data, setData] = useState<AvailabilityData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setEspace((e) => e || espaces[0] || '')
  }, [espaces])

  // Période visible [from, to] selon la vue.
  const { from, to } = useMemo(() => {
    if (vue === 'jour') return { from: curseur, to: curseur }
    if (vue === 'semaine') {
      const lundi = lundiDe(curseur)
      return { from: lundi, to: addDays(lundi, 6) }
    }
    // mois : grille de 6 semaines à partir du lundi précédant le 1er du mois
    const premier = new Date(curseur.getFullYear(), curseur.getMonth(), 1)
    const debut = lundiDe(premier)
    return { from: debut, to: addDays(debut, 41) }
  }, [vue, curseur])

  const charger = useCallback(async () => {
    if (!espace) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ espace, from: ymd(from), to: ymd(to) })
      const res = await fetch(`/api/availability?${params.toString()}`)
      const d = await res.json()
      if (res.ok && d.success) setData(d.data)
      else setError(d.error ?? 'Erreur de chargement du calendrier')
    } catch {
      setError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }, [espace, from, to])

  useEffect(() => {
    void charger()
  }, [charger])

  function naviguer(sens: -1 | 1) {
    setCurseur((c) => {
      if (vue === 'jour') return addDays(c, sens)
      if (vue === 'semaine') return addDays(c, sens * 7)
      return new Date(c.getFullYear(), c.getMonth() + sens, 1)
    })
  }
  function aujourdhui() {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    setCurseur(d)
  }

  const titre =
    vue === 'jour'
      ? fmtJour.format(curseur)
      : vue === 'semaine'
        ? `${fmtJourCourt.format(from)} – ${fmtJourCourt.format(to)} ${to.getFullYear()}`
        : fmtMois.format(curseur)

  const today = new Date()

  return (
    <section className="rounded-2xl border border-ima-line bg-white p-6">
      {/* Barre de contrôle */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-sora text-lg font-bold capitalize text-ima-ink">{titre}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={espace}
            onChange={(e) => setEspace(e.target.value)}
            className="rounded-xl border-[1.5px] border-[#E4E1EE] bg-white px-3 py-2 text-sm outline-none focus:border-ima-primary"
          >
            {espaces.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          {/* Commutateur de vue */}
          <div className="flex rounded-xl border border-[#E4E1EE] p-0.5">
            {(['jour', 'semaine', 'mois'] as Vue[]).map((v) => (
              <button
                key={v}
                onClick={() => setVue(v)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-[13px] font-semibold capitalize transition-colors',
                  vue === v ? 'bg-ima-primary text-white' : 'text-ima-muted hover:bg-ima-lilac',
                )}
              >
                {v}
              </button>
            ))}
          </div>
          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => naviguer(-1)}
              aria-label="Période précédente"
              className="rounded-lg border border-[#E4E1EE] px-2.5 py-1.5 text-ima-muted hover:bg-ima-lilac"
            >
              ‹
            </button>
            <button
              onClick={aujourdhui}
              className="rounded-lg border border-[#E4E1EE] px-3 py-1.5 text-[13px] font-semibold text-ima-muted hover:bg-ima-lilac"
            >
              Aujourd’hui
            </button>
            <button
              onClick={() => naviguer(1)}
              aria-label="Période suivante"
              className="rounded-lg border border-[#E4E1EE] px-2.5 py-1.5 text-ima-muted hover:bg-ima-lilac"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="mb-4 flex flex-wrap gap-3 text-[12px] text-ima-muted">
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded border border-emerald-300 bg-emerald-100" /> Confirmée</span>
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded border border-amber-300 bg-amber-100" /> En attente</span>
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded border border-rose-300 bg-rose-100" /> Blocage</span>
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded bg-[#f4f3f8]" /> Hors horaires</span>
      </div>

      {/* Corps */}
      {error ? (
        <div className="rounded-xl border border-[#f4d6d6] bg-[#fdf5f5] px-4 py-8 text-center">
          <div className="text-2xl">⚠️</div>
          <div className="mt-1 text-sm text-ima-muted">{error}</div>
          <button onClick={() => void charger()} className="mt-3 rounded-xl bg-ima-primary px-4 py-2 text-sm font-semibold text-white">
            Réessayer
          </button>
        </div>
      ) : loading || !data ? (
        <div className="h-[300px] animate-pulse rounded-xl bg-ima-line/60" />
      ) : vue === 'mois' ? (
        <VueMois from={from} curseur={curseur} data={data} today={today} onJour={(d) => { setCurseur(d); setVue('jour') }} />
      ) : vue === 'jour' ? (
        <div className="flex">
          <AxeHeures />
          <div className="flex-1 rounded-xl border border-[#f1eff7]">
            <ColonneJour date={curseur} data={data} />
          </div>
        </div>
      ) : (
        <VueSemaine from={from} data={data} today={today} />
      )}
    </section>
  )
}

// ── Vue semaine ──────────────────────────────────────────────────────────────

function VueSemaine({ from, data, today }: { from: Date; data: AvailabilityData; today: Date }) {
  const jours = Array.from({ length: 7 }, (_, i) => addDays(from, i))
  return (
    <div>
      {/* En-têtes */}
      <div className="flex">
        <div className="w-12 shrink-0" />
        {jours.map((j, i) => (
          <div
            key={i}
            className={cn(
              'flex-1 pb-2 text-center text-[12.5px] font-semibold',
              memeJour(j, today) ? 'text-ima-primary' : 'text-ima-muted',
            )}
          >
            {JOURS_COURTS[i]} {j.getDate()}
          </div>
        ))}
      </div>
      {/* Grille */}
      <div className="flex rounded-xl border border-[#f1eff7]">
        <AxeHeures />
        {jours.map((j, i) => (
          <div key={i} className="flex-1 border-l border-[#f1eff7]">
            <ColonneJour date={j} data={data} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Vue mois ──────────────────────────────────────────────────────────────────

function VueMois({
  from,
  curseur,
  data,
  today,
  onJour,
}: {
  from: Date
  curseur: Date
  data: AvailabilityData
  today: Date
  onJour: (d: Date) => void
}) {
  const jours = Array.from({ length: 42 }, (_, i) => addDays(from, i))

  // Comptages par jour.
  const parJour = useMemo(() => {
    const map = new Map<string, { res: number; blackout: boolean }>()
    for (const r of data.reservations) {
      const k = ymd(new Date(r.debutAt))
      const cur = map.get(k) ?? { res: 0, blackout: false }
      cur.res += 1
      map.set(k, cur)
    }
    for (const b of data.blackouts) {
      let d = new Date(b.debutAt)
      d.setHours(0, 0, 0, 0)
      const fin = new Date(b.finAt)
      while (d < fin) {
        const k = ymd(d)
        const cur = map.get(k) ?? { res: 0, blackout: false }
        cur.blackout = true
        map.set(k, cur)
        d = addDays(d, 1)
      }
    }
    return map
  }, [data])

  return (
    <div className="grid grid-cols-7 gap-1">
      {JOURS_COURTS.map((j) => (
        <div key={j} className="pb-1 text-center text-[12px] font-semibold text-ima-faint">{j}</div>
      ))}
      {jours.map((j, i) => {
        const info = parJour.get(ymd(j))
        const horsMois = j.getMonth() !== curseur.getMonth()
        const estAujourdhui = memeJour(j, today)
        return (
          <button
            key={i}
            onClick={() => onJour(j)}
            className={cn(
              'flex min-h-[68px] flex-col rounded-lg border p-1.5 text-left transition-colors hover:border-ima-primary',
              horsMois ? 'border-transparent bg-[#faf9fd] text-ima-faint' : 'border-[#f1eff7] bg-white',
            )}
          >
            <span
              className={cn(
                'self-end text-[12.5px] font-semibold',
                estAujourdhui && 'flex h-6 w-6 items-center justify-center rounded-full bg-ima-primary text-white',
              )}
            >
              {j.getDate()}
            </span>
            <span className="mt-auto flex flex-wrap gap-1">
              {info?.res ? (
                <span className="rounded bg-ima-lilac px-1.5 py-0.5 text-[10.5px] font-semibold text-ima-primary">
                  {info.res} résa
                </span>
              ) : null}
              {info?.blackout ? <span className="h-2.5 w-2.5 rounded-full bg-rose-400" title="Blocage" /> : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}
