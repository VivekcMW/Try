import { prisma } from "@/lib/prisma";
import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

// ─── Encryption (AES-256-GCM) ─────────────────────────────────────────────────
// Key is derived from INTEGRATION_SECRET env var via SHA-256 so any length works.
function getKey(): Buffer {
  const secret =
    process.env.INTEGRATION_SECRET ??
    "lokul-dev-integration-secret-key-change-in-production";
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(plaintext: string): string {
  if (!plaintext) return "";
  const key = getKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptSecret(ciphertext: string): string {
  if (!ciphertext || !ciphertext.includes(":")) return "";
  try {
    const key = getKey();
    const [ivHex, tagHex, encHex] = ciphertext.split(":");
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return Buffer.concat([
      decipher.update(Buffer.from(encHex, "hex")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return "";
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
export type ProviderCategory =
  | "infrastructure"
  | "discovery"
  | "local_context"
  | "identity_kyc"
  | "government_civic"
  | "ai_language";

export type ProviderPriority = "critical" | "high" | "medium";
export type PrdPhase = "v1" | "v2" | "v3";

export interface ProviderMeta {
  provider: string;
  label: string;
  icon: string;
  category: ProviderCategory;
  description: string;
  prdPhase: PrdPhase;
  priority: ProviderPriority;
  docUrl: string;
  hasApiKey: boolean;
  apiKeyLabel: string;
  hasApiSecret: boolean;
  apiSecretLabel: string;
  hasWebhookUrl: boolean;
  webhookUrlLabel: string;
  configHints: string;
}

export interface AdminIntegration extends ProviderMeta {
  id: string;
  enabled: boolean;
  apiKeySet: boolean;
  apiSecretSet: boolean;
  webhookUrl: string | null;
  config: Record<string, unknown>;
  lastTestedAt: Date | null;
  lastTestOk: boolean | null;
  lastTestMsg: string | null;
  updatedAt: Date;
}

// ─── Provider Registry (28 providers) ────────────────────────────────────────
export const PROVIDER_REGISTRY: ProviderMeta[] = [
  // ── Infrastructure ──────────────────────────────────────────────────────────
  {
    provider: "razorpay", label: "Razorpay", icon: "CreditCard",
    category: "infrastructure",
    description: "Payment gateway for UPI, cards, netbanking, escrow, recurring tiffin subscriptions, and peer payouts.",
    prdPhase: "v1", priority: "critical",
    docUrl: "https://razorpay.com/docs/",
    hasApiKey: true, apiKeyLabel: "Key ID",
    hasApiSecret: true, apiSecretLabel: "Key Secret",
    hasWebhookUrl: true, webhookUrlLabel: "Webhook Secret",
    configHints: '{"mode":"test"}',
  },
  {
    provider: "phonepe", label: "PhonePe", icon: "Smartphone",
    category: "infrastructure",
    description: "UPI Autopay secondary gateway, group-buy splits, and PhonePe Switch integration.",
    prdPhase: "v2", priority: "high",
    docUrl: "https://developer.phonepe.com/",
    hasApiKey: true, apiKeyLabel: "Merchant ID",
    hasApiSecret: true, apiSecretLabel: "Salt Key",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{"saltIndex":1,"env":"test"}',
  },
  {
    provider: "msg91", label: "MSG91", icon: "MessageSquare",
    category: "infrastructure",
    description: "Phone OTP login (India DLT-compliant), transactional SMS, and bulk broadcast SMS.",
    prdPhase: "v1", priority: "critical",
    docUrl: "https://docs.msg91.com/",
    hasApiKey: true, apiKeyLabel: "Auth Key",
    hasApiSecret: false, apiSecretLabel: "",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{"senderId":"LOKUL","dltEntityId":""}',
  },
  {
    provider: "firebase", label: "Firebase Phone Auth", icon: "Flame",
    category: "infrastructure",
    description: "OTP login fallback when MSG91 fails. Also used for FCM push on Android.",
    prdPhase: "v1", priority: "high",
    docUrl: "https://firebase.google.com/docs/auth/",
    hasApiKey: true, apiKeyLabel: "Web API Key",
    hasApiSecret: false, apiSecretLabel: "",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{"projectId":"","authDomain":""}',
  },
  {
    provider: "onesignal", label: "OneSignal", icon: "Bell",
    category: "infrastructure",
    description: "iOS + Android push notifications with locality segments, radius targeting, and delivery scheduling.",
    prdPhase: "v1", priority: "critical",
    docUrl: "https://documentation.onesignal.com/",
    hasApiKey: true, apiKeyLabel: "REST API Key",
    hasApiSecret: false, apiSecretLabel: "",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{"appId":""}',
  },
  {
    provider: "ably", label: "Ably", icon: "Zap",
    category: "infrastructure",
    description: "Realtime engine for DM/group chat, SOS live updates, rider tracking, and live feed.",
    prdPhase: "v2", priority: "critical",
    docUrl: "https://ably.com/docs/",
    hasApiKey: true, apiKeyLabel: "API Key",
    hasApiSecret: false, apiSecretLabel: "",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{}',
  },
  {
    provider: "cloudflare_r2", label: "Cloudflare R2 + Stream", icon: "Database",
    category: "infrastructure",
    description: "Egress-free media storage for post photos, videos, business catalogues, and user avatars.",
    prdPhase: "v1", priority: "high",
    docUrl: "https://developers.cloudflare.com/r2/",
    hasApiKey: true, apiKeyLabel: "Access Key ID",
    hasApiSecret: true, apiSecretLabel: "Secret Access Key",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{"bucketName":"lokul-media","accountId":"","endpoint":""}',
  },

  // ── Discovery & Platform Intelligence ───────────────────────────────────────
  {
    provider: "olamaps", label: "Ola Maps", icon: "Map",
    category: "discovery",
    description: "Primary geocoding, ETA, and routing API — cheaper than Google for high-volume Indian queries.",
    prdPhase: "v2", priority: "high",
    docUrl: "https://maps.olacabs.com/api/docs/",
    hasApiKey: true, apiKeyLabel: "API Key",
    hasApiSecret: false, apiSecretLabel: "",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{}',
  },
  {
    provider: "googlemaps", label: "Google Maps Platform", icon: "MapPin",
    category: "discovery",
    description: "Map display, Traffic layer, Places autocomplete, and society boundary overlays.",
    prdPhase: "v1", priority: "high",
    docUrl: "https://developers.google.com/maps/documentation/",
    hasApiKey: true, apiKeyLabel: "API Key",
    hasApiSecret: false, apiSecretLabel: "",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{}',
  },
  {
    provider: "meilisearch", label: "Meilisearch", icon: "Search",
    category: "discovery",
    description: "Full-text search for posts, merchants, classifieds, cooks, and coaches with Indian-language support.",
    prdPhase: "v2", priority: "high",
    docUrl: "https://www.meilisearch.com/docs/",
    hasApiKey: true, apiKeyLabel: "Master Key",
    hasApiSecret: false, apiSecretLabel: "",
    hasWebhookUrl: true, webhookUrlLabel: "Host URL",
    configHints: '{"indexPrefix":"lokul_"}',
  },
  {
    provider: "posthog", label: "PostHog", icon: "BarChart2",
    category: "discovery",
    description: "Event analytics, activation funnels, A/B testing, and D30 retention tracking.",
    prdPhase: "v1", priority: "high",
    docUrl: "https://posthog.com/docs/",
    hasApiKey: true, apiKeyLabel: "Project API Key",
    hasApiSecret: false, apiSecretLabel: "",
    hasWebhookUrl: true, webhookUrlLabel: "Host URL",
    configHints: '{}',
  },
  {
    provider: "sentry", label: "Sentry", icon: "Shield",
    category: "discovery",
    description: "Crash reporting and error monitoring for the web app and React Native mobile app.",
    prdPhase: "v1", priority: "medium",
    docUrl: "https://docs.sentry.io/",
    hasApiKey: false, apiKeyLabel: "",
    hasApiSecret: false, apiSecretLabel: "",
    hasWebhookUrl: true, webhookUrlLabel: "DSN",
    configHints: '{"environment":"production"}',
  },

  // ── Local Context & Safety ───────────────────────────────────────────────────
  {
    provider: "openweather", label: "OpenWeatherMap", icon: "CloudRain",
    category: "local_context",
    description: "Weather and 3-day forecasts in the feed header. Monsoon and heat-wave alerts for elderly residents.",
    prdPhase: "v1", priority: "medium",
    docUrl: "https://openweathermap.org/api/",
    hasApiKey: true, apiKeyLabel: "API Key",
    hasApiSecret: false, apiSecretLabel: "",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{"units":"metric","defaultCity":"Mumbai"}',
  },
  {
    provider: "aqicn", label: "AQICN (Air Quality)", icon: "Wind",
    category: "local_context",
    description: "Air Quality Index widget critical for Delhi, Mumbai, and Bengaluru residents.",
    prdPhase: "v2", priority: "medium",
    docUrl: "https://aqicn.org/api/",
    hasApiKey: true, apiKeyLabel: "API Token",
    hasApiSecret: false, apiSecretLabel: "",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{"alertThreshold":150}',
  },
  {
    provider: "ndma_alerts", label: "NDMA + IMD Alerts", icon: "Siren",
    category: "local_context",
    description: "Earthquake, flood, cyclone, and heat-wave alerts — auto-pushed as emergency Broadcasts to affected pin codes.",
    prdPhase: "v1", priority: "high",
    docUrl: "https://ndma.gov.in/",
    hasApiKey: false, apiKeyLabel: "",
    hasApiSecret: false, apiSecretLabel: "",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{"rssUrl":"https://sachet.ndma.gov.in/cap_public_website/FeedPage","pollIntervalMinutes":30}',
  },
  {
    provider: "newsdata", label: "Newsdata.io", icon: "Newspaper",
    category: "local_context",
    description: "City-filtered local news cards in the resident feed — 1 card per 8 organic posts.",
    prdPhase: "v2", priority: "medium",
    docUrl: "https://newsdata.io/documentation/",
    hasApiKey: true, apiKeyLabel: "API Key",
    hasApiSecret: false, apiSecretLabel: "",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{"country":"in","language":"en,hi","category":"top,domestic"}',
  },

  // ── Identity & KYC ───────────────────────────────────────────────────────────
  {
    provider: "aadhaar", label: "Aadhaar / UIDAI", icon: "IdCard",
    category: "identity_kyc",
    description: "Gold-tier KYC, RWA Admin verification, and Cook/Rider/Coach role unlock via Aadhaar identity.",
    prdPhase: "v2", priority: "high",
    docUrl: "https://uidai.gov.in/",
    hasApiKey: true, apiKeyLabel: "Client ID",
    hasApiSecret: true, apiSecretLabel: "Client Secret",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{"env":"staging"}',
  },
  {
    provider: "digilocker", label: "DigiLocker", icon: "FolderOpen",
    category: "identity_kyc",
    description: "Document verification for rent agreement, electricity bill, and society NOC.",
    prdPhase: "v2", priority: "high",
    docUrl: "https://digilocker.gov.in/",
    hasApiKey: true, apiKeyLabel: "Client ID",
    hasApiSecret: true, apiSecretLabel: "Client Secret",
    hasWebhookUrl: true, webhookUrlLabel: "Redirect URI",
    configHints: '{"env":"sandbox"}',
  },
  {
    provider: "eshram", label: "e-Shram", icon: "HardHat",
    category: "identity_kyc",
    description: "Informal worker identity for migrant companions, MGNREGA workers, and gig worker profiles.",
    prdPhase: "v3", priority: "medium",
    docUrl: "https://eshram.gov.in/",
    hasApiKey: true, apiKeyLabel: "API Key",
    hasApiSecret: false, apiSecretLabel: "",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{}',
  },
  {
    provider: "pan_verify", label: "PAN Verification", icon: "Landmark",
    category: "identity_kyc",
    description: "Business KYC for merchants and coaches earning above ₹2.5 lakh/year.",
    prdPhase: "v2", priority: "medium",
    docUrl: "https://karza.in/",
    hasApiKey: true, apiKeyLabel: "API Key",
    hasApiSecret: false, apiSecretLabel: "",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{"provider":"karza"}',
  },

  // ── Government & Civic ───────────────────────────────────────────────────────
  {
    provider: "agmarknet", label: "Agmarknet (Mandi Prices)", icon: "Wheat",
    category: "government_civic",
    description: "Real-time APMC mandi price comparison and arbitrage intelligence for the Kisan Hub.",
    prdPhase: "v3", priority: "high",
    docUrl: "https://agmarknet.gov.in/",
    hasApiKey: true, apiKeyLabel: "API Key",
    hasApiSecret: false, apiSecretLabel: "",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{"defaultState":"MH"}',
  },
  {
    provider: "pmkisan", label: "PM-KISAN / DBT", icon: "Sprout",
    category: "government_civic",
    description: "Farmer scheme verification, DBT receipt check, and PM-FASAL BIMA enrollment.",
    prdPhase: "v3", priority: "medium",
    docUrl: "https://pmkisan.gov.in/",
    hasApiKey: true, apiKeyLabel: "API Key",
    hasApiSecret: false, apiSecretLabel: "",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{}',
  },
  {
    provider: "ondc", label: "ONDC", icon: "Globe",
    category: "government_civic",
    description: "Open Network for Digital Commerce — auto-list artisan and kirana inventory to all buyer apps.",
    prdPhase: "v3", priority: "high",
    docUrl: "https://ondc.org/",
    hasApiKey: true, apiKeyLabel: "Subscriber ID",
    hasApiSecret: true, apiSecretLabel: "Signing Key",
    hasWebhookUrl: true, webhookUrlLabel: "Subscriber URL",
    configHints: '{"env":"staging"}',
  },
  {
    provider: "nregasoft", label: "NREGAsoft", icon: "Building2",
    category: "government_civic",
    description: "MGNREGA work availability and village economy dashboard for rural users.",
    prdPhase: "v3", priority: "medium",
    docUrl: "https://nrega.nic.in/",
    hasApiKey: false, apiKeyLabel: "",
    hasApiSecret: false, apiSecretLabel: "",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{"defaultState":"MH"}',
  },
  {
    provider: "abdm", label: "ABDM (Ayushman Bharat)", icon: "HeartPulse",
    category: "government_civic",
    description: "Ayushman Bharat Digital Mission — health records linkage for elderly users and clinic bookings.",
    prdPhase: "v3", priority: "medium",
    docUrl: "https://abdm.gov.in/",
    hasApiKey: true, apiKeyLabel: "Client ID",
    hasApiSecret: true, apiSecretLabel: "Client Secret",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{"env":"sandbox"}',
  },

  // ── AI & Language ─────────────────────────────────────────────────────────────
  {
    provider: "bhashini", label: "Bhashini / ULCA", icon: "Languages",
    category: "ai_language",
    description: "Government-backed Indian language AI for 22 languages — translation, transliteration, ASR, TTS.",
    prdPhase: "v3", priority: "high",
    docUrl: "https://bhashini.gov.in/ulca/",
    hasApiKey: true, apiKeyLabel: "User ID",
    hasApiSecret: true, apiSecretLabel: "ULCA API Key",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{"defaultSourceLang":"en","pipeline":"translation"}',
  },
  {
    provider: "openai", label: "OpenAI / Gemini", icon: "Bot",
    category: "ai_language",
    description: "Content moderation assist, crop disease photo detection, AI feed digest, and contextual search.",
    prdPhase: "v3", priority: "medium",
    docUrl: "https://platform.openai.com/docs/",
    hasApiKey: true, apiKeyLabel: "API Key",
    hasApiSecret: false, apiSecretLabel: "",
    hasWebhookUrl: false, webhookUrlLabel: "",
    configHints: '{"model":"gpt-4o","provider":"openai","maxTokens":1000}',
  },
  {
    provider: "utility_webhook", label: "Utility Webhook", icon: "Webhook",
    category: "ai_language",
    description: "Municipal water/power cut schedules via webhook — auto-converts to locality Broadcasts.",
    prdPhase: "v1", priority: "medium",
    docUrl: "",
    hasApiKey: false, apiKeyLabel: "",
    hasApiSecret: false, apiSecretLabel: "",
    hasWebhookUrl: true, webhookUrlLabel: "Inbound Webhook URL",
    configHints: '{"secretToken":"","municipality":""}',
  },
];

// ─── E2E Fixtures ─────────────────────────────────────────────────────────────
type FixtureState = {
  enabled: boolean;
  apiKeySet: boolean;
  apiSecretSet: boolean;
  lastTestOk: boolean | null;
  lastTestedAt: Date | null;
  lastTestMsg: string | null;
};

const E2E_STATES: Partial<Record<string, FixtureState>> = {
  razorpay:    { enabled: true,  apiKeySet: true,  apiSecretSet: true,  lastTestOk: true,  lastTestedAt: new Date("2026-05-27T10:00:00Z"), lastTestMsg: "Connected — test mode" },
  msg91:       { enabled: true,  apiKeySet: true,  apiSecretSet: false, lastTestOk: true,  lastTestedAt: new Date("2026-05-27T10:00:00Z"), lastTestMsg: "Auth key valid" },
  onesignal:   { enabled: false, apiKeySet: false, apiSecretSet: false, lastTestOk: null,  lastTestedAt: null, lastTestMsg: null },
  ably:        { enabled: false, apiKeySet: false, apiSecretSet: false, lastTestOk: null,  lastTestedAt: null, lastTestMsg: null },
  googlemaps:  { enabled: true,  apiKeySet: true,  apiSecretSet: false, lastTestOk: true,  lastTestedAt: new Date("2026-05-26T08:00:00Z"), lastTestMsg: "Geocoding API OK" },
  openweather: { enabled: true,  apiKeySet: true,  apiSecretSet: false, lastTestOk: true,  lastTestedAt: new Date("2026-05-28T06:00:00Z"), lastTestMsg: "Weather API OK" },
  aqicn:       { enabled: true,  apiKeySet: true,  apiSecretSet: false, lastTestOk: true,  lastTestedAt: new Date("2026-05-28T06:00:00Z"), lastTestMsg: "AQI feed OK" },
  ndma_alerts: { enabled: true,  apiKeySet: false, apiSecretSet: false, lastTestOk: true,  lastTestedAt: new Date("2026-05-28T05:00:00Z"), lastTestMsg: "RSS feed reachable" },
  sentry:      { enabled: true,  apiKeySet: false, apiSecretSet: false, lastTestOk: false, lastTestedAt: new Date("2026-05-27T12:00:00Z"), lastTestMsg: "DSN not configured" },
  cloudflare_r2: { enabled: true, apiKeySet: true, apiSecretSet: true, lastTestOk: true,  lastTestedAt: new Date("2026-05-26T10:00:00Z"), lastTestMsg: "Bucket accessible" },
};

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
export const E2E = process.env.E2E_TEST === "1" || noRealDb;

// ─── Merge helper ─────────────────────────────────────────────────────────────
type DbRow = {
  id: string;
  enabled: boolean;
  apiKey: string | null;
  apiSecret: string | null;
  webhookUrl: string | null;
  config: unknown;
  lastTestedAt: Date | null;
  lastTestOk: boolean | null;
  lastTestMsg: string | null;
  updatedAt: Date;
};

function mergeWithRegistry(
  meta: ProviderMeta,
  db: DbRow | null,
  fixture?: FixtureState,
): AdminIntegration {
  return {
    ...meta,
    id: db?.id ?? `fixture-${meta.provider}`,
    enabled:      fixture?.enabled      ?? db?.enabled      ?? false,
    apiKeySet:    fixture?.apiKeySet    ?? !!(db?.apiKey),
    apiSecretSet: fixture?.apiSecretSet ?? !!(db?.apiSecret),
    webhookUrl:   db?.webhookUrl  ?? null,
    config:       (db?.config as Record<string, unknown>) ?? {},
    lastTestedAt: fixture?.lastTestedAt ?? db?.lastTestedAt ?? null,
    lastTestOk:   fixture?.lastTestOk   ?? db?.lastTestOk   ?? null,
    lastTestMsg:  fixture?.lastTestMsg  ?? db?.lastTestMsg  ?? null,
    updatedAt:    db?.updatedAt ?? new Date(),
  };
}

// ─── Public data functions ────────────────────────────────────────────────────
export async function getIntegrations(): Promise<AdminIntegration[]> {
  if (E2E) {
    return PROVIDER_REGISTRY.map((meta) =>
      mergeWithRegistry(meta, null, E2E_STATES[meta.provider])
    );
  }
  const rows = await prisma.integrationConfig.findMany();
  const rowMap = new Map(rows.map((r) => [r.provider, r]));
  return PROVIDER_REGISTRY.map((meta) =>
    mergeWithRegistry(meta, rowMap.get(meta.provider) ?? null)
  );
}

export async function getIntegrationForProvider(
  provider: string,
): Promise<AdminIntegration | null> {
  const meta = PROVIDER_REGISTRY.find((m) => m.provider === provider);
  if (!meta) return null;
  if (E2E) return mergeWithRegistry(meta, null, E2E_STATES[provider]);
  const row = await prisma.integrationConfig.findUnique({ where: { provider } });
  return mergeWithRegistry(meta, row);
}

// Server-only: returns the decrypted API key for use in integration consumer functions
export async function getDecryptedApiKey(provider: string): Promise<string | null> {
  if (E2E) return "test-api-key";
  const row = await prisma.integrationConfig.findUnique({ where: { provider } });
  return row?.apiKey ? decryptSecret(row.apiKey) : null;
}

export type IntegrationsByCategory = Record<ProviderCategory, AdminIntegration[]>;

export function groupByCategory(integrations: AdminIntegration[]): IntegrationsByCategory {
  const groups: IntegrationsByCategory = {
    infrastructure: [],
    discovery: [],
    local_context: [],
    identity_kyc: [],
    government_civic: [],
    ai_language: [],
  };
  for (const integ of integrations) groups[integ.category].push(integ);
  return groups;
}
