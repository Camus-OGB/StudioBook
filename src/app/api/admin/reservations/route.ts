import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// GET /api/admin/reservations → liste paginée + recherche + filtre statut
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')?.trim() ?? ''
  const statut = searchParams.get('statut')?.trim() ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.max(1, Number(searchParams.get('limit')) || 20)

  const conditions: Prisma.ReservationWhereInput[] = []
  if (search) {
    conditions.push({
      OR: [
        { nom: { contains: search, mode: 'insensitive' } },
        { whatsapp: { contains: search, mode: 'insensitive' } },
        { objetProjet: { contains: search, mode: 'insensitive' } },
        { userId: { contains: search, mode: 'insensitive' } },
      ],
    })
  }
  if (statut) {
    conditions.push({ statut })
  }

  const where: Prisma.ReservationWhereInput =
    conditions.length > 0 ? { AND: conditions } : {}

  try {
    const [items, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: {
          user: {
            select: { nom: true, prenom: true, email: true, telephone: true },
          },
        },
        orderBy: { dateCreation: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reservation.count({ where }),
    ])

    return NextResponse.json({ success: true, data: { items, total, page } })
  } catch (error) {
    console.error('GET /api/admin/reservations', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des réservations' },
      { status: 500 },
    )
  }
}
