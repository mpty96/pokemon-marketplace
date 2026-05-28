-- CreateTable
CREATE TABLE "WantedCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "edition" TEXT,
    "setNumber" TEXT,
    "imageUrl" TEXT,
    "notifyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WantedCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WantedCard_userId_idx" ON "WantedCard"("userId");

-- CreateIndex
CREATE INDEX "WantedCard_name_idx" ON "WantedCard"("name");

-- AddForeignKey
ALTER TABLE "WantedCard" ADD CONSTRAINT "WantedCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
