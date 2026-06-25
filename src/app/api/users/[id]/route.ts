import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users/[id] → vérifier un identifiant usager (champs non sensibles)
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        lien: true,
        domainesInteret: true,
        niveauExperience: true,
        dateInscription: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usager introuvable' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('GET /api/users/[id]', error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la vérification de l'usager" },
      { status: 500 },
    )
  }
}
