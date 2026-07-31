import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  Building2,
  Calendar,
  ClipboardList,
  MapPin,
  Megaphone,
  Search,
  ShoppingBag,
  Star,
  Tag,
} from "lucide-react";
import { AdSlot } from "@/components/ads/AdSlot";

/* ────────────────────────────────────────────────────────── */
/* Types                                                      */
/* ────────────────────────────────────────────────────────── */

interface MerchantItem {
  id: string;
  name: string;
  category: string;
  city: string;
  ratingAvg: number | null;
  ratingCount: number;
  isEndorsed: boolean;
}

interface PostItem {
  id: string;
  type: string;
  body: string;
  createdAt: string;
  imageUrl?: string | null;
}

interface Neighborhood {
  pinCode: string;
  city: string;
  areaName: string;
  stats: { businesses: number; residents: number; eventsThisWeek: number; safetyAlerts: number };
  businesses: MerchantItem[];
  recentPosts: PostItem[];
  safetyAlerts: PostItem[];
}

/* ────────────────────────────────────────────────────────── */
/* Fetch helper                                               */
/* ────────────────────────────────────────────────────────── */

async function fetchNeighborhood(pincode: string): Promise<Neighborhood | null> {
  try {
    const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/web/neighborhood/${pincode}`, { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    return d.neighborhood ?? null;
  } catch {
    return null;
  }
}

/* ────────────────────────────────────────────────────────── */
/* SEO metadata                                               */
/* ────────────────────────────────────────────────────────── */

export async function generateMetadata(
  { params }: { params: Promise<{ pincode: string }> }
): Promise<Metadata> {
  const { pincode } = await params;
  const hood = await fetchNeighborhood(pincode);
  const area = hood?.areaName ?? pincode;
  const city = hood?.city ?? "";
  const areaTitle = city ? `${area}, ${city}` : area;
  return {
    title: `${areaTitle} — Local Community | Lokul`,
    description: `Discover local businesses, community updates, and safety alerts in ${area}. Join your neighborhood on Lokul — India's hyperlocal community app.`,
    openGraph: {
      title: `${area} Community on Lokul`,
      description: `${hood?.stats.businesses ?? 0} businesses · ${hood?.stats.residents ?? 0} residents · ${hood?.stats.eventsThisWeek ?? 0} events this week`,
      siteName: "Lokul",
    },
  };
}

/* ────────────────────────────────────────────────────────── */
/* Helpers                                                    */
/* ────────────────────────────────────────────────────────── */

const CAT_LABELS: Record<string, string> = {
  grocery: "Grocery",   food: "Food",       fitness: "Fitness",
  beauty: "Beauty",     tutoring: "Tutor",  cleaning: "Cleaning",
  plumbing: "Plumbing", electric: "Electrician", pet_care: "Pet Care", delivery: "Delivery",
};

/* ── Deterministic pincode → gradient (same pin always same colours) ── */
const HERO_GRADIENTS = [
  "linear-gradient(135deg, #1a3a5c 0%, #0d6e6e 100%)",
  "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)",
  "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
  "linear-gradient(135deg, #16213e 0%, #0f3460 60%, #533483 100%)",
  "linear-gradient(135deg, #1d4350 0%, #a43931 100%)",
  "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
  "linear-gradient(135deg, #373b44 0%, #4286f4 100%)",
  "linear-gradient(135deg, #005c97 0%, #363795 100%)",
];

function heroGradient(pincode: string): string {
  const hash = pincode.split("").reduce((acc, ch) => acc + (ch.codePointAt(0) ?? 0), 0);
  return HERO_GRADIENTS[hash % HERO_GRADIENTS.length] ?? HERO_GRADIENTS[0];
}

