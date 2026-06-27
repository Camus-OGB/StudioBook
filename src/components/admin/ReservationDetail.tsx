import type { Reservation } from '@/types'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

type BadgeVariant = 'pending' | 'confirmed' | 'refused' | 'default'

function statutVariant(statut: string): BadgeVariant {
  if (statut === 'Confirmée') return 'confirmed'
  if (statut === 'Refusée') return 'refused'
  if (statut === 'En attente') return 'pending'
  return 'default'
}

// Libellé d'affichage du type (la valeur « Les deux » stockée en base est
// traduite en quelque chose de plus explicite côté interface).
function libelleType(typeRes: string): string {
  return typeRes === 'Les deux' ? 'Matériel et espace' : typeRes
}

function creneau(date?: string | null, heure?: string | null): string {
  const d = date ? formatDate(date) : ''
  const parts = [d, heure].filter(Boolean)
  return parts.length > 0 ? parts.join(' à ') : '—'
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[12px] text-ima-faint">{label}</p>
      <p className="break-words text-sm font-medium text-ima-ink">{value}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ima-line bg-[#faf9fd] p-4">
      <h3 className="mb-3 font-sora text-[13px] font-bold uppercase tracking-wide text-ima-primary">
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function ReservationDetail({ reservation: r }: { reservation: Reservation }) {
  const reference = `RES-${r.id.slice(-8).toUpperCase()}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl bg-ima-lilac/60 px-4 py-3">
        <span className="font-sora text-lg font-extrabold text-ima-primary">{reference}</span>
        <Badge variant={statutVariant(r.statut)}>{r.statut}</Badge>
      </div>

      <Section title="Usager">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Identifiant" value={r.userId} />
          <Field label="Nom (réservation)" value={r.nom} />
          <Field label="WhatsApp" value={r.whatsapp} />
          {r.user?.email && <Field label="Email du compte" value={r.user.email} />}
          {r.user?.telephone && <Field label="Téléphone du compte" value={r.user.telephone} />}
        </div>
      </Section>

      <Section title="Demande">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Type" value={libelleType(r.typeRes)} />
          <Field label="Nombre de personnes" value={r.nbPersonnes} />
          {r.materielsChoisis.length > 0 && (
            <Field label="Matériels" value={r.materielsChoisis.join(', ')} />
          )}
          {r.espacesChoisis.length > 0 && (
            <Field label="Espaces" value={r.espacesChoisis.join(', ')} />
          )}
          <div className="col-span-2">
            <Field label="Objet du projet" value={r.objetProjet} />
          </div>
          {r.autreDetail && (
            <div className="col-span-2">
              <Field label="Détails supplémentaires" value={r.autreDetail} />
            </div>
          )}
        </div>
      </Section>

      <Section title="Planning">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Début" value={creneau(r.dateDebut, r.heureDebut)} />
          <Field label="Fin" value={creneau(r.dateFin, r.heureFin)} />
        </div>
      </Section>

      <Section title="Suivi">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Notes internes" value={r.notes || '—'} />
          <Field label="Créée le" value={formatDate(r.dateCreation)} />
        </div>
      </Section>
    </div>
  )
}
