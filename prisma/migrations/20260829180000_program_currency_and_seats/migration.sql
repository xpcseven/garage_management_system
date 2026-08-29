-- Tourism program currency + vehicle seat booking

ALTER TABLE "TourismProgram" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'IQD';

ALTER TABLE "Seat" ALTER COLUMN "tripId" DROP NOT NULL;
ALTER TABLE "Seat" ADD COLUMN IF NOT EXISTS "programId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Seat_programId_seatNumber_key" ON "Seat"("programId", "seatNumber");
CREATE INDEX IF NOT EXISTS "Seat_programId_idx" ON "Seat"("programId");

DO $$ BEGIN
  ALTER TABLE "Seat" ADD CONSTRAINT "Seat_programId_fkey"
    FOREIGN KEY ("programId") REFERENCES "TourismProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "TourismProgramBooking" ADD COLUMN IF NOT EXISTS "seatId" TEXT;

DROP INDEX IF EXISTS "TourismProgramBooking_programId_userId_key";

CREATE UNIQUE INDEX IF NOT EXISTS "TourismProgramBooking_seatId_key" ON "TourismProgramBooking"("seatId");

DO $$ BEGIN
  ALTER TABLE "TourismProgramBooking" ADD CONSTRAINT "TourismProgramBooking_seatId_fkey"
    FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
