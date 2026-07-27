-- CreateEnum
CREATE TYPE "PetType" AS ENUM ('dog', 'cat', 'bird', 'fish', 'other');

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PetType" NOT NULL,
    "breed" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "vaccinated" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetSitterProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "petTypes" TEXT[],
    "experience" TEXT NOT NULL,
    "bio" TEXT,
    "pricePerDayPaise" INTEGER NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "ratingAvg" DOUBLE PRECISION,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PetSitterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LostPetReport" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "found" BOOLEAN NOT NULL DEFAULT false,
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LostPetReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaydateRequest" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "note" TEXT,
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaydateRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pet_ownerId_idx" ON "Pet"("ownerId");

-- CreateIndex
CREATE INDEX "Pet_pinCode_idx" ON "Pet"("pinCode");

-- CreateIndex
CREATE UNIQUE INDEX "PetSitterProfile_userId_key" ON "PetSitterProfile"("userId");

-- CreateIndex
CREATE INDEX "PetSitterProfile_pinCode_idx" ON "PetSitterProfile"("pinCode");

-- CreateIndex
CREATE INDEX "PetSitterProfile_available_idx" ON "PetSitterProfile"("available");

-- CreateIndex
CREATE INDEX "LostPetReport_reporterId_idx" ON "LostPetReport"("reporterId");

-- CreateIndex
CREATE INDEX "LostPetReport_pinCode_idx" ON "LostPetReport"("pinCode");

-- CreateIndex
CREATE INDEX "LostPetReport_found_idx" ON "LostPetReport"("found");

-- CreateIndex
CREATE INDEX "PlaydateRequest_requesterId_idx" ON "PlaydateRequest"("requesterId");

-- CreateIndex
CREATE INDEX "PlaydateRequest_petId_idx" ON "PlaydateRequest"("petId");

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetSitterProfile" ADD CONSTRAINT "PetSitterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostPetReport" ADD CONSTRAINT "LostPetReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaydateRequest" ADD CONSTRAINT "PlaydateRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaydateRequest" ADD CONSTRAINT "PlaydateRequest_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
