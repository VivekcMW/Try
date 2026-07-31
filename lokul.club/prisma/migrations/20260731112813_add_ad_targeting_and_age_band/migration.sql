-- CreateEnum
CREATE TYPE "AgeBand" AS ENUM ('age_18_24', 'age_25_34', 'age_35_44', 'age_45_54', 'age_55_plus');

-- AlterTable
ALTER TABLE "AdBooking" ADD COLUMN     "daypart" TEXT,
ADD COLUMN     "daysOfWeek" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- AlterTable
ALTER TABLE "AdCreative" ADD COLUMN     "categories" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ageBand" "AgeBand";
