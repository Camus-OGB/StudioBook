import { notFound } from 'next/navigation'
import {
  inscriptionEmail,
  reservationRecueEmail,
  statutChangeEmail,
  type ReservationResume,
} from '@/lib/notifications/templates'

// Prévisualisation des emails transactionnels — outil de DEV uniquement.
// Permet d'itérer sur le design sans envoyer de vrais messages.
// Bloqué en production.
export const dynamic = 'force-dynamic'

const exemple: ReservationResume = {
  id: 'cmqtt1c1p0001uphsqkfe70y7',
  typeRes: 'Les deux',
  materielsChoisis: ['Caméra vidéo', 'Microphone-cravate'],
  espacesChoisis: ['Studio photo'],
  dateDebut: '2026-07-03',
  heureDebut: '14:00',
  heureFin: '16:00',
  objetProjet: 'Shooting portrait pour un magazine',
  statut: 'Confirmée',
  notes: null,
}

export default function EmailPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  const emails = [
    { titre: 'Inscription', ...inscriptionEmail({ prenom: 'Camus', userId: 'IMA-2026-0003' }) },
    {
      titre: 'Réservation reçue',
      ...reservationRecueEmail({ prenom: 'Camus', reservation: { ...exemple, statut: 'En attente' } }),
    },
    {
      titre: 'Statut — Confirmée',
      ...statutChangeEmail({ prenom: 'Camus', reservation: { ...exemple, statut: 'Confirmée' } }),
    },
    {
      titre: 'Statut — Refusée',
      ...statutChangeEmail({
        prenom: 'Camus',
        reservation: {
          ...exemple,
          statut: 'Refusée',
          notes: 'Le créneau demandé n’est plus disponible. Merci de proposer une autre date.',
        },
      }),
    },
  ]

  return (
    <div className="mx-auto max-w-[680px] px-5 py-10">
      <h1 className="font-sora text-2xl font-extrabold text-ima-primary">
        Prévisualisation des emails
      </h1>
      <p className="mt-1 text-sm text-ima-muted">
        Aperçu local des messages transactionnels (DEV uniquement).
      </p>
      <div className="mt-8 space-y-10">
        {emails.map((e) => (
          <section key={e.titre}>
            <div className="mb-2">
              <span className="font-sora text-sm font-bold text-ima-ink">{e.titre}</span>
              <span className="ml-2 text-[13px] text-ima-faint">Objet : {e.subject}</span>
            </div>
            <iframe
              title={e.titre}
              srcDoc={e.html}
              className="h-[820px] w-full rounded-xl border border-ima-line bg-white"
            />
          </section>
        ))}
      </div>
    </div>
  )
}
