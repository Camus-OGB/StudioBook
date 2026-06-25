import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mkCSV, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// GET /api/admin/export/reservations → export CSV de toutes les réservations
export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { dateCreation: 'desc' },
    })

    const rows = reservations.map((r) => ({
      id: r.id,
      userId: r.userId,
      nom: r.nom,
      whatsapp: r.whatsapp,
      typeRes: r.typeRes,
      materielsChoisis: r.materielsChoisis.join(' | '),
      espacesChoisis: r.espacesChoisis.join(' | '),
      autreDetail: r.autreDetail ?? '',
      dateDebut: r.dateDebut ?? '',
      dateFin: r.dateFin ?? '',
      heureDebut: r.heureDebut ?? '',
      heureFin: r.heureFin ?? '',
      objetProjet: r.objetProjet,
      nbPersonnes: r.nbPersonnes,
      statut: r.statut,
      notes: r.notes ?? '',
      dateCreation: formatDate(r.dateCreation),
      updatedAt: formatDate(r.updatedAt),
    }))

    const csv = mkCSV(rows, [
      { key: 'id', label: 'Identifiant' },
      { key: 'userId', label: 'Identifiant usager' },
      { key: 'nom', label: 'Nom' },
      { key: 'whatsapp', label: 'WhatsApp' },
      { key: 'typeRes', label: 'Type de réservation' },
      { key: 'materielsChoisis', label: 'Matériels choisis' },
      { key: 'espacesChoisis', label: 'Espaces choisis' },
      { key: 'autreDetail', label: 'Autre détail' },
      { key: 'dateDebut', label: 'Date de début' },
      { key: 'dateFin', label: 'Date de fin' },
      { key: 'heureDebut', label: 'Heure de début' },
      { key: 'heureFin', label: 'Heure de fin' },
      { key: 'objetProjet', label: 'Objet du projet' },
      { key: 'nbPersonnes', label: 'Nombre de personnes' },
      { key: 'statut', label: 'Statut' },
      { key: 'notes', label: 'Notes' },
      { key: 'dateCreation', label: 'Date de création' },
      { key: 'updatedAt', label: 'Dernière mise à jour' },
    ])

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="ima_reservations.csv"',
      },
    })
  } catch (error) {
    console.error('GET /api/admin/export/reservations', error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'export des réservations" },
      { status: 500 },
    )
  }
}
