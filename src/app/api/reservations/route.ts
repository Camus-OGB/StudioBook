import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reservationSchema } from '@/lib/validations'
import { invalidValues } from '@/lib/catalog'
import { combineDateTime, checkEspaceAvailability } from '@/lib/planning'
import { rateLimit, clientIp, tooMany } from '@/lib/rateLimit'
import { notifyReservationRecue } from '@/lib/notifications'

// POST /api/reservations → créer une réservation
export async function POST(request: NextRequest) {
  // Anti-spam : 15 réservations / heure par IP
  const limite = rateLimit(`reservation:${clientIp(request)}`, 15, 60 * 60 * 1000)
  if (!limite.ok) return tooMany(limite.retryAfter)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Corps de requête JSON invalide' },
      { status: 400 },
    )
  }

  const parsed = reservationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' },
      { status: 400 },
    )
  }

  // Vérifie que les matériels/espaces choisis sont au catalogue actif
  const [materielsKO, espacesKO] = await Promise.all([
    invalidValues('materiel', parsed.data.materielsChoisis),
    invalidValues('espace', parsed.data.espacesChoisis),
  ])
  const horsCatalogue = [...materielsKO, ...espacesKO]
  if (horsCatalogue.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: `Valeur(s) hors catalogue : ${horsCatalogue.join(', ')}`,
      },
      { status: 400 },
    )
  }

  // Planning : un espace impose un créneau borné (date + heures début/fin)
  const data = parsed.data
  let debutAt = combineDateTime(data.dateDebut, data.heureDebut)
  let finAt = combineDateTime(data.dateFin ?? data.dateDebut, data.heureFin)

  if (data.espacesChoisis.length > 0) {
    if (!debutAt || !finAt) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Pour réserver un espace, la date, l'heure de début et l'heure de fin sont requises",
        },
        { status: 400 },
      )
    }
    if (finAt <= debutAt) {
      return NextResponse.json(
        { success: false, error: "L'heure de fin doit suivre l'heure de début" },
        { status: 400 },
      )
    }

    const indispo = await checkEspaceAvailability({
      espaces: data.espacesChoisis,
      debutAt,
      finAt,
    })
    if (indispo.length > 0) {
      return NextResponse.json(
        { success: false, error: indispo.join(' · '), conflicts: indispo },
        { status: 409 },
      )
    }
  } else {
    // Pas d'espace : on ne calcule un créneau que si tout est fourni
    if (!debutAt || !finAt) {
      debutAt = null
      finAt = null
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true, email: true, prenom: true, nom: true },
    })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usager introuvable pour cette réservation' },
        { status: 404 },
      )
    }

    const reservation = await prisma.reservation.create({
      data: { ...data, debutAt, finAt },
    })

    // Accusé de réception « en attente » (non bloquant).
    await notifyReservationRecue({
      email: user.email,
      prenom: user.prenom,
      nom: user.nom,
      whatsapp: reservation.whatsapp,
      reservation,
    })

    return NextResponse.json({ success: true, reservation }, { status: 201 })
  } catch (error) {
    console.error('POST /api/reservations', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la réservation' },
      { status: 500 },
    )
  }
}
