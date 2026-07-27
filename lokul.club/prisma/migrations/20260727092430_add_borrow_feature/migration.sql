-- CreateEnum
CREATE TYPE "BorrowItemCondition" AS ENUM ('excellent', 'good', 'fair');

-- CreateEnum
CREATE TYPE "BorrowRentalType" AS ENUM ('free', 'deposit', 'rent');

-- CreateEnum
CREATE TYPE "BorrowRequestStatus" AS ENUM ('pending', 'approved', 'declined');

-- CreateTable
CREATE TABLE "BorrowItem" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "condition" "BorrowItemCondition" NOT NULL DEFAULT 'good',
    "rentalType" "BorrowRentalType" NOT NULL DEFAULT 'free',
    "depositAmountPaise" INTEGER,
    "rentPerDayPaise" INTEGER,
    "maxDays" INTEGER NOT NULL DEFAULT 3,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "borrowCount" INTEGER NOT NULL DEFAULT 0,
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BorrowItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BorrowRequest" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "status" "BorrowRequestStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BorrowRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BorrowItem_ownerId_idx" ON "BorrowItem"("ownerId");

-- CreateIndex
CREATE INDEX "BorrowItem_pinCode_idx" ON "BorrowItem"("pinCode");

-- CreateIndex
CREATE INDEX "BorrowRequest_itemId_idx" ON "BorrowRequest"("itemId");

-- CreateIndex
CREATE INDEX "BorrowRequest_requesterId_idx" ON "BorrowRequest"("requesterId");

-- AddForeignKey
ALTER TABLE "BorrowItem" ADD CONSTRAINT "BorrowItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BorrowRequest" ADD CONSTRAINT "BorrowRequest_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "BorrowItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BorrowRequest" ADD CONSTRAINT "BorrowRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
