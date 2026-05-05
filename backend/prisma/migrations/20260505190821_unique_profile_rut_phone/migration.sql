/*
  Warnings:

  - A unique constraint covering the columns `[rut]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contactPhone]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "profiles_rut_idx";

-- CreateIndex
CREATE UNIQUE INDEX "profiles_rut_key" ON "profiles"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_contactPhone_key" ON "profiles"("contactPhone");

-- CreateIndex
CREATE INDEX "profiles_contactPhone_idx" ON "profiles"("contactPhone");
