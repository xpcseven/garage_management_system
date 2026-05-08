DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TourismApprovalStatus') THEN
    CREATE TYPE "TourismApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  END IF;
END $$;

ALTER TABLE "TourismPlace"
ADD COLUMN IF NOT EXISTS "approvalStatus" "TourismApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "TourismPlace_approvalStatus_idx" ON "TourismPlace"("approvalStatus");

