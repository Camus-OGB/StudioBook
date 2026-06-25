import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { statutSchema } from '@/lib/validations'

const patchSchema = z.object({
  statut: statutSchema.optional(),
  notes: z.string().optional(),
})

// PATCH /api/reservations/[id] → modifier le statut et/ou les notes
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Corps de requête JSON invalide' },
      { status: 400 },
    )
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' },
      { status: 400 },
    )
  }

  if (parsed.data.statut === undefined && parsed.data.notes === undefined) {
    return NextResponse.json(
      { success: false, error: 'Aucun champ à mettre à jour' },
      { status: 400 },
    )
  }

  try {
    const reservation = await prisma.reservation.update({
      where: { id: params.id },
      data: parsed.data,
    })

    return NextResponse.json({ success: true, reservation })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        { success: false, error: 'Réservation introuvable' },
        { status: 404 },
      )
    }
    console.error('PATCH /api/reservations/[id]', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la réservation' },
      { status: 500 },
    )
  }
}
