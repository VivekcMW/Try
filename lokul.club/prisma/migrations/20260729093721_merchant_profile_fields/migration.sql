-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "businessLicense" TEXT,
ADD COLUMN     "closedWeekdays" JSONB,
ADD COLUMN     "freeDeliveryAbovePaise" INTEGER,
ADD COLUMN     "fssaiNumber" TEXT,
ADD COLUMN     "gstNumber" TEXT,
ADD COLUMN     "minimumOrderPaise" INTEGER,
ADD COLUMN     "paymentMethods" JSONB,
ADD COLUMN     "serviceRadiusKm" DOUBLE PRECISION;
