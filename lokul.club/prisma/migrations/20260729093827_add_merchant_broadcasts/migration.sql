-- CreateTable
CREATE TABLE "MerchantBroadcast" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentTo" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchantBroadcast_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MerchantBroadcast_merchantId_idx" ON "MerchantBroadcast"("merchantId");

-- CreateIndex
CREATE INDEX "MerchantBroadcast_createdAt_idx" ON "MerchantBroadcast"("createdAt");

-- AddForeignKey
ALTER TABLE "MerchantBroadcast" ADD CONSTRAINT "MerchantBroadcast_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
