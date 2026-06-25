import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  valeur: z.string().trim().min(1).optional(),
  actif: z.boolean().optional(),
  ordre: z.number().int().min(0).optional(),
})

// PATCH /api/admin/catalog/[id] → renommer, (dés)activer ou réordonner
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

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json(
      { success: false, error: 'Aucun champ à mettre à jour' },
      { status: 400 },
    )
  }

  try {
    const item = await prisma.catalogItem.update({
      where: { id: params.id },
      data: parsed.data,
    })
    return NextResponse.json({ success: true, item })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Élément introuvable' },
          { status: 404 },
        )
      }
      if (error.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: 'Une valeur identique existe déjà dans cette catégorie' },
          { status: 409 },
        )
      }
    }
    console.error('PATCH /api/admin/catalog/[id]', error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour de l'élément" },
      { status: 500 },
    )
  }
}

// DELETE /api/admin/catalog/[id] → supprimer un élément
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.catalogItem.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        { success: false, error: 'Élément introuvable' },
        { status: 404 },
      )
    }
    console.error('DELETE /api/admin/catalog/[id]', error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression de l'élément" },
      { status: 500 },
    )
  }
}
