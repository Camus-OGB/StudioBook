import { prisma } from '@/lib/prisma'

/** Combine une date "YYYY-MM-DD" et une heure "HH:mm" en Date (heure locale). */
export function combineDateTime(
  date?: string | null,
  heure?: string | null,
): Date | null {
  if (!date || !heure) return null
  const d = new Date(`${date}T${heure}:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes(),
  ).padStart(2, '0')}`
}

interface AvailabilityParams {
  espaces: string[]
  debutAt: Date
  finAt: Date
  excludeReservationId?: string
}

/**
 * Vérifie qu'un créneau est libre pour les espaces demandés :
 * 1) pas de chevauchement avec une autre réservation (statut ≠ Refusée),
 * 2) dans les horaires d'ouverture de l'espace (s'ils sont définis),
 * 3) hors de tout blocage (blackout) couvrant l'espace.
 * Retourne la liste des problèmes détectés (vide = créneau disponible).
 */
export async function checkEspaceAvailability({
  espaces,
  debutAt,
  finAt,
  excludeReservationId,
}: AvailabilityParams): Promise<string[]> {
  if (espaces.length === 0) return []

  const erreurs: string[] = []

  // 1) Conflits avec d'autres réservations (« dès la demande » : tout sauf Refusée)
  const conflits = await prisma.reservation.findMany({
    where: {
      id: excludeReservationId ? { not: excludeReservationId } : undefined,
      statut: { not: 'Refusée' },
      espacesChoisis: { hasSome: espaces },
      debutAt: { lt: finAt },
      finAt: { gt: debutAt },
    },
    select: { espacesChoisis: true, debutAt: true, finAt: true },
  })
  for (const c of conflits) {
    const communs = c.espacesChoisis.filter((e) => espaces.includes(e))
    erreurs.push(
      `Créneau déjà réservé pour : ${communs.join(', ')} (${
        c.debutAt ? hhmm(c.debutAt) : '?'
      }–${c.finAt ? hhmm(c.finAt) : '?'})`,
    )
  }

  // 2) Horaires d'ouverture du studio (globaux, par jour de la semaine).
  //    Un jour sans horaire enregistré = studio FERMÉ ce jour-là.
  const jour = debutAt.getDay()
  const horaire = await prisma.openingHours.findUnique({ where: { jour } })
  if (!horaire) {
    erreurs.push('Le studio est fermé ce jour-là')
  } else {
    const debutH = hhmm(debutAt)
    const finH = hhmm(finAt)
    if (debutH < horaire.ouverture || finH > horaire.fermeture) {
      erreurs.push(
        `Le studio est ouvert de ${horaire.ouverture} à ${horaire.fermeture} ce jour-là`,
      )
    }
  }

  // 3) Blocages (espace ciblé ou tous les espaces)
  const blackouts = await prisma.blackout.findMany({
    where: {
      OR: [{ espace: null }, { espace: { in: espaces } }],
      debutAt: { lt: finAt },
      finAt: { gt: debutAt },
    },
    select: { espace: true, motif: true },
  })
  for (const b of blackouts) {
    const cible = b.espace ?? 'tous les espaces'
    erreurs.push(
      `Créneau bloqué (${cible})${b.motif ? ` : ${b.motif}` : ''}`,
    )
  }

  return erreurs
}
