import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { summarizeNewsArticle } from "@/lib/news-summarizer";

/**
 * POST /api/cron/news-refresh
 *
 * Invoked by Vercel Cron (every 30 min).  Fetches news from Newsdata.io and
 * NDMA RSS for the top active pin codes, summarises each article via AI, and
 * upserts results into LocalityNews.
 *
 * Protected by a shared secret: Authorization: Bearer <CRON_SECRET>
 */

export const maxDuration = 60; // Vercel Pro allows up to 300s for cron routes

// How many unique pin codes to refresh per run (keep API costs bounded)
const PIN_CODES_PER_RUN = 20;

interface NewsdataArticle {
  article_id: string;
  title: string;
  description: string | null;
  content: string | null;
  link: string;
  source_name: string;
  pubDate: string;
  category: string[] | null;
  keywords: string[] | null;
}

interface NewsdataResponse {
  status: string;
  results: NewsdataArticle[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function mapCategory(
  cats: string[] | null,
): "civic" | "safety" | "weather" | "health" | "transport" | "local" {
  const c = (cats ?? []).map((s) => s.toLowerCase());
  if (c.some((s) => s.includes("crime") || s.includes("safety") || s.includes("police"))) return "safety";
  if (c.some((s) => s.includes("weather") || s.includes("rain") || s.includes("flood") || s.includes("cyclone"))) return "weather";
  if (c.some((s) => s.includes("health") || s.includes("medical") || s.includes("hospital"))) return "health";
  if (c.some((s) => s.includes("transport") || s.includes("traffic") || s.includes("road") || s.includes("metro"))) return "transport";
  if (c.some((s) => s.includes("civic") || s.includes("municipal") || s.includes("water") || s.includes("power"))) return "civic";
  return "local";
}

function isAlertCategory(category: string): boolean {
  return category === "safety" || category === "weather";
}

function expiresAt(isAlert: boolean): Date {
  const ms = isAlert ? 6 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  return new Date(Date.now() + ms);
}

// ── Newsdata.io fetch ─────────────────────────────────────────────────────────

async function fetchNewsdata(city: string): Promise<NewsdataArticle[]> {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) return [];

  const url = new URL("https://newsdata.io/api/1/news");
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("country", "in");
  url.searchParams.set("language", "en,hi");
  url.searchParams.set("q", city);
  url.searchParams.set("size", "10");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 0 } });
    if (!res.ok) return [];
    const data = (await res.json()) as NewsdataResponse;
    return data.results ?? [];
  } catch {
    return [];
  }
}

// ── NDMA RSS fetch ────────────────────────────────────────────────────────────

interface NdmaAlert {
  title: string;
  description: string;
  link: string;
  pubDate: string;
}

async function fetchNdmaAlerts(): Promise<NdmaAlert[]> {
  const rssUrl =
    process.env.NDMA_RSS_URL ??
    "https://sachet.ndma.gov.in/cap_public_website/FeedPage";

  try {
    const res = await fetch(rssUrl, { next: { revalidate: 0 } });
    if (!res.ok) return [];

    const xml = await res.text();

    // Minimal RSS parser — extract <item> blocks
    const items: NdmaAlert[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let m: RegExpExecArray | null;

    while ((m = itemRegex.exec(xml)) !== null) {
      const block = m[1];
      const get = (tag: string) => {
        const r = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
        return (r.exec(block)?.[1] ?? "").replace(/<!\[CDATA\[|\]\]>/g, "").trim();
      };
      items.push({
        title:       get("title"),
        description: get("description"),
        link:        get("link"),
        pubDate:     get("pubDate"),
      });
    }
    return items.slice(0, 5);
  } catch {
    return [];
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // Auth check
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Discover top active pin codes from UserLocality table
    const topPins = await prisma.userLocality.groupBy({
      by: ["pinCode", "city"],
      _count: { _all: true },
      orderBy: { _count: { pinCode: "desc" } },
      take: PIN_CODES_PER_RUN,
    });

    // If no users yet (dev / seeded env) fall back to a default pin
    const pins =
      topPins.length > 0
        ? topPins
        : [{ pinCode: "400001", city: "Mumbai", _count: { _all: 0 } }];

    let upsertCount = 0;

    // Fetch NDMA alerts once (global, not per-pin)
    const ndmaAlerts = await fetchNdmaAlerts();

    for (const { pinCode, city } of pins) {
      // ── Newsdata articles for this city ────────────────────────────────
      const articles = await fetchNewsdata(city);

      for (const article of articles) {
        if (!article.link || !article.title) continue;

        const category  = mapCategory(article.category);
        const alert     = isAlertCategory(category);
        const bodyText  = article.content ?? article.description ?? "";
        const locality  = `${city} ${pinCode}`;

        const { headline, summary } = await summarizeNewsArticle({
          title:    article.title,
          body:     bodyText,
          locality,
          lang:     "en",
        });

        await prisma.localityNews.upsert({
          where:  { sourceUrl: article.link },
          create: {
            pinCode,
            city,
            headline,
            summary,
            sourceUrl:   article.link,
            sourceName:  article.source_name ?? "Newsdata.io",
            category:    category as never,
            lang:        "en",
            isAlert:     alert,
            publishedAt: article.pubDate ? new Date(article.pubDate) : new Date(),
            expiresAt:   expiresAt(alert),
          },
          update: {
            headline,
            summary,
            expiresAt: expiresAt(alert),
          },
        });

        upsertCount++;
      }

      // ── NDMA alerts — broadcast to ALL pin codes ───────────────────────
      for (const alert of ndmaAlerts) {
        if (!alert.link || !alert.title) continue;

        // Use pin-scoped URL as unique key so each pin gets its own row
        const scopedUrl = `${alert.link}#${pinCode}`;

        const { headline, summary } = await summarizeNewsArticle({
          title:    alert.title,
          body:     alert.description,
          locality: `${city} ${pinCode}`,
          lang:     "en",
        });

        await prisma.localityNews.upsert({
          where:  { sourceUrl: scopedUrl },
          create: {
            pinCode,
            city,
            headline,
            summary,
            sourceUrl:  scopedUrl,
            sourceName: "NDMA / IMD",
            category:   "safety" as never,
            lang:       "en",
            isAlert:    true,
            publishedAt: alert.pubDate ? new Date(alert.pubDate) : new Date(),
            expiresAt:  expiresAt(true),
          },
          update: {
            headline,
            summary,
            expiresAt: expiresAt(true),
          },
        });

        upsertCount++;
      }
    }

    // Purge expired rows (keep DB tidy)
    const { count: deleted } = await prisma.localityNews.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    return NextResponse.json({ ok: true, upserted: upsertCount, deleted });
  } catch (err) {
    console.error("[cron/news-refresh]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
