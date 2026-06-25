import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Stats } from '@/types'

export const dynamic = 'force-dynamic'

// GET /api/admin/stats → indicateurs du tableau de bord
export async function GET() {
  try {
    const [totalUsers, totalReservations, enAttente, confirmees, refusees] =
      await Promise.all([
        prisma.user.count(),
        prisma.reservation.count(),
        prisma.reservation.count({ where: { statut: 'En attente' } }),
        prisma.reservation.count({ where: { statut: 'Confirmée' } }),
        prisma.reservation.count({ where: { statut: 'Refusée' } }),
      ])

    const stats: Stats = {
      totalUsers,
      totalReservations,
      enAttente,
      confirmees,
      refusees,
    }

    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('GET /api/admin/stats', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des statistiques' },
      { status: 500 },
    )
  }
}
