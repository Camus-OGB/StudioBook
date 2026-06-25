'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

interface OpeningHours {
  id: string
  espace: string
  jour: number
  ouverture: string
  fermeture: string
}
interface Blackout {
  id: string
  espace: string | null
  debutAt: string
  finAt: string
  motif: string | null
}
interface AvailabilityData {
  reservations: { id: string; debutAt: string; finAt: string; statut: string; objetProjet: string }[]
  blackouts: Blackout[]
  openingHours: OpeningHours[]
}

const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

const inputCls =
  'rounded-xl border-[1.5px] border-[#E4E1EE] px-3 py-2.5 text-sm outline-none transition focus:border-ima-primary focus:ring-[3px] focus:ring-ima-primary/15'
const labelCls = 'mb-1 block text-[12px] font-semibold text-[#3a3348]'
const btnPrimary =
  'rounded-xl bg-ima-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110'
const btnSecondary =
  'rounded-lg border border-[#d9d0f2] bg-white px-3 py-2 text-[13px] font-semibold text-ima-primary transition hover:bg-ima-lilac'
const sectionCls = 'rounded-2xl border border-ima-line bg-white p-6'
const titleCls = 'mb-4 font-sora text-lg font-bold text-ima-ink'

function hhmm(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function PlanningTab() {
  const [espaces, setEspaces] = useState<string[]>([])
  const [hours, setHours] = useState<OpeningHours[]>([])
  const [blackouts, setBlackouts] = useState<Blackout[]>([])
  const [espace, setEspace] = useState('')
  const [draft, setDraft] = useState<Record<number, { ouverture: string; fermeture: string }>>({})
  const [msg, setMsg] = useState<string | null>(null)

  const [boEspace, setBoEspace] = useState('')
  const [boDateDebut, setBoDateDebut] = useState('')
  const [boHeureDebut, setBoHeureDebut] = useState('')
  const [boDateFin, setBoDateFin] = useState('')
  const [boHeureFin, setBoHeureFin] = useState('')
  const [boMotif, setBoMotif] = useState('')

  const [avEspace, setAvEspace] = useState('')
  const [avDate, setAvDate] = useState('')
  const [avData, setAvData] = useState<AvailabilityData | null>(null)

  const loadAll = useCallback(async () => {
    try {
      const [cat, oh, bo] = await Promise.all([
        fetch('/api/catalog').then((r) => r.json()),
        fetch('/api/admin/opening-hours').then((r) => r.json()),
        fetch('/api/admin/blackouts').then((r) => r.json()),
      ])
      if (cat.success) {
        const list: string[] = cat.data.espace ?? []
        setEspaces(list)
        setEspace((e) => e || list[0] || '')
        setAvEspace((e) => e || list[0] || '')
      }
      if (oh.success) setHours(oh.data)
      if (bo.success) setBlackouts(bo.data)
    } catch {
      setMsg('Erreur de chargement du planning')
    }
  }, [])

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  useEffect(() => {
    const d: Record<number, { ouverture: string; fermeture: string }> = {}
    for (let j = 0; j < 7; j++) {
      const existing = hours.find((h) => h.espace === espace && h.jour === j)
      d[j] = existing
        ? { ouverture: existing.ouverture, fermeture: existing.fermeture }
        : { ouverture: '', fermeture: '' }
    }
    setDraft(d)
  }, [espace, hours])

  async function enregistrerJour(jour: number) {
    const { ouverture, fermeture } = draft[jour] ?? {}
    if (!ouverture || !fermeture) {
      setMsg('Renseignez ouverture et fermeture')
      return
    }
    const res = await fetch('/api/admin/opening-hours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ espace, jour, ouverture, fermeture }),
    })
    const data = await res.json()
    setMsg(res.ok ? `${JOURS[jour]} enregistré` : data.error)
    if (res.ok) void loadAll()
  }

  async function supprimerJour(jour: number) {
    const existing = hours.find((h) => h.espace === espace && h.jour === jour)
    if (!existing) return
    await fetch(`/api/admin/opening-hours/${existing.id}`, { method: 'DELETE' })
    void loadAll()
  }

  async function ajouterBlocage() {
    if (!boDateDebut || !boHeureDebut || !boDateFin || !boHeureFin) {
      setMsg('Dates et heures de blocage requises')
      return
    }
    const debutAt = new Date(`${boDateDebut}T${boHeureDebut}:00`).toISOString()
    const finAt = new Date(`${boDateFin}T${boHeureFin}:00`).toISOString()
    const res = await fetch('/api/admin/blackouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ espace: boEspace || null, debutAt, finAt, motif: boMotif || undefined }),
    })
    const data = await res.json()
    if (res.ok) {
      setMsg('Blocage ajouté')
      setBoMotif('')
      void loadAll()
    } else {
      setMsg(data.error)
    }
  }

  async function supprimerBlocage(id: string) {
    await fetch(`/api/admin/blackouts/${id}`, { method: 'DELETE' })
    void loadAll()
  }

  async function voirDispo() {
    if (!avEspace || !avDate) return
    const params = new URLSearchParams({ espace: avEspace, from: avDate, to: avDate })
    const res = await fetch(`/api/availability?${params.toString()}`)
    const data = await res.json()
    if (res.ok) setAvData(data.data)
  }

  return (
    <div className="mt-5 space-y-6">
      {msg && (
        <p className="rounded-xl bg-ima-lilac px-4 py-2.5 text-sm font-medium text-ima-primary">
          {msg}
        </p>
      )}

      {/* Horaires d'ouverture */}
      <section className={sectionCls}>
        <h3 className={titleCls}>Horaires d’ouverture</h3>
        <label className="mb-4 block text-sm">
          <span className={labelCls}>Espace</span>
          <select value={espace} onChange={(e) => setEspace(e.target.value)} className={cn(inputCls, 'bg-white')}>
            {espaces.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </label>
        <p className="mb-3 text-[12.5px] text-ima-faint">
          Un jour sans horaire est considéré comme « toujours ouvert ».
        </p>
        <div className="space-y-2">
          {JOURS.map((nom, j) => (
            <div key={j} className="flex flex-wrap items-center gap-2">
              <span className="w-24 text-sm text-ima-muted">{nom}</span>
              <input
                type="time"
                className={inputCls}
                value={draft[j]?.ouverture ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, [j]: { ...d[j], ouverture: e.target.value } }))}
              />
              <span className="text-ima-faint">→</span>
              <input
                type="time"
                className={inputCls}
                value={draft[j]?.fermeture ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, [j]: { ...d[j], fermeture: e.target.value } }))}
              />
              <button onClick={() => enregistrerJour(j)} className={btnSecondary}>Enregistrer</button>
              {hours.some((h) => h.espace === espace && h.jour === j) && (
                <button onClick={() => supprimerJour(j)} className="rounded-lg px-2.5 py-2 text-[13px] font-semibold text-ima-faint hover:text-[#C0392B]">
                  Effacer
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Blocages */}
      <section className={sectionCls}>
        <h3 className={titleCls}>Blocages (maintenance, événements…)</h3>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className={labelCls}>Espace</span>
            <select value={boEspace} onChange={(e) => setBoEspace(e.target.value)} className={cn(inputCls, 'bg-white')}>
              <option value="">Tous les espaces</option>
              {espaces.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className={labelCls}>Début</span>
            <span className="flex gap-1">
              <input type="date" className={inputCls} value={boDateDebut} onChange={(e) => setBoDateDebut(e.target.value)} />
              <input type="time" className={inputCls} value={boHeureDebut} onChange={(e) => setBoHeureDebut(e.target.value)} />
            </span>
          </label>
          <label className="text-sm">
            <span className={labelCls}>Fin</span>
            <span className="flex gap-1">
              <input type="date" className={inputCls} value={boDateFin} onChange={(e) => setBoDateFin(e.target.value)} />
              <input type="time" className={inputCls} value={boHeureFin} onChange={(e) => setBoHeureFin(e.target.value)} />
            </span>
          </label>
          <label className="text-sm">
            <span className={labelCls}>Motif</span>
            <input type="text" className={inputCls} placeholder="Maintenance…" value={boMotif} onChange={(e) => setBoMotif(e.target.value)} />
          </label>
          <button onClick={ajouterBlocage} className={btnPrimary}>Ajouter</button>
        </div>

        <ul className="mt-5 space-y-2">
          {blackouts.length === 0 && <li className="text-sm text-ima-muted">Aucun blocage enregistré.</li>}
          {blackouts.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#f1eff7] bg-[#faf9fd] px-3.5 py-2.5 text-sm">
              <span>
                <span className="font-semibold text-ima-ink">{b.espace ?? 'Tous les espaces'}</span>
                {' · '}
                <span className="text-ima-muted">
                  {formatDate(b.debutAt)} {hhmm(b.debutAt)} → {formatDate(b.finAt)} {hhmm(b.finAt)}
                  {b.motif ? ` · ${b.motif}` : ''}
                </span>
              </span>
              <button onClick={() => supprimerBlocage(b.id)} className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-[#C0392B] hover:bg-[#FBE4E4]">
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Créneaux occupés */}
      <section className={sectionCls}>
        <h3 className={titleCls}>Créneaux occupés</h3>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className={labelCls}>Espace</span>
            <select value={avEspace} onChange={(e) => setAvEspace(e.target.value)} className={cn(inputCls, 'bg-white')}>
              {espaces.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className={labelCls}>Date</span>
            <input type="date" className={inputCls} value={avDate} onChange={(e) => setAvDate(e.target.value)} />
          </label>
          <button onClick={voirDispo} className={btnSecondary}>Voir</button>
        </div>

        {avData && (
          <div className="mt-5 space-y-4">
            <div>
              <p className="mb-1 text-[12px] font-semibold uppercase text-ima-faint">
                Réservations ({avData.reservations.length})
              </p>
              {avData.reservations.length === 0 ? (
                <p className="text-sm text-ima-muted">Aucune réservation ce jour.</p>
              ) : (
                <ul className="space-y-1">
                  {avData.reservations.map((r) => (
                    <li key={r.id} className="rounded-xl bg-ima-lilac px-3.5 py-2.5 text-sm">
                      <span className="font-semibold text-ima-primary">{hhmm(r.debutAt)} → {hhmm(r.finAt)}</span>
                      {' · '}{r.objetProjet}{' '}
                      <span className="text-ima-faint">({r.statut})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {avData.blackouts.length > 0 && (
              <div>
                <p className="mb-1 text-[12px] font-semibold uppercase text-ima-faint">Blocages</p>
                <ul className="space-y-1">
                  {avData.blackouts.map((b) => (
                    <li key={b.id} className="rounded-xl bg-[#FBE4E4] px-3.5 py-2.5 text-sm text-[#C0392B]">
                      {hhmm(b.debutAt)} → {hhmm(b.finAt)}{b.motif ? ` · ${b.motif}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
