import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// DELETE /api/admin/blackouts/[id] → lever un blocage
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.blackout.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        { success: false, error: 'Blocage introuvable' },
        { status: 404 },
      )
    }
    console.error('DELETE /api/admin/blackouts/[id]', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du blocage' },
      { status: 500 },
    )
  }
}
