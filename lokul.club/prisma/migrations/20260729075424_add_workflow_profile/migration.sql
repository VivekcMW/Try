-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "deliveryFeePaise" INTEGER,
ADD COLUMN     "notifPrefs" JSONB,
ADD COLUMN     "workflowProfile" TEXT NOT NULL DEFAULT 'retail';

-- AlterTable
ALTER TABLE "MerchantCatalogItem" ADD COLUMN     "catalogCategory" TEXT,
ADD COLUMN     "stockCount" INTEGER;

-- CreateTable
CREATE TABLE "MerchantCoupon" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "minSpendPaise" INTEGER,
    "maxUsesTotal" INTEGER,
    "maxUsesPerUser" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantCoupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantBranch" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "pinCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantBranch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MerchantCoupon_merchantId_isActive_idx" ON "MerchantCoupon"("merchantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantCoupon_merchantId_code_key" ON "MerchantCoupon"("merchantId", "code");

-- CreateIndex
CREATE INDEX "MerchantBranch_merchantId_idx" ON "MerchantBranch"("merchantId");

-- CreateIndex
CREATE INDEX "MerchantBranch_pinCode_idx" ON "MerchantBranch"("pinCode");

-- CreateIndex
CREATE INDEX "MerchantCatalogItem_merchantId_catalogCategory_idx" ON "MerchantCatalogItem"("merchantId", "catalogCategory");

-- AddForeignKey
ALTER TABLE "MerchantCoupon" ADD CONSTRAINT "MerchantCoupon_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantBranch" ADD CONSTRAINT "MerchantBranch_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
