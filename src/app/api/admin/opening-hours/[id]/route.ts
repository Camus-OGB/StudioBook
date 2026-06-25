import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// DELETE /api/admin/opening-hours/[id] → supprimer un horaire
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.openingHours.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        { success: false, error: 'Horaire introuvable' },
        { status: 404 },
      )
    }
    console.error('DELETE /api/admin/opening-hours/[id]', error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression de l'horaire" },
      { status: 500 },
    )
  }
}
