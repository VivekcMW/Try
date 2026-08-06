"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") throw new Error("Unauthorized");
}

export async function cancelEvent(id: string) {
  await requireAdmin();
  // Events are Post records with type="event"; mark as removed/hidden via status
  if (!E2E) await prisma.post.update({ where: { id }, data: { status: "hidden" } });
  revalidatePath("/admin/events");
}

export async function removeEvent(id: string) {
  await requireAdmin();
  if (!E2E) await prisma.post.update({ where: { id }, data: { status: "removed" } });
  revalidatePath("/admin/events");
}
