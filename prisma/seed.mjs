import pkg from '@prisma/client'

const { PrismaClient } = pkg
const prisma = new PrismaClient()

// Valeurs initiales du catalogue (miroir de src/lib/constants.ts).
// Idempotent : ré-exécutable sans créer de doublons (upsert sur categorie+valeur).
const DATA = {
  lien: ['Epitech', 'ADS', 'Entrepreneur', 'SCOP', 'Externe', 'Personnel ADSC'],
  domaine: [
    'Photographie',
    'Vidéo/Cinéma',
    'Podcast/Audio',
    'Design graphique',
    'Animation/Motion design',
    'Journalisme/Reportage',
    'Autre',
  ],
  niveau: ['Débutant', 'Intermédiaire', 'Avancé'],
  materiel: [
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
  ],
  espace: [
    'Studio photo',
    'Studio vidéo',
    'Cabine podcast',
    'Salle de montage',
    'Espace diffusion live',
    'Salle créative',
  ],
}

async function main() {
  for (const [categorie, valeurs] of Object.entries(DATA)) {
    for (let ordre = 0; ordre < valeurs.length; ordre++) {
      const valeur = valeurs[ordre]
      await prisma.catalogItem.upsert({
        where: { categorie_valeur: { categorie, valeur } },
        update: { ordre },
        create: { categorie, valeur, ordre },
      })
    }
  }
  const total = await prisma.catalogItem.count()
  console.log(`Catalogue seedé : ${total} éléments.`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
