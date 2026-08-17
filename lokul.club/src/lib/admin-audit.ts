import "server-only";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/supabase/server";

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

/**
 * Best-effort admin audit trail write. Never throws — a logging failure must
 * not block the admin action it's recording. Skipped in E2E fixture mode to
 * match the rest of the admin write actions.
 */
export async function logAdminAction(
  action: string,
  targetKind?: string,
  targetId?: string,
  metadata?: Record<string, unknown>
) {
  if (E2E) return;
  try {
    const user = await getServerUser();
    // The local-dev admin session isn't backed by a real User row, so it
    // can't satisfy AuditLog.actorId's foreign key — leave it null and note
    // the identity in metadata instead.
    const isRealUser = !!user?.id && user.id !== "local-admin";
    await prisma.auditLog.create({
      data: {
        actorId: isRealUser ? user!.id : null,
        actorKind: isRealUser ? "user" : "system",
        action,
        targetKind: targetKind ?? null,
        targetId: targetId ?? null,
        metadata: {
          ...(metadata ?? {}),
          ...(user?.email ? { actorEmail: user.email } : {}),
        },
      },
    });
  } catch (error) {
    console.error(`[admin-audit] Failed to log action "${action}":`, error);
  }
}
