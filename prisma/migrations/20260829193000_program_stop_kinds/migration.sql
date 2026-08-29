-- Add travel/tourism stop kinds for tourism programs

DO $$ BEGIN
  CREATE TYPE "TourismProgramStopKind" AS ENUM ('TRAVEL', 'TOURISM');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "TourismProgramPlace" ADD COLUMN IF NOT EXISTS "stopKind" "TourismProgramStopKind" NOT NULL DEFAULT 'TOURISM';
ALTER TABLE "TourismProgramPlace" ADD COLUMN IF NOT EXISTS "cityId" TEXT;

ALTER TABLE "TourismProgramPlace" ALTER COLUMN "tourismPlaceId" DROP NOT NULL;

DROP INDEX IF EXISTS "TourismProgramPlace_programId_tourismPlaceId_key";

CREATE INDEX IF NOT EXISTS "TourismProgramPlace_cityId_idx" ON "TourismProgramPlace"("cityId");
CREATE INDEX IF NOT EXISTS "TourismProgramPlace_stopKind_idx" ON "TourismProgramPlace"("stopKind");

DO $$ BEGIN
  ALTER TABLE "TourismProgramPlace" ADD CONSTRAINT "TourismProgramPlace_cityId_fkey"
    FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
