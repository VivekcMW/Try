-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "acceptingOrders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "closedReason" TEXT,
ADD COLUMN     "closedUntil" TIMESTAMP(3);
