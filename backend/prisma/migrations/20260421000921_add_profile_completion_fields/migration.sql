-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "rut" TEXT,
ADD COLUMN     "socialLinks" TEXT;

-- CreateIndex
CREATE INDEX "profiles_rut_idx" ON "profiles"("rut");
