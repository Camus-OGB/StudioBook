import type { User, Reservation } from '@/types'
import Badge from '@/components/ui/Badge'
import { DetailSkeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/utils'

type BadgeVariant = 'pending' | 'confirmed' | 'refused' | 'default'

function statutVariant(statut: string): BadgeVariant {
  if (statut === 'Confirmée') return 'confirmed'
  if (statut === 'Refusée') return 'refused'
  if (statut === 'En attente') return 'pending'
  return 'default'
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[12px] text-ima-faint">{label}</p>
      <p className="break-words text-sm font-medium text-ima-ink">{value}</p>
    </div>
  )
}

interface UsagerDetailData {
  user: User
  reservations: Reservation[]
}

export default function UsagerDetail({
  data,
  isLoading,
}: {
  data: UsagerDetailData | null
  isLoading: boolean
}) {
  if (isLoading || !data) {
    return <DetailSkeleton />
  }

  const { user, reservations } = data

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-ima-lilac/60 px-4 py-3">
        <span className="rounded-lg bg-white px-2.5 py-1 font-sora text-sm font-bold text-ima-primary">
          {user.id}
        </span>
        <span className="font-sora text-lg font-extrabold text-ima-ink">
          {user.prenom} {user.nom}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-ima-line bg-[#faf9fd] p-4 sm:grid-cols-2">
        <Field label="Email" value={user.email} />
        <Field label="Téléphone" value={user.telephone} />
        <Field label="Lien Sème City" value={user.lien} />
        <Field label="Programme" value={user.programme || '—'} />
        <Field label="Niveau d’expérience" value={user.niveauExperience} />
        <Field label="Inscrit le" value={formatDate(user.dateInscription)} />
        <div className="col-span-2">
          <Field label="Domaines d’intérêt" value={user.domainesInteret.join(', ') || '—'} />
        </div>
        <div className="col-span-2">
          <Field label="Objectif d’utilisation" value={user.objectifUtilisation} />
        </div>
        {user.descriptionProjet && (
          <div className="col-span-2">
            <Field label="Description du projet" value={user.descriptionProjet} />
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 font-sora text-[13px] font-bold uppercase tracking-wide text-ima-primary">
          Réservations ({reservations.length})
        </h3>
        {reservations.length === 0 ? (
          <p className="text-sm text-ima-muted">Aucune réservation pour cet usager.</p>
        ) : (
          <ul className="space-y-2">
            {reservations.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#f1eff7] bg-[#faf9fd] px-3.5 py-2.5">
                <div className="min-w-0">
                  <span className="font-sora text-[12px] font-bold text-ima-primary">
                    RES-{r.id.slice(-8).toUpperCase()}
                  </span>
                  <p className="truncate text-sm text-ima-muted">
                    {r.typeRes} · {r.dateDebut ? formatDate(r.dateDebut) : 'date n.c.'}
                  </p>
                </div>
                <Badge variant={statutVariant(r.statut)}>{r.statut}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
