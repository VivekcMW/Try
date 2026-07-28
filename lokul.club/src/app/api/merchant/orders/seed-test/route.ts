/**
 * POST /api/merchant/orders/seed-test — create test orders for development
 * Only works when E2E_TEST=1 or NODE_ENV=development
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/enums";

export async function POST(req: NextRequest) {
  try {
    // Only allow in development or E2E test mode
    if (process.env.NODE_ENV === "production" && process.env.E2E_TEST !== "1") {
      return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
    }

    const { merchant, userId } = await requireMerchant();

    // Get or create a test customer
    let customer = await prisma.user.findFirst({
      where: { phone: "+919999999999" },
    });

    if (!customer) {
      customer = await prisma.user.create({
        data: {
          phone: "+919999999999",
          name: "Test Customer",
          kycTier: "silver",
          role: "resident",
        },
      });
    }

    // Get catalog items
    const catalogItems = await prisma.merchantCatalogItem.findMany({
      where: { merchantId: merchant.id, isAvailable: true },
      take: 3,
    });

    if (catalogItems.length === 0) {
      return NextResponse.json(
        { error: "No catalog items found. Add some items first." },
        { status: 422 }
      );
    }

    // Create 5 test orders with different statuses
    const statuses: OrderStatus[] = [OrderStatus.pending, OrderStatus.confirmed, OrderStatus.in_progress, OrderStatus.completed, OrderStatus.cancelled];
    const orders = [];

    for (let i = 0; i < 5; i++) {
      const status = statuses[i];
      const orderNumber = `#LK-${new Date().getFullYear()}-TEST${String(1000 + i).slice(-4)}`;
      
      // Select 1-3 random items
      const numItems = Math.floor(Math.random() * 3) + 1;
      const selectedItems = catalogItems.slice(0, numItems);
      
      let subtotalPaise = 0;
      const orderItems = selectedItems.map((item) => {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const itemTotal = item.pricePaise * quantity;
        subtotalPaise += itemTotal;
        
        return {
          catalogItemId: item.id,
          name: item.name,
          kind: item.kind,
          pricePaise: item.pricePaise,
          quantity,
          unit: item.unit,
          subtotalPaise: itemTotal,
          totalPaise: itemTotal,
        };
      });

      const deliveryFeePaise = Math.random() > 0.5 ? 2000 : 0;
      const totalPaise = subtotalPaise + deliveryFeePaise;

      const order = await prisma.merchantOrder.create({
        data: {
          orderNumber,
          customerId: customer.id,
          merchantId: merchant.id,
          type: "catalog_item",
          status,
          subtotalPaise,
          discountPaise: 0,
          deliveryFeePaise,
          taxPaise: 0,
          totalPaise,
          paymentMethod: Math.random() > 0.5 ? "cod" : "upi",
          paymentStatus: status === "completed" ? "paid" : "pending",
          deliveryMode: deliveryFeePaise > 0 ? "home_delivery" : "self_pickup",
          deliveryAddress: deliveryFeePaise > 0 ? "Tower A, Flat 305, Green Park Society" : null,
          customerNotes: i % 2 === 0 ? "Please deliver before 6 PM" : null,
          confirmedAt: status !== "pending" ? new Date() : null,
          inProgressAt: ["in_progress", "completed"].includes(status) ? new Date() : null,
          completedAt: status === "completed" ? new Date() : null,
          cancelledAt: status === "cancelled" ? new Date() : null,
          rejectionReason: status === "cancelled" ? "Out of stock" : null,
          orderItems: {
            create: orderItems,
          },
          statusHistory: {
            create: [
              {
                fromStatus: null,
                toStatus: OrderStatus.pending,
                changedBy: customer.id,
              },
              ...(status !== OrderStatus.pending
                ? [
                    {
                      fromStatus: OrderStatus.pending,
                      toStatus: status === OrderStatus.cancelled ? OrderStatus.cancelled : OrderStatus.confirmed,
                      changedBy: userId,
                    },
                  ]
                : []),
              ...([OrderStatus.in_progress as OrderStatus, OrderStatus.completed as OrderStatus].includes(status)
                ? [
                    {
                      fromStatus: OrderStatus.confirmed,
                      toStatus: OrderStatus.in_progress,
                      changedBy: userId,
                    },
                  ]
                : []),
              ...(status === OrderStatus.completed
                ? [
                    {
                      fromStatus: OrderStatus.in_progress,
                      toStatus: OrderStatus.completed,
                      changedBy: userId,
                    },
                  ]
                : []),
            ],
          },
        },
        include: {
          orderItems: true,
          customer: true,
        },
      });

      orders.push(order);
    }

    return NextResponse.json({
      message: "Created 5 test orders",
      orders: orders.map((o) => ({ id: o.id, orderNumber: o.orderNumber, status: o.status })),
    });
  } catch (error: any) {
    if (error.message === "Not authenticated" || error.message?.includes("suspended")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to seed test orders:", error);
    return NextResponse.json(
      { error: "Failed to seed test orders", details: error.message },
      { status: 500 }
    );
  }
}
