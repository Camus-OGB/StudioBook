import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, clientIp, tooMany } from '@/lib/rateLimit'

// GET /api/users/[id]?nom=... → vérifier un identifiant usager.
// Le nom est exigé (et doit correspondre) pour empêcher l'énumération des
// usagers via des identifiants séquentiels devinables (fuite de données).
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  // Anti-énumération / anti-moissonnage : 20 vérifications / 10 min par IP
  const limite = rateLimit(`verify:${clientIp(request)}`, 20, 10 * 60 * 1000)
  if (!limite.ok) return tooMany(limite.retryAfter)

  const introuvable = NextResponse.json(
    { success: false, error: 'Identifiant ou nom incorrect' },
    { status: 404 },
  )

  const { searchParams } = new URL(request.url)
  const nom = searchParams.get('nom')?.trim()
  if (!nom) return introuvable

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

    // Réponse identique si l'usager n'existe pas OU si le nom ne correspond pas,
    // pour ne révéler aucune information par énumération.
    if (!user || user.nom.trim().toLowerCase() !== nom.toLowerCase()) {
      return introuvable
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
