import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { CATALOG_CATEGORIES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

const createSchema = z.object({
  categorie: z.enum(CATALOG_CATEGORIES),
  valeur: z.string().trim().min(1, 'La valeur est requise'),
})

// GET /api/admin/catalog → tous les éléments (actifs et inactifs)
export async function GET() {
  try {
    const items = await prisma.catalogItem.findMany({
      orderBy: [{ categorie: 'asc' }, { ordre: 'asc' }],
    })
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('GET /api/admin/catalog', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement du catalogue' },
      { status: 500 },
    )
  }
}

// POST /api/admin/catalog → ajouter un élément (ordre = dernier + 1)
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Corps de requête JSON invalide' },
      { status: 400 },
    )
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' },
      { status: 400 },
    )
  }

  try {
    const dernier = await prisma.catalogItem.findFirst({
      where: { categorie: parsed.data.categorie },
      orderBy: { ordre: 'desc' },
      select: { ordre: true },
    })

    const item = await prisma.catalogItem.create({
      data: {
        categorie: parsed.data.categorie,
        valeur: parsed.data.valeur,
        ordre: (dernier?.ordre ?? -1) + 1,
      },
    })

    return NextResponse.json({ success: true, item }, { status: 201 })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { success: false, error: 'Cet élément existe déjà dans cette catégorie' },
        { status: 409 },
      )
    }
    console.error('POST /api/admin/catalog', error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'ajout de l'élément" },
      { status: 500 },
    )
  }
}
