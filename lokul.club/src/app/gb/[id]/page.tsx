import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, MapPin, Share2, ShoppingBag, Users } from "lucide-react";

/* ────────────────────────────────────────────────────────── */
/* Types                                                      */
/* ────────────────────────────────────────────────────────── */

interface GroupBuyData {
  id: string;
  title: string;
  description: string;
  category: string;
  pricePaise: number;
  marketPricePaise: number | null;
  unit: string;
  minQty: number;
  targetQty: number;
  currentQty: number;
  closesAt: string;
  pinCode: string;
  city: string;
  status: string;
  organizer: { name: string; avatar: string | null };
  slots: { id: string; name: string; qty: number }[];
}

/* ────────────────────────────────────────────────────────── */
/* ISR fetch                                                  */
/* ────────────────────────────────────────────────────────── */

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

async function fetchGB(id: string): Promise<GroupBuyData | null> {
  try {
    const res = await fetch(`${BASE}/api/web/group-buys/${id}`, {
      next: { revalidate: 30 }, // fresh every 30 s (slots change frequently)
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/* ────────────────────────────────────────────────────────── */
/* Metadata                                                   */
/* ────────────────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const gb = await fetchGB(id);
  if (!gb) return { title: "Group Buy | Lokul" };
  const savings = gb.marketPricePaise ? Math.round((gb.marketPricePaise - gb.pricePaise) / 100) : null;
  return {
    title: `${gb.title} — Group Buy on Lokul`,
    description: `Join ${gb.currentQty}/${gb.targetQty} neighbours buying together in ${gb.city || gb.pinCode}. Save${savings ? " ₹".concat(String(savings)) : ""} vs market price.`,
    openGraph: {
      title: `${gb.title} — Group Buy on Lokul`,
      description: `${gb.currentQty} of ${gb.targetQty} slots filled. Closes soon!`,
      url: `https://lokul.club/gb/${id}`,
      siteName: "Lokul",
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}

/* ────────────────────────────────────────────────────────── */
/* Helpers                                                    */
/* ────────────────────────────────────────────────────────── */

function fmt(paise: number) {
  return `₹${(paise / 100).toFixed(0)}`;
}

function countdown(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "Closed";
  const h = Math.floor(diff / 3_600_000);
  if (h < 24) return `${h}h left`;
  return `${Math.floor(h / 24)}d left`;
}

/* ────────────────────────────────────────────────────────── */
/* Page                                                       */
/* ────────────────────────────────────────────────────────── */

export default async function GroupBuyPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const gb = await fetchGB(id);
  if (!gb) notFound();

  const pct = Math.min(100, Math.round((gb.currentQty / gb.targetQty) * 100));
  const spotsLeft = gb.targetQty - gb.currentQty;
  const savings = gb.marketPricePaise ? gb.marketPricePaise - gb.pricePaise : null;
  const savingsPct = savings && gb.marketPricePaise
    ? Math.round((savings / gb.marketPricePaise) * 100)
    : null;
  const isClosed = gb.status !== "open";
  const timeLeft = countdown(gb.closesAt);

  const waText = encodeURIComponent(
    `🛒 Join our group buy on Lokul!\n${gb.title} — only ${fmt(gb.pricePaise)}/${gb.unit}\n${spotsLeft} spots left!\nhttps://lokul.club/gb/${id}`
  );

  return (
    <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>

      {/* Minimal nav */}
      <header
        className="sticky top-0 z-20 border-b"
        style={{ borderColor: "var(--color-border)", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)" }}
      >
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))" }}
            >L</span>
            <span className="text-sm font-bold hidden sm:block" style={{ color: "var(--color-heading)" }}>Lokul</span>
          </Link>
          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white"
            style={{ background: "#25D366" }}
          >
            <Share2 size={13} /> Share on WhatsApp
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">

        {/* Hero card */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          {/* Category pill */}
          <div
            className="px-4 pt-4 pb-0 flex items-center gap-2"
          >
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}
            >
              {gb.category}
            </span>
            {isClosed && (
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{ background: "var(--color-gray-100)", color: "var(--color-gray-600)" }}
              >
                Closed
              </span>
            )}
          </div>

          <div className="p-4 space-y-3">
            <h1 className="text-xl font-bold leading-tight" style={{ color: "var(--color-heading)" }}>
              {gb.title}
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{gb.description}</p>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold" style={{ color: "var(--color-brand-600)" }}>
                {fmt(gb.pricePaise)}
              </span>
              <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>/ {gb.unit}</span>
              {gb.marketPricePaise !== null && (
                <span className="text-sm line-through" style={{ color: "var(--color-text-secondary)" }}>
                  {fmt(gb.marketPricePaise)}
                </span>
              )}
              {savingsPct !== null && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{ background: "#dcfce7", color: "#166534" }}
                >
                  {savingsPct}% off
                </span>
              )}
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {gb.city || gb.pinCode}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {timeLeft}
              </span>
              <span className="flex items-center gap-1">
                <Users size={12} />
                {gb.currentQty} joined
              </span>
              <span className="flex items-center gap-1">
                <ShoppingBag size={12} />
                Min. {gb.minQty} {gb.unit}
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div
          className="rounded-2xl border p-4 space-y-3"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold" style={{ color: "var(--color-heading)" }}>
              Group progress
            </span>
            <span className="text-sm font-semibold" style={{ color: "var(--color-brand-600)" }}>
              {gb.currentQty} / {gb.targetQty} units
            </span>
          </div>
          <div
            className="h-4 w-full overflow-hidden rounded-full"
            style={{ background: "var(--color-gray-200)" }}
          >
            <div
              className="h-4 rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct >= 80
                  ? "var(--color-success)"
                  : "linear-gradient(90deg, var(--color-brand-500), var(--color-brand-600))",
              }}
            />
          </div>
          <div className="flex justify-between text-xs" style={{ color: "var(--color-text-secondary)" }}>
            <span>{pct}% filled</span>
            {!isClosed && <span className="font-semibold" style={{ color: spotsLeft <= 5 ? "var(--color-danger)" : undefined }}>
              {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left
            </span>}
          </div>
        </div>

        {/* Who's joined */}
        {gb.slots.length > 0 && (
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
          >
            <div
              className="flex items-center gap-2 border-b px-4 py-3"
              style={{ borderColor: "var(--color-border)" }}
            >
              <Users size={15} style={{ color: "var(--color-brand-600)" }} />
              <span className="text-sm font-bold" style={{ color: "var(--color-heading)" }}>
                Who&apos;s in ({gb.slots.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2 p-4">
              {gb.slots.map((s) => (
                <span
                  key={s.id}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ background: "var(--color-brand-600)" }}
                  >
                    {s.name.charAt(0)}
                  </span>
                  {s.name} × {s.qty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Organizer */}
        <div
          className="flex items-center gap-3 rounded-2xl border p-4"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white"
            style={{ background: "var(--color-brand-600)" }}
          >
            {gb.organizer.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--color-heading)" }}>
              {gb.organizer.name}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Group organiser</p>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3 pb-8">
          {isClosed ? (
            <div
              className="flex w-full items-center justify-center rounded-2xl py-4 text-base font-semibold"
              style={{ background: "var(--color-gray-100)", color: "var(--color-gray-500)" }}
            >
              This group buy is closed
            </div>
          ) : (
            <Link
              href={`/signup?next=join-gb&gbId=${gb.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white shadow-lg transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))" }}
            >
              <ShoppingBag size={18} />
              Join this Group Buy
            </Link>
          )}

          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white"
            style={{ background: "#25D366" }}
          >
            <Share2 size={16} />
            Invite neighbours via WhatsApp
          </a>

          <Link
            href={`/n/${gb.pinCode}`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border py-3.5 text-sm font-semibold transition hover:opacity-80"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-brand-600)",
            }}
          >
            See more deals in {gb.city || gb.pinCode} →
          </Link>
        </div>

        {/* SEO breadcrumb */}
        <nav className="text-xs" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1" style={{ color: "var(--color-text-secondary)" }}>
            <li><Link href="/" className="hover:underline" style={{ color: "var(--color-brand-600)" }}>Lokul</Link></li>
            <li aria-hidden>/</li>
            <li><Link href={`/n/${gb.pinCode}`} className="hover:underline" style={{ color: "var(--color-brand-600)" }}>
              {gb.city || gb.pinCode}
            </Link></li>
            <li aria-hidden>/</li>
            <li aria-current="page">{gb.title}</li>
          </ol>
        </nav>
      </main>
    </div>
  );
}
