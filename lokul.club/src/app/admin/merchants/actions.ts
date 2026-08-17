"use server";

import { getServerUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getProfileFromCategory } from "@/lib/merchant-profiles";
import { logAdminAction } from "@/lib/admin-audit";

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

async function requireAdmin() {
  const user = await getServerUser();
  if (process.env.NODE_ENV !== "development" && (!user || (user as any)?.role !== "admin")) throw new Error("Unauthorized");
}

export async function approveMerchant(merchantId: string) {
  await requireAdmin();
  if (!E2E) await prisma.merchant.update({ where: { id: merchantId }, data: { status: "active" } });
  await logAdminAction("merchant.approved", "merchant", merchantId);
  revalidatePath("/admin/merchants");
}

export async function rejectMerchant(merchantId: string) {
  await requireAdmin();
  if (!E2E) await prisma.merchant.update({ where: { id: merchantId }, data: { status: "rejected" } });
  await logAdminAction("merchant.rejected", "merchant", merchantId);
  revalidatePath("/admin/merchants");
}

export async function suspendMerchant(merchantId: string) {
  await requireAdmin();
  if (!E2E) await prisma.merchant.update({ where: { id: merchantId }, data: { status: "suspended" } });
  await logAdminAction("merchant.suspended", "merchant", merchantId);
  revalidatePath("/admin/merchants");
}

export async function toggleEndorsement(merchantId: string, endorsed: boolean) {
  await requireAdmin();
  if (!E2E) await prisma.merchant.update({ where: { id: merchantId }, data: { isEndorsed: endorsed } });
  await logAdminAction(endorsed ? "merchant.endorsed" : "merchant.endorsement_removed", "merchant", merchantId);
  revalidatePath("/admin/merchants");
}

/** Fixes a merchant's stored workflowProfile to match what its category expects. */
export async function syncMerchantWorkflow(merchantId: string, category: string) {
  await requireAdmin();
  const expected = getProfileFromCategory(category);
  if (!E2E) await prisma.merchant.update({ where: { id: merchantId }, data: { workflowProfile: expected } });
  await logAdminAction("merchant.workflow_synced", "merchant", merchantId, { category, syncedTo: expected });
  revalidatePath("/admin/merchants");
}
