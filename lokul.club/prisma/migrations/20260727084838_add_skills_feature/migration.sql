-- CreateEnum
CREATE TYPE "SkillMode" AS ENUM ('teach', 'learn', 'exchange');

-- CreateTable
CREATE TABLE "SkillOffer" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "mode" "SkillMode" NOT NULL,
    "availability" TEXT NOT NULL,
    "pricePaise" INTEGER,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "responseCount" INTEGER NOT NULL DEFAULT 0,
    "ratingAvg" DOUBLE PRECISION,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "sessionsCompleted" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillConnection" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SkillOffer_ownerId_idx" ON "SkillOffer"("ownerId");

-- CreateIndex
CREATE INDEX "SkillOffer_pinCode_idx" ON "SkillOffer"("pinCode");

-- CreateIndex
CREATE INDEX "SkillOffer_category_idx" ON "SkillOffer"("category");

-- CreateIndex
CREATE INDEX "SkillConnection_requesterId_idx" ON "SkillConnection"("requesterId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillConnection_offerId_requesterId_key" ON "SkillConnection"("offerId", "requesterId");

-- AddForeignKey
ALTER TABLE "SkillOffer" ADD CONSTRAINT "SkillOffer_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillConnection" ADD CONSTRAINT "SkillConnection_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "SkillOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillConnection" ADD CONSTRAINT "SkillConnection_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
