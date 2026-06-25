import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mkCSV, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// GET /api/admin/export/users → export CSV de tous les usagers
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { dateInscription: 'desc' },
    })

    const rows = users.map((u) => ({
      id: u.id,
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      telephone: u.telephone,
      lien: u.lien,
      programme: u.programme ?? '',
      domainesInteret: u.domainesInteret.join(' | '),
      niveauExperience: u.niveauExperience,
      objectifUtilisation: u.objectifUtilisation,
      descriptionProjet: u.descriptionProjet ?? '',
      dateInscription: formatDate(u.dateInscription),
      updatedAt: formatDate(u.updatedAt),
    }))

    const csv = mkCSV(rows, [
      { key: 'id', label: 'Identifiant' },
      { key: 'nom', label: 'Nom' },
      { key: 'prenom', label: 'Prénom' },
      { key: 'email', label: 'Email' },
      { key: 'telephone', label: 'Téléphone' },
      { key: 'lien', label: 'Lien Sème City' },
      { key: 'programme', label: 'Programme' },
      { key: 'domainesInteret', label: "Domaines d'intérêt" },
      { key: 'niveauExperience', label: "Niveau d'expérience" },
      { key: 'objectifUtilisation', label: "Objectif d'utilisation" },
      { key: 'descriptionProjet', label: 'Description du projet' },
      { key: 'dateInscription', label: "Date d'inscription" },
      { key: 'updatedAt', label: 'Dernière mise à jour' },
    ])

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="ima_usagers.csv"',
      },
    })
  } catch (error) {
    console.error('GET /api/admin/export/users', error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'export des usagers" },
      { status: 500 },
    )
  }
}
