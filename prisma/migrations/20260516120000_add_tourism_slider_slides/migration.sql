CREATE TABLE IF NOT EXISTS "TourismSliderSlide" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TourismSliderSlide_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TourismSliderSlide_isActive_idx" ON "TourismSliderSlide"("isActive");
CREATE INDEX IF NOT EXISTS "TourismSliderSlide_sortOrder_idx" ON "TourismSliderSlide"("sortOrder");
