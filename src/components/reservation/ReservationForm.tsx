'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface FormData {
  userId: string
  nom: string
  whatsapp: string
  typeRes: string
  materielsChoisis: string[]
  espacesChoisis: string[]
  autreDetail: string
  dateDebut: string
  dateFin: string
  heureDebut: string
  heureFin: string
  objetProjet: string
  nbPersonnes: number
}

const INITIAL: FormData = {
  userId: '',
  nom: '',
  whatsapp: '',
  typeRes: '',
  materielsChoisis: [],
  espacesChoisis: [],
  autreDetail: '',
  dateDebut: '',
  dateFin: '',
  heureDebut: '',
  heureFin: '',
  objetProjet: '',
  nbPersonnes: 1,
}

const ETAPES = ['Identité', 'Sélection', 'Planning', 'Récap']
const TYPES = ['Matériel', 'Espace', 'Les deux']

const labelCls = 'mb-1.5 block text-[13px] font-semibold text-[#3a3348]'
const inputCls =
  'w-full rounded-xl border-[1.5px] border-[#E4E1EE] px-3.5 py-3 text-sm text-ima-ink outline-none transition focus:border-ima-primary focus:ring-[3px] focus:ring-ima-primary/15'

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-2 text-[13.5px] font-semibold transition',
        on ? 'border-ima-primary bg-ima-lilac text-ima-primary' : 'border-[#E4E1EE] bg-white text-ima-muted hover:border-[#d3cce6]',
      )}
    >
      {on ? '✓' : '+'} {children}
    </button>
  )
}

function ReservationFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>(INITIAL)
  const [verified, setVerified] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [verifyNom, setVerifyNom] = useState('')
  const [verifyName, setVerifyName] = useState('')
  const [verifyEmail, setVerifyEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [resultId, setResultId] = useState<string | null>(null)

  const [materiels, setMateriels] = useState<string[]>([])
  const [espaces, setEspaces] = useState<string[]>([])

  const today = new Date().toISOString().split('T')[0]
  const showMateriel = data.typeRes === 'Matériel' || data.typeRes === 'Les deux'
  const showEspace = data.typeRes === 'Espace' || data.typeRes === 'Les deux'

  useEffect(() => {
    fetch('/api/catalog')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setMateriels(d.data.materiel ?? [])
          setEspaces(d.data.espace ?? [])
        }
      })
      .catch(() => {})
  }, [])

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((p) => ({ ...p, [key]: value }))
  }
  function toggle(key: 'materielsChoisis' | 'espacesChoisis', v: string) {
    setData((p) => ({
      ...p,
      [key]: p[key].includes(v) ? p[key].filter((x) => x !== v) : [...p[key], v],
    }))
  }

  async function verifier(id: string, nom: string) {
    const cible = id.trim()
    const nomCible = nom.trim()
    if (!cible || !nomCible) {
      setVerifyError('Saisissez votre identifiant et votre nom')
      return
    }
    setLoading(true)
    setVerifyError(null)
    try {
      const res = await fetch(
        `/api/users/${encodeURIComponent(cible)}?nom=${encodeURIComponent(nomCible)}`,
      )
      const d = await res.json()
      if (res.ok && d.success) {
        setVerified(true)
        setVerifyName(`${d.user.prenom} ${d.user.nom}`)
        setVerifyEmail(d.user.email)
        setData((p) => ({
          ...p,
          userId: cible,
          nom: `${d.user.prenom} ${d.user.nom}`,
          whatsapp: d.user.telephone ?? p.whatsapp,
        }))
      } else {
        setVerified(false)
        setVerifyError(d.error ?? 'Identifiant introuvable')
      }
    } catch {
      setVerified(false)
      setVerifyError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const id = searchParams.get('id')
    const nomQ = searchParams.get('nom')
    if (id) setData((p) => ({ ...p, userId: id }))
    if (id && nomQ) {
      setVerifyNom(nomQ)
      void verifier(id, nomQ)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function submit() {
    setLoading(true)
    setGlobalError(null)
    try {
      const payload = {
        ...data,
        materielsChoisis: showMateriel ? data.materielsChoisis : [],
        espacesChoisis: showEspace ? data.espacesChoisis : [],
      }
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const d = await res.json()
      if (res.ok && d.success) setResultId(d.reservation.id)
      else setGlobalError(d.error ?? 'Une erreur est survenue')
    } catch {
      setGlobalError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  const canStep1 = verified && data.nom.trim() && data.whatsapp.trim()
  const canStep2 =
    data.typeRes &&
    (!showMateriel || data.materielsChoisis.length > 0) &&
    (!showEspace || data.espacesChoisis.length > 0)
  const canStep3 =
    data.dateDebut && data.objetProjet.trim() && data.nbPersonnes >= 1 &&
    (!showEspace || (data.heureDebut && data.heureFin))

  const canNext = step === 1 ? canStep1 : step === 2 ? canStep2 : step === 3 ? canStep3 : true

  function next() {
    if (!canNext) return
    if (step === 4) void submit()
    else setStep((s) => s + 1)
  }

  // ----- Succès -----
  if (resultId) {
    const reference = `RES-${resultId.slice(-8).toUpperCase()}`
    return (
      <div className="mx-auto max-w-[680px] px-5 pb-16 pt-9">
        <div className="animate-ima-up rounded-[22px] border border-ima-line bg-white p-8 text-center shadow-[0_14px_40px_rgba(40,20,80,0.08)]">
          <div className="mx-auto flex h-[66px] w-[66px] items-center justify-center rounded-full bg-[#FFF4D6]">
            <span className="text-[32px]">🎉</span>
          </div>
          <h2 className="mt-4 font-sora text-2xl font-extrabold">Demande envoyée !</h2>
          <p className="mx-auto mt-2 max-w-[420px] text-[15px] leading-relaxed text-ima-muted">
            Votre réservation est <b className="text-[#9A6B00]">en attente</b> de validation.
            L’équipe IMA Studio vous contactera sur WhatsApp.
          </p>
          <div className="mt-5 rounded-2xl border border-dashed border-[#c9bdf0] bg-[#f7f5fd] p-4">
            <div className="text-xs font-semibold text-ima-faint">RÉFÉRENCE</div>
            <div className="mt-1 font-sora text-2xl font-extrabold text-ima-primary">{reference}</div>
          </div>
          <div className="mt-6 flex flex-col gap-2.5">
            <button onClick={() => router.push('/')} className="rounded-xl bg-ima-primary px-5 py-[15px] font-sora text-[15px] font-bold text-white transition hover:brightness-110">
              Retour à l’accueil
            </button>
            <button onClick={() => window.location.reload()} className="py-1.5 text-sm font-medium text-ima-muted hover:text-ima-primary">
              Nouvelle réservation
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ----- Formulaire -----
  return (
    <div className="mx-auto max-w-[680px] px-5 pb-16 pt-9">
      <Link href="/" className="text-[13px] font-medium text-ima-faint hover:text-ima-primary">
        ← Accueil
      </Link>
      <h1 className="mt-1.5 font-sora text-[28px] font-extrabold">Nouvelle réservation</h1>
      <p className="mt-1.5 text-[14.5px] text-ima-muted">
        Étape {step} sur 4 — {ETAPES[step - 1]}
      </p>

      <div className="my-6 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={cn('h-1.5 flex-1 rounded-full', i <= step ? 'bg-ima-primary' : 'bg-ima-line')} />
        ))}
      </div>

      <div className="rounded-[20px] border border-ima-line bg-white p-6 shadow-[0_8px_28px_rgba(40,20,80,0.06)]">
        {step === 1 && (
          <div className="grid gap-4">
            <div>
              <span className={labelCls}>Votre identifiant usager *</span>
              <input
                className={cn(inputCls, 'font-sora tracking-wide')}
                value={data.userId}
                onChange={(e) => {
                  set('userId', e.target.value)
                  setVerified(false)
                  setVerifyError(null)
                }}
                placeholder="IMA-2026-0001"
              />
              <span className={cn(labelCls, 'mt-3')}>Votre nom de famille *</span>
              <div className="flex gap-2.5">
                <input
                  className={cn(inputCls, 'flex-1')}
                  value={verifyNom}
                  onChange={(e) => {
                    setVerifyNom(e.target.value)
                    setVerified(false)
                    setVerifyError(null)
                  }}
                  placeholder="Aïssi"
                />
                <button
                  onClick={() => verifier(data.userId, verifyNom)}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-ima-primary px-[18px] text-sm font-semibold text-white"
                >
                  {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                  Vérifier
                </button>
              </div>
              {verifyError && (
                <div className="mt-2.5 rounded-xl bg-[#FBE4E4] px-3.5 py-3 text-[13px] leading-relaxed text-[#C0392B]">
                  {verifyError}{' '}
                  <Link href="/inscription" className="font-semibold text-ima-primary underline">
                    S’inscrire d’abord →
                  </Link>
                </div>
              )}
            </div>

            {verified && (
              <>
                <div className="rounded-2xl border border-[#b9e6cd] bg-[#E8F7EF] p-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#157347] font-bold text-white">✓</span>
                    <span>
                      <span className="block font-sora text-[15px] font-bold text-[#0f5132]">{verifyName}</span>
                      <span className="block text-[12.5px] text-[#3f6e57]">Identifiant vérifié · {verifyEmail}</span>
                    </span>
                  </div>
                </div>
                <label>
                  <span className={labelCls}>Nom</span>
                  <input className={inputCls} value={data.nom} onChange={(e) => set('nom', e.target.value)} />
                </label>
                <label>
                  <span className={labelCls}>WhatsApp</span>
                  <input type="tel" className={inputCls} value={data.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
                </label>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-6">
            <div>
              <span className={labelCls}>Que souhaitez-vous réserver ? *</span>
              <div className="flex flex-wrap gap-2.5">
                {TYPES.map((t) => {
                  const on = data.typeRes === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set('typeRes', t)}
                      className={cn(
                        'min-w-[100px] flex-1 rounded-xl border-[1.5px] px-3 py-3.5 text-sm font-semibold transition',
                        on ? 'border-ima-primary bg-ima-lilac text-ima-primary' : 'border-[#E4E1EE] bg-white text-ima-muted hover:border-[#d3cce6]',
                      )}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>

            {showMateriel && (
              <div>
                <span className={labelCls}>Matériel</span>
                <div className="flex flex-wrap gap-2.5">
                  {materiels.map((m) => (
                    <Chip key={m} on={data.materielsChoisis.includes(m)} onClick={() => toggle('materielsChoisis', m)}>{m}</Chip>
                  ))}
                </div>
              </div>
            )}

            {showEspace && (
              <div>
                <span className={labelCls}>Espaces</span>
                <div className="flex flex-wrap gap-2.5">
                  {espaces.map((e) => (
                    <Chip key={e} on={data.espacesChoisis.includes(e)} onClick={() => toggle('espacesChoisis', e)}>{e}</Chip>
                  ))}
                </div>
              </div>
            )}

            <label>
              <span className={labelCls}>Autre précision <span className="font-normal text-ima-faint">(optionnel)</span></span>
              <input className={inputCls} value={data.autreDetail} onChange={(e) => set('autreDetail', e.target.value)} placeholder="Besoin spécifique…" />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4">
            {showEspace && (
              <p className="rounded-xl bg-[#f7f5fd] px-4 py-3 text-[13px] text-ima-muted">
                ⏱️ Pour un espace, l’heure de début et de fin sont obligatoires (vérification des disponibilités).
              </p>
            )}
            <div className="grid grid-cols-2 gap-3.5">
              <label>
                <span className={labelCls}>Date de début *</span>
                <input type="date" min={today} className={inputCls} value={data.dateDebut} onChange={(e) => set('dateDebut', e.target.value)} />
              </label>
              <label>
                <span className={labelCls}>Date de fin</span>
                <input type="date" min={data.dateDebut || today} className={inputCls} value={data.dateFin} onChange={(e) => set('dateFin', e.target.value)} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <label>
                <span className={labelCls}>Heure début {showEspace && '*'}</span>
                <input type="time" className={inputCls} value={data.heureDebut} onChange={(e) => set('heureDebut', e.target.value)} />
              </label>
              <label>
                <span className={labelCls}>Heure fin {showEspace && '*'}</span>
                <input type="time" className={inputCls} value={data.heureFin} onChange={(e) => set('heureFin', e.target.value)} />
              </label>
            </div>
            <label>
              <span className={labelCls}>Nombre de personnes *</span>
              <input type="number" min={1} max={20} className={inputCls} value={data.nbPersonnes} onChange={(e) => set('nbPersonnes', Number(e.target.value) || 1)} />
            </label>
            <label>
              <span className={labelCls}>Objet du projet *</span>
              <input className={inputCls} value={data.objetProjet} onChange={(e) => set('objetProjet', e.target.value)} placeholder="Ex. Shooting portrait, épisode podcast…" />
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="rounded-2xl bg-[#f7f5fd] p-[18px]">
            <div className="mb-3 font-sora text-[13px] font-bold text-ima-primary">Récapitulatif de la demande</div>
            <div className="grid gap-2 text-[13.5px]">
              <Recap label="Usager" value={`${data.nom} (${data.userId})`} />
              <Recap label="WhatsApp" value={data.whatsapp} />
              <Recap label="Type" value={data.typeRes} />
              {showMateriel && data.materielsChoisis.length > 0 && <Recap label="Matériel" value={data.materielsChoisis.join(', ')} />}
              {showEspace && data.espacesChoisis.length > 0 && <Recap label="Espaces" value={data.espacesChoisis.join(', ')} />}
              <Recap label="Période" value={`${data.dateDebut}${data.heureDebut ? ' ' + data.heureDebut : ''}${data.dateFin || data.heureFin ? ' → ' + (data.dateFin || data.dateDebut) + (data.heureFin ? ' ' + data.heureFin : '') : ''}`} />
              <Recap label="Personnes" value={String(data.nbPersonnes)} />
              <Recap label="Objet" value={data.objetProjet} />
            </div>
          </div>
        )}

        {globalError && (
          <p className="mt-4 rounded-xl bg-[#FBE4E4] px-4 py-3 text-sm text-[#C0392B]">{globalError}</p>
        )}

        <div className="mt-6 flex gap-2.5">
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)} disabled={loading} className="rounded-xl bg-ima-lilac px-5 py-3.5 text-[14.5px] font-semibold text-ima-primary transition hover:brightness-95">
              Retour
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={next}
              disabled={!canNext}
              className={cn('flex-1 rounded-xl px-3 py-3.5 font-sora text-[14.5px] font-bold text-white transition', canNext ? 'bg-ima-primary hover:brightness-110' : 'cursor-not-allowed bg-ima-primary/40')}
            >
              Continuer →
            </button>
          ) : (
            <button
              onClick={next}
              disabled={loading}
              className={cn('flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3.5 font-sora text-[14.5px] font-bold text-[#3a2700] transition', loading ? 'bg-ima-accent/70' : 'bg-ima-accent hover:brightness-95')}
            >
              {loading && <span className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-[#3a2700]/30 border-t-[#3a2700]" />}
              Confirmer la demande
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Recap({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-ima-faint">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  )
}

export default function ReservationForm() {
  return (
    <Suspense fallback={<div className="px-5 py-16 text-center text-ima-muted">Chargement…</div>}>
      <ReservationFormInner />
    </Suspense>
  )
}
