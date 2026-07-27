-- CreateEnum
CREATE TYPE "AmenityBookingStatus" AS ENUM ('upcoming', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "AmenityBooking" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,
    "amenityName" TEXT NOT NULL,
    "amenityIcon" TEXT NOT NULL,
    "dateLabel" TEXT NOT NULL,
    "dateISO" TIMESTAMP(3) NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "status" "AmenityBookingStatus" NOT NULL DEFAULT 'upcoming',
    "bookingRef" TEXT NOT NULL,
    "totalPricePaise" INTEGER NOT NULL,
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AmenityBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AmenityBooking_ownerId_idx" ON "AmenityBooking"("ownerId");

-- CreateIndex
CREATE INDEX "AmenityBooking_pinCode_idx" ON "AmenityBooking"("pinCode");

-- AddForeignKey
ALTER TABLE "AmenityBooking" ADD CONSTRAINT "AmenityBooking_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
