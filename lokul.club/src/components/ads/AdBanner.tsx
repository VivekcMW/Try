import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface AdBannerProps {
  readonly label: string;        // headline copy
  readonly sub: string;          // sub-copy
  readonly cta: string;          // button label
  readonly href: string;         // destination URL
  readonly advertiser: string;   // brand name shown in "Sponsored by"
  readonly accent?: string;      // optional brand colour (CSS value)
  readonly mediaUrl?: string | null;
}

const STUB: AdBannerProps = {
  label:      "Groceries in 10 min",
  sub:        "Free delivery on first order above ₹199 — Swiggy Instamart",
  cta:        "Shop now",
  href:       "https://instamart.swiggy.com",
  advertiser: "Swiggy Instamart",
  accent:     "#FC8019",
};

export function AdBanner(props?: Partial<AdBannerProps>) {
  const ad = { ...STUB, ...props };
  return (
    <div
      className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between"
      style={{ background: "var(--color-brand-50)", borderColor: "var(--color-brand-200)" }}
      aria-label="Sponsored content"
    >
      <div className="flex items-start gap-3 min-w-0">
        {/* Colour swatch as mini logo placeholder */}
        {ad.mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ad.mediaUrl}
            alt=""
            className="mt-0.5 h-9 w-9 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
            style={{ background: ad.accent ?? "var(--color-brand-600)" }}
          >
            {ad.advertiser.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug" style={{ color: "var(--color-heading)" }}>
            {ad.label}
          </p>
          <p className="mt-0.5 text-xs line-clamp-1" style={{ color: "var(--color-text-secondary)" }}>
            {ad.sub}
          </p>
          <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-disabled)" }}>
            Sponsored · {ad.advertiser}
          </span>
        </div>
      </div>
      <Link
        href={ad.href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold text-white"
        style={{ background: ad.accent ?? "var(--color-brand-600)" }}
      >
        {ad.cta} <ExternalLink size={11} />
      </Link>
    </div>
  );
}
