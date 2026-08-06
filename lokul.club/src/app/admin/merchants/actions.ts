"use server";

import { getServerUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

async function requireAdmin() {
  const user = await getServerUser();
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") throw new Error("Unauthorized");
}

export async function approveMerchant(merchantId: string) {
  await requireAdmin();
  if (!E2E) await prisma.merchant.update({ where: { id: merchantId }, data: { status: "active" } });
  revalidatePath("/admin/merchants");
}

export async function rejectMerchant(merchantId: string) {
  await requireAdmin();
  if (!E2E) await prisma.merchant.update({ where: { id: merchantId }, data: { status: "rejected" } });
  revalidatePath("/admin/merchants");
}

export async function suspendMerchant(merchantId: string) {
  await requireAdmin();
  if (!E2E) await prisma.merchant.update({ where: { id: merchantId }, data: { status: "suspended" } });
  revalidatePath("/admin/merchants");
}

export async function toggleEndorsement(merchantId: string, endorsed: boolean) {
  await requireAdmin();
  if (!E2E) await prisma.merchant.update({ where: { id: merchantId }, data: { isEndorsed: endorsed } });
  revalidatePath("/admin/merchants");
}
