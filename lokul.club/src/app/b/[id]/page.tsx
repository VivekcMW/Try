import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  Calendar,
  Download,
  ImageOff,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Star,
} from "lucide-react";
import { CatalogSection } from "./CatalogSection";
import type { CatalogItem } from "./CatalogSection";
import { StorePhotoGallery } from "./StorePhotoGallery";
import type { StorePhoto } from "./StorePhotoGallery";
import { AdSlot } from "@/components/ads/AdSlot";

/* ────────────────────────────────────────────────────────── */
/* Types                                                      */
/* ────────────────────────────────────────────────────────── */

interface NearbyStore {
  id: string;
  name: string;
  category: string;
  ratingAvg: number | null;
  ratingCount: number;
  distanceM: number;
  city: string;
  pinCode: string;
  isEndorsed: boolean;
}
interface Rating { id: string; score: number; review: string | null; raterName: string; }
interface Business {
  id: string;
  name: string;
  category: string;
  description: string | null;
  avatarUrl: string | null;
  phone: string | null;
  pinCode: string;
  city: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  isEndorsed: boolean;
  ratingAvg: number | null;
  ratingCount: number;
  createdAt: string;
  owner: { name: string; kycTier: string };
  serviceSlots: { id: string; dayOfWeek: number; startTime: string; endTime: string }[];
  recentRatings: Rating[];
  catalog: CatalogItem[];
  photos?: StorePhoto[];
  nearbyStores?: NearbyStore[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function to12h(time: string) {
  const [hStr, mStr] = time.split(":");
  const h = Number.parseInt(hStr, 10);
  const m = mStr ?? "00";
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === "00" ? `${h12} ${suffix}` : `${h12}:${m} ${suffix}`;
}
const CATEGORY_LABELS: Record<string, string> = {
  grocery: "Grocery & Kirana",    food: "Food & Tiffin",
  fitness: "Fitness & Wellness",  beauty: "Beauty & Salon",
  tutoring: "Tutoring & Coaching", cleaning: "Cleaning Services",
  plumbing: "Plumbing & Repair",  electric: "Electrical",
  pet_care: "Pet Care",           delivery: "Delivery Services",
};

/* ────────────────────────────────────────────────────────── */
/* Fetch helper (server-side)                                 */
/* ────────────────────────────────────────────────────────── */

async function fetchBusiness(id: string): Promise<Business | null> {
  try {
    const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/web/businesses/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    return d.business ?? null;
  } catch {
    return null;
  }
}

/* ────────────────────────────────────────────────────────── */
/* SEO metadata                                               */
/* ────────────────────────────────────────────────────────── */

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const biz = await fetchBusiness(id);
  if (!biz) return { title: "Business | Lokul" };
  const label = CATEGORY_LABELS[biz.category] ?? biz.category;
  return {
    title: `${biz.name} — ${label} in ${biz.city} | Lokul`,
    description: biz.description ?? `${biz.name} is a verified local business in ${biz.city} (${biz.pinCode}). Find them on Lokul.`,
    openGraph: {
      title: biz.name,
      description: biz.description ?? "",
      siteName: "Lokul",
    },
  };
}

/* ────────────────────────────────────────────────────────── */
/* Components                                                 */
/* ────────────────────────────────────────────────────────── */

function StarRating({ score, total }: { readonly score: number; readonly total?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          fill={n <= Math.round(score) ? "var(--color-accent-500)" : "none"}
          style={{ color: "var(--color-accent-500)" }}
        />
      ))}
      <span className="ml-1 text-sm font-semibold" style={{ color: "var(--color-heading)" }}>
        {score.toFixed(1)}
      </span>
      {total !== undefined && (
        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          ({total})
        </span>
      )}
    </div>
  );
}

