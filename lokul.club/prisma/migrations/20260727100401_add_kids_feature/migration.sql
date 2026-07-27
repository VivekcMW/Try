-- CreateEnum
CREATE TYPE "KidsActivityPriceType" AS ENUM ('session', 'month');

-- CreateTable
CREATE TABLE "KidsActivity" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "totalSpots" INTEGER NOT NULL,
    "spotsLeft" INTEGER NOT NULL,
    "pricePaise" INTEGER NOT NULL,
    "priceType" "KidsActivityPriceType" NOT NULL DEFAULT 'session',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviews" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KidsActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KidsPlaydate" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "dateLabel" TEXT NOT NULL,
    "timeLabel" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "notes" TEXT,
    "totalSpots" INTEGER NOT NULL,
    "spotsLeft" INTEGER NOT NULL,
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KidsPlaydate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KidsPlaydateAttendee" (
    "id" TEXT NOT NULL,
    "playdateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kidName" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KidsPlaydateAttendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KidsTutorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flat" TEXT NOT NULL DEFAULT 'Not specified',
    "subjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "grades" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "pricePerHourPaise" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviews" INTEGER NOT NULL DEFAULT 0,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "bio" TEXT,
    "phone" TEXT,
    "availability" TEXT,
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KidsTutorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KidsActivity_hostId_idx" ON "KidsActivity"("hostId");

-- CreateIndex
CREATE INDEX "KidsActivity_pinCode_idx" ON "KidsActivity"("pinCode");

-- CreateIndex
CREATE INDEX "KidsPlaydate_hostId_idx" ON "KidsPlaydate"("hostId");

-- CreateIndex
CREATE INDEX "KidsPlaydate_pinCode_idx" ON "KidsPlaydate"("pinCode");

-- CreateIndex
CREATE INDEX "KidsPlaydateAttendee_playdateId_idx" ON "KidsPlaydateAttendee"("playdateId");

-- CreateIndex
CREATE UNIQUE INDEX "KidsPlaydateAttendee_playdateId_userId_key" ON "KidsPlaydateAttendee"("playdateId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "KidsTutorProfile_userId_key" ON "KidsTutorProfile"("userId");

-- CreateIndex
CREATE INDEX "KidsTutorProfile_pinCode_idx" ON "KidsTutorProfile"("pinCode");

-- AddForeignKey
ALTER TABLE "KidsActivity" ADD CONSTRAINT "KidsActivity_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsPlaydate" ADD CONSTRAINT "KidsPlaydate_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsPlaydateAttendee" ADD CONSTRAINT "KidsPlaydateAttendee_playdateId_fkey" FOREIGN KEY ("playdateId") REFERENCES "KidsPlaydate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsPlaydateAttendee" ADD CONSTRAINT "KidsPlaydateAttendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KidsTutorProfile" ADD CONSTRAINT "KidsTutorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
