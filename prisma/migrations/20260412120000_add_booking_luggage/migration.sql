-- CreateEnum
CREATE TYPE "LuggageKind" AS ENUM ('LARGE_BAG', 'MEDIUM_BAG', 'SACK', 'CARTON');

-- CreateTable
CREATE TABLE "BookingLuggageItem" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "kind" "LuggageKind" NOT NULL,
    "weightKg" DECIMAL(8,2),
    "dimensions" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingLuggageItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingLuggageItem_bookingId_idx" ON "BookingLuggageItem"("bookingId");

-- AddForeignKey
ALTER TABLE "BookingLuggageItem" ADD CONSTRAINT "BookingLuggageItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
