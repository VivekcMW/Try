"use client";

import { useState, useMemo, Fragment } from "react";
import { Phone, Search, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  pricePaise: number;
  inStock: boolean;
}

const CAT_LABELS: Record<string, string> = {
  all:       "All",
  grains:    "Grains & Pulses",
  oils:      "Oils & Ghee",
  spices:    "Spices",
  dairy:     "Dairy",
  snacks:    "Snacks",
  beverages: "Beverages",
  household: "Household",
};

function fmt(paise: number): string {
  return "\u20B9" + (paise / 100).toFixed(0);
}

export function CatalogSection({
  items,
  phone,
  pinCode,
}: {
  readonly items: CatalogItem[];
  readonly phone: string | null;
  readonly pinCode: string;
}) {
  const [query, setQuery]       = useState("");
  const [activeCat, setActiveCat] = useState("all");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.category)));
    return ["all", ...cats];
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        (activeCat === "all" || item.category === activeCat) &&
        item.name.toLowerCase().includes(q),
    );
  }, [items, query, activeCat]);

  // In-stock first, then out-of-stock
  const display = [
    ...filtered.filter((i) => i.inStock),
    ...filtered.filter((i) => !i.inStock),
  ];

  return (
    <section>
      <h2 className="mb-3 text-base font-bold" style={{ color: "var(--color-heading)" }}>
        What&apos;s available
      </h2>

      {/* Search input */}
      <div className="relative mb-3">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--color-text-secondary)" }}
        />
        <input
          type="search"
          placeholder="Search items — atta, dal, oil…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full appearance-none rounded-md border py-2.5 pl-9 pr-9 text-sm outline-none focus:ring-2"
          style={{
            borderColor:       "var(--color-border)",
            background:        "var(--color-surface)",
            color:             "var(--color-heading)",
            "--tw-ring-color": "var(--color-brand-200)",
          } as React.CSSProperties}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-text-secondary)" }}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className="shrink-0 rounded-full px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors"
            style={
              activeCat === cat
                ? { background: "var(--color-brand-600)", color: "#fff" }
                : { background: "var(--color-gray-100)", color: "var(--color-text-secondary)" }
            }
          >
            {CAT_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Result count */}
      {query && (
        <p className="mb-3 text-xs" style={{ color: "var(--color-text-secondary)" }}>
          {display.length} result{display.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
        </p>
      )}

      {/* Items grid */}
      {display.length === 0 ? (
        <div
          className="rounded-md border p-8 text-center"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--color-heading)" }}>
            No items found
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
            Call the store to check availability
          </p>
          {phone && (
            <a
              href={"tel:".concat(phone)}
              className="mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white"
              style={{ background: "var(--color-brand-600)" }}
            >
              <Phone size={14} /> Call store
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {display.map((item, idx) => (
            <Fragment key={item.id}>
              {/* Native ad card injected after the 4th item */}
              {idx === 4 && <AdSlot placement="feed_post" pin={pinCode} variant="card" />}
            <div
              className="flex flex-col gap-3 rounded-md border p-4"
              style={{
                borderColor: "var(--color-border)",
                background:  item.inStock ? "var(--color-surface)" : "var(--color-gray-50)",
                opacity:     item.inStock ? 1 : 0.72,
              }}
            >
              {/* Name + price row */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-semibold leading-snug"
                    style={{ color: "var(--color-heading)" }}
                  >
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {item.unit}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-base font-bold" style={{ color: "var(--color-brand-600)" }}>
                    {fmt(item.pricePaise)}
                  </p>
                  {!item.inStock && (
                    <span
                      className="text-xs font-medium"
                      style={{ color: "var(--color-danger)" }}
                    >
                      Out of stock
                    </span>
                  )}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex gap-2">
                {phone ? (
                  <a
                    href={"tel:".concat(phone)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-heading)" }}
                  >
                    <Phone size={12} /> Call to order
                  </a>
                ) : (
                  <span
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                  >
                    <Phone size={12} /> Call to order
                  </span>
                )}
                <Link
                  href="/signup"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-white"
                  style={{ background: "var(--color-brand-600)" }}
                >
                  <ShoppingBag size={12} /> Order via App
                </Link>
              </div>
            </div>
            </Fragment>
          ))}
        </div>
      )}
    </section>
  );
}
