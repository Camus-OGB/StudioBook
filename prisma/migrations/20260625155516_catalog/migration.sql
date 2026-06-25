-- CreateTable
CREATE TABLE "catalog_items" (
    "id" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "catalog_items_categorie_actif_idx" ON "catalog_items"("categorie", "actif");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_items_categorie_valeur_key" ON "catalog_items"("categorie", "valeur");
