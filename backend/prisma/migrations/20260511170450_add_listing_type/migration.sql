-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('CARD', 'POKEMON_PRODUCT', 'BULK_LOT');

-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "listingType" "ListingType" NOT NULL DEFAULT 'CARD';

-- CreateIndex
CREATE INDEX "listings_listingType_idx" ON "listings"("listingType");
