"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin") throw new Error("Unauthorized");
  return session;
}

export async function takeModAction(formData: FormData) {
  await requireAdmin();

  const reportId      = formData.get("reportId") as string;
  const action        = formData.get("action") as string;
  const targetKind    = formData.get("targetKind") as string;
  const targetId      = formData.get("targetId") as string;
  const internalNotes = (formData.get("internalNotes") as string) || undefined;

  if (E2E) { revalidatePath("/admin/moderation"); return; }

  const status = ["dismiss"].includes(action) ? "dismissed" : "resolved";

  await prisma.$transaction([
    prisma.report.update({ where: { id: reportId }, data: { status: status as never, resolvedAt: new Date() } }),
    prisma.modAction.create({
      data: {
        actorId: "system",         // replace with session user id when User model is seeded
        targetKind,
        targetId,
        action:  action as never,
        reasonCategory: "admin_review",
        internalNotes,
        reportId,
      },
    }),
  ]);

  revalidatePath("/admin/moderation");
}
