import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const createSchema = z
  .object({
    espace: z.string().trim().min(1).nullable().optional(),
    debutAt: z.string().datetime({ message: 'Date/heure de début invalide (ISO)' }),
    finAt: z.string().datetime({ message: 'Date/heure de fin invalide (ISO)' }),
    motif: z.string().trim().optional(),
  })
  .refine((d) => new Date(d.finAt) > new Date(d.debutAt), {
    message: 'La fin doit suivre le début',
  })

// GET /api/admin/blackouts → tous les blocages (à venir d'abord)
export async function GET() {
  try {
    const items = await prisma.blackout.findMany({ orderBy: { debutAt: 'asc' } })
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('GET /api/admin/blackouts', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des blocages' },
      { status: 500 },
    )
  }
}

// POST /api/admin/blackouts → bloquer un créneau (espace précis ou tous)
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
    const item = await prisma.blackout.create({
      data: {
        espace: parsed.data.espace ?? null,
        debutAt: new Date(parsed.data.debutAt),
        finAt: new Date(parsed.data.finAt),
        motif: parsed.data.motif,
      },
    })
    return NextResponse.json({ success: true, item }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/blackouts', error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création du blocage" },
      { status: 500 },
    )
  }
}
