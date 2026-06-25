// Valeurs métier de référence pour les formulaires et la validation.

export const LIENS_SEME_CITY = [
  'Epitech',
  'ADS',
  'Entrepreneur',
  'SCOP',
  'Externe',
  'Personnel ADSC',
] as const

export const DOMAINES = [
  'Photographie',
  'Vidéo/Cinéma',
  'Podcast/Audio',
  'Design graphique',
  'Animation/Motion design',
  'Journalisme/Reportage',
  'Autre',
] as const

export const NIVEAUX = ['Débutant', 'Intermédiaire', 'Avancé'] as const

export const MATERIELS = [
  'Caméra vidéo',
  'Appareil photo reflex/hybride',
  'Drone',
  'Microphone directionnel',
  'Microphone-cravate',
  'Enregistreur audio',
  "Kit d'éclairage LED",
  'Trépied/Stabilisateur',
  'Fond de studio',
  'Vidéoprojecteur',
  'Moniteur de référence',
  'Autre',
] as const

export const ESPACES = [
  'Studio photo',
  'Studio vidéo',
  'Cabine podcast',
  'Salle de montage',
  'Espace diffusion live',
  'Salle créative',
] as const

export const STATUTS = ['En attente', 'Confirmée', 'Refusée'] as const

// Catégories du catalogue dynamique (table catalog_items).
// Les constantes ci-dessus servent de valeurs initiales (seed) ; à l'exécution,
// les options sont lues depuis la base via /api/catalog.
export const CATALOG_CATEGORIES = [
  'materiel',
  'espace',
  'domaine',
  'lien',
  'niveau',
] as const
