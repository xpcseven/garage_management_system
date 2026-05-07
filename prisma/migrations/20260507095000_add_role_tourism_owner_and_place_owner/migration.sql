-- Add new role value (PostgreSQL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'TOURISM_OWNER'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Role')
  ) THEN
    ALTER TYPE "Role" ADD VALUE 'TOURISM_OWNER';
  END IF;
END $$;

-- Add ownership to tourism places (for existing databases)
ALTER TABLE "TourismPlace"
ADD COLUMN IF NOT EXISTS "ownerId" TEXT;

-- Backfill ownerId with a SUPER_ADMIN if available (first one)
UPDATE "TourismPlace" tp
SET "ownerId" = u.id
FROM "User" u
WHERE tp."ownerId" IS NULL
  AND u.role = 'SUPER_ADMIN';

-- If still null, backfill with any user (first row) to satisfy NOT NULL later
UPDATE "TourismPlace" tp
SET "ownerId" = u.id
FROM "User" u
WHERE tp."ownerId" IS NULL;

-- Enforce NOT NULL after backfill
ALTER TABLE "TourismPlace"
ALTER COLUMN "ownerId" SET NOT NULL;

-- Index + FK (idempotent where possible)
CREATE INDEX IF NOT EXISTS "TourismPlace_ownerId_idx" ON "TourismPlace"("ownerId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'TourismPlace_ownerId_fkey'
      AND table_name = 'TourismPlace'
  ) THEN
    ALTER TABLE "TourismPlace"
    ADD CONSTRAINT "TourismPlace_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

