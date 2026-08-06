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

// Rating has no isFlagged field — admin can only remove the rating
export async function flagRating(id: string) {
  await requireAdmin();
  // No flag field on Rating model; create a report to flag it
  if (!E2E) await prisma.report.create({ data: { reporterId: "admin", targetKind: "rating", targetId: id, reason: "spam" } });
  revalidatePath("/admin/ratings");
}

export async function removeRating(id: string) {
  await requireAdmin();
  if (!E2E) await prisma.rating.delete({ where: { id } });
  revalidatePath("/admin/ratings");
}
