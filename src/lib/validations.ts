import { z } from 'zod'
import { STATUTS } from '@/lib/constants'

// Schémas de validation serveur (Zod) appliqués sur toutes les routes POST/PATCH.
// Les champs adossés au catalogue dynamique (lien, domaines, niveau, matériels,
// espaces) sont validés en `z.string()` ici ; leur appartenance au catalogue
// actif est vérifiée dans les routes via src/lib/catalog.ts (invalidValues).

export const userSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  prenom: z.string().min(1, 'Le prénom est requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(1, 'Le téléphone est requis'),
  lien: z.string().min(1, 'Le lien avec Sème City est requis'),
  programme: z.string().optional(),
  domainesInteret: z.array(z.string()).min(1, 'Sélectionnez au moins un domaine'),
  niveauExperience: z.string().min(1, "Le niveau d'expérience est requis"),
  objectifUtilisation: z.string().min(1, "L'objectif d'utilisation est requis"),
  descriptionProjet: z.string().optional(),
})

export const reservationSchema = z.object({
  userId: z.string().min(1, "L'identifiant usager est requis"),
  nom: z.string().min(1, 'Le nom est requis'),
  whatsapp: z.string().min(1, 'Le numéro WhatsApp est requis'),
  typeRes: z.string().min(1, 'Le type de réservation est requis'),
  materielsChoisis: z.array(z.string()).default([]),
  espacesChoisis: z.array(z.string()).default([]),
  autreDetail: z.string().optional(),
  dateDebut: z.string().optional(),
  dateFin: z.string().optional(),
  heureDebut: z.string().optional(),
  heureFin: z.string().optional(),
  objetProjet: z.string().min(1, "L'objet du projet est requis"),
  nbPersonnes: z.number().int().positive().default(1),
  notes: z.string().optional(),
})

export const statutSchema = z.enum(STATUTS)

export type UserInput = z.infer<typeof userSchema>
export type ReservationInput = z.infer<typeof reservationSchema>
export type StatutInput = z.infer<typeof statutSchema>
