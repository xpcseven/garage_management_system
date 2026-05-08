DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TourismProgramStatus') THEN
    CREATE TYPE "TourismProgramStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "TourismProgram" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "notes" TEXT,
  "garageId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "driverId" TEXT NOT NULL,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3),
  "basePrice" DECIMAL(10,2) NOT NULL,
  "maxSeats" INTEGER NOT NULL,
  "availableSeats" INTEGER NOT NULL,
  "status" "TourismProgramStatus" NOT NULL DEFAULT 'SCHEDULED',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TourismProgram_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TourismProgramPlace" (
  "id" TEXT NOT NULL,
  "programId" TEXT NOT NULL,
  "tourismPlaceId" TEXT NOT NULL,
  "stopOrder" INTEGER NOT NULL,
  CONSTRAINT "TourismProgramPlace_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TourismProgramBooking" (
  "id" TEXT NOT NULL,
  "programId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
  "priceAtBooking" DECIMAL(10,2) NOT NULL,
  "passengersCount" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TourismProgramBooking_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TourismProgramPlace_programId_tourismPlaceId_key"
  ON "TourismProgramPlace"("programId", "tourismPlaceId");
CREATE UNIQUE INDEX IF NOT EXISTS "TourismProgramPlace_programId_stopOrder_key"
  ON "TourismProgramPlace"("programId", "stopOrder");
CREATE UNIQUE INDEX IF NOT EXISTS "TourismProgramBooking_programId_userId_key"
  ON "TourismProgramBooking"("programId", "userId");

CREATE INDEX IF NOT EXISTS "TourismProgram_garageId_idx" ON "TourismProgram"("garageId");
CREATE INDEX IF NOT EXISTS "TourismProgram_vehicleId_idx" ON "TourismProgram"("vehicleId");
CREATE INDEX IF NOT EXISTS "TourismProgram_driverId_idx" ON "TourismProgram"("driverId");
CREATE INDEX IF NOT EXISTS "TourismProgram_startAt_idx" ON "TourismProgram"("startAt");
CREATE INDEX IF NOT EXISTS "TourismProgram_status_idx" ON "TourismProgram"("status");
CREATE INDEX IF NOT EXISTS "TourismProgram_isActive_idx" ON "TourismProgram"("isActive");

CREATE INDEX IF NOT EXISTS "TourismProgramPlace_programId_idx" ON "TourismProgramPlace"("programId");
CREATE INDEX IF NOT EXISTS "TourismProgramPlace_tourismPlaceId_idx" ON "TourismProgramPlace"("tourismPlaceId");

CREATE INDEX IF NOT EXISTS "TourismProgramBooking_programId_idx" ON "TourismProgramBooking"("programId");
CREATE INDEX IF NOT EXISTS "TourismProgramBooking_userId_idx" ON "TourismProgramBooking"("userId");
CREATE INDEX IF NOT EXISTS "TourismProgramBooking_status_idx" ON "TourismProgramBooking"("status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TourismProgram_garageId_fkey'
  ) THEN
    ALTER TABLE "TourismProgram"
      ADD CONSTRAINT "TourismProgram_garageId_fkey"
      FOREIGN KEY ("garageId") REFERENCES "Garage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TourismProgram_vehicleId_fkey'
  ) THEN
    ALTER TABLE "TourismProgram"
      ADD CONSTRAINT "TourismProgram_vehicleId_fkey"
      FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TourismProgram_driverId_fkey'
  ) THEN
    ALTER TABLE "TourismProgram"
      ADD CONSTRAINT "TourismProgram_driverId_fkey"
      FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TourismProgramPlace_programId_fkey'
  ) THEN
    ALTER TABLE "TourismProgramPlace"
      ADD CONSTRAINT "TourismProgramPlace_programId_fkey"
      FOREIGN KEY ("programId") REFERENCES "TourismProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TourismProgramPlace_tourismPlaceId_fkey'
  ) THEN
    ALTER TABLE "TourismProgramPlace"
      ADD CONSTRAINT "TourismProgramPlace_tourismPlaceId_fkey"
      FOREIGN KEY ("tourismPlaceId") REFERENCES "TourismPlace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TourismProgramBooking_programId_fkey'
  ) THEN
    ALTER TABLE "TourismProgramBooking"
      ADD CONSTRAINT "TourismProgramBooking_programId_fkey"
      FOREIGN KEY ("programId") REFERENCES "TourismProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TourismProgramBooking_userId_fkey'
  ) THEN
    ALTER TABLE "TourismProgramBooking"
      ADD CONSTRAINT "TourismProgramBooking_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

