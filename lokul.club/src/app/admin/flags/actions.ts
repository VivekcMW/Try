"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") throw new Error("Unauthorized");
}

export async function toggleFlag(flagId: string, enabled: boolean) {
  await requireAdmin();
  if (!E2E) await prisma.featureFlag.update({ where: { id: flagId }, data: { enabled } });
  revalidatePath("/admin/flags");
}
