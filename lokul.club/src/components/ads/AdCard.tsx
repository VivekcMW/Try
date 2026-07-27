import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface AdCardProps {
  readonly name: string;
  readonly unit: string;        // shown as category pill
  readonly badgeText: string;   // shown as offer line (replaces rating)
  readonly cta: string;
  readonly href: string;
  readonly advertiser: string;
  readonly accent?: string;
}

const STUB: AdCardProps = {
  name:       "Apollo Pharmacy",
  unit:       "Medicines & Health",
  badgeText:  "25% off first online order",
  cta:        "Order now",
  href:       "https://www.apollopharmacy.in",
  advertiser: "Apollo Pharmacy",
  accent:     "#0066CC",
};

export function AdCard(props?: Partial<AdCardProps>) {
  const ad = { ...STUB, ...props };
  return (
    <Link
      href={ad.href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="flex items-center gap-3 rounded-md border p-4 transition-shadow hover:shadow-md"
      style={{ borderColor: "var(--color-brand-200)", background: "var(--color-brand-50)" }}
      aria-label="Sponsored content"
    >
      {/* Avatar — same size as organic cards */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md font-bold text-white text-lg"
        style={{ background: ad.accent ?? "var(--color-brand-600)" }}
      >
        {ad.name.charAt(0)}
      </div>

      {/* Info column */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold" style={{ color: "var(--color-heading)" }}>
            {ad.name}
          </p>
          <span
            className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest"
            style={{ background: "var(--color-brand-50)", color: "var(--color-brand-600)" }}
          >
            Ad
          </span>
        </div>
        <span
          className="inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium"
          style={{ background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}
        >
          {ad.unit}
        </span>
        <p className="mt-0.5 flex items-center gap-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
          <ExternalLink size={9} />
          {ad.badgeText}
        </p>
      </div>
    </Link>
  );
}
