/**
 * POST /api/mobile/merchants/[id]/orders — create a new order
 * Body: { items: [{ catalogItemId, quantity, customizations? }], deliveryMode, address?, paymentMethod, notes? }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPush } from "@/lib/push";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: merchantId } = await params;
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
      select: {
        id: true,
        name: true,
        ownerId: true,
        isBlacklisted: true,
        acceptingOrders: true,
        businessHoursStart: true,
        businessHoursEnd: true,
        closedReason: true,
        closedUntil: true,
        estimatedDeliveryMins: true,
        minimumOrderPaise: true,
        freeDeliveryAbovePaise: true,
        owner: { select: { phone: true } },
      },
    });

    if (!merchant || merchant.isBlacklisted) {
      return NextResponse.json({ error: "Merchant not available" }, { status: 404 });
    }

    // Check if merchant is accepting orders
    if (merchant.acceptingOrders === false) {
      return NextResponse.json(
        {
          error: "This merchant is not currently accepting orders",
          code: "MERCHANT_CLOSED",
        },
        { status: 400 }
      );
    }

    // Check business hours (IST = UTC+5:30)
    if (merchant.businessHoursStart && merchant.businessHoursEnd) {
      const now = new Date();
      const istOffset = 5.5 * 60;
      const istMinutes = (now.getUTCHours() * 60 + now.getUTCMinutes() + istOffset) % (24 * 60);
      const istHHMM = `${String(Math.floor(istMinutes / 60)).padStart(2, "0")}:${String(istMinutes % 60).padStart(2, "0")}`;
      const { businessHoursStart, businessHoursEnd } = merchant;
      if (istHHMM < businessHoursStart || istHHMM >= businessHoursEnd) {
        return NextResponse.json(
          {
            error: `This merchant is closed. Open from ${businessHoursStart} to ${businessHoursEnd}`,
            code: "OUTSIDE_HOURS",
          },
          { status: 400 }
        );
      }
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

    // Check stock availability
    for (const item of items) {
      const catalogItem = catalogItems.find((ci) => ci.id === item.catalogItemId);
      if (catalogItem && catalogItem.stockCount === 0) {
        return NextResponse.json(
          { error: "Item out of stock", itemName: catalogItem.name },
          { status: 400 }
        );
      }
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

    // Minimum order check
    if (merchant.minimumOrderPaise && subtotalPaise < merchant.minimumOrderPaise) {
      return NextResponse.json(
        { error: `Minimum order amount is ₹${(merchant.minimumOrderPaise / 100).toFixed(0)}` },
        { status: 400 }
      );
    }

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
    const computedDeliveryFee = deliveryMode === "home_delivery" ? 2000 : 0; // ₹20 delivery
    const deliveryFeePaise =
      merchant.freeDeliveryAbovePaise && subtotalPaise >= merchant.freeDeliveryAbovePaise
        ? 0
        : computedDeliveryFee;

    // Calculate tax (0% for now, add GST logic later)
    const taxPaise = 0;

    const totalPaise = subtotalPaise - discountPaise + deliveryFeePaise + taxPaise;

    // Validate wallet balance if paying via wallet
    if (paymentMethod === "wallet") {
      const customer = await prisma.user.findUnique({
        where: { id: customerId },
        select: { walletBalancePaise: true },
      });

      if (!customer || customer.walletBalancePaise < totalPaise) {
        return NextResponse.json(
          { 
            error: "Insufficient wallet balance",
            required: totalPaise,
            available: customer?.walletBalancePaise || 0,
          },
          { status: 422 }
        );
      }
    }

    // Generate order number
    const orderCount = await prisma.merchantOrder.count();
    const orderNumber = `#LK-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, "0")}`;

    // Calculate estimated ready time
    const estimatedReadyAt = merchant.estimatedDeliveryMins
      ? new Date(Date.now() + merchant.estimatedDeliveryMins * 60 * 1000)
      : null;

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
          paymentStatus: paymentMethod === "wallet" ? "paid" : "pending",
          deliveryMode: deliveryMode || "self_pickup",
          deliveryAddress,
          deliveryLat,
          deliveryLng,
          customerNotes,
          appliedOfferId,
          estimatedReadyAt,
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

      // Decrement stock for items with finite stock
      for (const orderItem of orderItems) {
        const catalogItem = catalogItems.find((ci) => ci.id === orderItem.catalogItemId);
        if (catalogItem && catalogItem.stockCount !== null) {
          await tx.merchantCatalogItem.update({
            where: { id: orderItem.catalogItemId },
            data: { stockCount: { decrement: orderItem.quantity } },
          });
        }
      }

      // Handle wallet payment
      if (paymentMethod === "wallet") {
        // Deduct from customer wallet
        await tx.user.update({
          where: { id: customerId },
          data: {
            walletBalancePaise: { decrement: totalPaise },
          },
        });

        // Create wallet transaction entry
        await tx.walletEntry.create({
          data: {
            userId: customerId,
            type: "spend",
            amountPaise: -totalPaise,
            description: `Order ${orderNumber} at ${merchant.name}`,
            status: "completed",
            reference: newOrder.id,
            party: merchant.name,
          },
        });

        // Hold funds for merchant (will be released on completion)
        await tx.walletEntry.create({
          data: {
            userId: merchant.ownerId,
            type: "hold",
            amountPaise: totalPaise,
            description: `Order ${orderNumber} - held until completion`,
            status: "pending",
            reference: newOrder.id,
            party: newOrder.customer?.name || "Customer",
          },
        });
      }

      return newOrder;
    });

    // Send push notification to merchant owner about new order (after transaction)
    await sendPush(
      { userId: merchant.ownerId },
      {
        title: "New Order Received!",
        body: `${order.customer?.name || "A customer"} placed an order for ₹${(totalPaise / 100).toFixed(2)}`,
        data: { type: "merchant_order_new", orderId: order.id },
        priority: "high",
      }
    );

    // SMS fallback — optional, non-blocking
    try {
      const { sendSms } = await import("@/lib/sms");
      const phone = merchant.owner?.phone;
      if (phone && process.env.MSG91_AUTH_KEY) {
        await sendSms(
          phone,
          `New order ${order.orderNumber} received on Lokul! Open the app to confirm.`
        );
      }
    } catch {
      // SMS is optional fallback — don't fail the request
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}
