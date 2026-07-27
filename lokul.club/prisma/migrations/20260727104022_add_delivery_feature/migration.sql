-- CreateEnum
CREATE TYPE "DeliveryOrderStatus" AS ENUM ('preparing', 'picked', 'delivering', 'delivered', 'cancelled');

-- CreateTable
CREATE TABLE "DeliveryOrder" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "storeId" TEXT,
    "storeName" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "totalPaise" INTEGER NOT NULL,
    "status" "DeliveryOrderStatus" NOT NULL DEFAULT 'preparing',
    "estimatedTime" TEXT,
    "deliveryPartner" TEXT,
    "pinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryOrder_ownerId_idx" ON "DeliveryOrder"("ownerId");

-- CreateIndex
CREATE INDEX "DeliveryOrder_pinCode_idx" ON "DeliveryOrder"("pinCode");

-- AddForeignKey
ALTER TABLE "DeliveryOrder" ADD CONSTRAINT "DeliveryOrder_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
