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

export async function deactivatePeerRole(id: string) {
  await requireAdmin();
  // PeerRole maps to SocietyAdmin; set revokedAt to deactivate
  if (!E2E) await prisma.societyAdmin.update({ where: { id }, data: { revokedAt: new Date() } });
  revalidatePath("/admin/peer-roles");
}
