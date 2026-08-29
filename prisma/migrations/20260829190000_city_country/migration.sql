ALTER TABLE "City" ADD COLUMN IF NOT EXISTS "country" TEXT;
CREATE INDEX IF NOT EXISTS "City_country_idx" ON "City"("country");
