import { prisma } from '@/lib/prisma'
import { CATALOG_CATEGORIES } from '@/lib/constants'
import type { CatalogCategory, GroupedCatalog } from '@/types'

/**
 * Retourne les valeurs actives d'une catégorie sous forme de Set,
 * pour vérifier l'appartenance lors de la validation serveur.
 */
export async function getActiveValues(
  categorie: CatalogCategory,
): Promise<Set<string>> {
  const items = await prisma.catalogItem.findMany({
    where: { categorie, actif: true },
    select: { valeur: true },
  })
  return new Set(items.map((i) => i.valeur))
}

/** Retourne les valeurs d'une liste absentes du catalogue actif (= invalides). */
export async function invalidValues(
  categorie: CatalogCategory,
  values: string[],
): Promise<string[]> {
  const set = await getActiveValues(categorie)
  return values.filter((v) => !set.has(v))
}

/**
 * Catalogue groupé par catégorie. Par défaut, uniquement les éléments actifs
 * (pour les formulaires) ; includeInactive=true pour l'administration.
 */
export async function getGroupedCatalog(
  includeInactive = false,
): Promise<GroupedCatalog> {
  const items = await prisma.catalogItem.findMany({
    where: includeInactive ? {} : { actif: true },
    orderBy: [{ categorie: 'asc' }, { ordre: 'asc' }],
    select: { valeur: true, categorie: true },
  })

  const grouped = Object.fromEntries(
    CATALOG_CATEGORIES.map((c) => [c, [] as string[]]),
  ) as GroupedCatalog

  for (const item of items) {
    const categorie = item.categorie as CatalogCategory
    if (grouped[categorie]) grouped[categorie].push(item.valeur)
  }

  return grouped
}
