-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aadhaar_address" TEXT,
ADD COLUMN     "aadhaar_dob" TIMESTAMP(3),
ADD COLUMN     "aadhaar_gender" TEXT,
ADD COLUMN     "aadhaar_name" TEXT,
ADD COLUMN     "aadhaar_verified" BOOLEAN NOT NULL DEFAULT false;
