/**
 * GET /api/mobile/flags  — fetch enabled feature flags for a user / context
 *
 * Returns a flat key→boolean map so mobile can gate features with:
 *   if (flags['new_wallet_ui']) { ... }
 *
 * Query params:
 *   userId   — used for user-scoped flags
 *   pinCode  — used for pincode-scoped flags
 *   city     — used for city-scoped flags
 *   societyId — used for society-scoped flags
 *
 * Resolution order (most specific wins):
 *   user > society > pincode > city > global
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FeatureFlagScope } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId    = searchParams.get("userId");
  const pinCode   = searchParams.get("pinCode");
  const city      = searchParams.get("city");
  const societyId = searchParams.get("societyId");

  try {
    // Fetch all flags that match any relevant scope
    const flags = await prisma.featureFlag.findMany({
      where: {
        OR: [
          { scope: FeatureFlagScope.global },
          ...(userId    ? [{ scope: FeatureFlagScope.user,    scopeValue: userId    }] : []),
          ...(pinCode   ? [{ scope: FeatureFlagScope.pincode, scopeValue: pinCode   }] : []),
          ...(city      ? [{ scope: FeatureFlagScope.city,    scopeValue: city      }] : []),
          ...(societyId ? [{ scope: FeatureFlagScope.society, scopeValue: societyId }] : []),
        ],
      },
      select: { key: true, enabled: true, scope: true },
      orderBy: { scope: "asc" }, // global first, overridden by specific
    });

    // Scope priority: global(0) < city(1) < pincode(2) < society(3) < user(4)
    const scopePriority: Record<string, number> = {
      global: 0, city: 1, pincode: 2, society: 3, user: 4,
    };

    const resolved: Record<string, boolean> = {};
    const priority: Record<string, number>  = {};

    for (const flag of flags) {
      const p = scopePriority[flag.scope] ?? 0;
      if (priority[flag.key] === undefined || p > priority[flag.key]) {
        resolved[flag.key] = flag.enabled;
        priority[flag.key] = p;
      }
    }

    return NextResponse.json({ flags: resolved });
  } catch {
    return NextResponse.json({ error: "Failed to load feature flags" }, { status: 500 });
  }
}
