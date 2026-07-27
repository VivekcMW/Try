-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('due', 'paid', 'overdue');

-- CreateEnum
CREATE TYPE "BillPaymentStatus" AS ENUM ('success', 'pending', 'failed');

-- CreateTable
CREATE TABLE "SavedBiller" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "lastBillAmountPaise" INTEGER,
    "dueDate" TIMESTAMP(3),
    "status" "BillStatus" NOT NULL DEFAULT 'due',
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedBiller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillPayment" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "billerId" TEXT,
    "biller" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "status" "BillPaymentStatus" NOT NULL DEFAULT 'success',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedBiller_ownerId_idx" ON "SavedBiller"("ownerId");

-- CreateIndex
CREATE INDEX "SavedBiller_pinCode_idx" ON "SavedBiller"("pinCode");

-- CreateIndex
CREATE INDEX "BillPayment_ownerId_idx" ON "BillPayment"("ownerId");

-- CreateIndex
CREATE INDEX "BillPayment_billerId_idx" ON "BillPayment"("billerId");

-- AddForeignKey
ALTER TABLE "SavedBiller" ADD CONSTRAINT "SavedBiller_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_billerId_fkey" FOREIGN KEY ("billerId") REFERENCES "SavedBiller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
