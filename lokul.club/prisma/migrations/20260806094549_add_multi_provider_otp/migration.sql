/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `OtpVerification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transactionId` to the `OtpVerification` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add new columns as nullable first
ALTER TABLE "OtpVerification" 
  ADD COLUMN "email" TEXT,
  ADD COLUMN "provider" TEXT DEFAULT 'sms',
  ADD COLUMN "transactionId" TEXT,
  ADD COLUMN "userId" TEXT,
  ADD COLUMN "verifiedAt" TIMESTAMP(3),
  ALTER COLUMN "phone" DROP NOT NULL;

-- Step 2: Generate unique transaction IDs for existing rows
UPDATE "OtpVerification" 
SET "transactionId" = 'otp_legacy_' || id 
WHERE "transactionId" IS NULL;

-- Step 3: Make transactionId and provider non-nullable
ALTER TABLE "OtpVerification" 
  ALTER COLUMN "transactionId" SET NOT NULL,
  ALTER COLUMN "provider" SET NOT NULL;

-- Step 4: Create unique constraint
CREATE UNIQUE INDEX "OtpVerification_transactionId_key" ON "OtpVerification"("transactionId");

-- Step 5: Create other indexes
CREATE INDEX "OtpVerification_email_idx" ON "OtpVerification"("email");
CREATE INDEX "OtpVerification_transactionId_idx" ON "OtpVerification"("transactionId");
CREATE INDEX "OtpVerification_provider_idx" ON "OtpVerification"("provider");

-- Step 6: Add foreign key constraint
ALTER TABLE "OtpVerification" 
  ADD CONSTRAINT "OtpVerification_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;
