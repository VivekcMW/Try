-- CreateEnum
CREATE TYPE "MerchantOrderType" AS ENUM ('catalog_item', 'service_booking', 'bulk_order');

-- CreateTable
CREATE TABLE "MerchantOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "type" "MerchantOrderType" NOT NULL DEFAULT 'catalog_item',
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "subtotalPaise" INTEGER NOT NULL,
    "discountPaise" INTEGER NOT NULL DEFAULT 0,
    "deliveryFeePaise" INTEGER NOT NULL DEFAULT 0,
    "taxPaise" INTEGER NOT NULL DEFAULT 0,
    "totalPaise" INTEGER NOT NULL,
    "paymentMethod" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paidAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "estimatedReadyAt" TIMESTAMP(3),
    "actualReadyAt" TIMESTAMP(3),
    "deliveryMode" TEXT,
    "deliveryAddress" TEXT,
    "deliveryLat" DOUBLE PRECISION,
    "deliveryLng" DOUBLE PRECISION,
    "customerNotes" TEXT,
    "merchantNotes" TEXT,
    "cancellationReason" TEXT,
    "rejectionReason" TEXT,
    "appliedOfferId" TEXT,
    "qrToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "inProgressAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "catalogItemId" TEXT,
    "name" TEXT NOT NULL,
    "kind" "CatalogItemKind" NOT NULL,
    "pricePaise" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT,
    "subtotalPaise" INTEGER NOT NULL,
    "discountPaise" INTEGER NOT NULL DEFAULT 0,
    "totalPaise" INTEGER NOT NULL,
    "customizations" JSONB,

    CONSTRAINT "MerchantOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fromStatus" "OrderStatus",
    "toStatus" "OrderStatus" NOT NULL,
    "changedBy" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderRating" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "response" TEXT,
    "respondedAt" TIMESTAMP(3),
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MerchantOrder_orderNumber_key" ON "MerchantOrder"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantOrder_qrToken_key" ON "MerchantOrder"("qrToken");

-- CreateIndex
CREATE INDEX "MerchantOrder_merchantId_status_idx" ON "MerchantOrder"("merchantId", "status");

-- CreateIndex
CREATE INDEX "MerchantOrder_customerId_idx" ON "MerchantOrder"("customerId");

-- CreateIndex
CREATE INDEX "MerchantOrder_orderNumber_idx" ON "MerchantOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "MerchantOrder_createdAt_idx" ON "MerchantOrder"("createdAt");

-- CreateIndex
CREATE INDEX "MerchantOrder_status_merchantId_idx" ON "MerchantOrder"("status", "merchantId");

-- CreateIndex
CREATE INDEX "MerchantOrderItem_orderId_idx" ON "MerchantOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderRating_orderId_key" ON "OrderRating"("orderId");

-- CreateIndex
CREATE INDEX "OrderRating_merchantId_isVisible_idx" ON "OrderRating"("merchantId", "isVisible");

-- AddForeignKey
ALTER TABLE "MerchantOrder" ADD CONSTRAINT "MerchantOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantOrder" ADD CONSTRAINT "MerchantOrder_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantOrderItem" ADD CONSTRAINT "MerchantOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "MerchantOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantOrderItem" ADD CONSTRAINT "MerchantOrderItem_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "MerchantCatalogItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "MerchantOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderRating" ADD CONSTRAINT "OrderRating_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "MerchantOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
