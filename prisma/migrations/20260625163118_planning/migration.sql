-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "debutAt" TIMESTAMP(3),
ADD COLUMN     "finAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "opening_hours" (
    "id" TEXT NOT NULL,
    "espace" TEXT NOT NULL,
    "jour" INTEGER NOT NULL,
    "ouverture" TEXT NOT NULL,
    "fermeture" TEXT NOT NULL,

    CONSTRAINT "opening_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blackouts" (
    "id" TEXT NOT NULL,
    "espace" TEXT,
    "debutAt" TIMESTAMP(3) NOT NULL,
    "finAt" TIMESTAMP(3) NOT NULL,
    "motif" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blackouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "opening_hours_espace_jour_key" ON "opening_hours"("espace", "jour");

-- CreateIndex
CREATE INDEX "blackouts_espace_idx" ON "blackouts"("espace");

-- CreateIndex
CREATE INDEX "reservations_debutAt_finAt_idx" ON "reservations"("debutAt", "finAt");
