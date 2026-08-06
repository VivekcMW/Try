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

export async function bulkApproveKyc(ids: string[]) {
  await requireAdmin();
  if (!E2E) await prisma.kycDocument.updateMany({ where: { id: { in: ids } }, data: { status: "approved" } });
  revalidatePath("/admin/kyc");
}

export async function rejectKycDocument(id: string) {
  await requireAdmin();
  if (!E2E) await prisma.kycDocument.update({ where: { id }, data: { status: "rejected" } });
  revalidatePath("/admin/kyc");
}

export async function approveKycDocument(id: string) {
  await requireAdmin();
  if (!E2E) await prisma.kycDocument.update({ where: { id }, data: { status: "approved" } });
  revalidatePath("/admin/kyc");
}
