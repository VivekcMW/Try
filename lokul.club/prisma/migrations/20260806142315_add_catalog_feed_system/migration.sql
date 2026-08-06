-- CreateEnum
CREATE TYPE "CatalogActivityType" AS ENUM ('view_merchant', 'view_catalog_item', 'search', 'order_placed', 'add_to_cart', 'favorite', 'share');

-- CreateEnum
CREATE TYPE "AdAction" AS ENUM ('view', 'click');

-- CreateEnum
CREATE TYPE "PromotedPlacementType" AS ENUM ('home_feed', 'catalog_hub', 'category_listing', 'search_results', 'merchant_detail');

-- CreateTable
CREATE TABLE "UserCatalogActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "merchantId" TEXT,
    "catalogItemId" TEXT,
    "category" TEXT,
    "activityType" "CatalogActivityType" NOT NULL,
    "durationSec" INTEGER,
    "metadata" JSONB,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCatalogActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInterestProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topCategories" JSONB NOT NULL,
    "preferredPriceRange" TEXT,
    "avgOrderFrequency" INTEGER,
    "favoriteTimeSlots" JSONB,
    "dietaryPreferences" JSONB,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInterestProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantCatalogCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "iconName" TEXT,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MerchantCatalogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotedListing" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT,
    "advertiserId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "targetUrl" TEXT,
    "placementType" "PromotedPlacementType" NOT NULL,
    "targetLocations" TEXT[],
    "targetCategories" TEXT[],
    "budgetPaise" INTEGER NOT NULL,
    "spentPaise" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotedListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdImpression" (
    "id" TEXT NOT NULL,
    "promotedListingId" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AdAction" NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "deviceInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdImpression_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserCatalogActivity_userId_createdAt_idx" ON "UserCatalogActivity"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserCatalogActivity_userId_activityType_idx" ON "UserCatalogActivity"("userId", "activityType");

-- CreateIndex
CREATE INDEX "UserCatalogActivity_merchantId_idx" ON "UserCatalogActivity"("merchantId");

-- CreateIndex
CREATE INDEX "UserCatalogActivity_category_idx" ON "UserCatalogActivity"("category");

-- CreateIndex
CREATE UNIQUE INDEX "UserInterestProfile_userId_key" ON "UserInterestProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantCatalogCategory_slug_key" ON "MerchantCatalogCategory"("slug");

-- CreateIndex
CREATE INDEX "MerchantCatalogCategory_slug_idx" ON "MerchantCatalogCategory"("slug");

-- CreateIndex
CREATE INDEX "MerchantCatalogCategory_isActive_idx" ON "MerchantCatalogCategory"("isActive");

-- CreateIndex
CREATE INDEX "PromotedListing_placementType_isActive_idx" ON "PromotedListing"("placementType", "isActive");

-- CreateIndex
CREATE INDEX "PromotedListing_targetLocations_idx" ON "PromotedListing"("targetLocations");

-- CreateIndex
CREATE INDEX "AdImpression_promotedListingId_action_idx" ON "AdImpression"("promotedListingId", "action");

-- CreateIndex
CREATE INDEX "AdImpression_userId_idx" ON "AdImpression"("userId");

-- CreateIndex
CREATE INDEX "AdImpression_createdAt_idx" ON "AdImpression"("createdAt");

-- AddForeignKey
ALTER TABLE "UserCatalogActivity" ADD CONSTRAINT "UserCatalogActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCatalogActivity" ADD CONSTRAINT "UserCatalogActivity_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCatalogActivity" ADD CONSTRAINT "UserCatalogActivity_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "MerchantCatalogItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterestProfile" ADD CONSTRAINT "UserInterestProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantCatalogCategory" ADD CONSTRAINT "MerchantCatalogCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MerchantCatalogCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotedListing" ADD CONSTRAINT "PromotedListing_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotedListing" ADD CONSTRAINT "PromotedListing_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "Advertiser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdImpression" ADD CONSTRAINT "AdImpression_promotedListingId_fkey" FOREIGN KEY ("promotedListingId") REFERENCES "PromotedListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdImpression" ADD CONSTRAINT "AdImpression_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