const POST_META: Record<string, { label: string; bg: string; color: string; gradient: string; Icon: LucideIcon }> = {
  event:      { label: "Event",        bg: "#d1fae5", color: "#065f46", gradient: "linear-gradient(135deg,#064e3b 0%,#059669 100%)", Icon: Calendar },
  update:     { label: "Update",       bg: "#e0f2fe", color: "#075985", gradient: "linear-gradient(135deg,#0c4a6e 0%,#0284c7 100%)", Icon: Megaphone },
  lost:       { label: "Lost & Found", bg: "#fef3c7", color: "#92400e", gradient: "linear-gradient(135deg,#78350f 0%,#f59e0b 100%)", Icon: Search },
  sell:       { label: "For Sale",     bg: "#ede9fe", color: "#5b21b6", gradient: "linear-gradient(135deg,#3b0764 0%,#7c3aed 100%)", Icon: Tag },
  rwa_notice: { label: "Notice",       bg: "#f1f5f9", color: "#334155", gradient: "linear-gradient(135deg,#1e293b 0%,#475569 100%)", Icon: ClipboardList },
};

function relativeTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 60_000;
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default async function NeighborhoodPage(
  { params }: Readonly<{ params: Promise<{ pincode: string }> }>
) {
  const { pincode } = await params;
  const hood = await fetchNeighborhood(pincode);

  if (!hood) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <p className="text-lg font-semibold" style={{ color: "var(--color-heading)" }}>Neighborhood not found</p>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Pin code <strong>{pincode}</strong> may not be active yet.
          </p>
          <Link href="/" className="mt-3 inline-block text-sm hover:underline" style={{ color: "var(--color-brand-600)" }}>
            ← Back to Lokul
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>

      {/* Header */}
      <header
        className="sticky top-0 z-20 border-b"
        style={{ borderColor: "var(--color-border)", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))" }}
            >L</span>
            <span className="text-sm font-bold" style={{ color: "var(--color-heading)" }}>
              lokul<span style={{ color: "var(--color-brand-600)" }}>.club</span>
            </span>
          </Link>
          <Link
            href="/signup"
            className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--color-brand-600)" }}
          >
            Join {hood.areaName}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-8 sm:py-8 sm:space-y-10">

        {/* Hero */}
        <div
          className="relative overflow-hidden rounded-md px-6 py-10 text-center sm:px-12 sm:py-14"
          style={{ background: heroGradient(hood.pinCode) }}
        >
          {/* dot-grid texture overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1.5px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative z-10 space-y-4">
            <div
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
              style={{ borderColor: "rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.75)" }}
            >
              <MapPin size={11} />
              {hood.city} · {hood.pinCode}
            </div>
            <h1
              className="text-3xl font-bold sm:text-5xl"
              style={{ color: "white", textShadow: "0 2px 12px rgba(0,0,0,0.25)" }}
            >
              {hood.areaName}
            </h1>
            <p className="mx-auto max-w-md text-sm sm:text-base" style={{ color: "rgba(255,255,255,0.78)" }}>
              Your hyperlocal community — businesses, neighbors, and everything within 200m.
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md px-5 py-3 text-sm"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <span className="flex items-center gap-1.5" style={{ color: "var(--color-heading)" }}>
            <Building2 size={15} style={{ color: "var(--color-brand-600)" }} />
            <strong>{hood.stats.businesses}</strong>
            <span style={{ color: "var(--color-text-secondary)" }}>Local Businesses</span>
          </span>
          <span style={{ color: "var(--color-border)" }}>·</span>
          <span className="flex items-center gap-1.5" style={{ color: "var(--color-heading)" }}>
            <Calendar size={15} style={{ color: "var(--color-success)" }} />
            <strong>{hood.stats.eventsThisWeek}</strong>
            <span style={{ color: "var(--color-text-secondary)" }}>Events This Week</span>
          </span>
        </div>

        {/* Businesses */}
        {hood.businesses.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold" style={{ color: "var(--color-heading)" }}>
                <ShoppingBag size={17} style={{ color: "var(--color-brand-600)" }} /> Local Businesses
              </h2>
              <Link href={`/web/marketplace?pinCode=${hood.pinCode}`} className="text-sm hover:underline" style={{ color: "var(--color-brand-600)" }}>
                View all →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* Slot 1 — Featured business ad (pinned first) */}
              <AdSlot placement="feed_post" pin={hood.pinCode} variant="card" />
              {hood.businesses.map((biz) => (
                <Link
                  key={biz.id}
                  href={`/b/${biz.id}`}
                  className="flex items-center gap-3 rounded-md border p-4 transition-shadow hover:shadow-md"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md font-bold text-white text-lg"
                    style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))" }}
                  >
                    {biz.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="truncate text-sm font-semibold" style={{ color: "var(--color-heading)" }}>
                        {biz.name}
                      </p>
                      {biz.isEndorsed && <Award size={12} style={{ color: "var(--color-accent-600)", flexShrink: 0 }} />}
                    </div>
                    <span
                      className="inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                      style={{ background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}
                    >
                      {CAT_LABELS[biz.category] ?? biz.category}
                    </span>
                    {biz.ratingAvg !== null && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                        <Star size={10} fill="var(--color-accent-500)" style={{ color: "var(--color-accent-500)" }} />
                        {biz.ratingAvg.toFixed(1)} ({biz.ratingCount})
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Community feed */}
        {hood.recentPosts.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold" style={{ color: "var(--color-heading)" }}>
              <Tag size={17} style={{ color: "var(--color-brand-600)" }} /> Community Updates
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {hood.recentPosts.map((post, idx) => {
                const meta = POST_META[post.type] ?? { label: post.type, bg: "#f1f5f9", color: "#334155", gradient: "linear-gradient(135deg,#1e293b,#475569)", Icon: MapPin };
                return (
                  <Fragment key={post.id}>
                    {/* Slot 3 — Native feed ad after 3rd post (row 1 full), spans full width */}
                    {idx === 3 && (
                      <div className="sm:col-span-2 lg:col-span-3">
                        <AdSlot placement="feed_post" pin={hood.pinCode} variant="native" />
                      </div>
                    )}
                    <div
                      className="flex flex-col overflow-hidden rounded-md border"
                      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                    >
                      {/* Media zone — fixed height, always present */}
                      <div className="relative h-32 w-full shrink-0 overflow-hidden">
                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl}
                            alt=""
                            aria-hidden="true"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className="flex h-full w-full items-center justify-center"
                            style={{ background: meta.gradient }}
                          >
                            <meta.Icon size={40} strokeWidth={1.5} color="white" aria-hidden="true" />
                          </div>
                        )}
                        {/* Type badge pinned bottom-left over the media */}
                        <span
                          className="absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          {meta.label}
                        </span>
                      </div>
                      {/* Body */}
                      <div className="flex flex-col gap-1.5 p-3">
                        <p className="text-sm font-medium leading-snug line-clamp-3" style={{ color: "var(--color-heading)" }}>
                          {post.body}
                        </p>
                        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                          {relativeTime(post.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Fragment>
                );
              })}
            </div>
          </section>
        )}

        {/* Slot 2 — Banner ad between feed and join CTA */}
        <AdSlot placement="banner" pin={hood.pinCode} variant="banner" />

        <div
          className="rounded-md p-8 text-center"
          style={{
            background: "linear-gradient(135deg, var(--color-brand-600), var(--color-brand-800))",
            color: "white",
          }}
        >
          <h2 className="text-xl font-bold" style={{ color: "white" }}>You live here. Join the conversation.</h2>
          <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
            Connect with {hood.stats.residents > 0 ? hood.stats.residents.toLocaleString() : "your"} neighbors,
            discover local businesses, and stay safe — all within 200m.
          </p>
          <Link
            href="/signup"
            className="mt-5 inline-block rounded-md px-6 py-3 text-sm font-bold"
            style={{ background: "white", color: "var(--color-brand-700)" }}
          >
            Join {hood.areaName} for free →
          </Link>
        </div>

        {/* SEO breadcrumb */}
        <nav className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          <Link href="/" className="hover:underline">Lokul</Link>
          {" / "}
          <Link href={`/n/${hood.pinCode}`} className="hover:underline">{hood.city}</Link>
          {" / "}{hood.areaName}
        </nav>
      </main>
    </div>
  );
}
