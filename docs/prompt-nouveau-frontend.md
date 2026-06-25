# Prompt — Nouveau front-end IMA Studio

> À copier-coller dans Claude (claude.ai ou Claude Code). Le **backend, la base de
> données et toutes les routes API existent déjà et ne doivent PAS changer** : ce
> prompt ne concerne que la couche d'interface (pages + composants).

---

## Rôle

Tu es un designer-développeur front-end senior. Conçois et implémente une interface
**moderne, élégante et accessible** pour « IMA Studio », sans modifier le backend.

## Contexte produit

IMA Studio est le studio multimédia de **Sème City** (Cotonou, Bénin). L'application
web gère **les inscriptions des usagers** et **les réservations** de matériel et
d'espaces (photo, vidéo, podcast…). Trois publics : usagers qui s'inscrivent, usagers
qui réservent, et administrateurs qui pilotent.

## Contraintes techniques (impératives)

- **Next.js 14 (App Router uniquement)**, **TypeScript strict** (jamais `any`).
- **Tailwind CSS** uniquement (pas de styles inline, pas d'autre lib CSS).
- Composants interactifs : `'use client'` en première ligne. Composants serveur sinon.
- Interface **100 % en français**.
- Alias d'import `@/` pour `src/`.
- Ne réécris **pas** : Prisma, les routes `src/app/api/**`, `src/lib/*`. Tu peux
  refondre librement : `src/app/(pages)`, `src/components/**`, `globals.css`, layout.

## Direction artistique

Le design actuel ne convient pas : propose **une identité visuelle fraîche et
soignée**. Tu as toute latitude, en respectant :

- Couleurs de marque : **violet `#4527A0`** (primaire), **ambre `#FFB300`** (accent).
  Tu peux introduire une palette neutre + nuances dérivées, dégradés, etc.
- **Mobile-first**, responsive, transitions douces, états de chargement/vides/erreur
  soignés, accessibilité (contrastes, focus visibles, labels).
- Ton : professionnel, créatif, « studio multimédia africain moderne ».
- Police système ou Google Font légère.

## Données de référence

- **Format identifiant usager** : `IMA-ANNÉE-XXXX` (ex. `IMA-2026-0001`).
- **Statuts de réservation** : `En attente`, `Confirmée`, `Refusée`.
- **Les listes d'options (matériels, espaces, domaines, liens, niveaux) sont
  DYNAMIQUES** : récupère-les via `GET /api/catalog` (voir contrat). **Ne jamais
  coder ces listes en dur** dans les composants.

---

## Contrat d'API (à consommer tel quel)

Toutes les réponses sont en JSON. Forme générale succès : `{ success: true, ... }` ;
erreur : `{ success: false, error: string }`.

### Public

**`GET /api/catalog`** → options actives groupées
```json
{ "success": true, "data": {
  "materiel": ["Caméra vidéo", "..."],
  "espace":   ["Studio photo", "..."],
  "domaine":  ["Photographie", "..."],
  "lien":     ["Epitech", "..."],
  "niveau":   ["Débutant", "Intermédiaire", "Avancé"]
}}
```

**`POST /api/users`** → créer un usager
```jsonc
// body
{
  "nom": "string", "prenom": "string", "email": "string", "telephone": "string",
  "lien": "string (∈ catalog.lien)", "programme": "string?",
  "domainesInteret": ["string (∈ catalog.domaine)"],  // au moins 1
  "niveauExperience": "string (∈ catalog.niveau)",
  "objectifUtilisation": "string", "descriptionProjet": "string?"
}
// 201 → { success: true, user: { id: "IMA-2026-0001", ... } }
// 400 → validation ; 409 → { success:false, error, userId } (email déjà inscrit)
```

**`GET /api/users/[id]`** → vérifier un identifiant
```json
// 200 → { "success": true, "user": {
//   "id","nom","prenom","email","telephone","lien",
//   "domainesInteret","niveauExperience","dateInscription" } }
// 404 → { success:false, error:"Usager introuvable" }
```

**`POST /api/reservations`** → créer une réservation
```jsonc
// body
{
  "userId": "IMA-2026-0001", "nom": "string", "whatsapp": "string",
  "typeRes": "string",                          // ex. "Matériel" | "Espace" | "Les deux"
  "materielsChoisis": ["string (∈ catalog.materiel)"],
  "espacesChoisis":   ["string (∈ catalog.espace)"],
  "autreDetail": "string?",
  "dateDebut": "YYYY-MM-DD?", "dateFin": "YYYY-MM-DD?",
  "heureDebut": "HH:mm?", "heureFin": "HH:mm?",
  "objetProjet": "string", "nbPersonnes": 1
}
// 201 → { success: true, reservation: { id, statut: "En attente", ... } }
// 404 → usager introuvable ; 400 → validation/hors catalogue
```

**`PATCH /api/reservations/[id]`** → `{ "statut"?: "Confirmée", "notes"?: "string" }`
→ `{ success:true, reservation }`

### Admin

- **`GET /api/admin/stats`** → `{ success, data: { totalUsers, totalReservations, enAttente, confirmees, refusees } }`
- **`GET /api/admin/users?search=&page=1&limit=20`** → `{ success, data: { items: User[], total, page } }`
- **`GET /api/admin/reservations?search=&statut=&page=1&limit=20`** → `{ success, data: { items: Reservation[], total, page } }` (chaque item inclut `user: { nom, prenom, email }`)
- **`GET /api/admin/export/users`** et **`/api/admin/export/reservations`** → téléchargement CSV (ouvrir dans un nouvel onglet)
- **`GET /api/admin/catalog`** → `{ success, data: CatalogItem[] }` avec `CatalogItem = { id, categorie, valeur, ordre, actif }`
- **`POST /api/admin/catalog`** → `{ categorie, valeur }` → `201 { success, item }` (409 si doublon)
- **`PATCH /api/admin/catalog/[id]`** → `{ valeur?, actif?, ordre? }` → `{ success, item }`
- **`DELETE /api/admin/catalog/[id]`** → `{ success: true }`

### Planning & disponibilité

- **`GET /api/availability?espace=...&from=YYYY-MM-DD&to=YYYY-MM-DD`** (public) →
  `{ success, data: { reservations:[{id,debutAt,finAt,statut,objetProjet}], blackouts:[{id,espace,debutAt,finAt,motif}], openingHours:[{id,espace,jour,ouverture,fermeture}] } }`
- **`GET /api/admin/opening-hours`** → `{ success, data: OpeningHours[] }` (`jour`: 0=dimanche…6=samedi, `ouverture`/`fermeture` au format "HH:mm")
- **`POST /api/admin/opening-hours`** → `{ espace, jour, ouverture, fermeture }` (upsert par espace+jour) → `201`
- **`DELETE /api/admin/opening-hours/[id]`** → `{ success: true }`
- **`GET /api/admin/blackouts`** → `{ success, data: Blackout[] }`
- **`POST /api/admin/blackouts`** → `{ espace?: string|null, debutAt: ISO, finAt: ISO, motif?: string }` (espace null = tous) → `201`
- **`DELETE /api/admin/blackouts/[id]`** → `{ success: true }`

> **Règles imposées par le backend (à respecter dans l'UI)** :
> - Si au moins un **espace** est choisi, `dateDebut` + `heureDebut` + `heureFin` sont
>   **obligatoires** (sinon `400`).
> - À la création, le backend refuse (`409`) un espace déjà réservé sur un créneau qui
>   se chevauche (toute réservation non « Refusée » bloque — premier arrivé, premier
>   servi), hors horaires d'ouverture, ou pendant un blocage. **Affiche clairement ce
>   message de conflit** (`data.error`) et, idéalement, propose les créneaux libres en
>   t'appuyant sur `GET /api/availability`.

---

## Pages à produire

1. **`/` — Accueil** : présentation, 2 actions principales (S'inscrire, Réserver),
   accès discret à l'administration.

2. **`/inscription` — Inscription (formulaire multi-étapes)** :
   - Étapes : Identité (nom, prénoms, email, téléphone) → Affiliation (lien Sème City
     + programme optionnel) → Domaines & niveau → Objectif + description + récapitulatif.
   - Options `lien`, `domaine`, `niveau` chargées depuis `GET /api/catalog`.
   - Validation par étape, messages d'erreur clairs sous les champs.
   - Soumission `POST /api/users` → **écran de succès affichant l'identifiant**
     (copiable) + accès direct à la réservation. Gérer le cas 409 (déjà inscrit :
     afficher l'`userId` renvoyé).

3. **`/reservation` — Réservation (multi-étapes)** :
   - Étape 1 : saisir l'identifiant usager, **vérifier via `GET /api/users/[id]`**,
     afficher un état « vérifié », pré-remplir nom + WhatsApp (depuis `telephone`).
     Lien vers `/inscription` si introuvable. Lire un éventuel `?id=` dans l'URL pour
     pré-remplir/vérifier automatiquement.
   - Étape 2 : type (Matériel / Espace / Les deux) → cases à cocher `materiel`/`espace`
     selon le type (options depuis `GET /api/catalog`).
   - Étape 3 : planning (dates/heures, nombre de personnes, objet du projet).
     **Si un espace est choisi : `dateDebut`, `heureDebut` et `heureFin` obligatoires.**
     Idéalement, afficher les créneaux déjà occupés via `GET /api/availability` pour
     guider l'usager.
   - Étape 4 : récapitulatif → `POST /api/reservations` → écran de succès avec référence.
     Gérer le `409` (conflit/horaires/blocage) en affichant `data.error`.

4. **`/admin` — Tableau de bord** :
   - Cartes d'indicateurs (`GET /api/admin/stats`).
   - Onglet **Usagers** : tableau paginé + recherche, export CSV.
   - Onglet **Réservations** : tableau paginé + recherche + filtre statut, **changement
     de statut en ligne** (`PATCH`), export CSV. Badges colorés par statut.
   - Onglet **Catalogue** (gestion dynamique) : pour chaque catégorie (matériel,
     espace, domaine, lien, niveau), lister les éléments, **ajouter**, **renommer**,
     **activer/désactiver**, **supprimer** (`/api/admin/catalog`). C'est ce qui rend
     les formulaires non statiques.
   - Onglet **Planning** : gérer les **horaires d'ouverture** par espace et jour
     (`/api/admin/opening-hours`), poser/lever des **blocages** ponctuels
     (`/api/admin/blackouts`), et afficher une **vue calendrier** (jour/semaine) des
     créneaux occupés/libres par espace via `GET /api/availability`.
   - États vide / chargement / erreur (avec « Réessayer ») soignés.

5. **États globaux** : `loading.tsx`, `error.tsx`, `not-found.tsx` cohérents avec le design.

## Livrable

Code complet, compilable (`tsc` strict + `next build` sans erreur ni warning ESLint),
prêt à remplacer le dossier front existant. Explique brièvement l'organisation des
composants. Ne touche ni au backend ni à la base.
```

---

### Variante « maquette visuelle rapide » (claude.ai Artifacts)

Si tu veux d'abord explorer un design **avant** de coder : reprends le « Contexte
produit » + « Direction artistique » ci-dessus et demande une **maquette HTML/Tailwind
autonome** (une seule page montrant accueil + une étape de formulaire + le dashboard),
avec données fictives en dur, pour valider l'esthétique. Une fois le style validé,
utilise le prompt complet pour l'implémentation Next.js réelle.
