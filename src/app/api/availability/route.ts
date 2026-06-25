import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { combineDateTime } from '@/lib/planning'

export const dynamic = 'force-dynamic'

// GET /api/availability?espace=...&from=YYYY-MM-DD&to=YYYY-MM-DD
// Créneaux occupés (réservations non refusées), blocages et horaires d'ouverture
// pour un espace, sur une période (par défaut : aujourd'hui → +7 jours).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const espace = searchParams.get('espace')?.trim()

  if (!espace) {
    return NextResponse.json(
      { success: false, error: "Le paramètre 'espace' est requis" },
      { status: 400 },
    )
  }

  const fromStr = searchParams.get('from')
  const toStr = searchParams.get('to')
  const from = combineDateTime(fromStr, '00:00') ?? new Date()
  from.setHours(0, 0, 0, 0)
  const to = combineDateTime(toStr, '23:59') ?? new Date(from.getTime() + 7 * 86400000)

  try {
    const [reservations, blackouts, openingHours] = await Promise.all([
      prisma.reservation.findMany({
        where: {
          statut: { not: 'Refusée' },
          espacesChoisis: { has: espace },
          debutAt: { gte: from, lte: to },
        },
        select: { id: true, debutAt: true, finAt: true, statut: true, objetProjet: true },
        orderBy: { debutAt: 'asc' },
      }),
      prisma.blackout.findMany({
        where: {
          OR: [{ espace: null }, { espace }],
          debutAt: { lt: to },
          finAt: { gt: from },
        },
        orderBy: { debutAt: 'asc' },
      }),
      prisma.openingHours.findMany({
        where: { espace },
        orderBy: { jour: 'asc' },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: { reservations, blackouts, openingHours },
    })
  } catch (error) {
    console.error('GET /api/availability', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des disponibilités' },
      { status: 500 },
    )
  }
}
