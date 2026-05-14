-- CreateTable
CREATE TABLE "HomeSliderImage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeSliderImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomeSliderImage_isActive_idx" ON "HomeSliderImage"("isActive");

-- CreateIndex
CREATE INDEX "HomeSliderImage_sortOrder_idx" ON "HomeSliderImage"("sortOrder");
