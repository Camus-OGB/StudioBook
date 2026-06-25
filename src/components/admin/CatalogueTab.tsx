'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { CatalogItem } from '@/types'

const CATEGORIES: { key: string; label: string }[] = [
  { key: 'materiel', label: 'Matériel' },
  { key: 'espace', label: 'Espaces' },
  { key: 'domaine', label: 'Domaines' },
  { key: 'lien', label: 'Liens Sème City' },
  { key: 'niveau', label: 'Niveaux' },
]

export default function CatalogueTab() {
  const [items, setItems] = useState<CatalogItem[]>([])
  const [categorie, setCategorie] = useState('materiel')
  const [nouveau, setNouveau] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/catalog')
    const d = await res.json()
    if (d.success) setItems(d.data)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const liste = items
    .filter((i) => i.categorie === categorie)
    .sort((a, b) => a.ordre - b.ordre)

  async function ajouter() {
    if (!nouveau.trim()) return
    const res = await fetch('/api/admin/catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categorie, valeur: nouveau.trim() }),
    })
    const d = await res.json()
    if (res.ok) {
      setNouveau('')
      setMsg(null)
      void load()
    } else {
      setMsg(d.error)
    }
  }

  async function basculer(item: CatalogItem) {
    await fetch(`/api/admin/catalog/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actif: !item.actif }),
    })
    void load()
  }

  async function renommer(id: string) {
    if (!editVal.trim()) return
    const res = await fetch(`/api/admin/catalog/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valeur: editVal.trim() }),
    })
    const d = await res.json()
    if (res.ok) {
      setEditId(null)
      setMsg(null)
      void load()
    } else {
      setMsg(d.error)
    }
  }

  async function supprimer(id: string) {
    await fetch(`/api/admin/catalog/${id}`, { method: 'DELETE' })
    void load()
  }

  return (
    <div className="mt-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const on = c.key === categorie
          return (
            <button
              key={c.key}
              onClick={() => {
                setCategorie(c.key)
                setEditId(null)
                setMsg(null)
              }}
              className={cn(
                'rounded-lg border-[1.5px] px-3.5 py-2 text-[13.5px] font-semibold transition',
                on ? 'border-ima-primary bg-ima-lilac text-ima-primary' : 'border-[#E4E1EE] bg-white text-ima-muted hover:border-[#d3cce6]',
              )}
            >
              {c.label}
            </button>
          )
        })}
      </div>

      <div className="rounded-2xl border border-ima-line bg-white p-[18px]">
        <div className="mb-4 flex gap-2.5">
          <input
            value={nouveau}
            onChange={(e) => setNouveau(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ajouter()}
            placeholder="Ajouter une option…"
            className="flex-1 rounded-xl border-[1.5px] border-[#E4E1EE] px-3.5 py-2.5 text-sm outline-none focus:border-ima-primary focus:ring-[3px] focus:ring-ima-primary/15"
          />
          <button onClick={ajouter} className="rounded-xl bg-ima-primary px-[18px] text-sm font-semibold text-white transition hover:brightness-110">
            + Ajouter
          </button>
        </div>

        {msg && <p className="mb-3 rounded-lg bg-[#FBE4E4] px-3 py-2 text-[13px] text-[#C0392B]">{msg}</p>}

        <div className="grid gap-2">
          {liste.length === 0 && <p className="text-sm text-ima-muted">Aucune option dans cette catégorie.</p>}
          {liste.map((it) => (
            <div
              key={it.id}
              className={cn(
                'flex items-center gap-2.5 rounded-xl border border-[#f1eff7] px-3.5 py-2.5',
                it.actif ? 'bg-white' : 'bg-[#faf9fd] opacity-70',
              )}
            >
              {editId === it.id ? (
                <>
                  <input
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && renommer(it.id)}
                    className="flex-1 rounded-lg border-[1.5px] border-ima-primary px-2.5 py-2 text-sm outline-none ring-[3px] ring-ima-primary/15"
                  />
                  <button onClick={() => renommer(it.id)} className="text-[13px] font-semibold text-ima-primary">Enregistrer</button>
                  <button onClick={() => setEditId(null)} className="text-[13px] text-ima-faint">Annuler</button>
                </>
              ) : (
                <>
                  <span className={cn('flex-1 text-sm', it.actif ? 'text-ima-ink' : 'text-ima-faint line-through')}>
                    {it.valeur}
                  </span>
                  <button
                    onClick={() => basculer(it)}
                    className={cn('rounded-lg px-2.5 py-1.5 text-[12px] font-semibold', it.actif ? 'bg-[#E8F7EF] text-[#157347]' : 'bg-ima-lilac text-ima-muted')}
                  >
                    {it.actif ? 'Actif' : 'Inactif'}
                  </button>
                  <button
                    onClick={() => {
                      setEditId(it.id)
                      setEditVal(it.valeur)
                    }}
                    className="rounded-lg px-2 py-1.5 text-[12px] font-semibold text-ima-primary hover:bg-ima-lilac"
                  >
                    Renommer
                  </button>
                  <button onClick={() => supprimer(it.id)} className="rounded-lg px-2 py-1.5 text-[12px] font-semibold text-[#C0392B] hover:bg-[#FBE4E4]">
                    Suppr.
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12.5px] text-ima-faint">
          Désactiver masque l’option dans les formulaires sans la supprimer (les données existantes restent intactes).
        </p>
      </div>
    </div>
  )
}
