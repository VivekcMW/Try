-- CreateEnum
CREATE TYPE "InsurancePolicyStatus" AS ENUM ('active', 'expired', 'pending');

-- CreateEnum
CREATE TYPE "InsuranceClaimStatus" AS ENUM ('submitted', 'in_review', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "InsurancePolicy" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "categoryIcon" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "coverAmountPaise" INTEGER NOT NULL,
    "premiumPaise" INTEGER NOT NULL,
    "nextDueAt" TIMESTAMP(3) NOT NULL,
    "status" "InsurancePolicyStatus" NOT NULL DEFAULT 'active',
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsurancePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceClaim" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "InsuranceClaimStatus" NOT NULL DEFAULT 'submitted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsuranceClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InsurancePolicy_ownerId_idx" ON "InsurancePolicy"("ownerId");

-- CreateIndex
CREATE INDEX "InsurancePolicy_pinCode_idx" ON "InsurancePolicy"("pinCode");

-- CreateIndex
CREATE INDEX "InsuranceClaim_policyId_idx" ON "InsuranceClaim"("policyId");

-- AddForeignKey
ALTER TABLE "InsurancePolicy" ADD CONSTRAINT "InsurancePolicy_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceClaim" ADD CONSTRAINT "InsuranceClaim_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "InsurancePolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
