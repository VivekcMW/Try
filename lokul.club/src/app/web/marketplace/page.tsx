"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, Search, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

const API_BASE = "";

type ServiceListing = {
  id: string;
  category: string;
  title: string;
  description: string;
  pricePaise: number;
  priceUnit: string;
  ratingAvg: number;
  ratingCount: number;
  user: { id: string; name: string; avatarUrl: string | null; kycTier: string; trustScore: number };
};

const CATEGORIES = [
  { id: "",          label: "All" },
  { id: "cleaning",  label: "Cleaning" },
  { id: "plumbing",  label: "Plumbing" },
  { id: "electric",  label: "Electrical" },
  { id: "tutoring",  label: "Tutoring" },
  { id: "delivery",  label: "Delivery" },
  { id: "fitness",   label: "Fitness" },
  { id: "beauty",    label: "Beauty" },
  { id: "pet_care",  label: "Pet Care" },
];

function formatPrice(paise: number, unit: string) {
  const rupees = (paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  return `₹${rupees}${unit ? ` / ${unit}` : ""}`;
}

function Avatar({ name }: { readonly name: string }) {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ background: "var(--color-brand-600)" }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function ListingCard({ listing }: { readonly listing: ServiceListing }) {
  return (
    <div
      className="flex flex-col rounded-xl border p-4 transition-shadow hover:shadow-md"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      {/* Category pill */}
      <span
        className="mb-2 self-start rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
        style={{ background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}
      >
        {listing.category}
      </span>

      <h3 className="mb-1 text-sm font-bold" style={{ color: "var(--color-heading)" }}>
        {listing.title}
      </h3>

      <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
        {listing.description}
      </p>

      {/* Rating */}
      {listing.ratingCount > 0 && (
        <div className="mb-2 flex items-center gap-1">
          <Star size={12} fill="#F59E0B" stroke="none" />
          <span className="text-xs font-semibold" style={{ color: "var(--color-accent-600)" }}>
            {listing.ratingAvg.toFixed(1)}
          </span>
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            ({listing.ratingCount})
          </span>
        </div>
      )}

      {/* Footer: provider + price */}
      <div className="flex items-center gap-2 pt-2" style={{ borderTop: "1px solid var(--color-border)" }}>
        <Avatar name={listing.user.name} />
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>
              {listing.user.name}
            </span>
            {listing.user.kycTier !== "bronze" && (
              <span
                className="rounded px-1 text-[9px] font-bold uppercase"
                style={{ background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}
              >
                {listing.user.kycTier}
              </span>
            )}
          </div>
          <div className="text-[10px]" style={{ color: "var(--color-text-secondary)" }}>
            Trust score: {listing.user.trustScore ?? "–"}
          </div>
        </div>
        <span className="text-sm font-bold" style={{ color: "var(--color-brand-600)" }}>
          {formatPrice(listing.pricePaise, listing.priceUnit)}
        </span>
      </div>

      <button
        type="button"
        className="mt-3 w-full rounded-lg py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: "var(--color-brand-600)" }}
      >
        Book / Enquire
      </button>
    </div>
  );
}

export default function WebMarketplacePage() {
  const router = useRouter();
  const { isEnabled, loading: flagsLoading } = useFeatureFlags();
  const [pinCode,   setPinCode]   = useState("");
  const [pinInput,  setPinInput]  = useState("");
  const [query,     setQuery]     = useState("");
  const [category,  setCategory]  = useState("");
  const [listings,  setListings]  = useState<ServiceListing[]>([]);
  const [loading,   setLoading]   = useState(false);

  // Redirect if services feature is not enabled
  useEffect(() => {
    if (!flagsLoading && !isEnabled('services')) {
      console.log('[Marketplace] Services feature not enabled, redirecting to feed');
      router.replace('/web/feed');
    }
  }, [flagsLoading, isEnabled, router]);

  // Show nothing while checking feature flag
  if (flagsLoading || !isEnabled('services')) {
    return null;
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("lokul_web_pin");
    if (saved) setPinCode(saved);
  }, []);

  const loadListings = useCallback(async (pin: string, cat: string) => {
    if (!pin) return;
    setLoading(true);
    try {
      const catParam = cat ? `&category=${encodeURIComponent(cat)}` : "";
      const res  = await fetch(`${API_BASE}/api/mobile/service-listings?pinCode=${pin}${catParam}`);
      const data = await res.json();
      setListings(data.items ?? []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pinCode) loadListings(pinCode, category);
  }, [pinCode, category, loadListings]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pinInput)) return;
    sessionStorage.setItem("lokul_web_pin", pinInput);
    setPinCode(pinInput);
  };

  const filtered = query
    ? listings.filter(
        (l) =>
          l.title.toLowerCase().includes(query.toLowerCase()) ||
          l.category.toLowerCase().includes(query.toLowerCase()),
      )
    : listings;

  if (!pinCode) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 pt-16 text-center">
        <MapPin size={40} style={{ color: "var(--color-brand-400)" }} />
        <div>
          <h1 className="mb-1 text-xl font-bold" style={{ color: "var(--color-heading)" }}>
            Local marketplace
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Enter your 6-digit PIN code to browse services near you.
          </p>
        </div>
        <form onSubmit={handlePinSubmit} className="flex w-full max-w-xs gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            placeholder="411028"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)" }}
          />
          <button
            type="submit"
            disabled={pinInput.length !== 6}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--color-brand-600)" }}
          >
            Go
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: "var(--color-heading)" }}>
            Services near you
          </h1>
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            PIN {pinCode} ·{" "}
            <button
              type="button"
              onClick={() => { setPinCode(""); sessionStorage.removeItem("lokul_web_pin"); }}
              className="underline"
              style={{ color: "var(--color-brand-600)" }}
            >
              change
            </button>
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-secondary)" }} />
        <input
          type="text"
          placeholder="Search services…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm outline-none"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)" }}
        />
      </div>

      {/* Category chips */}
      <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
            style={
              category === c.id
                ? { background: "var(--color-brand-600)", color: "#fff" }
                : { background: "var(--color-gray-100)", color: "var(--color-text-secondary)" }
            }
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl"
              style={{ background: "var(--color-gray-100)" }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center text-sm"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
        >
          {query ? "No services match your search." : "No services listed in this area yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
