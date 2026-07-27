-- CreateEnum
CREATE TYPE "PropertyDealType" AS ENUM ('sale', 'rent', 'pg');

-- CreateEnum
CREATE TYPE "PropertyBuildingType" AS ENUM ('apartment', 'house', 'villa', 'plot', 'pg');

-- CreateTable
CREATE TABLE "PropertyListing" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dealType" "PropertyDealType" NOT NULL,
    "buildingType" "PropertyBuildingType" NOT NULL,
    "bhk" TEXT,
    "areaSqft" INTEGER NOT NULL,
    "pricePaise" INTEGER NOT NULL,
    "priceUnit" TEXT,
    "location" TEXT NOT NULL,
    "amenities" TEXT[],
    "furnishing" TEXT,
    "floor" TEXT,
    "availableFrom" TEXT,
    "description" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RealEstateAgentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialization" TEXT[],
    "experience" TEXT NOT NULL,
    "ratingAvg" DOUBLE PRECISION,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RealEstateAgentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyListing_ownerId_idx" ON "PropertyListing"("ownerId");

-- CreateIndex
CREATE INDEX "PropertyListing_pinCode_idx" ON "PropertyListing"("pinCode");

-- CreateIndex
CREATE INDEX "PropertyListing_dealType_idx" ON "PropertyListing"("dealType");

-- CreateIndex
CREATE UNIQUE INDEX "RealEstateAgentProfile_userId_key" ON "RealEstateAgentProfile"("userId");

-- CreateIndex
CREATE INDEX "RealEstateAgentProfile_pinCode_idx" ON "RealEstateAgentProfile"("pinCode");

-- AddForeignKey
ALTER TABLE "PropertyListing" ADD CONSTRAINT "PropertyListing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstateAgentProfile" ADD CONSTRAINT "RealEstateAgentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
