'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import StatsCards from '@/components/admin/StatsCards'
import UsagersTable from '@/components/admin/UsagersTable'
import ReservationsTable from '@/components/admin/ReservationsTable'
import ReservationDetail from '@/components/admin/ReservationDetail'
import UsagerDetail from '@/components/admin/UsagerDetail'
import CatalogueTab from '@/components/admin/CatalogueTab'
import PlanningTab from '@/components/admin/PlanningTab'
import { STATUTS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Stats, User, Reservation } from '@/types'

const LIMIT = 20
type Tab = 'users' | 'reservations' | 'catalogue' | 'planning'

interface UsagerDetailData {
  user: User
  reservations: Reservation[]
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'users', label: 'Usagers' },
  { key: 'reservations', label: 'Réservations' },
  { key: 'catalogue', label: 'Catalogue' },
  { key: 'planning', label: 'Planning' },
]

const inputCls =
  'rounded-xl border-[1.5px] border-[#E4E1EE] px-3.5 py-2.5 text-sm outline-none transition focus:border-ima-primary focus:ring-[3px] focus:ring-ima-primary/15'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [usersPage, setUsersPage] = useState(1)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [resTotal, setResTotal] = useState(0)
  const [resPage, setResPage] = useState(1)
  const [activeTab, setActiveTab] = useState<Tab>('users')
  const [searchQuery, setSearchQuery] = useState('')
  const [statutFilter, setStatutFilter] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [usagerDetail, setUsagerDetail] = useState<UsagerDetailData | null>(null)
  const [usagerOpen, setUsagerOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  const todayLabel = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const d = await res.json()
      if (res.ok && d.success) setStats(d.data)
    } catch {
      /* non critique */
    }
  }, [])

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(usersPage), limit: String(LIMIT) })
      if (searchQuery.trim()) params.set('search', searchQuery.trim())
      const res = await fetch(`/api/admin/users?${params.toString()}`)
      const d = await res.json()
      if (res.ok && d.success) {
        setUsers(d.data.items)
        setUsersTotal(d.data.total)
      } else setError(d.error ?? 'Erreur de chargement')
    } catch {
      setError('Impossible de contacter le serveur')
    } finally {
      setIsLoading(false)
    }
  }, [usersPage, searchQuery])

  const loadReservations = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(resPage), limit: String(LIMIT) })
      if (searchQuery.trim()) params.set('search', searchQuery.trim())
      if (statutFilter) params.set('statut', statutFilter)
      const res = await fetch(`/api/admin/reservations?${params.toString()}`)
      const d = await res.json()
      if (res.ok && d.success) {
        setReservations(d.data.items)
        setResTotal(d.data.total)
      } else setError(d.error ?? 'Erreur de chargement')
    } catch {
      setError('Impossible de contacter le serveur')
    } finally {
      setIsLoading(false)
    }
  }, [resPage, searchQuery, statutFilter])

  useEffect(() => {
    void loadStats()
  }, [loadStats])
  useEffect(() => {
    if (activeTab === 'users') void loadUsers()
  }, [activeTab, loadUsers])
  useEffect(() => {
    if (activeTab === 'reservations') void loadReservations()
  }, [activeTab, loadReservations])

  async function handleStatutChange(id: string, statut: string) {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut }),
      })
      const d = await res.json()
      if (res.ok && d.success) {
        setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, statut } : r)))
        void loadStats()
      }
    } catch {
      /* ignore */
    }
  }

  async function ouvrirUsager(user: User) {
    setUsagerOpen(true)
    setDetailLoading(true)
    setUsagerDetail(null)
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`)
      const d = await res.json()
      if (res.ok && d.success) setUsagerDetail(d.data)
    } catch {
      /* ignore */
    } finally {
      setDetailLoading(false)
    }
  }

  function changerTab(tab: Tab) {
    setActiveTab(tab)
    setSearchQuery('')
    setStatutFilter('')
    setUsersPage(1)
    setResPage(1)
    setError(null)
  }

  function exporter() {
    window.open(
      activeTab === 'users' ? '/api/admin/export/users' : '/api/admin/export/reservations',
    )
  }

  function reessayer() {
    if (activeTab === 'users') void loadUsers()
    else void loadReservations()
  }

  async function deconnexion() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch {
      /* ignore */
    }
    router.replace('/admin/login')
    router.refresh()
  }

  const total = activeTab === 'users' ? usersTotal : resTotal
  const page = activeTab === 'users' ? usersPage : resPage
  const items = activeTab === 'users' ? users : reservations
  const setPage = activeTab === 'users' ? setUsersPage : setResPage
  const pageCount = Math.max(1, Math.ceil(total / LIMIT))
  const start = total === 0 ? 0 : (page - 1) * LIMIT + 1
  const end = Math.min(page * LIMIT, total)

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[1px] text-ima-faint">
            Espace administration
          </div>
          <h1 className="mt-1 font-sora text-[28px] font-extrabold">Tableau de bord</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[13px] text-ima-faint">Cotonou · {todayLabel}</span>
          <button
            onClick={deconnexion}
            className="rounded-lg border border-[#d9d0f2] bg-white px-3.5 py-2 text-[13px] font-semibold text-ima-primary transition hover:bg-ima-lilac"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {stats && (
        <div className="mt-5">
          <StatsCards stats={stats} />
        </div>
      )}

      <div className="mt-6 flex gap-1 border-b border-ima-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => changerTab(t.key)}
            className={cn(
              'border-b-[2.5px] px-3.5 py-3 font-sora text-sm font-semibold transition-colors',
              activeTab === t.key
                ? 'border-ima-primary text-ima-primary'
                : 'border-transparent text-ima-faint hover:text-ima-muted',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'catalogue' ? (
        <CatalogueTab />
      ) : activeTab === 'planning' ? (
        <div className="mt-5">
          <PlanningTab />
        </div>
      ) : (
        <div className="mt-5">
          {/* Contrôles */}
          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-1 flex-wrap gap-2.5">
              <input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setUsersPage(1)
                  setResPage(1)
                }}
                placeholder="Rechercher…"
                className={cn(inputCls, 'min-w-[200px] max-w-[340px] flex-1')}
              />
              {activeTab === 'reservations' && (
                <select
                  value={statutFilter}
                  onChange={(e) => {
                    setStatutFilter(e.target.value)
                    setResPage(1)
                  }}
                  className={cn(inputCls, 'bg-white')}
                >
                  <option value="">Tous les statuts</option>
                  {STATUTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}
            </div>
            <button
              onClick={exporter}
              className="inline-flex items-center gap-2 rounded-xl border border-[#d9d0f2] bg-white px-4 py-2.5 text-[13.5px] font-semibold text-ima-primary transition hover:bg-ima-lilac"
            >
              ⬇ Exporter CSV
            </button>
          </div>

          {error ? (
            <div className="rounded-2xl border border-[#f4d6d6] bg-white px-6 py-10 text-center">
              <div className="text-[34px]">⚠️</div>
              <div className="mt-2 font-sora text-[17px] font-bold">Impossible de charger les données</div>
              <div className="mt-1.5 text-[13.5px] text-ima-muted">{error}</div>
              <button onClick={reessayer} className="mt-4 rounded-xl bg-ima-primary px-5 py-2.5 text-sm font-semibold text-white">
                Réessayer
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid gap-2.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-[46px] animate-pulse rounded-xl bg-ima-line/70" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-ima-line bg-white px-6 py-12 text-center">
              <div className="text-[30px]">{activeTab === 'users' ? '🔍' : '📭'}</div>
              <div className="mt-2 font-sora font-bold">
                {activeTab === 'users' ? 'Aucun usager trouvé' : 'Aucune réservation'}
              </div>
              <div className="mt-1 text-[13.5px] text-ima-muted">
                {searchQuery || statutFilter ? 'Aucun résultat pour ces critères.' : 'Rien à afficher pour le moment.'}
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-ima-line bg-white">
              {activeTab === 'users' ? (
                <UsagersTable users={users} onRowClick={ouvrirUsager} />
              ) : (
                <ReservationsTable
                  reservations={reservations}
                  onStatutChange={handleStatutChange}
                  onRowClick={setSelectedReservation}
                />
              )}
              <div className="flex items-center justify-between border-t border-[#f1eff7] px-4 py-3">
                <div className="text-[12.5px] text-ima-faint">
                  {start}–{end} sur {total} résultats
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-lg bg-ima-lilac px-3 py-2 text-[13px] font-semibold text-ima-primary disabled:opacity-40"
                  >
                    ‹
                  </button>
                  <span className="text-[13px] text-ima-muted">{page} / {pageCount}</span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={end >= total}
                    className="rounded-lg bg-ima-lilac px-3 py-2 text-[13px] font-semibold text-ima-primary disabled:opacity-40"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal
        open={selectedReservation !== null}
        onClose={() => setSelectedReservation(null)}
        title="Détail de la réservation"
      >
        {selectedReservation && <ReservationDetail reservation={selectedReservation} />}
      </Modal>

      <Modal open={usagerOpen} onClose={() => setUsagerOpen(false)} title="Fiche usager">
        <UsagerDetail data={usagerDetail} isLoading={detailLoading} />
      </Modal>
    </div>
  )
}
