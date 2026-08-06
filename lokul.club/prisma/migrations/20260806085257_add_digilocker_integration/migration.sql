/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[digilocker_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "digilocker_dob" TIMESTAMP(3),
ADD COLUMN     "digilocker_gender" TEXT,
ADD COLUMN     "digilocker_id" TEXT,
ADD COLUMN     "digilocker_name" TEXT,
ADD COLUMN     "digilocker_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "email" TEXT,
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateTable
CREATE TABLE "DigiLockerDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "docUri" TEXT NOT NULL,
    "docName" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fetchedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "storageUrl" TEXT,
    "metadata" JSONB,

    CONSTRAINT "DigiLockerDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DigiLockerDocument_userId_idx" ON "DigiLockerDocument"("userId");

-- CreateIndex
CREATE INDEX "DigiLockerDocument_docType_idx" ON "DigiLockerDocument"("docType");

-- CreateIndex
CREATE INDEX "DigiLockerDocument_requestedAt_idx" ON "DigiLockerDocument"("requestedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_digilocker_id_key" ON "User"("digilocker_id");

-- AddForeignKey
ALTER TABLE "DigiLockerDocument" ADD CONSTRAINT "DigiLockerDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
