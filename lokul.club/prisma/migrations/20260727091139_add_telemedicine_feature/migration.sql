-- CreateEnum
CREATE TYPE "TelemedAppointmentMode" AS ENUM ('video', 'audio', 'in_person', 'instant');

-- CreateEnum
CREATE TYPE "TelemedAppointmentStatus" AS ENUM ('upcoming', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "TelemedAppointment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "doctorId" TEXT,
    "doctorName" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "mode" "TelemedAppointmentMode" NOT NULL,
    "dateLabel" TEXT NOT NULL,
    "timeLabel" TEXT NOT NULL,
    "status" "TelemedAppointmentStatus" NOT NULL DEFAULT 'upcoming',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelemedAppointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelemedHealthRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "doctorName" TEXT,
    "fileUrl" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelemedHealthRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelemedMedicineOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "totalPaise" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'placed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelemedMedicineOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelemedLabBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "pricePaise" INTEGER NOT NULL,
    "dateLabel" TEXT NOT NULL,
    "timeLabel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'booked',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelemedLabBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TelemedAppointment_userId_idx" ON "TelemedAppointment"("userId");

-- CreateIndex
CREATE INDEX "TelemedHealthRecord_userId_idx" ON "TelemedHealthRecord"("userId");

-- CreateIndex
CREATE INDEX "TelemedMedicineOrder_userId_idx" ON "TelemedMedicineOrder"("userId");

-- CreateIndex
CREATE INDEX "TelemedLabBooking_userId_idx" ON "TelemedLabBooking"("userId");

-- AddForeignKey
ALTER TABLE "TelemedAppointment" ADD CONSTRAINT "TelemedAppointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelemedHealthRecord" ADD CONSTRAINT "TelemedHealthRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelemedMedicineOrder" ADD CONSTRAINT "TelemedMedicineOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelemedLabBooking" ADD CONSTRAINT "TelemedLabBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
