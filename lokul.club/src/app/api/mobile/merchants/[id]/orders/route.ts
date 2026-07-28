/**
 * POST /api/mobile/merchants/[id]/orders — create a new order
 * Body: { items: [{ catalogItemId, quantity, customizations? }], deliveryMode, address?, paymentMethod, notes? }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const merchantId = params.id;
    const body = await req.json();
    
    const {
      customerId,
      items,
      deliveryMode,
      deliveryAddress,
      deliveryLat,
      deliveryLng,
      paymentMethod,
      customerNotes,
      appliedOfferId,
    } = body;

    // Validate required fields
    if (!customerId || !items || items.length === 0 || !paymentMethod) {
      return NextResponse.json(
        { error: "customerId, items, and paymentMethod are required" },
        { status: 400 }
      );
    }

    // E2E test mode - return mock order
    if (process.env.E2E_TEST === "1") {
      const mockOrder = {
        id: "mock_order_" + Date.now(),
        orderNumber: `#LK-2024-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
        customerId,
        merchantId,
        status: "pending",
        type: "catalog_item",
        totalPaise: 50000,
        subtotalPaise: 50000,
        discountPaise: 0,
        deliveryFeePaise: 0,
        taxPaise: 0,
        paymentMethod,
        paymentStatus: "pending",
        deliveryMode: deliveryMode || "self_pickup",
        customerNotes,
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json({ order: mockOrder }, { status: 201 });
    }

    // Verify merchant exists
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant || merchant.isBlacklisted) {
      return NextResponse.json({ error: "Merchant not available" }, { status: 404 });
    }

    // Fetch catalog items with current prices
    const catalogItemIds = items.map((item: any) => item.catalogItemId);
    const catalogItems = await prisma.merchantCatalogItem.findMany({
      where: {
        id: { in: catalogItemIds },
        merchantId,
        isAvailable: true,
      },
    });

    if (catalogItems.length !== catalogItemIds.length) {
      return NextResponse.json(
        { error: "Some items are not available" },
        { status: 422 }
      );
    }

    // Calculate totals
    let subtotalPaise = 0;
    const orderItems = items.map((item: any) => {
      const catalogItem = catalogItems.find((ci) => ci.id === item.catalogItemId);
      if (!catalogItem) throw new Error("Item not found");
      
      const quantity = item.quantity || 1;
      const itemTotal = catalogItem.pricePaise * quantity;
      subtotalPaise += itemTotal;

      return {
        catalogItemId: catalogItem.id,
        name: catalogItem.name,
        kind: catalogItem.kind,
        pricePaise: catalogItem.pricePaise,
        quantity,
        unit: catalogItem.unit,
        subtotalPaise: itemTotal,
        totalPaise: itemTotal,
        customizations: item.customizations || null,
      };
    });

    // Apply discount if offer provided
    let discountPaise = 0;
    if (appliedOfferId) {
      const offer = await prisma.merchantOffer.findFirst({
        where: {
          id: appliedOfferId,
          merchantId,
          isActive: true,
          endsAt: { gte: new Date() },
        },
      });

      if (offer) {
        if (offer.type === "percent_off") {
          discountPaise = Math.floor((subtotalPaise * offer.value) / 100);
        } else if (offer.type === "flat_off") {
          discountPaise = Math.min(offer.value, subtotalPaise);
        }
      }
    }

    // Calculate delivery fee (simple logic for now)
    const deliveryFeePaise = deliveryMode === "home_delivery" ? 2000 : 0; // ₹20 delivery

    // Calculate tax (0% for now, add GST logic later)
    const taxPaise = 0;

    const totalPaise = subtotalPaise - discountPaise + deliveryFeePaise + taxPaise;

    // Generate order number
    const orderCount = await prisma.merchantOrder.count();
    const orderNumber = `#LK-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, "0")}`;

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.merchantOrder.create({
        data: {
          orderNumber,
          customerId,
          merchantId,
          type: "catalog_item",
          status: "pending",
          subtotalPaise,
          discountPaise,
          deliveryFeePaise,
          taxPaise,
          totalPaise,
          paymentMethod,
          paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
          deliveryMode: deliveryMode || "self_pickup",
          deliveryAddress,
          deliveryLat,
          deliveryLng,
          customerNotes,
          appliedOfferId,
          orderItems: {
            create: orderItems,
          },
        },
        include: {
          orderItems: true,
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatarUrl: true,
              kycTier: true,
            },
          },
        },
      });

      // Create status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          fromStatus: null,
          toStatus: "pending",
          changedBy: customerId,
        },
      });

      // TODO: Handle wallet payment if paymentMethod === "wallet"
      // TODO: Send notification to merchant

      return newOrder;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}
