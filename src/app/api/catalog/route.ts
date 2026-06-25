import { NextResponse } from 'next/server'
import { getGroupedCatalog } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

// GET /api/catalog → options actives groupées par catégorie (lecture publique).
export async function GET() {
  try {
    const data = await getGroupedCatalog(false)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET /api/catalog', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement du catalogue' },
      { status: 500 },
    )
  }
}
