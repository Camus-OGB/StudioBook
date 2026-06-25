'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface FormData {
  nom: string
  prenom: string
  email: string
  telephone: string
  lien: string
  programme: string
  domainesInteret: string[]
  niveauExperience: string
  objectifUtilisation: string
  descriptionProjet: string
}

const INITIAL: FormData = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  lien: '',
  programme: '',
  domainesInteret: [],
  niveauExperience: '',
  objectifUtilisation: '',
  descriptionProjet: '',
}

const ETAPES = ['Identité', 'Affiliation', 'Domaines', 'Projet']
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const labelCls = 'mb-1.5 block text-[13px] font-semibold text-[#3a3348]'
const inputCls =
  'w-full rounded-xl border-[1.5px] px-3.5 py-3 text-sm text-ima-ink outline-none transition focus:border-ima-primary focus:ring-[3px] focus:ring-ima-primary/15'

function border(err?: string) {
  return err ? 'border-[#C0392B]' : 'border-[#E4E1EE]'
}

export default function InscriptionForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [resultId, setResultId] = useState<string | null>(null)
  const [isExisting, setIsExisting] = useState(false)
  const [copied, setCopied] = useState(false)

  const [liens, setLiens] = useState<string[]>([])
  const [domaines, setDomaines] = useState<string[]>([])
  const [niveaux, setNiveaux] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/catalog')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setLiens(d.data.lien ?? [])
          setDomaines(d.data.domaine ?? [])
          setNiveaux(d.data.niveau ?? [])
        }
      })
      .catch(() => {})
  }, [])

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((p) => ({ ...p, [key]: value }))
    setErrors((p) => {
      if (!p[key]) return p
      const n = { ...p }
      delete n[key]
      return n
    })
  }

  function toggleDomaine(v: string) {
    setData((p) => ({
      ...p,
      domainesInteret: p.domainesInteret.includes(v)
        ? p.domainesInteret.filter((d) => d !== v)
        : [...p.domainesInteret, v],
    }))
    setErrors((p) => {
      if (!p.domainesInteret) return p
      const n = { ...p }
      delete n.domainesInteret
      return n
    })
  }

  function validate(s: number): boolean {
    const e: Record<string, string> = {}
    if (s === 1) {
      if (!data.nom.trim()) e.nom = 'Requis'
      if (!data.prenom.trim()) e.prenom = 'Requis'
      if (!data.email.trim()) e.email = 'Requis'
      else if (!EMAIL_REGEX.test(data.email)) e.email = 'Email invalide'
      if (!data.telephone.trim()) e.telephone = 'Requis'
    }
    if (s === 2 && !data.lien) e.lien = 'Sélectionnez votre lien avec Sème City'
    if (s === 3) {
      if (data.domainesInteret.length === 0)
        e.domainesInteret = 'Sélectionnez au moins un domaine'
      if (!data.niveauExperience) e.niveauExperience = "Choisissez un niveau"
    }
    if (s === 4 && !data.objectifUtilisation.trim())
      e.objectifUtilisation = 'Requis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit() {
    setLoading(true)
    setGlobalError(null)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const d = await res.json()
      if (res.ok && d.success) {
        setResultId(d.user.id)
        setIsExisting(false)
      } else if (res.status === 409) {
        setResultId(d.userId ?? null)
        setIsExisting(true)
      } else {
        setGlobalError(d.error ?? "Une erreur est survenue")
      }
    } catch {
      setGlobalError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  function next() {
    if (!validate(step)) return
    if (step === 4) void submit()
    else setStep((s) => s + 1)
  }

  function back() {
    setErrors({})
    setStep((s) => s - 1)
  }

  async function copy() {
    if (!resultId) return
    try {
      await navigator.clipboard.writeText(resultId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  // ----- Écran de succès -----
  if (resultId) {
    return (
      <div className="mx-auto max-w-[680px] px-5 pb-16 pt-9">
        <div className="animate-ima-up rounded-[22px] border border-ima-line bg-white p-8 text-center shadow-[0_14px_40px_rgba(40,20,80,0.08)]">
          <div
            className={cn(
              'mx-auto flex h-[66px] w-[66px] items-center justify-center rounded-full',
              isExisting ? 'bg-ima-lilac' : 'bg-[#FFF4D6]',
            )}
          >
            <span className="text-[32px]">{isExisting ? '👋' : '🎉'}</span>
          </div>
          <h2 className="mt-4 font-sora text-2xl font-extrabold">
            {isExisting ? 'Vous êtes déjà inscrit' : 'Inscription réussie !'}
          </h2>
          <p className="mx-auto mt-2 max-w-[400px] text-[15px] leading-relaxed text-ima-muted">
            {isExisting
              ? 'Un compte existe déjà avec cet email. Voici votre identifiant.'
              : 'Bienvenue à l’IMA Studio ! Conservez votre identifiant.'}
          </p>

          <div className="mt-5 rounded-2xl border border-dashed border-[#c9bdf0] bg-[#f7f5fd] p-[18px]">
            <div className="text-xs font-semibold tracking-wide text-ima-faint">
              VOTRE IDENTIFIANT
            </div>
            <div className="mt-2 flex items-center justify-center gap-3">
              <div className="font-sora text-[27px] font-extrabold tracking-wide text-ima-primary">
                {resultId}
              </div>
              <button
                onClick={copy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#d9d0f2] bg-white px-2.5 py-2 text-[13px] font-semibold text-ima-primary transition hover:bg-ima-lilac"
              >
                ⧉ {copied ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <div className="mt-2 text-xs text-ima-faint">
              Conservez-le : il vous servira à réserver.
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() =>
                router.push(
                  `/reservation?id=${resultId}&nom=${encodeURIComponent(data.nom)}`,
                )
              }
              className="rounded-xl bg-ima-accent px-5 py-[15px] font-sora text-[15px] font-bold text-[#3a2700] transition hover:brightness-95"
            >
              Réserver maintenant →
            </button>
            <Link href="/" className="py-1.5 text-sm font-medium text-ima-muted hover:text-ima-primary">
              Retour à l’accueil
            </Link>
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
      <h1 className="mt-1.5 font-sora text-[28px] font-extrabold">Inscription usager</h1>
      <p className="mt-1.5 text-[14.5px] text-ima-muted">
        Étape {step} sur 4 — {ETAPES[step - 1]}
      </p>

      <div className="my-6 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn('h-1.5 flex-1 rounded-full', i <= step ? 'bg-ima-primary' : 'bg-ima-line')}
          />
        ))}
      </div>

      <div className="rounded-[20px] border border-ima-line bg-white p-6 shadow-[0_8px_28px_rgba(40,20,80,0.06)]">
        {step === 1 && (
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <label>
                <span className={labelCls}>Nom *</span>
                <input className={cn(inputCls, border(errors.nom))} value={data.nom} onChange={(e) => set('nom', e.target.value)} placeholder="Aïssi" />
                {errors.nom && <span className="mt-1.5 block text-xs text-[#C0392B]">{errors.nom}</span>}
              </label>
              <label>
                <span className={labelCls}>Prénoms *</span>
                <input className={cn(inputCls, border(errors.prenom))} value={data.prenom} onChange={(e) => set('prenom', e.target.value)} placeholder="Marie-Chantal" />
                {errors.prenom && <span className="mt-1.5 block text-xs text-[#C0392B]">{errors.prenom}</span>}
              </label>
            </div>
            <label>
              <span className={labelCls}>Email *</span>
              <input type="email" className={cn(inputCls, border(errors.email))} value={data.email} onChange={(e) => set('email', e.target.value)} placeholder="nom@exemple.bj" />
              {errors.email && <span className="mt-1.5 block text-xs text-[#C0392B]">{errors.email}</span>}
            </label>
            <label>
              <span className={labelCls}>Téléphone (WhatsApp) *</span>
              <input type="tel" className={cn(inputCls, border(errors.telephone))} value={data.telephone} onChange={(e) => set('telephone', e.target.value)} placeholder="+229 01 00 00 00 00" />
              {errors.telephone && <span className="mt-1.5 block text-xs text-[#C0392B]">{errors.telephone}</span>}
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            <label>
              <span className={labelCls}>Lien avec Sème City *</span>
              <select className={cn(inputCls, 'bg-white', border(errors.lien))} value={data.lien} onChange={(e) => set('lien', e.target.value)}>
                <option value="">— Sélectionner —</option>
                {liens.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              {errors.lien && <span className="mt-1.5 block text-xs text-[#C0392B]">{errors.lien}</span>}
            </label>
            <label>
              <span className={labelCls}>Programme / formation <span className="font-normal text-ima-faint">(optionnel)</span></span>
              <input className={cn(inputCls, 'border-[#E4E1EE]')} value={data.programme} onChange={(e) => set('programme', e.target.value)} placeholder="Ex. Web Academy, promotion 2026" />
            </label>
            <div className="rounded-xl bg-[#f7f5fd] px-4 py-3.5 text-[13px] leading-relaxed text-ima-muted">
              💡 Les options sont gérées par l’administration via le catalogue.
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-6">
            <div>
              <span className={labelCls}>Domaines d’intérêt * <span className="font-normal text-ima-faint">(un ou plusieurs)</span></span>
              <div className="flex flex-wrap gap-2.5">
                {domaines.map((d) => {
                  const on = data.domainesInteret.includes(d)
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDomaine(d)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-2 text-[13.5px] font-semibold transition',
                        on ? 'border-ima-primary bg-ima-lilac text-ima-primary' : 'border-[#E4E1EE] bg-white text-ima-muted hover:border-[#d3cce6]',
                      )}
                    >
                      {on ? '✓' : '+'} {d}
                    </button>
                  )
                })}
              </div>
              {errors.domainesInteret && <span className="mt-2 block text-xs text-[#C0392B]">{errors.domainesInteret}</span>}
            </div>
            <div>
              <span className={labelCls}>Niveau d’expérience *</span>
              <div className="flex flex-wrap gap-2.5">
                {niveaux.map((n) => {
                  const on = data.niveauExperience === n
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => set('niveauExperience', n)}
                      className={cn(
                        'min-w-[90px] flex-1 rounded-xl border-[1.5px] px-3 py-3 text-[13.5px] font-semibold transition',
                        on ? 'border-ima-primary bg-ima-lilac text-ima-primary' : 'border-[#E4E1EE] bg-white text-ima-muted hover:border-[#d3cce6]',
                      )}
                    >
                      {n}
                    </button>
                  )
                })}
              </div>
              {errors.niveauExperience && <span className="mt-2 block text-xs text-[#C0392B]">{errors.niveauExperience}</span>}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-4">
            <label>
              <span className={labelCls}>Objectif d’utilisation *</span>
              <input className={cn(inputCls, border(errors.objectifUtilisation))} value={data.objectifUtilisation} onChange={(e) => set('objectifUtilisation', e.target.value)} placeholder="Ex. Réaliser un court-métrage" />
              {errors.objectifUtilisation && <span className="mt-1.5 block text-xs text-[#C0392B]">{errors.objectifUtilisation}</span>}
            </label>
            <label>
              <span className={labelCls}>Description du projet <span className="font-normal text-ima-faint">(optionnel)</span></span>
              <textarea rows={3} className={cn(inputCls, 'resize-y border-[#E4E1EE]')} value={data.descriptionProjet} onChange={(e) => set('descriptionProjet', e.target.value)} placeholder="Décrivez votre projet en quelques mots…" />
            </label>
            <div className="rounded-2xl bg-[#f7f5fd] p-4">
              <div className="mb-2.5 font-sora text-[13px] font-bold text-ima-primary">Récapitulatif</div>
              <div className="grid gap-1.5 text-[13.5px]">
                <Recap label="Nom complet" value={`${data.prenom} ${data.nom}`} />
                <Recap label="Email" value={data.email} />
                <Recap label="Téléphone" value={data.telephone} />
                <Recap label="Lien" value={data.lien} />
                <Recap label="Domaines" value={data.domainesInteret.join(', ')} />
                <Recap label="Niveau" value={data.niveauExperience} />
              </div>
            </div>
          </div>
        )}

        {globalError && (
          <p className="mt-4 rounded-xl bg-[#FBE4E4] px-4 py-3 text-sm text-[#C0392B]">{globalError}</p>
        )}

        <div className="mt-6 flex gap-2.5">
          {step > 1 && (
            <button onClick={back} disabled={loading} className="rounded-xl bg-ima-lilac px-5 py-3.5 text-[14.5px] font-semibold text-ima-primary transition hover:brightness-95">
              Retour
            </button>
          )}
          <button
            onClick={next}
            disabled={loading}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3.5 font-sora text-[14.5px] font-bold text-white transition',
              loading ? 'bg-ima-primary/70' : 'bg-ima-primary hover:brightness-110',
            )}
          >
            {loading && <span className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {step === 4 ? "Valider l’inscription" : 'Continuer →'}
          </button>
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
