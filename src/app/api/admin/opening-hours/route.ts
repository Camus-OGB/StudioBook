import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const HEURE = /^([01]\d|2[0-3]):[0-5]\d$/

const upsertSchema = z
  .object({
    jour: z.number().int().min(0).max(6),
    ouverture: z.string().regex(HEURE, 'Heure invalide (HH:mm)'),
    fermeture: z.string().regex(HEURE, 'Heure invalide (HH:mm)'),
  })
  .refine((d) => d.ouverture < d.fermeture, {
    message: "L'ouverture doit précéder la fermeture",
  })

// GET /api/admin/opening-hours → tous les horaires (globaux, par jour)
export async function GET() {
  try {
    const items = await prisma.openingHours.findMany({
      orderBy: { jour: 'asc' },
    })
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('GET /api/admin/opening-hours', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des horaires' },
      { status: 500 },
    )
  }
}

// POST /api/admin/opening-hours → créer/mettre à jour un horaire (espace + jour)
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

  const parsed = upsertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' },
      { status: 400 },
    )
  }

  try {
    const { jour, ouverture, fermeture } = parsed.data
    const item = await prisma.openingHours.upsert({
      where: { jour },
      update: { ouverture, fermeture },
      create: { jour, ouverture, fermeture },
    })
    return NextResponse.json({ success: true, item }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/opening-hours', error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'enregistrement de l'horaire" },
      { status: 500 },
    )
  }
}
