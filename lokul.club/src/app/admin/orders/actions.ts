"use server";

import { getServerUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

async function requireAdmin() {
  const user = await getServerUser();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") throw new Error("Unauthorized");
}

export async function cancelOrder(id: string) {
  await requireAdmin();
  if (!E2E) await prisma.order.update({ where: { id }, data: { status: "cancelled", cancelledAt: new Date(), cancelReason: "Admin cancellation" } });
  revalidatePath("/admin/orders");
}

export async function releaseEscrow(id: string) {
  await requireAdmin();
  if (!E2E) {
    await prisma.$transaction([
      prisma.order.update({ where: { id }, data: { status: "completed" } }),
      prisma.walletEntry.updateMany({ where: { reference: id, status: "pending" }, data: { status: "completed" } }),
    ]);
  }
  revalidatePath("/admin/orders");
}

export async function refundOrder(id: string) {
  await requireAdmin();
  if (!E2E) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (order) {
      await prisma.$transaction([
        prisma.order.update({ where: { id }, data: { status: "cancelled", cancelReason: "Admin refund" } }),
        prisma.walletEntry.create({
          data: {
            userId: order.buyerId,
            type: "refund",
            amountPaise: order.pricePaise,
            description: `Refund for order ${id}`,
            status: "completed",
            reference: id,
          },
        }),
      ]);
    }
  }
  revalidatePath("/admin/orders");
}
