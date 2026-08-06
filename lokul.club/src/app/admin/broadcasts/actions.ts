"use server";

import { getServerUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

async function requireAdmin() {
  const user = await getServerUser();
  if (process.env.NODE_ENV !== "development" && (!user || (user as any)?.role !== "admin")) throw new Error("Unauthorized");
}

export async function createBroadcast(formData: FormData) {
  await requireAdmin();
  const title       = formData.get("title") as string;
  const body        = formData.get("body") as string;
  const targetScope = formData.get("targetScope") as string;

  if (!title?.trim() || !body?.trim()) throw new Error("Title and body are required");

  if (!E2E) {
    await prisma.broadcast.create({
      data: { title, body, targetScope: targetScope || "all", sentById: "system", status: "draft" },
    });
  }
  revalidatePath("/admin/broadcasts");
}

export async function sendBroadcast(broadcastId: string) {
  await requireAdmin();
  if (!E2E) {
    await prisma.broadcast.update({
      where: { id: broadcastId },
      data: { status: "sent", sentAt: new Date() },
    });
  }
  revalidatePath("/admin/broadcasts");
}

export async function cancelBroadcast(broadcastId: string) {
  await requireAdmin();
  if (!E2E) {
    await prisma.broadcast.update({
      where: { id: broadcastId },
      data: { status: "cancelled" },
    });
  }
  revalidatePath("/admin/broadcasts");
}
