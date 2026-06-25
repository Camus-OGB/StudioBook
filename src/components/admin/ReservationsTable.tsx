import type { Reservation } from '@/types'
import Badge from '@/components/ui/Badge'
import { STATUTS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

interface ReservationsTableProps {
  reservations: Reservation[]
  onStatutChange: (id: string, statut: string) => void
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

export default function ReservationsTable({
  reservations,
  onStatutChange,
  onRowClick,
}: ReservationsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[760px] w-full border-collapse text-[13.5px]">
        <thead>
          <tr className="bg-[#faf9fd]">
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
                  <select
                    value={r.statut}
                    onChange={(e) => onStatutChange(r.id, e.target.value)}
                    aria-label="Changer le statut"
                    className="cursor-pointer rounded-lg border border-[#E4E1EE] bg-white px-2 py-1.5 text-[12px] text-ima-muted outline-none"
                  >
                    {STATUTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
