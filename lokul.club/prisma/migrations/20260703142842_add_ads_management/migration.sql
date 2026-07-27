-- CreateEnum
CREATE TYPE "AdvertiserStatus" AS ENUM ('pending', 'approved', 'suspended');

-- CreateEnum
CREATE TYPE "AdPackageTier" AS ENUM ('micro_local', 'growth', 'brand', 'national');

-- CreateEnum
CREATE TYPE "AdPricingModel" AS ENUM ('cpm', 'cpc', 'fixed');

-- CreateEnum
CREATE TYPE "AdCampaignStatus" AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'scheduled', 'live', 'paused', 'completed', 'archived');

-- CreateEnum
CREATE TYPE "AdPlacementType" AS ENUM ('feed_post', 'search_slot', 'story', 'banner');

-- CreateEnum
CREATE TYPE "AdCreativeStatus" AS ENUM ('pending_review', 'approved', 'rejected', 'flagged');

-- CreateEnum
CREATE TYPE "AdBookingStatus" AS ENUM ('requested', 'approved', 'rejected', 'cancelled');

-- CreateTable
CREATE TABLE "Advertiser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "merchantId" TEXT,
    "status" "AdvertiserStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advertiser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdCampaign" (
    "id" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "objective" TEXT,
    "packageTier" "AdPackageTier" NOT NULL,
    "pricingModel" "AdPricingModel" NOT NULL,
    "budgetPaise" INTEGER NOT NULL,
    "dailyCapPaise" INTEGER,
    "spentPaise" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "targeting" JSONB,
    "status" "AdCampaignStatus" NOT NULL DEFAULT 'draft',
    "reviewedById" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdCreative" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "placement" "AdPlacementType" NOT NULL,
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "mediaKey" TEXT,
    "ctaLabel" TEXT NOT NULL DEFAULT 'Learn more',
    "ctaUrl" TEXT,
    "status" "AdCreativeStatus" NOT NULL DEFAULT 'pending_review',
    "rejectionReason" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdCreative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdBooking" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "placement" "AdPlacementType" NOT NULL,
    "pinCode" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "quotePaise" INTEGER NOT NULL,
    "status" "AdBookingStatus" NOT NULL DEFAULT 'requested',
    "decisionNote" TEXT,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdEventDaily" (
    "id" TEXT NOT NULL,
    "creativeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "hides" INTEGER NOT NULL DEFAULT 0,
    "spendPaise" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AdEventDaily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Advertiser_status_idx" ON "Advertiser"("status");

-- CreateIndex
CREATE INDEX "Advertiser_merchantId_idx" ON "Advertiser"("merchantId");

-- CreateIndex
CREATE INDEX "AdCampaign_advertiserId_idx" ON "AdCampaign"("advertiserId");

-- CreateIndex
CREATE INDEX "AdCampaign_status_idx" ON "AdCampaign"("status");

-- CreateIndex
CREATE INDEX "AdCampaign_startDate_endDate_idx" ON "AdCampaign"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "AdCreative_campaignId_idx" ON "AdCreative"("campaignId");

-- CreateIndex
CREATE INDEX "AdCreative_status_idx" ON "AdCreative"("status");

-- CreateIndex
CREATE INDEX "AdBooking_campaignId_idx" ON "AdBooking"("campaignId");

-- CreateIndex
CREATE INDEX "AdBooking_status_idx" ON "AdBooking"("status");

-- CreateIndex
CREATE INDEX "AdBooking_placement_pinCode_startDate_endDate_idx" ON "AdBooking"("placement", "pinCode", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "AdEventDaily_date_idx" ON "AdEventDaily"("date");

-- CreateIndex
CREATE UNIQUE INDEX "AdEventDaily_creativeId_date_key" ON "AdEventDaily"("creativeId", "date");

-- AddForeignKey
ALTER TABLE "Advertiser" ADD CONSTRAINT "Advertiser_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdCampaign" ADD CONSTRAINT "AdCampaign_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "Advertiser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdCreative" ADD CONSTRAINT "AdCreative_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AdCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdBooking" ADD CONSTRAINT "AdBooking_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AdCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdEventDaily" ADD CONSTRAINT "AdEventDaily_creativeId_fkey" FOREIGN KEY ("creativeId") REFERENCES "AdCreative"("id") ON DELETE CASCADE ON UPDATE CASCADE;
