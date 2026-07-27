-- CreateEnum
CREATE TYPE "DomesticHelperVerificationStatus" AS ENUM ('unverified', 'pending', 'verified', 'rejected');

-- CreateTable
CREATE TABLE "DomesticHelper" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "photo" TEXT,
    "roleId" TEXT,
    "role" TEXT NOT NULL,
    "verificationStatus" "DomesticHelperVerificationStatus" NOT NULL DEFAULT 'unverified',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviews" INTEGER NOT NULL DEFAULT 0,
    "worksAt" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "workingDays" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "workingHours" TEXT NOT NULL DEFAULT '',
    "monthlyPayPaise" INTEGER NOT NULL DEFAULT 0,
    "joiningDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVerifiedAt" TIMESTAMP(3),
    "documents" JSONB NOT NULL DEFAULT '{}',
    "notes" TEXT,
    "recommendedBy" INTEGER NOT NULL DEFAULT 0,
    "areas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experience" TEXT,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "monthlyRateMinPaise" INTEGER,
    "monthlyRateMaxPaise" INTEGER,
    "availability" TEXT,
    "isPoolListed" BOOLEAN NOT NULL DEFAULT false,
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomesticHelper_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DomesticHelper_ownerId_idx" ON "DomesticHelper"("ownerId");

-- CreateIndex
CREATE INDEX "DomesticHelper_pinCode_idx" ON "DomesticHelper"("pinCode");

-- CreateIndex
CREATE INDEX "DomesticHelper_isPoolListed_idx" ON "DomesticHelper"("isPoolListed");

-- AddForeignKey
ALTER TABLE "DomesticHelper" ADD CONSTRAINT "DomesticHelper_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
