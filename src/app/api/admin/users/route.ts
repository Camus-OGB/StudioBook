import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// GET /api/admin/users → liste paginée + recherche
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')?.trim() ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.max(1, Number(searchParams.get('limit')) || 20)

  const where: Prisma.UserWhereInput = search
    ? {
        OR: [
          { nom: { contains: search, mode: 'insensitive' } },
          { prenom: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { id: { contains: search, mode: 'insensitive' } },
          { lien: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {}

  try {
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { dateInscription: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({ success: true, data: { items, total, page } })
  } catch (error) {
    console.error('GET /api/admin/users', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des usagers' },
      { status: 500 },
    )
  }
}
