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

export async function banUser(id: string) {
  await requireAdmin();
  if (!E2E) await prisma.user.update({ where: { id }, data: { status: "banned" } });
  revalidatePath("/admin/users");
}

export async function suspendUser(id: string) {
  await requireAdmin();
  if (!E2E) await prisma.user.update({ where: { id }, data: { status: "suspended" } });
  revalidatePath("/admin/users");
}

export async function unsuspendUser(id: string) {
  await requireAdmin();
  if (!E2E) await prisma.user.update({ where: { id }, data: { status: "active" } });
  revalidatePath("/admin/users");
}
