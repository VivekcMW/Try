-- CreateEnum
CREATE TYPE "BookingKind" AS ENUM ('slot', 'window', 'project');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('requested', 'cancelled', 'completed', 'confirmed', 'checked_in', 'accepted', 'on_the_way', 'arrived', 'quote_pending', 'in_progress', 'work_done', 'visit_scheduled', 'visit_done', 'quote_shared', 'quote_accepted', 'scheduled');

-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "visitFeePaise" INTEGER;

-- AlterTable
ALTER TABLE "ServiceSlot" ADD COLUMN     "staffId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "radiusKm" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "MerchantStaff" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "rating" DOUBLE PRECISION,
    "years" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantStaff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceBooking" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "staffId" TEXT,
    "kind" "BookingKind" NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'requested',
    "category" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "slotLabel" TEXT NOT NULL,
    "slotId" TEXT,
    "address" TEXT,
    "locationType" TEXT,
    "fromAddress" TEXT,
    "toAddress" TEXT,
    "bookingFor" TEXT,
    "petName" TEXT,
    "inventory" TEXT,
    "fastingRequired" BOOLEAN NOT NULL DEFAULT false,
    "roomCount" TEXT,
    "recurrence" JSONB,
    "consultMode" TEXT,
    "problem" TEXT,
    "problemPhotoUrl" TEXT,
    "urgency" TEXT,
    "visitFeePaise" INTEGER,
    "totalPaise" INTEGER NOT NULL DEFAULT 0,
    "advancePaise" INTEGER,
    "advancePaid" BOOLEAN NOT NULL DEFAULT false,
    "otp" TEXT NOT NULL,
    "cancellationReason" TEXT,
    "rating" INTEGER,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "ServiceBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingItem" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pricePaise" INTEGER NOT NULL,
    "durationMins" INTEGER,

    CONSTRAINT "BookingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingQuote" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT,
    "lineItems" JSONB,
    "totalPaise" INTEGER NOT NULL,
    "counterPaise" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingMilestone" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" TIMESTAMP(3),

    CONSTRAINT "BookingMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingLeg" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "legType" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "slotLabel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "doneAt" TIMESTAMP(3),

    CONSTRAINT "BookingLeg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingStatusHistory" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "fromStatus" "BookingStatus",
    "toStatus" "BookingStatus" NOT NULL,
    "changedBy" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MerchantStaff_merchantId_isActive_idx" ON "MerchantStaff"("merchantId", "isActive");

-- CreateIndex
CREATE INDEX "ServiceBooking_customerId_createdAt_idx" ON "ServiceBooking"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "ServiceBooking_merchantId_status_idx" ON "ServiceBooking"("merchantId", "status");

-- CreateIndex
CREATE INDEX "ServiceBooking_status_idx" ON "ServiceBooking"("status");

-- CreateIndex
CREATE INDEX "ServiceBooking_date_idx" ON "ServiceBooking"("date");

-- CreateIndex
CREATE INDEX "BookingItem_bookingId_idx" ON "BookingItem"("bookingId");

-- CreateIndex
CREATE INDEX "BookingQuote_bookingId_idx" ON "BookingQuote"("bookingId");

-- CreateIndex
CREATE INDEX "BookingMilestone_bookingId_idx" ON "BookingMilestone"("bookingId");

-- CreateIndex
CREATE INDEX "BookingLeg_bookingId_idx" ON "BookingLeg"("bookingId");

-- CreateIndex
CREATE INDEX "BookingStatusHistory_bookingId_idx" ON "BookingStatusHistory"("bookingId");

-- AddForeignKey
ALTER TABLE "ServiceSlot" ADD CONSTRAINT "ServiceSlot_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "MerchantStaff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantStaff" ADD CONSTRAINT "MerchantStaff_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceBooking" ADD CONSTRAINT "ServiceBooking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceBooking" ADD CONSTRAINT "ServiceBooking_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceBooking" ADD CONSTRAINT "ServiceBooking_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "MerchantStaff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingItem" ADD CONSTRAINT "BookingItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "ServiceBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingQuote" ADD CONSTRAINT "BookingQuote_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "ServiceBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingMilestone" ADD CONSTRAINT "BookingMilestone_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "ServiceBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingLeg" ADD CONSTRAINT "BookingLeg_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "ServiceBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingStatusHistory" ADD CONSTRAINT "BookingStatusHistory_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "ServiceBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
