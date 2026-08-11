-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PostType" ADD VALUE 'recommendation';
ALTER TYPE "PostType" ADD VALUE 'outage';
ALTER TYPE "PostType" ADD VALUE 'help_request';

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "recommendedMerchantId" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "meta" JSONB;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_recommendedMerchantId_fkey" FOREIGN KEY ("recommendedMerchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
