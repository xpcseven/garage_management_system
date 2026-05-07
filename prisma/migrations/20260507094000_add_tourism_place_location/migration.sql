-- Safety migration: add column if previous migration was applied
ALTER TABLE "TourismPlace"
ADD COLUMN IF NOT EXISTS "location" TEXT;

