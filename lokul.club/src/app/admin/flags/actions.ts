"use server";

import { getServerUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { FeatureFlagScope } from "@/generated/prisma/client";
import { logAdminAction } from "@/lib/admin-audit";

const VALID_SCOPES: FeatureFlagScope[] = ["global", "society", "city", "pincode", "user"];

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

async function requireAdmin() {
  const user = await getServerUser();
  if (process.env.NODE_ENV !== "development" && (!user || (user as any)?.role !== "admin")) throw new Error("Unauthorized");
}

export async function toggleFlag(flagId: string, enabled: boolean) {
  await requireAdmin();
  let flag: { key: string; scope: string; scopeValue: string | null } | null = null;
  if (!E2E) {
    flag = await prisma.featureFlag.update({
      where: { id: flagId }, data: { enabled },
      select: { key: true, scope: true, scopeValue: true },
    });
  }
  await logAdminAction(enabled ? "flag.enabled" : "flag.disabled", "feature_flag", flagId, {
    key: flag?.key, scope: flag?.scope, scopeValue: flag?.scopeValue,
  });
  revalidatePath("/admin/flags");
}

export async function createFlag(formData: FormData) {
  await requireAdmin();
  const key         = (formData.get("key") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const scopeInput  = (formData.get("scope") as string) || "global";
  const scopeValue  = (formData.get("scopeValue") as string)?.trim() || null;
  const enabled     = formData.get("enabled") === "on";

  if (!key) throw new Error("Key is required");
  if (!/^[a-z0-9_]+$/.test(key)) throw new Error("Key must be lowercase letters, numbers, and underscores only");
  if (!VALID_SCOPES.includes(scopeInput as FeatureFlagScope)) throw new Error("Invalid scope");
  const scope = scopeInput as FeatureFlagScope;
  if (scope !== "global" && !scopeValue) throw new Error("Scope value is required for non-global scopes");

  if (!E2E) {
    await prisma.featureFlag.create({
      data: { key, description: description || null, scope, scopeValue, enabled },
    });
  }
  await logAdminAction("flag.created", "feature_flag", key, { key, scope, scopeValue, enabled });
  revalidatePath("/admin/flags");
}
