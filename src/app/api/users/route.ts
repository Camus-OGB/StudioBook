import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { userSchema } from '@/lib/validations'
import { genUserId } from '@/lib/utils'
import { invalidValues } from '@/lib/catalog'
import { rateLimit, clientIp, tooMany } from '@/lib/rateLimit'

// POST /api/users → créer un usager
export async function POST(request: NextRequest) {
  // Anti-spam : 10 inscriptions / heure par IP
  const limite = rateLimit(`signup:${clientIp(request)}`, 10, 60 * 60 * 1000)
  if (!limite.ok) return tooMany(limite.retryAfter)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Corps de requête JSON invalide' },
      { status: 400 },
    )
  }

  const parsed = userSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' },
      { status: 400 },
    )
  }

  // Vérifie que les valeurs adossées au catalogue sont actives
  const [liensKO, domainesKO, niveauxKO] = await Promise.all([
    invalidValues('lien', [parsed.data.lien]),
    invalidValues('domaine', parsed.data.domainesInteret),
    invalidValues('niveau', [parsed.data.niveauExperience]),
  ])
  const horsCatalogue = [...liensKO, ...domainesKO, ...niveauxKO]
  if (horsCatalogue.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: `Valeur(s) hors catalogue : ${horsCatalogue.join(', ')}`,
      },
      { status: 400 },
    )
  }

  try {
    const existant = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    })
    if (existant) {
      return NextResponse.json(
        {
          success: false,
          error: 'Un usager avec cet email existe déjà',
          userId: existant.id,
        },
        { status: 409 },
      )
    }

    const id = await genUserId()
    const user = await prisma.user.create({
      data: { id, ...parsed.data },
    })

    return NextResponse.json({ success: true, user }, { status: 201 })
  } catch (error) {
    console.error('POST /api/users', error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création de l'usager" },
      { status: 500 },
    )
  }
}
