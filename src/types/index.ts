// Types de l'application IMA Studio – Sème City
// Source de vérité des types côté application (cf. CLAUDE.md).

export interface User {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  lien: string
  programme: string | null
  domainesInteret: string[]
  niveauExperience: string
  objectifUtilisation: string
  descriptionProjet: string | null
  dateInscription: Date
  updatedAt: Date
  reservations?: Reservation[]
}

export interface Reservation {
  id: string
  userId: string
  user?: User
  nom: string
  whatsapp: string
  typeRes: string
  materielsChoisis: string[]
  espacesChoisis: string[]
  autreDetail: string | null
  dateDebut: string | null
  dateFin: string | null
  heureDebut: string | null
  heureFin: string | null
  objetProjet: string
  nbPersonnes: number
  statut: string
  notes: string | null
  dateCreation: Date
  updatedAt: Date
}

export interface Stats {
  totalUsers: number
  totalReservations: number
  enAttente: number
  confirmees: number
  refusees: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
}

export type CatalogCategory =
  | 'materiel'
  | 'espace'
  | 'domaine'
  | 'lien'
  | 'niveau'

export interface CatalogItem {
  id: string
  categorie: string
  valeur: string
  ordre: number
  actif: boolean
}

// Options actives groupées par catégorie, telles que lues par les formulaires.
export type GroupedCatalog = Record<CatalogCategory, string[]>
