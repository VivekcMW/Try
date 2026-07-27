-- CreateEnum
CREATE TYPE "ParkingVehicleType" AS ENUM ('car', 'bike');

-- CreateEnum
CREATE TYPE "ParkingVehicleStatus" AS ENUM ('occupied', 'vacant', 'reserved');

-- CreateEnum
CREATE TYPE "ParkingVisitorStatus" AS ENUM ('pending', 'approved', 'rejected', 'active', 'completed');

-- CreateTable
CREATE TABLE "ParkingVehicle" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "slotNumber" TEXT NOT NULL,
    "type" "ParkingVehicleType" NOT NULL,
    "location" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "status" "ParkingVehicleStatus" NOT NULL DEFAULT 'occupied',
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParkingVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkingVisitorRequest" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "requestedSlot" TEXT NOT NULL,
    "requestedTime" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "notes" TEXT,
    "status" "ParkingVisitorStatus" NOT NULL DEFAULT 'pending',
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParkingVisitorRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ParkingVehicle_ownerId_idx" ON "ParkingVehicle"("ownerId");

-- CreateIndex
CREATE INDEX "ParkingVehicle_pinCode_idx" ON "ParkingVehicle"("pinCode");

-- CreateIndex
CREATE INDEX "ParkingVisitorRequest_requesterId_idx" ON "ParkingVisitorRequest"("requesterId");

-- CreateIndex
CREATE INDEX "ParkingVisitorRequest_pinCode_idx" ON "ParkingVisitorRequest"("pinCode");

-- AddForeignKey
ALTER TABLE "ParkingVehicle" ADD CONSTRAINT "ParkingVehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingVisitorRequest" ADD CONSTRAINT "ParkingVisitorRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