function Avatar({ name, size = 72 }: { readonly name: string; readonly size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-2xl font-bold text-white"
      style={{
        width: size, height: size, fontSize: size / 2.5,
        background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))",
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function AppDownloadCTA({ bizName }: Readonly<{ bizName: string }>) {
  return (
    <div
      className="rounded-2xl p-6 text-center"
      style={{ background: "var(--color-brand-50)", border: "1px solid var(--color-brand-200)" }}
    >
      <p className="text-sm font-semibold" style={{ color: "var(--color-brand-700)" }}>
        Book appointments, chat &amp; pay — all in one place
      </p>
      <p className="mt-1 text-xs" style={{ color: "var(--color-brand-600)" }}>
        Download the Lokul app to connect with {bizName}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        <a
          href="https://play.google.com/store/apps/details?id=club.lokul"
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          style={{ background: "#1a1a1a" }}
        >
          <Download size={15} /> Android
        </a>
        <a
          href="https://apps.apple.com/app/lokul/id0000000000"
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"
          style={{ borderColor: "var(--color-brand-400)", color: "var(--color-brand-700)" }}
        >
          <Download size={15} /> iOS
        </a>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Page                                                       */
/* ────────────────────────────────────────────────────────── */

export default async function BusinessStorefrontPage(
  { params }: Readonly<{ params: Promise<{ id: string }> }>
) {
  const { id } = await params;
  const biz = await fetchBusiness(id);

  if (!biz) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <p className="text-lg font-semibold" style={{ color: "var(--color-heading)" }}>Business not found</p>
          <Link href="/" className="mt-2 text-sm hover:underline" style={{ color: "var(--color-brand-600)" }}>
            ← Back to Lokul
          </Link>
        </div>
      </main>
    );
  }

  const label = CATEGORY_LABELS[biz.category] ?? biz.category;

  return (
    <div style={{ background: "var(--color-background)", minHeight: "100vh" }}>
      {/* Top nav */}
      <header
        className="sticky top-0 z-20 border-b"
        style={{ borderColor: "var(--color-border)", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
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
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--color-brand-600)" }}
          >
            Sign up free
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6 sm:py-8 sm:space-y-8">

        {/* Hero card */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-sm)" }}
        >
          {/* ── Photo gallery ── */}
          {biz.photos && biz.photos.length > 0 ? (
            <StorePhotoGallery photos={biz.photos} />
          ) : (
            <div
              className="flex h-40 w-full flex-col items-center justify-center gap-2 sm:h-48"
              style={{ background: "var(--color-gray-100)" }}
            >
              <ImageOff size={32} strokeWidth={1.5} style={{ color: "var(--color-text-secondary)", opacity: 0.5 }} />
              <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>No photos yet</p>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)", opacity: 0.7 }}>Download the Lokul app to add the first photo</p>
            </div>
          )}

          {/* ── Info section ── */}
          <div className="p-6">
          <div className="flex gap-4 items-start">
            <Avatar name={biz.name} size={72} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold truncate" style={{ color: "var(--color-heading)" }}>
                  {biz.name}
                </h1>
                {biz.isEndorsed && (
                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{ background: "var(--color-accent-100)", color: "var(--color-accent-700)" }}
                  >
                    <Award size={10} /> Verified
                  </span>
                )}
              </div>
              <span
                className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide"
                style={{ background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}
              >
                {label}
              </span>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {biz.ratingAvg !== null && <StarRating score={biz.ratingAvg} total={biz.ratingCount} />}
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {biz.city} · {biz.pinCode}
                </span>
              </div>
            </div>
          </div>

          {biz.description && (
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              {biz.description}
            </p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <a
              href={biz.phone ? "tel:".concat(biz.phone) : "#"}
              className="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium"
              style={{ borderColor: "var(--color-border)", color: "var(--color-heading)" }}
            >
              <Phone size={15} /> Call
            </a>
            <a
              href={biz.phone ? "https://wa.me/".concat(biz.phone.replaceAll(/\D/gu, "")) : "#"}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium"
              style={{ borderColor: "var(--color-border)", color: "var(--color-heading)" }}
            >
              <MessageCircle size={15} /> WhatsApp
            </a>
            <a
              href={biz.lat && biz.lng
                ? `https://www.google.com/maps/dir/?api=1&destination=${biz.lat},${biz.lng}`
                : `https://www.google.com/maps/search/${encodeURIComponent((biz.address ?? biz.name).concat(", ", biz.city))}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium"
              style={{ borderColor: "var(--color-border)", color: "var(--color-heading)" }}
            >
              <Navigation size={15} /> Directions
            </a>
            <Link
              href="/signup"
              className="col-span-2 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white sm:col-span-1"
              style={{ background: "var(--color-brand-600)" }}
            >
              <Calendar size={15} /> Book via App
            </Link>
          </div>
          </div>{/* /p-6 */}
        </div>

        {/* Catalog */}
        {(biz.catalog ?? []).length > 0 && (
          <CatalogSection items={biz.catalog ?? []} phone={biz.phone ?? null} pinCode={biz.pinCode} />
        )}

        {/* Ad slot — banner between catalog and hours */}
        <AdSlot placement="banner" pin={biz.pinCode} variant="banner" />

        {/* Hours */}
        <section>
          <h2 className="mb-3 text-base font-bold" style={{ color: "var(--color-heading)" }}>Hours</h2>
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
          >
            {/* Day header row */}
            <div className="grid grid-cols-7 divide-x" style={{ borderBottom: "1px solid var(--color-border)" }}>
              {DAYS.map((day, i) => {
                const isToday = new Date().getDay() === i;
                return (
                  <div
                    key={day}
                    className="py-2 text-center text-xs font-semibold uppercase tracking-wide"
                    style={{
                      color: isToday ? "var(--color-brand-600)" : "var(--color-text-secondary)",
                      background: isToday ? "var(--color-brand-50)" : undefined,
                    }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            {/* Time row */}
            <div className="grid grid-cols-7 divide-x">
              {DAYS.map((day, i) => {
                const slot = biz.serviceSlots.find((s) => s.dayOfWeek === i);
                const isToday = new Date().getDay() === i;
                return (
                  <div
                    key={day}
                    className="flex flex-col items-center justify-center gap-0.5 px-1 py-3"
                    style={{ background: isToday ? "var(--color-brand-50)" : undefined }}
                  >
                    {slot ? (
                      <>
                        <span className="text-center text-[11px] font-semibold leading-tight" style={{ color: "var(--color-heading)" }}>
                          {to12h(slot.startTime)}
                        </span>
                        <span className="text-[9px]" style={{ color: "var(--color-text-secondary)", opacity: 0.6 }}>to</span>
                        <span className="text-center text-[11px] font-semibold leading-tight" style={{ color: "var(--color-heading)" }}>
                          {to12h(slot.endTime)}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] font-medium" style={{ color: "var(--color-text-secondary)", opacity: 0.45 }}>Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Reviews */}
        {biz.recentRatings.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-bold" style={{ color: "var(--color-heading)" }}>
              What neighbors say
            </h2>
            <div className="space-y-3">
              {biz.recentRatings.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border p-4"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <StarRating score={r.score} />
                    <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                      {r.raterName}
                    </span>
                  </div>
                  {r.review && (
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{r.review}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Nearby stores */}
        {biz.nearbyStores && biz.nearbyStores.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-bold" style={{ color: "var(--color-heading)" }}>Similar stores nearby</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {biz.nearbyStores.map((store) => (
                <Link
                  key={store.id}
                  href={`/b/${store.id}`}
                  className="flex flex-col gap-2 rounded-2xl border p-3 transition-shadow hover:shadow-md"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                >
                  {/* Avatar */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white"
                    style={{ background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))" }}
                  >
                    {store.name.charAt(0).toUpperCase()}
                  </div>
                  {/* Name + badge */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-semibold leading-snug" style={{ color: "var(--color-heading)" }}>
                      {store.name}
                    </p>
                    {store.isEndorsed && (
                      <span className="inline-flex items-center gap-0.5 mt-0.5 text-[9px] font-semibold" style={{ color: "var(--color-accent-600)" }}>
                        <Award size={9} /> Verified
                      </span>
                    )}
                  </div>
                  {/* Rating + distance */}
                  <div className="flex items-center justify-between">
                    {store.ratingAvg !== null && (
                      <span className="flex items-center gap-0.5 text-[11px] font-semibold" style={{ color: "var(--color-accent-500)" }}>
                        <Star size={10} fill="currentColor" />{store.ratingAvg.toFixed(1)}
                      </span>
                    )}
                    <span className="text-[10px] font-medium" style={{ color: "var(--color-text-secondary)" }}>
                      {store.distanceM < 1000 ? `${store.distanceM} m` : `${(store.distanceM / 1000).toFixed(1)} km`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* App CTA */}
        <AppDownloadCTA bizName={biz.name} />

        {/* Breadcrumb SEO footer */}
        <nav className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          <Link href="/" className="hover:underline">Lokul</Link>
          {" / "}
          <Link href={`/n/${biz.pinCode}`} className="hover:underline">{biz.city} {biz.pinCode}</Link>
          {" / "}{biz.name}
        </nav>
      </main>
    </div>
  );
}
