import type { Reservation } from '@/types'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

interface ReservationsTableProps {
  reservations: Reservation[]
  selectedIds: string[]
  onToggleOne: (id: string) => void
  onToggleAll: () => void
  onConfirm: (id: string) => void
  onRefuse: (reservation: Reservation) => void
  onRowClick: (reservation: Reservation) => void
}

type BadgeVariant = 'pending' | 'confirmed' | 'refused' | 'default'

function statutVariant(statut: string): BadgeVariant {
  if (statut === 'Confirmée') return 'confirmed'
  if (statut === 'Refusée') return 'refused'
  if (statut === 'En attente') return 'pending'
  return 'default'
}

const TH = 'px-4 py-3.5 text-left text-[12px] font-semibold text-ima-faint'
const TD = 'px-4 py-3'

const btnBase =
  'rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition-colors disabled:cursor-default'

export default function ReservationsTable({
  reservations,
  selectedIds,
  onToggleOne,
  onToggleAll,
  onConfirm,
  onRefuse,
  onRowClick,
}: ReservationsTableProps) {
  const pendingIds = reservations.filter((r) => r.statut === 'En attente').map((r) => r.id)
  const allPendingSelected =
    pendingIds.length > 0 && pendingIds.every((id) => selectedIds.includes(id))

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[760px] w-full border-collapse text-[13.5px]">
        <thead>
          <tr className="bg-[#faf9fd]">
            <th className={`${TH} w-10`}>
              <input
                type="checkbox"
                checked={allPendingSelected}
                onChange={onToggleAll}
                disabled={pendingIds.length === 0}
                aria-label="Tout sélectionner"
                className="h-4 w-4 cursor-pointer accent-ima-primary disabled:cursor-default disabled:opacity-40"
              />
            </th>
            <th className={TH}>RÉF.</th>
            <th className={TH}>USAGER</th>
            <th className={TH}>OBJET</th>
            <th className={TH}>DATE</th>
            <th className={TH}>STATUT</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr
              key={r.id}
              onClick={() => onRowClick(r)}
              className="cursor-pointer border-t border-[#f1eff7] transition-colors hover:bg-ima-lilac/60"
            >
              <td className={TD} onClick={(e) => e.stopPropagation()}>
                {r.statut === 'En attente' && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(r.id)}
                    onChange={() => onToggleOne(r.id)}
                    aria-label="Sélectionner cette réservation"
                    className="h-4 w-4 cursor-pointer accent-ima-primary"
                  />
                )}
              </td>
              <td className={`${TD} font-sora font-bold text-ima-primary`}>
                RES-{r.id.slice(-8).toUpperCase()}
              </td>
              <td className={TD}>
                <div className="font-semibold text-ima-ink">
                  {r.user?.prenom} {r.user?.nom}
                </div>
                <div className="text-[12px] text-ima-faint">{r.user?.email}</div>
              </td>
              <td className={`${TD} max-w-[200px] truncate text-ima-muted`}>{r.objetProjet}</td>
              <td className={`${TD} whitespace-nowrap text-ima-muted`}>
                {r.dateDebut ? formatDate(r.dateDebut) : '—'}
                {r.heureDebut ? ` · ${r.heureDebut}` : ''}
              </td>
              <td className={TD} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2.5">
                  <Badge variant={statutVariant(r.statut)}>{r.statut}</Badge>
                  {r.statut === 'En attente' && (
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => onConfirm(r.id)}
                        className={`${btnBase} border border-emerald-200 text-emerald-700 hover:bg-emerald-50`}
                      >
                        Confirmer
                      </button>
                      <button
                        type="button"
                        onClick={() => onRefuse(r)}
                        className={`${btnBase} border border-rose-200 text-rose-700 hover:bg-rose-50`}
                      >
                        Refuser
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
