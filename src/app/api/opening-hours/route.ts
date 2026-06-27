import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/opening-hours → horaires d'ouverture globaux du studio (public, lecture seule).
// Utilisé par le formulaire de réservation pour afficher/valider les créneaux.
export async function GET() {
  try {
    const items = await prisma.openingHours.findMany({ orderBy: { jour: 'asc' } })
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('GET /api/opening-hours', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des horaires' },
      { status: 500 },
    )
  }
}
