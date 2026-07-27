-- CreateEnum
CREATE TYPE "SportsLeagueStatus" AS ENUM ('registering', 'ongoing', 'completed');

-- CreateEnum
CREATE TYPE "SportsSkillLevel" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateTable
CREATE TABLE "SportsLeague" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "entryFeePaise" INTEGER NOT NULL DEFAULT 0,
    "prize" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "maxTeams" INTEGER NOT NULL,
    "status" "SportsLeagueStatus" NOT NULL DEFAULT 'registering',
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SportsLeague_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportsTeam" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "leagueId" TEXT,
    "captain" TEXT NOT NULL,
    "captainFlat" TEXT NOT NULL,
    "members" INTEGER NOT NULL DEFAULT 1,
    "maxMembers" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "lookingForPlayers" BOOLEAN NOT NULL DEFAULT true,
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SportsTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportsPlayerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flat" TEXT NOT NULL,
    "sports" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skill" "SportsSkillLevel" NOT NULL DEFAULT 'beginner',
    "lookingToJoin" BOOLEAN NOT NULL DEFAULT true,
    "available" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bio" TEXT,
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SportsPlayerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SportsLeague_ownerId_idx" ON "SportsLeague"("ownerId");

-- CreateIndex
CREATE INDEX "SportsLeague_pinCode_idx" ON "SportsLeague"("pinCode");

-- CreateIndex
CREATE INDEX "SportsTeam_ownerId_idx" ON "SportsTeam"("ownerId");

-- CreateIndex
CREATE INDEX "SportsTeam_leagueId_idx" ON "SportsTeam"("leagueId");

-- CreateIndex
CREATE INDEX "SportsTeam_pinCode_idx" ON "SportsTeam"("pinCode");

-- CreateIndex
CREATE UNIQUE INDEX "SportsPlayerProfile_userId_key" ON "SportsPlayerProfile"("userId");

-- CreateIndex
CREATE INDEX "SportsPlayerProfile_pinCode_idx" ON "SportsPlayerProfile"("pinCode");

-- AddForeignKey
ALTER TABLE "SportsLeague" ADD CONSTRAINT "SportsLeague_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsTeam" ADD CONSTRAINT "SportsTeam_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsTeam" ADD CONSTRAINT "SportsTeam_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "SportsLeague"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsPlayerProfile" ADD CONSTRAINT "SportsPlayerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
