-- تحويل emailVerified من DateTime إلى Boolean + إزالة الجدول القديم
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified_new" BOOLEAN NOT NULL DEFAULT false;

UPDATE "User"
SET "emailVerified_new" = true
WHERE "emailVerified" IS NOT NULL;

ALTER TABLE "User" DROP COLUMN IF EXISTS "emailVerified";
ALTER TABLE "User" RENAME COLUMN "emailVerified_new" TO "emailVerified";

DROP TABLE IF EXISTS "EmailVerificationToken";
