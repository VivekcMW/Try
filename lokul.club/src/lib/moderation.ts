/**
 * Content moderation pipeline — two tiers:
 *
 * Tier 1 — fast, local word-list check (zero latency, no external call)
 * Tier 2 — Azure Content Safety API (async, only when Tier 1 passes)
 *
 * Usage:
 *   const result = await moderateText(userInput);
 *   if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 422 });
 */

export interface ModerationResult {
  ok: boolean;
  reason?: string;
  /** 0–6 severity scale from Azure; undefined when only local check ran */
  severity?: number;
}

// ─── Tier 1: local word list ──────────────────────────────────────────────────
// Keep this list minimal — it is intentionally incomplete.
// Its purpose is to catch obvious slurs without an API call.
const BLOCKED_TERMS = new Set([
  "fuck",
  "shit",
  "bitch",
  "bastard",
  "asshole",
  "motherfucker",
  "cunt",
  "whore",
  "slut",
  "nigger",
  "faggot",
  "chutiya",
  "madarchod",
  "bhenchod",
  "randi",
  "gaandu",
]);

function tier1Check(text: string): ModerationResult {
  const lower  = text.toLowerCase();
  // simple word-boundary check via word tokenisation
  const tokens = lower.split(/\W+/);
  const hit    = tokens.find((t) => BLOCKED_TERMS.has(t));
  if (hit) {
    return { ok: false, reason: "Content contains prohibited language." };
  }
  return { ok: true };
}

// ─── Tier 2: Azure Content Safety ────────────────────────────────────────────

interface AzureCategory {
  category: string;
  severity: number; // 0 | 2 | 4 | 6
}

interface AzureResponse {
  categoriesAnalysis: AzureCategory[];
}

const AZURE_ENDPOINT = process.env.AZURE_CONTENT_SAFETY_ENDPOINT;
const AZURE_KEY      = process.env.AZURE_CONTENT_SAFETY_KEY;
// Reject content if any category reaches this severity or above (0–6 scale)
const SEVERITY_THRESHOLD = 4;

async function tier2Check(text: string): Promise<ModerationResult> {
  if (!AZURE_ENDPOINT || !AZURE_KEY) {
    // Azure not configured — skip Tier 2
    return { ok: true };
  }

  const url = `${AZURE_ENDPOINT}/contentsafety/text:analyze?api-version=2023-10-01`;
  let data: AzureResponse;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": AZURE_KEY,
      },
      body: JSON.stringify({ text: text.slice(0, 1_000) }),
    });
    if (!res.ok) return { ok: true }; // fail open on Azure errors
    data = (await res.json()) as AzureResponse;
  } catch {
    return { ok: true }; // network error — fail open
  }

  const worstCategory = data.categoriesAnalysis.reduce(
    (max, c) => (c.severity > max.severity ? c : max),
    { category: "none", severity: 0 }
  );

  if (worstCategory.severity >= SEVERITY_THRESHOLD) {
    return {
      ok: false,
      reason: `Content flagged for ${worstCategory.category.toLowerCase()} (severity ${worstCategory.severity}).`,
      severity: worstCategory.severity,
    };
  }

  return { ok: true, severity: worstCategory.severity };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Run both moderation tiers against `text`.
 * Short-circuits after Tier 1 if blocked so Azure is never called unnecessarily.
 */
export async function moderateText(text: string): Promise<ModerationResult> {
  if (!text || text.trim().length === 0) return { ok: true };

  const t1 = tier1Check(text);
  if (!t1.ok) return t1;

  return tier2Check(text);
}

/**
 * Convenience: moderate multiple fields at once.
 * Returns first failure or { ok: true }.
 */
export async function moderateFields(
  fields: Record<string, string | undefined>
): Promise<ModerationResult> {
  for (const [, value] of Object.entries(fields)) {
    if (!value) continue;
    // eslint-disable-next-line no-await-in-loop
    const result = await moderateText(value);
    if (!result.ok) return result;
  }
  return { ok: true };
}
