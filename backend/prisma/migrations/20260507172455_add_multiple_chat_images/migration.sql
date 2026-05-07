-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
