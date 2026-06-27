-- Horaires d'ouverture globaux : un jeu d'horaires unique pour tout le studio.
-- On retire le rattachement à un espace (colonne + index unique composite)
-- au profit d'une unicité sur le seul jour de la semaine.

-- DropIndex
DROP INDEX "opening_hours_espace_jour_key";

-- AlterTable
ALTER TABLE "opening_hours" DROP COLUMN "espace";

-- CreateIndex
CREATE UNIQUE INDEX "opening_hours_jour_key" ON "opening_hours"("jour");
