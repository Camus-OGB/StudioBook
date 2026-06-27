'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

interface OpeningHours {
  id: string
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
const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

const inputCls =
  'rounded-xl border-[1.5px] border-[#E4E1EE] px-3 py-2.5 text-sm outline-none transition focus:border-ima-primary focus:ring-[3px] focus:ring-ima-primary/15'
const labelCls = 'mb-1 block text-[12px] font-semibold text-[#3a3348]'
const btnPrimary =
  'rounded-xl bg-ima-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110'
const sectionCls = 'rounded-2xl border border-ima-line bg-white p-6'
const titleCls = 'mb-4 font-sora text-lg font-bold text-ima-ink'

function hhmm(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function ReglagesTab() {
  const [espaces, setEspaces] = useState<string[]>([])
  const [hours, setHours] = useState<OpeningHours[]>([])
  const [blackouts, setBlackouts] = useState<Blackout[]>([])
  const [draft, setDraft] = useState<Record<number, { ouverture: string; fermeture: string }>>({})
  const [msg, setMsg] = useState<string | null>(null)

  const [boEspace, setBoEspace] = useState('')
  const [boDateDebut, setBoDateDebut] = useState('')
  const [boHeureDebut, setBoHeureDebut] = useState('')
  const [boDateFin, setBoDateFin] = useState('')
  const [boHeureFin, setBoHeureFin] = useState('')
  const [boMotif, setBoMotif] = useState('')

  const loadAll = useCallback(async () => {
    try {
      const [cat, oh, bo] = await Promise.all([
        fetch('/api/catalog').then((r) => r.json()),
        fetch('/api/admin/opening-hours').then((r) => r.json()),
        fetch('/api/admin/blackouts').then((r) => r.json()),
      ])
      if (cat.success) setEspaces(cat.data.espace ?? [])
      if (oh.success) setHours(oh.data)
      if (bo.success) setBlackouts(bo.data)
    } catch {
      setMsg('Erreur de chargement des réglages')
    }
  }, [])

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  // Horaires globaux : un jeu d'horaires unique pour tout le studio, par jour.
  useEffect(() => {
    const d: Record<number, { ouverture: string; fermeture: string }> = {}
    for (let j = 0; j < 7; j++) {
      const existing = hours.find((h) => h.jour === j)
      d[j] = existing
        ? { ouverture: existing.ouverture, fermeture: existing.fermeture }
        : { ouverture: '', fermeture: '' }
    }
    setDraft(d)
  }, [hours])

  function viderJour(jour: number) {
    setDraft((d) => ({ ...d, [jour]: { ouverture: '', fermeture: '' } }))
  }

  // Enregistre les 7 jours d'un coup : upsert des jours renseignés, suppression
  // des jours vidés. Vérifie d'abord la cohérence de chaque ligne.
  async function enregistrerHoraires() {
    for (let j = 0; j < 7; j++) {
      const o = draft[j]?.ouverture ?? ''
      const f = draft[j]?.fermeture ?? ''
      if ((o && !f) || (!o && f)) {
        setMsg(`${JOURS[j]} : renseignez l’ouverture ET la fermeture, ou laissez les deux vides (jour fermé).`)
        return
      }
      if (o && f && o >= f) {
        setMsg(`${JOURS[j]} : l’heure d’ouverture doit précéder la fermeture.`)
        return
      }
    }
    try {
      await Promise.all(
        Array.from({ length: 7 }, (_, j) => {
          const o = draft[j]?.ouverture ?? ''
          const f = draft[j]?.fermeture ?? ''
          const existing = hours.find((h) => h.jour === j)
          if (o && f) {
            return fetch('/api/admin/opening-hours', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ jour: j, ouverture: o, fermeture: f }),
            })
          }
          if (existing) {
            return fetch(`/api/admin/opening-hours/${existing.id}`, { method: 'DELETE' })
          }
          return Promise.resolve(null)
        }),
      )
      setMsg('Horaires enregistrés.')
      void loadAll()
    } catch {
      setMsg('Erreur lors de l’enregistrement des horaires.')
    }
  }

  async function ajouterBlocage() {
    if (!boDateDebut || !boHeureDebut || !boDateFin || !boHeureFin) {
      setMsg('Dates et heures de blocage requises')
      return
    }
    const debutAt = new Date(`${boDateDebut}T${boHeureDebut}:00`).toISOString()
    const finAt = new Date(`${boDateFin}T${boHeureFin}:00`).toISOString()
    if (new Date(finAt) <= new Date(debutAt)) {
      setMsg('La fin du blocage doit suivre le début.')
      return
    }
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

  return (
    <div className="mt-5 space-y-6">
      {msg && (
        <p className="rounded-xl bg-ima-lilac px-4 py-2.5 text-sm font-medium text-ima-primary">
          {msg}
        </p>
      )}

      {/* Horaires d'ouverture (globaux) */}
      <section className={sectionCls}>
        <h3 className={titleCls}>Horaires d’ouverture</h3>
        <p className="mb-3 text-[12.5px] text-ima-faint">
          Ces horaires s’appliquent à <strong>tout le studio</strong>. Un jour <strong>sans
          horaire</strong> est considéré comme <strong>fermé</strong> (aucune réservation
          d’espace possible ce jour-là).
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
              {draft[j]?.ouverture || draft[j]?.fermeture ? (
                <button
                  onClick={() => viderJour(j)}
                  className="rounded-lg px-2.5 py-2 text-[13px] font-semibold text-ima-faint hover:text-[#C0392B]"
                >
                  Vider
                </button>
              ) : (
                <span className="text-[12.5px] font-medium text-ima-faint">Fermé</span>
              )}
            </div>
          ))}
        </div>
        <button onClick={enregistrerHoraires} className={`${btnPrimary} mt-4`}>
          Enregistrer les horaires
        </button>
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
    </div>
  )
}
