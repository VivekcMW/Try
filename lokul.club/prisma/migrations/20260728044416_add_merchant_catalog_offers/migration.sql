-- CreateEnum
CREATE TYPE "CatalogItemKind" AS ENUM ('product', 'menu_item', 'service', 'consultation', 'class_batch');

-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('percent_off', 'flat_off', 'bogo', 'free_delivery');

-- CreateTable
CREATE TABLE "MerchantCatalogItem" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "kind" "CatalogItemKind" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pricePaise" INTEGER NOT NULL,
    "unit" TEXT,
    "durationMins" INTEGER,
    "imageUrl" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "attributes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantCatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantOffer" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "OfferType" NOT NULL,
    "value" INTEGER NOT NULL,
    "minSpendPaise" INTEGER,
    "appliesTo" TEXT[],
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MerchantCatalogItem_merchantId_kind_idx" ON "MerchantCatalogItem"("merchantId", "kind");

-- CreateIndex
CREATE INDEX "MerchantCatalogItem_merchantId_isAvailable_idx" ON "MerchantCatalogItem"("merchantId", "isAvailable");

-- CreateIndex
CREATE INDEX "MerchantOffer_merchantId_isActive_idx" ON "MerchantOffer"("merchantId", "isActive");

-- CreateIndex
CREATE INDEX "MerchantOffer_endsAt_idx" ON "MerchantOffer"("endsAt");

-- AddForeignKey
ALTER TABLE "MerchantCatalogItem" ADD CONSTRAINT "MerchantCatalogItem_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantOffer" ADD CONSTRAINT "MerchantOffer_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
