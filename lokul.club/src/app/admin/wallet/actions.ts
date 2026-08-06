"use server";

import { getServerUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

async function requireAdmin() {
  const user = await getServerUser();
  if (process.env.NODE_ENV !== "development" && (!user || (user as any)?.role !== "admin")) throw new Error("Unauthorized");
}

export async function releaseWalletEntry(id: string) {
  await requireAdmin();
  if (!E2E) await prisma.walletEntry.update({ where: { id }, data: { status: "completed" } });
  revalidatePath("/admin/wallet");
}

export async function freezeWalletEntry(id: string) {
  await requireAdmin();
  // WalletTxStatus has no "frozen"; mark as failed to block release
  if (!E2E) await prisma.walletEntry.update({ where: { id }, data: { status: "failed" } });
  revalidatePath("/admin/wallet");
}
