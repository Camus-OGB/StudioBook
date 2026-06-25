# IMA Studio – Sème City

## Projet
Application web de gestion des inscriptions et réservations pour l'IMA Studio
(studio multimédia de Sème City, Cotonou, Bénin).

## Stack technique
- Next.js 14 App Router (jamais Pages Router)
- TypeScript strict
- Tailwind CSS (jamais de styles inline)
- Prisma ORM + PostgreSQL
- Docker + Docker Compose

## Conventions de code
- Composants interactifs : toujours 'use client' en première ligne
- Composants serveur : pas de directive, fetch direct en async/await
- Nommage fichiers : PascalCase pour composants, camelCase pour lib
- Imports : @/ pour src/, chemins relatifs interdits entre modules
- Types : tout dans src/types/index.ts, jamais de `any`
- API : route handlers dans src/app/api/, réponse toujours NextResponse.json()
- Validation : Zod côté serveur sur toutes les routes POST/PATCH

## Langue & Design
- Interface 100% en français
- Couleur principale : #4527A0 (violet)
- Accent : #FFB300 (ambre)
- Tailwind config : étendre les couleurs avec ima-primary et ima-accent

## Structure API
POST   /api/users              → créer usager
GET    /api/users/[id]         → vérifier ID
POST   /api/reservations       → créer réservation
PATCH  /api/reservations/[id]  → modifier statut
GET    /api/admin/stats        → indicateurs
GET    /api/admin/users        → liste paginée + recherche
GET    /api/admin/reservations → liste paginée + recherche + filtre statut
GET    /api/admin/export/users → CSV usagers
GET    /api/admin/export/reservations → CSV réservations

## Format ID usager
IMA-ANNÉE-XXXX (ex : IMA-2025-0001)
Généré via transaction Prisma sur la table IdCounter.

## Règles Prisma
- Singleton dans src/lib/prisma.ts
- Jamais new PrismaClient() hors de ce fichier
- Toujours gérer les erreurs Prisma avec try/catch
