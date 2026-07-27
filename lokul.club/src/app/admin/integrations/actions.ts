"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  encryptSecret,
  decryptSecret,
  PROVIDER_REGISTRY,
  E2E,
} from "@/lib/admin-integrations";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

// ─── Save (upsert) an integration's config ───────────────────────────────────
export async function saveIntegration(formData: FormData) {
  await requireAdmin();

  const provider   = formData.get("provider") as string;
  const enabled    = formData.get("enabled") === "true";
  const rawKey     = (formData.get("apiKey")    as string | null) ?? "";
  const rawSecret  = (formData.get("apiSecret") as string | null) ?? "";
  const webhookUrl = (formData.get("webhookUrl") as string | null) || null;
  const rawConfig  = (formData.get("config")    as string | null) ?? "{}";

  let config: Record<string, unknown> = {};
  try { config = JSON.parse(rawConfig); } catch { /* keep empty */ }

  if (!E2E) {
    // Prisma JSON fields require InputJsonValue — cast via unknown
    const configJson = config as unknown as import("@/generated/prisma/client").Prisma.InputJsonValue;

    const updateFields: Record<string, unknown> = { enabled, webhookUrl, config: configJson };

    // Only update encrypted fields when the user provides a new non-masked value
    if (rawKey && rawKey !== "••••••••") {
      updateFields.apiKey = encryptSecret(rawKey);
    }
    if (rawSecret && rawSecret !== "••••••••") {
      updateFields.apiSecret = encryptSecret(rawSecret);
    }

    await prisma.integrationConfig.upsert({
      where:  { provider },
      create: {
        provider,
        enabled,
        webhookUrl,
        config: configJson,
        ...(updateFields.apiKey    ? { apiKey:    updateFields.apiKey    as string } : {}),
        ...(updateFields.apiSecret ? { apiSecret: updateFields.apiSecret as string } : {}),
      },
      update: updateFields as Parameters<typeof prisma.integrationConfig.update>[0]["data"],
    });
  }

  revalidatePath("/admin/integrations");
  revalidatePath("/admin/dashboard");
}

// ─── Toggle enabled state ────────────────────────────────────────────────────
export async function toggleIntegration(provider: string, enabled: boolean) {
  await requireAdmin();

  if (!E2E) {
    await prisma.integrationConfig.upsert({
      where:  { provider },
      create: { provider, enabled },
      update: { enabled },
    });
  }

  revalidatePath("/admin/integrations");
  revalidatePath("/admin/dashboard");
}

// ─── Test a live connection ───────────────────────────────────────────────────
export async function testIntegration(
  provider: string,
): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();

  if (E2E) {
    await new Promise((r) => setTimeout(r, 400));
    const goodOnes = ["razorpay", "msg91", "googlemaps", "openweather", "aqicn", "ndma_alerts", "cloudflare_r2"];
    return goodOnes.includes(provider)
      ? { ok: true,  message: "Connection successful (E2E mode)" }
      : { ok: false, message: "Not configured (E2E mode)" };
  }

  const row = await prisma.integrationConfig.findUnique({ where: { provider } });
  if (!row) return { ok: false, message: "Integration not configured" };

  const key = row.apiKey ? decryptSecret(row.apiKey) : null;

  try {
    let result: { ok: boolean; message: string };

    switch (provider) {
      case "openweather":
        result = await testOpenWeather(key);
        break;
      case "aqicn":
        result = await testAqicn(key);
        break;
      case "newsdata":
        result = await testNewsdata(key);
        break;
      case "ndma_alerts": {
        const cfg = row.config as Record<string, string> | null;
        result = await testNdma(cfg?.rssUrl);
        break;
      }
      case "meilisearch": {
        result = await testMeilisearch(row.webhookUrl, key);
        break;
      }
      default: {
        const meta = PROVIDER_REGISTRY.find((m) => m.provider === provider);
        const needsKey = meta?.hasApiKey ?? false;
        result = needsKey && !key
          ? { ok: false, message: "API key not configured" }
          : { ok: true,  message: "API key saved ✓" };
      }
    }

    await prisma.integrationConfig.update({
      where: { provider },
      data:  { lastTestedAt: new Date(), lastTestOk: result.ok, lastTestMsg: result.message },
    });

    revalidatePath("/admin/integrations");
    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await prisma.integrationConfig.update({
      where: { provider },
      data:  { lastTestedAt: new Date(), lastTestOk: false, lastTestMsg: msg },
    });
    revalidatePath("/admin/integrations");
    return { ok: false, message: msg };
  }
}

// ─── Live test helpers ────────────────────────────────────────────────────────
async function testOpenWeather(key: string | null) {
  if (!key) return { ok: false, message: "API key not set" };
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=Mumbai&appid=${key}&units=metric`,
    { signal: AbortSignal.timeout(6000) },
  );
  if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
  const data = await res.json() as { main?: { temp?: number } };
  return { ok: true, message: `Connected — Mumbai: ${data.main?.temp ?? "?"}°C` };
}

async function testAqicn(key: string | null) {
  if (!key) return { ok: false, message: "Token not set" };
  const res = await fetch(`https://api.waqi.info/feed/mumbai/?token=${key}`, {
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
  const data = await res.json() as { status: string; data?: { aqi?: number } };
  return data.status === "ok"
    ? { ok: true,  message: `Mumbai AQI: ${data.data?.aqi ?? "?"}` }
    : { ok: false, message: `Status: ${data.status}` };
}

async function testNewsdata(key: string | null) {
  if (!key) return { ok: false, message: "API key not set" };
  const res = await fetch(
    `https://newsdata.io/api/1/news?country=in&language=en&apikey=${key}&size=1`,
    { signal: AbortSignal.timeout(7000) },
  );
  return res.ok
    ? { ok: true,  message: "Newsdata feed accessible" }
    : { ok: false, message: `HTTP ${res.status}` };
}

async function testNdma(rssUrl?: string) {
  const url = rssUrl ?? "https://sachet.ndma.gov.in/cap_public_website/FeedPage";
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  return res.ok
    ? { ok: true,  message: "NDMA RSS feed reachable" }
    : { ok: false, message: `HTTP ${res.status}` };
}

async function testMeilisearch(host: string | null, key: string | null) {
  if (!host) return { ok: false, message: "Host URL not set" };
  const res = await fetch(`${host.replace(/\/$/, "")}/health`, {
    headers: key ? { Authorization: `Bearer ${key}` } : {},
    signal: AbortSignal.timeout(5000),
  });
  return res.ok
    ? { ok: true,  message: "Meilisearch health OK" }
    : { ok: false, message: `HTTP ${res.status}` };
}
