-- CreateTable
CREATE TABLE "id_counter" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "id_counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "lien" TEXT NOT NULL,
    "programme" TEXT,
    "domainesInteret" TEXT[],
    "niveauExperience" TEXT NOT NULL,
    "objectifUtilisation" TEXT NOT NULL,
    "descriptionProjet" TEXT,
    "dateInscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "typeRes" TEXT NOT NULL,
    "materielsChoisis" TEXT[],
    "espacesChoisis" TEXT[],
    "autreDetail" TEXT,
    "dateDebut" TEXT,
    "dateFin" TEXT,
    "heureDebut" TEXT,
    "heureFin" TEXT,
    "objetProjet" TEXT NOT NULL,
    "nbPersonnes" INTEGER NOT NULL DEFAULT 1,
    "statut" TEXT NOT NULL DEFAULT 'En attente',
    "notes" TEXT,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
