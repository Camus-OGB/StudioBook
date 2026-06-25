import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/admin/users/[id] → fiche usager complète + ses réservations
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        reservations: {
          orderBy: { dateCreation: 'desc' },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usager introuvable' },
        { status: 404 },
      )
    }

    const { reservations, ...profil } = user
    return NextResponse.json({
      success: true,
      data: { user: profil, reservations },
    })
  } catch (error) {
    console.error('GET /api/admin/users/[id]', error)
    return NextResponse.json(
      { success: false, error: "Erreur lors du chargement de la fiche usager" },
      { status: 500 },
    )
  }
}
