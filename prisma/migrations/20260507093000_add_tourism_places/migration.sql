-- CreateTable
CREATE TABLE "TourismPlace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "governorate" TEXT,
    "description" TEXT,
    "address" TEXT,
    "location" TEXT,
    "imageUrl" TEXT,
    "cityId" TEXT,
    "ownerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourismPlace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TourismPlace_cityId_idx" ON "TourismPlace"("cityId");

-- CreateIndex
CREATE INDEX "TourismPlace_ownerId_idx" ON "TourismPlace"("ownerId");

-- CreateIndex
CREATE INDEX "TourismPlace_isActive_idx" ON "TourismPlace"("isActive");

-- AddForeignKey
ALTER TABLE "TourismPlace" ADD CONSTRAINT "TourismPlace_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourismPlace" ADD CONSTRAINT "TourismPlace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

